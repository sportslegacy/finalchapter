import { getPlayerSlugs } from "../data/players";

// Same base-URL resolution as app/layout.js (Vercel-aware with override).
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "https://finalchapterfc.com");

// Generated at build time and served at /sitemap.xml. Tells Google
// every page on the site, when it last changed, and roughly how often
// to recrawl. Read in conjunction with /robots.txt.
export default function sitemap() {
  const lastModified = new Date();

  const home = {
    url: siteUrl,
    lastModified,
    changeFrequency: "weekly",
    priority: 1.0,
  };

  const players = getPlayerSlugs().map((slug) => ({
    url: `${siteUrl}/player/${slug}`,
    lastModified,
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  const format = {
    url: `${siteUrl}/world-cup-2026-format`,
    lastModified,
    changeFrequency: "monthly",
    priority: 0.8,
  };

  const groups = {
    url: `${siteUrl}/world-cup-2026-groups`,
    lastModified,
    changeFrequency: "monthly",
    priority: 0.8,
  };

  // Live "who's still standing" hub — recrawl often during the tournament.
  const status = {
    url: `${siteUrl}/status`,
    lastModified,
    changeFrequency: "daily",
    priority: 0.9,
  };

  return [home, status, format, groups, ...players];
}
