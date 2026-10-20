"use client";
import { useEffect, useState } from "react";
import {
  Copy,
  Facebook,
  Linkedin,
  Mail,
  MessageCircle,
  Share2,
  Send,
} from "lucide-react";
import { SocialIcon } from "./social-icon";
import { articleShareLinks } from "@/lib/share";
export function ArticleShare({ title, url }: { title: string; url: string }) {
  const [message, setMessage] = useState("");
  const [shareUrl, setShareUrl] = useState(url);
  useEffect(() => {
    const canonical = new URL(url);
    if (["localhost", "127.0.0.1"].includes(canonical.hostname)) {
      const timer = window.setTimeout(
        () =>
          setShareUrl(
            new URL(canonical.pathname, window.location.origin).toString(),
          ),
        0,
      );
      return () => window.clearTimeout(timer);
    }
  }, [url]);
  async function copy() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setMessage("Article link copied.");
    } catch {
      setMessage(`Copy this link: ${shareUrl}`);
    }
  }
  async function share() {
    if (!navigator.share) return copy();
    try {
      await navigator.share({ title, url: shareUrl });
      setMessage("Shared using your device.");
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError"))
        setMessage("Sharing did not finish. Try copying the link instead.");
    }
  }
  return (
    <section
      className="article-share wrap"
      aria-labelledby="article-share-heading"
    >
      <div>
        <p className="eyebrow">Pass it along</p>
        <h2 id="article-share-heading">Share this guide</h2>
        <p>A useful conversation can start with one link.</p>
      </div>
      <ul className="share-links">
        {articleShareLinks(title, shareUrl).map((link) => (
          <li key={link.network}>
            <a
              href={link.href}
              target={link.network === "email" ? undefined : "_blank"}
              rel="noopener noreferrer"
              aria-label={`Share this article ${link.network === "email" ? "by email" : `on ${link.label} (opens in a new tab)`}`}
            >
              {link.network === "facebook" ? (
                <Facebook size={19} aria-hidden="true" />
              ) : link.network === "linkedin" ? (
                <Linkedin size={19} aria-hidden="true" />
              ) : link.network === "whatsapp" ? (
                <SocialIcon network="whatsapp" />
              ) : link.network === "email" ? (
                <Mail size={19} aria-hidden="true" />
              ) : link.network === "reddit" ? (
                <MessageCircle size={19} aria-hidden="true" />
              ) : link.network === "bluesky" ? (
                <Send size={19} aria-hidden="true" />
              ) : (
                <svg
                  width="19"
                  height="19"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fill="currentColor"
                    d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3l-4.9-7.4L5.5 22H2.4l7.8-8.9L.8 2h6.5l4.5 6.8L18.9 2ZM17.8 20h1.7L6.4 4H4.6l13.2 16Z"
                  />
                </svg>
              )}
              {link.label}
            </a>
          </li>
        ))}
        <li>
          <button type="button" onClick={() => void share()}>
            <Share2 size={19} aria-hidden="true" />
            More apps
          </button>
        </li>
        <li>
          <button type="button" onClick={() => void copy()}>
            <Copy size={19} aria-hidden="true" />
            Copy link
          </button>
        </li>
      </ul>
      <p className="small">
        For Instagram or another app, use More apps or paste the copied link.
        Sharing opens your chosen service; it never posts automatically.
      </p>
      <p className="share-status" role="status">
        {message}
      </p>
    </section>
  );
}
