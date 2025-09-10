import React, { useEffect, useState } from "react";

export default function FacebookEmbed({ height = 420, className = "" }) {
  const url =
    import.meta?.env?.VITE_FACEBOOK_PAGE_URL ||
    "https://www.facebook.com/facebook";
  const [showFallback, setShowFallback] = useState(false);

  // If iframe is blocked (adblock/CSP), show a clean link instead of console spam
  useEffect(() => {
    const t = setTimeout(() => setShowFallback(true), 2000);
    return () => clearTimeout(t);
  }, []);

  if (showFallback) {
    return (
      <div
        className={`rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 flex items-center justify-between ${className}`}
        style={{ height }}
      >
        <div className="max-w-[70%]">
          <h3 className="text-lg font-semibold">Follow us on Facebook</h3>
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
        <img
          src="/images/logo.png"
          alt="ENVET"
          className="w-14 h-14 rounded-md object-contain"
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <iframe
      key={url}
      title="Facebook Page Plugin"
      className={`w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 ${className}`}
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
