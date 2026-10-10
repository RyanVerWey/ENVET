import { ImageResponse } from "next/og";
export const alt =
  "ENVET: Horses. Hope. A place to belong. Lovettsville, Virginia.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function Image() {
  return new ImageResponse(
    <div
      style={{
        background: "#d4eee2",
        color: "#12251f",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 70,
      }}
    >
      <div style={{ fontSize: 38, letterSpacing: 7 }}>ENVET</div>
      <div
        style={{
          fontSize: 84,
          fontWeight: 700,
          lineHeight: 1.05,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <span>Horses. Hope.</span>
        <span>A place to belong.</span>
      </div>
      <div style={{ fontSize: 26 }}>
        Eagle’s Nest Veterans’ Equine Therapy · Lovettsville, Virginia
      </div>
    </div>,
    size,
  );
}
