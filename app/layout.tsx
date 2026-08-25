import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { buildStructuredData } from "./lib/structured-data";
import {
  KEYWORDS,
  LOCATION,
  PERSON,
  SITE_DESCRIPTION,
  SITE_TITLE,
  SITE_URL,
  SOCIAL_DESCRIPTION,
} from "./lib/site";

const involve = localFont({
  src: [
    {
      path: "../public/fonts/Involve-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/Involve-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/Involve-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
  ],
  variable: "--font-involve",
  display: "swap",
});

export const metadata: Metadata = {
  // Lets every URL field below be written as a relative path and resolved to
  // an absolute one. Without it, relative OG images are a build error.
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    // Any future route gets "<its title> | Vanshaj Gugnani" for free.
    template: `%s | ${PERSON.name}`,
  },
  description: SITE_DESCRIPTION,
  keywords: KEYWORDS,
  applicationName: PERSON.name,
  authors: [{ name: PERSON.name, url: SITE_URL }],
  creator: PERSON.name,
  publisher: PERSON.name,
  category: "technology",
  // The site is one page; state that it is the canonical one so query strings
  // and tracking params can never fragment its ranking signals.
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "profile",
    firstName: PERSON.shortName,
    lastName: "Gugnani",
    username: PERSON.shortName.toLowerCase(),
    url: SITE_URL,
    siteName: PERSON.name,
    title: SITE_TITLE,
    description: SOCIAL_DESCRIPTION,
    locale: LOCATION.locale,
    // og:image is intentionally omitted: app/opengraph-image.tsx generates it
    // and Next fills the tags in, hash included. Setting it here would win
    // over that file and pin a stale URL.
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SOCIAL_DESCRIPTION,
    // Likewise generated, by app/twitter-image.tsx.
  },
  robots: {
    index: true,
    follow: true,
    // Without max-image-preview:large, Google renders a thumbnail-sized card
    // for this page instead of a full-width one. It is the single highest
    // click-through-rate line in this whole file.
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  other: {
    // Read by Bing and several AI crawlers for geographic relevance.
    "geo.region": `${LOCATION.countryCode}-${LOCATION.region}`,
    "geo.placename": LOCATION.city,
  },
  // TODO(vansh): paste the token from Google Search Console > Settings >
  // Ownership verification > HTML tag, then redeploy to verify the property.
  // verification: { google: "..." },
};

export const viewport: Viewport = {
  // themeColor moved out of `metadata` in Next 14 and must live here.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fefefe" },
    { media: "(prefers-color-scheme: dark)", color: "#111111" },
  ],
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const structuredData = buildStructuredData();

  return (
    <html lang="en" className={involve.variable}>
      <head>
        {/* The contact form loads Turnstile from Cloudflare. Warming the
            connection here shaves a full TLS handshake off first interaction. */}
        <link rel="preconnect" href="https://challenges.cloudflare.com" />
        <link rel="dns-prefetch" href="https://challenges.cloudflare.com" />
        <link rel="me" href={`mailto:${PERSON.email}`} />
        <script
          type="application/ld+json"
          // Server-rendered into the static HTML, so crawlers that do not run
          // JavaScript still see the full entity graph.
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
