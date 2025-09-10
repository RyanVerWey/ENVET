// scripts/fetch-fb-images.mjs
// Node 18+ (global fetch). Pull recent images from a Facebook Page and write public/facebook/manifest.json

import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const PAGE_ID = process.env.FB_PAGE_ID || '100068209587248'; // ENVET page id
const ACCESS_TOKEN = process.env.FB_ACCESS_TOKEN;            // Page access token (DO NOT put in client)

if (!ACCESS_TOKEN) {
  console.error('Missing FB_ACCESS_TOKEN in env');
  process.exit(1);
}

const LIMIT_POSTS = Number(process.env.FB_LIMIT_POSTS || 25);
const MAX_IMAGES = Number(process.env.FB_MAX_IMAGES || 12);

// Prefer /photos (high-res), then fallback to /posts full_picture/attachments.
async function fetchPhotos() {
  // Try Page Photos (uploaded) -> yields direct images array
  const photosUrl = new URL(`https://graph.facebook.com/v19.0/${PAGE_ID}/photos`);
  photosUrl.searchParams.set('type', 'uploaded');
  photosUrl.searchParams.set('fields', 'id,created_time,images,source,link,alt_text');
  photosUrl.searchParams.set('limit', String(MAX_IMAGES * 2));
  photosUrl.searchParams.set('access_token', ACCESS_TOKEN);

  const res = await fetch(photosUrl);
  if (!res.ok) throw new Error(`Photos edge HTTP ${res.status}`);
  const data = await res.json();

  // Each photo has images[] (largest first). Choose the first https source.
  const list = (data.data || []).flatMap(p => {
    const img = (p.images || []).find(x => x.source?.startsWith('http'));
    return img ? [{ url: img.source, created_time: p.created_time, link: p.link }] : [];
  });

  // Sort newest first and take top MAX_IMAGES
  list.sort((a, b) => new Date(b.created_time) - new Date(a.created_time));
  return list.slice(0, MAX_IMAGES).map(x => x.url);
}

async function fetchPostPictures() {
  const postsUrl = new URL(`https://graph.facebook.com/v19.0/${PAGE_ID}/posts`);
  postsUrl.searchParams.set(
    'fields',
    // full_picture is an easy win; attachments can hold albums w/ subattachments
    'id,created_time,permalink_url,full_picture,attachments{subattachments,media_type,media}'
  );
  postsUrl.searchParams.set('limit', String(LIMIT_POSTS));
  postsUrl.searchParams.set('access_token', ACCESS_TOKEN);

  const res = await fetch(postsUrl);
  if (!res.ok) throw new Error(`Posts edge HTTP ${res.status}`);
  const data = await res.json();

  const urls = [];
  for (const p of data.data || []) {
    if (p.full_picture) urls.push(p.full_picture);
    if (p.attachments?.data?.length) {
      for (const att of p.attachments.data) {
        if (att.media?.image?.src) urls.push(att.media.image.src);
        if (att.subattachments?.data?.length) {
          for (const sub of att.subattachments.data) {
            if (sub.media?.image?.src) urls.push(sub.media.image.src);
          }
        }
      }
    }
  }
  // Dedupe & cap
  return Array.from(new Set(urls)).slice(0, MAX_IMAGES);
}

async function main() {
  let images = [];
  try {
    images = await fetchPhotos();
  } catch (e) {
    console.warn('Photo edge failed, falling back to posts:', e.message);
    images = await fetchPostPictures();
  }
  if (!images.length) {
    console.error('No images found from Facebook API.');
    process.exit(2);
  }

  // Write manifest under public/
  const outDir = path.join(process.cwd(), 'public', 'facebook');
  const outFile = path.join(outDir, 'manifest.json');
  await fs.mkdir(outDir, { recursive: true });
  await fs.writeFile(outFile, JSON.stringify({ images }, null, 2), 'utf-8');
  console.log(`Wrote ${images.length} images to ${path.relative(process.cwd(), outFile)}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
