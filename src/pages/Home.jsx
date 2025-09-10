// src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import Carousel from "../components/Carousel";
import DonationCTA from "../components/DonationCTA";

function SocialLinks() {
  const fb = import.meta.env.VITE_FACEBOOK_PAGE_URL || "https://www.facebook.com/facebook";
  return (
    <div className="flex items-center gap-4">
      {/* Facebook */}
      <a
        href={fb}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 text-slate-700 hover:text-[#1877f2] dark:text-slate-200 dark:hover:text-white"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path fill="currentColor" d="M22 12.07C22 6.48 17.52 2 11.93 2S1.86 6.48 1.86 12.07c0 5.02 3.66 9.19 8.44 9.93v-7.02H7.9v-2.91h2.4V9.98c0-2.37 1.41-3.68 3.57-3.68c1.04 0 2.14.19 2.14.19v2.35h-1.2c-1.18 0-1.55.73-1.55 1.48v1.77h2.64l-.42 2.91h-2.22V22c4.78-.74 8.44-4.91 8.44-9.93Z"/>
        </svg>
        <span className="text-sm font-medium">Facebook</span>
      </a>

      {/* Add more as needed: Instagram, YouTube, etc. */}
      {/* <a href="https://instagram.com/..." ...>Instagram</a> */}
      {/* <a href="https://youtube.com/..." ...>YouTube</a> */}
    </div>
  );
}

function FacebookEmbed({ height = 420 }) {
  const [showFallback, setShowFallback] = useState(false);
  const url = import.meta.env.VITE_FACEBOOK_PAGE_URL || "https://www.facebook.com/profile.php?id=100068209587248";

  useEffect(() => {
    const t = setTimeout(() => setShowFallback(true), 2000);
    return () => clearTimeout(t);
  }, []);

  if (showFallback) {
    return (
      <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex items-center justify-between">
        <div className="max-w-[70%]">
          <h3 className="text-lg font-semibold dark:text-white">Follow us on Facebook</h3>
          <p className="text-slate-600 dark:text-slate-300 text-sm">
            See the latest photos, events, and updates from ENVET.
          </p>
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="inline-block mt-3 px-4 py-2 rounded bg-[#1877f2] text-white font-semibold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#1877f2]"
          >
            Open Facebook Page
          </a>
        </div>
        <img src="/images/logo.png" alt="ENVET" className="w-14 h-14 rounded-md object-contain" loading="lazy" />
      </div>
    );
  }

  return (
    <iframe
      key={url}
      title="Facebook Page Plugin"
      className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
      style={{ height, overflow: "hidden" }}
      loading="lazy"
      referrerPolicy="strict-origin-when-cross-origin"
      allow="encrypted-media; clipboard-write; picture-in-picture; web-share"
      scrolling="no"
      frameBorder="0"
      src={`https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(
        url
      )}&tabs=timeline&width=800&height=${height}&small_header=true&adapt_container_width=true&hide_cover=false&show_facepile=false`}
    />
  );
}

export default function Home() {
  const [fbImgs, setFbImgs] = useState([]); 

  // Load images captured from FB posts (no Graph API needed).
  useEffect(() => {
    fetch("/facebook/manifest.json")
      .then((r) => r.json())
      .then((data) => setFbImgs(Array.isArray(data.images) ? data.images : []))
      .catch(() => setFbImgs([]));
  }, []);

  const showLiveFb = import.meta.env.VITE_FACEBOOK_EMBED === "1";

  return (
    <div className="space-y-10">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-xl">
        <img
          src="/images/hero.jpg"
          alt="Veteran with horse"
          className="w-full h-[360px] md:h-[440px] object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 container-px flex items-center">
          <div className="text-white max-w-xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-2">Equine Therapy for Veterans & Families</h2>
            <p className="text-white/90">
              Evidence-informed programs that build resilience, trust, and community—one ride, one breath, one step at a time.
            </p>
            <div className="mt-4">
              <SocialLinks />
            </div>
          </div>
        </div>
      </section>

      {/* FACEBOOK IMAGES ROTATOR */}
      <section>
        <h3 className="text-xl font-semibold mb-3 dark:text-white">From Our Facebook</h3>
        <Carousel imgs={fbImgs} height={360} />
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
          These images are pulled from our recent Facebook posts.
        </p>
      </section>

      {/* LIVE FACEBOOK FEED (optional) */}
      {showLiveFb && (
        <section>
          <h3 className="text-xl font-semibold mb-3 dark:text-white">Live Facebook Feed</h3>
          <FacebookEmbed height={420} />
        </section>
      )}

      {/* WHAT WE DO */}
      <section className="grid md:grid-cols-2 gap-6 items-center">
        <img
          src="/images/arena.jpg"
          alt="Riding arena"
          className="rounded-xl shadow object-cover w-full h-64"
        />
        <div>
          <h3 className="text-2xl font-semibold mb-2 dark:text-white">What We Do</h3>
          <p className="text-slate-700 dark:text-slate-200">
            We deliver equine-assisted learning (EAL) and equine-assisted psychotherapy (EAP) in a safe, structured environment.
            Our certified team partners with horses to support emotional regulation, connection, and post-service transition.
          </p>
          <ul className="list-disc pl-5 mt-3 text-slate-700 dark:text-slate-200 space-y-1">
            <li>Individual & small-group sessions</li>
            <li>Family workshops & reintegration support</li>
            <li>Peer mentor and horsemanship clinics</li>
          </ul>
        </div>
      </section>

      {/* FEATURED HORSES */}
      <section>
        <h3 className="text-2xl font-semibold mb-4 dark:text-white">Featured Horses</h3>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {["/images/horse1.jpg", "/images/horse2.jpg", "/images/horse3.jpg"].map((src, i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-900 rounded-lg shadow overflow-hidden border border-slate-200 dark:border-slate-800"
            >
              <img src={src} alt={`Horse ${i + 1}`} className="w-full h-48 object-cover" />
              <div className="p-3">
                <p className="font-medium dark:text-white">Horse {i + 1}</p>
                <p className="text-sm text-slate-600 dark:text-slate-300">Gentle partner in our programs.</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <DonationCTA />
    </div>
  );
}
