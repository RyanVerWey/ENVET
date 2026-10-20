export function articleShareLinks(title: string, url: string) {
  const link = encodeURIComponent(url);
  const text = encodeURIComponent(title);
  const combined = encodeURIComponent(`${title} ${url}`);
  return [
    {
      network: "facebook",
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${link}`,
    },
    {
      network: "linkedin",
      label: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${link}`,
    },
    {
      network: "x",
      label: "X",
      href: `https://x.com/intent/post?url=${link}&text=${text}`,
    },
    {
      network: "bluesky",
      label: "Bluesky",
      href: `https://bsky.app/intent/compose?text=${combined}`,
    },
    {
      network: "whatsapp",
      label: "WhatsApp",
      href: `https://wa.me/?text=${combined}`,
    },
    {
      network: "reddit",
      label: "Reddit",
      href: `https://www.reddit.com/submit?url=${link}&title=${text}`,
    },
    {
      network: "email",
      label: "Email",
      href: `mailto:?subject=${text}&body=${combined}`,
    },
  ] as const;
}
