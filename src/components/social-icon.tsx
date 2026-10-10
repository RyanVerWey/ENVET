import { Facebook } from "lucide-react";

export function SocialIcon({
  network,
}: {
  network: "facebook" | "messenger" | "whatsapp";
}) {
  if (network === "facebook")
    return <Facebook size={21} aria-hidden="true" focusable="false" />;
  return (
    <svg
      width="21"
      height="21"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      {network === "messenger" ? (
        <>
          <path d="M12 2C6.48 2 2 6.15 2 11.27c0 2.92 1.46 5.53 3.75 7.23V22l3.42-1.88c.9.25 1.85.39 2.83.39 5.52 0 10-4.14 10-9.24S17.52 2 12 2Z" />
          <path
            d="m5.8 14.3 5.3-5.6 2.7 2.8 4.4-2.8-5.3 5.6-2.7-2.8-4.4 2.8Z"
            fill="var(--surface)"
          />
        </>
      ) : (
        <>
          <path
            d="M20.5 11.7a8.5 8.5 0 0 1-12.7 7.4L3 20.5l1.4-4.7A8.5 8.5 0 1 1 20.5 11.7Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path d="M8.1 7.2c.2-.3.4-.3.7-.3h.4c.2 0 .3.1.4.3l.9 2c.1.2.1.4-.1.6l-.7.8c-.1.1-.1.3 0 .5a8.3 8.3 0 0 0 3.5 3c.2.1.3.1.5-.1l1-1.2c.2-.2.3-.2.5-.1l1.9.9c.3.1.4.2.4.4 0 .6-.3 1.5-.8 1.8-.5.4-1.2.6-2 .4-1.1-.2-2.6-.8-4.3-2.2-1.9-1.7-3-3.6-3.1-4.8 0-.8.3-1.5.8-2Z" />
        </>
      )}
    </svg>
  );
}
