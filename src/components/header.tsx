"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { Button } from "@corvaui/react";
import { ArrowUpRight, Menu, Moon, Sun, X } from "lucide-react";

const nav = [
  ["Our story", "/about"],
  ["Plan a visit", "/visit"],
  ["The journal", "/blog"],
  ["Contact", "/contact"],
];
function subscribeTheme(listener: () => void) {
  const observer = new MutationObserver(listener);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-corva-theme"],
  });
  return () => observer.disconnect();
}
export function Header() {
  const pathname = usePathname();
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const open = menuFor === pathname;
  const dark = useSyncExternalStore(
    subscribeTheme,
    () => document.documentElement.dataset.corvaTheme === "mint-dark",
    () => false,
  );
  function toggleTheme() {
    const next =
      document.documentElement.dataset.corvaTheme === "mint-dark"
        ? "mint-light"
        : "mint-dark";
    document.documentElement.dataset.corvaTheme = next;
    try {
      localStorage.setItem("envet-theme", next);
    } catch {
      /* Theme still works with storage unavailable. */
    }
  }
  return (
    <header className="site-header">
      <div className="header-inner wrap">
        <Link className="brand" href="/" aria-label="ENVET home">
          <Image
            className="brand-logo"
            src="/images/envet-logo.jpg"
            alt=""
            width={52}
            height={52}
            priority
          />
          <span>
            <strong>ENVET</strong>
            <small>
              Eagle’s Nest Veterans’
              <br />
              Equine Therapy
            </small>
          </span>
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          {nav.map(([label, href]) => (
            <Link
              href={href}
              key={href}
              aria-current={pathname.startsWith(href) ? "page" : undefined}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          <Button
            variant="secondary"
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label="Toggle light and dark theme"
            aria-pressed={dark}
          >
            <Moon className="moon-icon" size={19} aria-hidden="true" />
            <Sun className="sun-icon" size={19} aria-hidden="true" />
          </Button>
          <Link href="/donate" className="header-donate">
            Donate <ArrowUpRight size={17} aria-hidden="true" />
          </Link>
          <button
            type="button"
            className="menu-toggle"
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setMenuFor(open ? null : pathname)}
          >
            {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </div>
      </div>
      <nav
        id="mobile-nav"
        className="mobile-nav"
        aria-label="Mobile navigation"
        hidden={!open}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setMenuFor(null);
            document.querySelector<HTMLButtonElement>(".menu-toggle")?.focus();
          }
        }}
      >
        {nav.map(([label, href]) => (
          <Link
            key={href}
            href={href}
            onClick={() => setMenuFor(null)}
            aria-current={pathname.startsWith(href) ? "page" : undefined}
          >
            {label}
          </Link>
        ))}
        <Link href="/gallery" onClick={() => setMenuFor(null)}>
          Life at the farm
        </Link>
      </nav>
    </header>
  );
}
