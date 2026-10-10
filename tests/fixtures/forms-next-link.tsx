import type { ReactNode } from "react";
export default function FixtureLink({
  href,
  children,
  prefetch: _prefetch,
  ...props
}: {
  href: string;
  children: ReactNode;
  className?: string;
  prefetch?: boolean;
  "aria-current"?: "page";
}) {
  void _prefetch;
  return (
    <a href={href} {...props}>
      {children}
    </a>
  );
}
