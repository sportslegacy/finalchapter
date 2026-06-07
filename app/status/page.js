import Link from "next/link";
import Image from "next/image";
import {
  players,
  tournament,
  statusHeadline,
  stageLabel,
  stageIndex,
  latestResultLabel,
  STAGE_ORDER,
  STAGE_SHORT,
} from "../../data/players";
import Nav from "../components/Nav";
import JsonLd from "../components/JsonLd";
import JsonLdDedupe from "../components/JsonLdDedupe";

const SITE_URL = "https://finalchapterfc.com";

// The "Who's Still Standing" hub — the live answer to "which legends are still
// in the 2026 World Cup". One page that updates as the tournament progresses;
// each legend's status is derived from data/players.js (single source of truth)
// so editing a player's wc2026.status ripples here, to their page banner, and
// to the JSON-LD. Built to ride the high-intent "is X still in / out" search
// wave during the tournament and give returning visitors a reason to come back.
const description =
  "Who's still standing at the 2026 World Cup? Live status for all five legends — Messi (Argentina), Ronaldo (Portugal), Modrić (Croatia), Neymar (Brazil) and De Bruyne (Belgium) — tracking each one from the group stage to the final.";

export const metadata = {
  title: "Who's Still Standing? Legends at the 2026 World Cup",
  description,
  alternates: { canonical: "/status" },
  openGraph: {
    title: "Who's Still Standing — Legends at the 2026 World Cup",
    description,
    url: "/status",
    type: "website",
  },
};

// Sort: still-alive players first, deepest stage at the top; eliminated players
// drop to the bottom (also ordered by how far they got).
function rank(p) {
  const st = p.wc2026?.status || { stage: "group", alive: true };
  const out = st.alive === false || st.stage === "eliminated";
  return (out ? 0 : 100) + stageIndex(st.stage);
}

function buildFaqJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: players.map((p) => {
      const h = statusHeadline(p);
      return {
        "@type": "Question",
        name: h.q,
        acceptedAnswer: { "@type": "Answer", text: h.a },
      };
    }),
  };
}

const eventJsonLd = {
  "@context": "https://schema.org",
  "@type": "SportsEvent",
  name: "2026 FIFA World Cup",
  description:
    "The first 48-team FIFA World Cup, hosted across the USA, Canada, and Mexico from June 11 to July 19, 2026.",
  startDate: "2026-06-11",
  endDate: "2026-07-19",
  eventStatus: "https://schema.org/EventScheduled",
  sport: "Association Football",
  url: `${SITE_URL}/status`,
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
  performer: players.map((p) => ({
    "@type": "SportsTeam",
    name: `${p.country} national football team`,
  })),
  organizer: {
    "@type": "Organization",
    name: "FIFA",
    url: "https://www.fifa.com",
  },
};

export default function StatusPage() {
  const ordered = [...players].sort((a, b) => rank(b) - rank(a));
  const aliveCount = players.filter((p) => {
    const st = p.wc2026?.status || { alive: true };
    return st.alive !== false && st.stage !== "eliminated";
  }).length;

  return (
    <>
      <JsonLd data={eventJsonLd} />
      <JsonLd data={buildFaqJsonLd()} />
      <JsonLdDedupe />
      <Nav />

      {/* Header */}
      <section className="section" style={{ paddingTop: "6.5rem" }}>
        <div className="section-header" style={{ marginBottom: "2.5rem" }}>
          <div className="section-label">World Cup 2026 &middot; Live</div>
          <h1 className="section-title">Who&apos;s Still Standing?</h1>
          <p className="section-desc">
            Five legends, one last World Cup. Here&apos;s where each of them
            stands right now &mdash; {aliveCount} of {players.length}{" "}
            still in it &mdash; tracked from the group stage to the final.
            Bookmark this page; it updates as the tournament unfolds.
          </p>
        </div>

        {/* Status grid */}
        <div className="status-grid">
          {ordered.map((p) => {
            const st = p.wc2026?.status || { stage: "group", alive: true };
            const head = statusHeadline(p);
            const curIdx = stageIndex(st.stage);
            const out = st.alive === false || st.stage === "eliminated";
            const champ = st.stage === "champion";
            const lastResult = latestResultLabel(p);
            return (
              <Link
                key={p.id}
                href={`/player/${p.id}`}
                className={`status-card${out ? " is-out" : ""}${
                  champ ? " is-champion" : ""
                }`}
                style={{
                  "--player-accent": p.colors?.primary || "var(--accent-gold)",
                  "--player-accent-2":
                    p.colors?.secondary || "var(--accent-gold-dim)",
                }}
              >
                <div className="status-card-photo">
                  <Image
                    src={p.photo.src}
                    alt={`${p.name} portrait`}
                    width={160}
                    height={200}
                    sizes="80px"
                    style={{
                      objectPosition: p.photo.focus || "center top",
                    }}
                  />
                  <span className="status-card-flag" aria-hidden="true">
                    {p.countryFlag}
                  </span>
                </div>
                <div className="status-card-body">
                  <div className="status-card-name">{p.name}</div>
                  <div className="status-card-country">{p.country}</div>
                  <div className="status-card-stage">
                    {out
                      ? `Out · ${stageLabel(st.stage)}`
                      : champ
                      ? "Champion 🏆"
                      : `In · ${stageLabel(st.stage)}`}
                  </div>
                  <ol className="status-track is-mini" aria-hidden="true">
                    {STAGE_ORDER.map((stage, i) => {
                      const reached = !out && i <= curIdx;
                      const here = i === curIdx;
                      return (
                        <li
                          key={stage}
                          className={`status-step${reached ? " reached" : ""}${
                            here ? " current" : ""
                          }${here && out ? " out" : ""}`}
                        >
                          {STAGE_SHORT[stage]}
                        </li>
                      );
                    })}
                  </ol>
                  {lastResult ? (
                    <div
                      className={`status-card-result outcome-${lastResult[0].toLowerCase()}`}
                    >
                      Last: {lastResult}
                    </div>
                  ) : st.note ? (
                    <div className="status-card-note">{st.note}</div>
                  ) : null}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Cross-links */}
        <p
          style={{
            textAlign: "center",
            marginTop: "2.25rem",
            display: "flex",
            gap: "1.5rem",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/road-to-the-final"
            style={{
              color: "var(--accent-gold)",
              fontWeight: 600,
              letterSpacing: "0.02em",
            }}
          >
            Trace each legend&apos;s road to the final &rarr;
          </Link>
          <Link
            href="/world-cup-2026-groups"
            style={{
              color: "var(--accent-gold)",
              fontWeight: 600,
              letterSpacing: "0.02em",
            }}
          >
            See the full 48-team draw &amp; all 12 groups &rarr;
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
