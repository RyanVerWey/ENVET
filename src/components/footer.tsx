import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import { SocialIcon } from "./social-icon";
import { organization as org } from "@/lib/site";
export function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap footer-top">
        <div>
          <Link href="/" className="footer-wordmark">
            Eagle’s Nest
          </Link>
          <p>
            Eagle’s Nest Veterans’ Equine Therapy.
            <br />
            Supporting Veterans and families through connection with horses.
          </p>
          <p className="footer-location">
            Lovettsville, Virginia
            <br />
            Visits by arrangement. Please contact us first.
          </p>
        </div>
        <nav aria-label="Footer navigation">
          <h2>Explore ENVET</h2>
          <Link href="/visit">Plan a visit</Link>
          <Link href="/about">Our story</Link>
          <Link href="/gallery">Life at the farm</Link>
          <Link href="/staff">Meet the animal staff</Link>
          <Link href="/blog">The journal</Link>
          <Link href="/donate">Support ENVET</Link>
          <Link href="/forms">Guest & horse donation forms</Link>
          <Link href="/account" prefetch={false}>
            Your account & tasks
          </Link>
        </nav>
        <div>
          <h2>Contact & connect</h2>
          <a href={org.phoneHref}>
            <Phone size={17} aria-hidden="true" /> {org.phone}
          </a>
          <a href={`mailto:${org.email}`}>
            <Mail size={17} aria-hidden="true" /> {org.email}
          </a>
          <nav className="footer-social" aria-label="ENVET social channels">
            {(
              [
                ["facebook", "Facebook", org.facebook],
                ["messenger", "Messenger", org.messenger],
                ["whatsapp", "WhatsApp", org.whatsapp],
              ] as const
            ).map(([network, label, href]) => (
              <a
                key={network}
                href={href}
                aria-label={`ENVET on ${label}`}
                title={`ENVET on ${label}`}
              >
                <SocialIcon network={network} />
              </a>
            ))}
          </nav>
        </div>
      </div>
      <div className="wrap footer-bottom">
        <span>
          © {new Date().getFullYear()} Eagle’s Nest Veterans’ Equine Therapy.
        </span>
        <div>
          <Link href="/privacy">Privacy & accessibility</Link>
          <Link href="/editorial-policy">Editorial standards</Link>
          <a href="/feed.xml">RSS</a>
        </div>
      </div>
    </footer>
  );
}
