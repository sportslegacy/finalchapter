import Link from "next/link";
import { players, tournament } from "../../data/players";
import Nav from "../components/Nav";
import JsonLd from "../components/JsonLd";
import JsonLdDedupe from "../components/JsonLdDedupe";

const SITE_URL = "https://finalchapterfc.com";

// Visual companion to the prose-heavy /world-cup-2026-format page: the entire
// 48-team draw at a glance. Targets the high-volume "world cup 2026 groups" /
// "full draw" / "all teams" search intent the format page can't fully own, and
// cross-links into the player pages via the five highlighted legend nations.
const description =
  "The full 2026 World Cup draw: all 48 teams across 12 groups of four, A to L. See every group at a glance, with the five legends' nations — Messi's Argentina, Ronaldo's Portugal, Modrić's Croatia, Neymar's Brazil, De Bruyne's Belgium — highlighted.";

export const metadata = {
  title: "World Cup 2026 Groups: All 48 Teams & Full Draw",
  description,
  alternates: { canonical: "/world-cup-2026-groups" },
  openGraph: {
    title: "World Cup 2026 Groups — All 48 Teams, Full Draw A–L",
    description,
    url: "/world-cup-2026-groups",
    type: "article",
  },
};

// SportsEvent with all 48 nations as performers — the most accurate structured
// representation of a full-draw page (mirrors the homepage/format event schema).
const eventJsonLd = {
  "@context": "https://schema.org",
  "@type": "SportsEvent",
  name: "2026 FIFA World Cup",
  description:
    "The first 48-team FIFA World Cup, drawn into 12 groups of four. Hosted across the USA, Canada, and Mexico from June 11 to July 19, 2026.",
  startDate: "2026-06-11",
  endDate: "2026-07-19",
  eventStatus: "https://schema.org/EventScheduled",
  sport: "Association Football",
  url: `${SITE_URL}/world-cup-2026-groups`,
  image: `${SITE_URL}/opengraph-image`,
  location: [
    {
      "@type": "Place",
      name: "United States",
      address: { "@type": "PostalAddress", addressCountry: "US" },
    },
    {
      "@type": "Place",
      name: "Canada",
      address: { "@type": "PostalAddress", addressCountry: "CA" },
    },
    {
      "@type": "Place",
      name: "Mexico",
      address: { "@type": "PostalAddress", addressCountry: "MX" },
    },
  ],
  performer: tournament.groups
    .flatMap((g) => g.teams)
    .map((t) => ({
      "@type": "SportsTeam",
      name: `${t.name} national football team`,
    })),
  organizer: {
    "@type": "Organization",
    name: "FIFA",
    url: "https://www.fifa.com",
  },
};

export default function GroupsPage() {
  // Map each legend's nation → player, so the grid can highlight + link the
  // five legend teams. Derived from players (single source of truth) rather
  // than duplicated onto the group data. None of the five nations is a host.
  const legendByCountry = {};
  players.forEach((p) => {
    legendByCountry[p.country] = p;
  });

  return (
    <>
      <JsonLd data={eventJsonLd} />
      <JsonLdDedupe />
      <Nav />

      {/* Header */}
      <section className="section" style={{ paddingTop: "6.5rem" }}>
        <div className="section-header" style={{ marginBottom: "2.5rem" }}>
          <div className="section-label">
            FIFA World Cup 2026 &middot; The Draw
          </div>
          <h1 className="section-title">World Cup 2026 Groups</h1>
          <p className="section-desc">
            All 48 teams, drawn into 12 groups of four in Washington, D.C. on
            December 5, 2025 &mdash; the biggest field in World Cup history.
            Here&apos;s the complete group stage, A to L, with the five
            legends&apos; nations highlighted in gold. The top two from every
            group, plus the eight best third-placed teams, advance to the new
            Round of 32.
          </p>
        </div>

        {/* The 12 groups */}
        <div className="groups-grid">
          {tournament.groups.map((g) => (
            <div key={g.id} className="group-card">
              <div className="group-card-header">
                <span className="group-card-letter">{g.id}</span>
                <span className="group-card-label">Group {g.id}</span>
              </div>
              {g.teams.map((t) => {
                const legend = legendByCountry[t.name];
                if (legend) {
                  return (
                    <Link
                      key={t.name}
                      href={`/player/${legend.id}`}
                      className="group-team is-legend"
                    >
                      <span className="group-team-flag">{t.flag}</span>
                      <span className="group-team-name">{t.name}</span>
                      <span className="group-team-legend">
                        {legend.name} &rarr;
                      </span>
                    </Link>
                  );
                }
                return (
                  <div key={t.name} className="group-team">
                    <span className="group-team-flag">{t.flag}</span>
                    <span className="group-team-name">{t.name}</span>
                    {t.host && <span className="group-team-host">Host</span>}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Cross-link to the format explainer */}
        <p style={{ textAlign: "center", marginTop: "2.25rem" }}>
          <Link
            href="/world-cup-2026-format"
            style={{
              color: "var(--accent-gold)",
              fontWeight: 600,
              letterSpacing: "0.02em",
            }}
          >
            How the 2026 format works &mdash; the Round of 32, explained &rarr;
          </Link>
        </p>
      </section>

      {/* Footer */}
      <footer className="site-footer">
        <p>
          The Final Chapter &mdash; A tribute to the legends of FIFA World Cup
          2026.
          <br />
          June 11 &ndash; July 19, 2026 &middot; USA &middot; Canada &middot;
          Mexico
          <br />
          <Link href="/#legends" style={{ color: "var(--accent-gold)" }}>
            Meet the five legends &rarr;
          </Link>
        </p>
      </footer>
    </>
  );
}
