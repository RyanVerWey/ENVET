import React from "react";
export default function TestImage({
  src,
  alt,
  ...props
}: {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  unoptimized?: boolean;
  sizes?: string;
  className?: string;
  priority?: boolean;
}) {
  void src;
  // Local synthetic portraits only; fixture never reaches hosted private storage.
  // Test double uses a local synthetic image, not a production image pipeline.
  /* eslint-disable @next/next/no-img-element */
  return (
    <img
      src="/synthetic-portrait.svg"
      alt={alt}
      className={props.className}
      width={props.width}
      height={props.height}
      style={
        props.fill
          ? {
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }
          : undefined
      }
    />
  );
}
