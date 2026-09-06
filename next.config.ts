import type { NextConfig } from "next";
import { launchEnabled } from "./src/lib/site";
import media from "./docs/media-manifest.json";

if (launchEnabled && media.assets.some((asset) => !asset.publicApproved)) {
  throw new Error(
    "Launch blocked: every deployed image needs documented owner clearance in docs/media-manifest.json.",
  );
}

if (process.env.VERCEL_ENV === "production" && !launchEnabled) {
  throw new Error(
    "Production blocked: owner approval, cleared media/content, and a canonical HTTPS SITE_URL are required. See docs/launch-runbook.md.",
  );
}

const config: NextConfig = {
  poweredByHeader: false,
  images: { formats: ["image/avif", "image/webp"] },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          ...(!launchEnabled
            ? [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }]
            : []),
        ],
      },
    ];
  },
  async redirects() {
    return [
      { source: "/services", destination: "/visit", permanent: true },
      { source: "/legal", destination: "/privacy", permanent: true },
      { source: "/tax", destination: "/donate", permanent: true },
    ];
  },
};
export default config;
