import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { socialImageSize } from "./seo";

// Only reviewed repository assets; never fetch a URL or read a request path.
const photographs = ["connection", "farm", "horse"] as const;
type Photograph = (typeof photographs)[number];
export function socialPhotograph(path: string): Photograph {
  return (
    photographs.find((name) => path === `/images/${name}.jpg`) ?? "connection"
  );
}
export async function createSocialImage({
  title,
  label = "Eagle’s Nest Veterans’ Equine Therapy",
  detail = "Free equine-assisted programs for Veterans and families.",
  photograph = "connection",
}: {
  title: string;
  label?: string;
  detail?: string;
  photograph?: Photograph;
}) {
  const [photo, logo] = await Promise.all([
    readFile(
      join(process.cwd(), "public", "images", `${photograph}.jpg`),
      "base64",
    ),
    readFile(
      join(process.cwd(), "public", "images", "envet-logo.jpg"),
      "base64",
    ),
  ]);
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: "#102b23",
        color: "#f3f8f5",
        position: "relative",
      }}
    >
      {/* Satori needs native img elements, not next/image. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`data:image/jpeg;base64,${photo}`}
        alt=""
        width={510}
        height={630}
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          objectFit: "cover",
          objectPosition: "center",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 660,
          top: 0,
          width: 100,
          height: 630,
          background: "linear-gradient(to right, #102b23, transparent)",
        }}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: 720,
          padding: "48px 54px 44px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`data:image/jpeg;base64,${logo}`}
            alt=""
            width={76}
            height={76}
            style={{ borderRadius: 38, objectFit: "cover" }}
          />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 31, fontWeight: 700, letterSpacing: 4 }}>
              ENVET
            </span>
            <span style={{ fontSize: 19, color: "#a6d7c3" }}>
              Lovettsville, Virginia
            </span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 19, color: "#a6d7c3", marginBottom: 18 }}>
            {label}
          </div>
          <div
            style={{
              fontSize: title.length > 65 ? 49 : title.length > 45 ? 54 : 64,
              fontWeight: 700,
              lineHeight: 1.08,
              letterSpacing: -1.5,
              whiteSpace: "pre-wrap",
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: 23,
              lineHeight: 1.35,
              color: "#d1e4da",
              marginTop: 24,
            }}
          >
            {detail}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: 21,
            color: "#a6d7c3",
            gap: 14,
          }}
        >
          <div style={{ width: 36, height: 3, background: "#7ccbb0" }} />
          envet.org
        </div>
      </div>
    </div>,
    socialImageSize,
  );
}
