import { players, playerUpdatedAt } from "../data/players";
import { autoUpdate } from "../data/autoUpdate";

// Same base-URL resolution as app/layout.js (Vercel-aware with override).
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "https://finalchapterfc.com");

// Generated at build time and served at /sitemap.xml.
//
// lastModified is the single machine-readable "recrawl this page" lever a static
// site has, so it must be HONEST or Google learns to discount it. The old code
// stamped `new Date()` (build time) on all 9 URLs identically — so a CSS-only
// commit bumped every page and a Neymar-only result push claimed Messi changed
// too. Now:
//   • home / status / road  → autoUpdate.updatedAt (the agent stamps it ONLY on a
//     real result push, behind a git-diff gate) — they aggregate all 5 legends,
//     so any result genuinely changes them.
//   • each player page      → that player's OWN latest result date, so a push for
//     one legend doesn't falsely re-stamp the others.
//   • format / groups       → a STATIC date (evergreen draw/explainer content), so
//     they stop claiming to change on every build.
const siteUpdated = new Date(autoUpdate.updatedAt);
const evergreen = new Date("2026-06-06");

export default function sitemap() {
  const home = {
    url: siteUrl,
    lastModified: siteUpdated,
    changeFrequency: "daily",
    priority: 1.0,
  };

  const playerPages = players.map((p) => {
    const iso = playerUpdatedAt(p);
    return {
      url: `${siteUrl}/player/${p.id}`,
      lastModified: iso ? new Date(iso) : siteUpdated,
      changeFrequency: "daily",
      priority: 0.9,
    };
  });

  const format = {
    url: `${siteUrl}/world-cup-2026-format`,
    lastModified: evergreen,
    changeFrequency: "monthly",
    priority: 0.8,
  };

  const groups = {
    url: `${siteUrl}/world-cup-2026-groups`,
    lastModified: evergreen,
    changeFrequency: "monthly",
    priority: 0.8,
  };

  // Live "who's still standing" hub — recrawl often during the tournament.
  const status = {
    url: `${siteUrl}/status`,
    lastModified: siteUpdated,
    changeFrequency: "daily",
    priority: 0.9,
  };

  // Per-legend knockout-path lanes — fills in during the knockouts, recrawl often.
  const road = {
    url: `${siteUrl}/road-to-the-final`,
    lastModified: siteUpdated,
    changeFrequency: "daily",
    priority: 0.8,
  };

  return [home, status, road, format, groups, ...playerPages];
}
