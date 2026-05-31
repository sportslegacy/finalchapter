import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import HashScroll from "./components/HashScroll";

// Base URL used to resolve absolute URLs for OG / Twitter / canonical tags.
// In Vercel deployments, VERCEL_PROJECT_PRODUCTION_URL is set automatically.
// Override locally or on other hosts via NEXT_PUBLIC_SITE_URL.
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "https://finalchapterfc.com");

const SITE_TITLE = "The Final Chapter — World Cup 2026";
const SITE_DESCRIPTION =
  "The farewell tour of football's greatest legends. Messi, Ronaldo, Modrić, Neymar, De Bruyne — one last time on the biggest stage.";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    type: "website",
    url: "/",
    siteName: "The Final Chapter",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  verification: {
    other: {
      // Bing Webmaster Tools site verification (covers Bing + DuckDuckGo).
      "msvalidate.01": "83B7E7C31E7ACE6E1086DAE9197B34D5",
    },
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <HashScroll />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
