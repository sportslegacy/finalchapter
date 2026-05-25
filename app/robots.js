const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "https://finalchapterfc.com");

// Generated at build time and served at /robots.txt.
// We have nothing to hide — allow all crawlers everywhere. The
// sitemap link is the important part: it tells Google to crawl every
// URL we publish without having to discover them via internal links.
export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
