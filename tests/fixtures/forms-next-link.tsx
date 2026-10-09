import type { ReactNode } from "react";
export default function FixtureLink({
  href,
  children,
  ...props
}: {
  href: string;
  children: ReactNode;
  className?: string;
  "aria-current"?: "page";
}) {
  return (
    <a href={href} {...props}>
      {children}
    </a>
  );
}
