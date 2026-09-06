import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
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
            Supporting veterans and families through connection with horses.
          </p>
          <p className="footer-location">
            Lovettsville, Virginia
            <br />
            Visits by arrangement. Please contact us first.
          </p>
        </div>
        <div>
          <h2>Explore ENVET</h2>
          <Link href="/visit">Plan a visit</Link>
          <Link href="/about">Our story</Link>
          <Link href="/gallery">Life at the farm</Link>
          <Link href="/blog">The journal</Link>
          <Link href="/donate">Support ENVET</Link>
        </div>
        <div>
          <h2>Contact & connect</h2>
          <a href={org.phoneHref}>{org.phone}</a>
          <a href={`mailto:${org.email}`}>{org.email}</a>
          <a href={org.facebook}>
            Facebook <ArrowUpRight size={14} aria-hidden="true" />
          </a>
          <a href={org.messenger}>
            Messenger <ArrowUpRight size={14} aria-hidden="true" />
          </a>
          <a href={org.whatsapp}>
            WhatsApp <ArrowUpRight size={14} aria-hidden="true" />
          </a>
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
