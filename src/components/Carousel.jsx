import React, { useEffect, useRef, useState, useCallback } from "react";

export default function Carousel({
  imgs = [],
  intervalMs = 4000,
  height = 360,
  className = "",
}) {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);
  const fbEmbedEnabled = (import.meta?.env?.VITE_FACEBOOK_EMBED || "") === "1";

  useEffect(() => {
    if (imgs.length === 0) setIdx(0);
    else if (idx >= imgs.length) setIdx(0);
  }, [imgs, idx]);

  const next = useCallback(() => {
    setIdx((p) => (imgs.length ? (p + 1) % imgs.length : 0));
  }, [imgs.length]);

  const prev = useCallback(() => {
    setIdx((p) => (imgs.length ? (p - 1 + imgs.length) % imgs.length : 0));
  }, [imgs.length]);

  useEffect(() => {
    if (paused || imgs.length < 2) return;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(next, intervalMs);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [paused, imgs.length, intervalMs, next]);

  useEffect(() => {
    const onVis = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const onKeyDown = (e) => {
    if (e.key === "ArrowRight") { e.preventDefault(); next(); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
  };

  // Prefer rotator; only use FB embed if explicitly enabled and no images provided.
  if (imgs.length === 0) {
    return (
      <div
        className={`w-full rounded shadow overflow-hidden bg-white ${className}`}
        style={{ height }}
      >
        {fbEmbedEnabled ? <FacebookEmbedWithFallback height={height} /> : <FacebookLinkCard />}
      </div>
    );
  }

  return (
    <div
      className={`relative w-full rounded shadow overflow-hidden bg-black ${className}`}
      style={{ height }}
      role="region"
      aria-roledescription="carousel"
      aria-label="Facebook highlights"
      tabIndex={0}
      onKeyDown={onKeyDown}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {imgs.map((src, i) => (
        <img
          key={`${src}-${i}`}
          src={src}
          alt={`Slide ${i + 1} of ${imgs.length}`}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
            i === idx ? "opacity-100" : "opacity-0"
          }`}
          loading={i === 0 ? "eager" : "lazy"}
          aria-hidden={i === idx ? "false" : "true"}
        />
      ))}

      {imgs.length > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white rounded-full h-10 w-10 grid place-items-center focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Previous slide"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white rounded-full h-10 w-10 grid place-items-center focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Next slide"
          >
            ›
          </button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
            {imgs.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={`h-2.5 w-2.5 rounded-full ${i === idx ? "bg-white" : "bg-white/40"}`}
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === idx ? "true" : "false"}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/** FB Page Plugin with graceful fallback to link card */
function FacebookEmbedWithFallback({ height = 360 }) {
  const [showFallback, setShowFallback] = useState(false);
  const url =
    import.meta?.env?.VITE_FACEBOOK_PAGE_URL || "https://www.facebook.com/facebook";

  // If the iframe doesn't paint within a short window (often blocked),
  // show a clean link card instead of spamming console with FB internals.
  useEffect(() => {
    const t = setTimeout(() => setShowFallback(true), 2000);
    return () => clearTimeout(t);
  }, []);

  if (showFallback) return <FacebookLinkCard />;

  return (
    <iframe
      key={url}
      title="Facebook Page Plugin"
      className="w-full h-full"
      style={{ border: 0, overflow: "hidden" }}
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

function FacebookLinkCard() {
  const url =
    import.meta?.env?.VITE_FACEBOOK_PAGE_URL || "https://www.facebook.com/facebook";
  return (
    <div className="h-full flex items-center justify-between p-4 sm:p-6">
      <div className="max-w-[70%]">
        <h3 className="text-lg font-semibold">Follow us on Facebook</h3>
        <p className="text-slate-600 text-sm">
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
