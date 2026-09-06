import type { Metadata } from "next";
import { Source_Sans_3 } from "next/font/google";
import "@corvaui/tokens/css";
import "@corvaui/react/styles.css";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import {
  absoluteUrl,
  jsonLd,
  launchEnabled,
  organization,
  siteUrl,
} from "@/lib/site";

const body = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "ENVET | A place to reconnect", template: "%s | ENVET" },
  description: organization.description,
  robots: launchEnabled
    ? {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-image-preview": "large",
          "max-snippet": -1,
        },
      }
    : { index: false, follow: false, noarchive: true },
  alternates: { types: { "application/rss+xml": "/feed.xml" } },
};
const themeScript = `(function(){try{var t=localStorage.getItem('envet-theme');document.documentElement.dataset.corvaTheme=t==='mint-light'||t==='mint-dark'?t:matchMedia('(prefers-color-scheme: dark)').matches?'mint-dark':'mint-light'}catch(e){}})()`;
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-corva-theme="mint-light"
      data-scroll-behavior="smooth"
      className={body.variable}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        {!launchEnabled && (
          <div className="review-banner">
            OWNER REVIEW <span>·</span> Not a public launch. Content & imagery
            awaiting approval.
          </div>
        )}
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: jsonLd({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "NGO",
                  "@id": absoluteUrl("/#organization"),
                  name: organization.name,
                  alternateName: "ENVET",
                  url: siteUrl,
                  description: organization.description,
                  email: organization.email,
                  telephone: "+15405048401",
                  address: {
                    "@type": "PostalAddress",
                    streetAddress: "37958 Long Lane",
                    addressLocality: "Lovettsville",
                    addressRegion: "VA",
                    postalCode: "20180",
                    addressCountry: "US",
                  },
                  sameAs: [organization.facebook],
                },
                {
                  "@type": "WebSite",
                  "@id": absoluteUrl("/#website"),
                  url: siteUrl,
                  name: organization.name,
                  publisher: { "@id": absoluteUrl("/#organization") },
                  inLanguage: "en-US",
                },
              ],
            }),
          }}
        />
      </body>
    </html>
  );
}
