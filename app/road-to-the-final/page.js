import Link from "next/link";
import {
  players,
  statusStatement,
  playerRoad,
  stageIndex,
  isChampion,
  projectedPaths,
} from "../../data/players";
import Nav from "../components/Nav";
import JsonLd from "../components/JsonLd";
import JsonLdDedupe from "../components/JsonLdDedupe";

const SITE_URL = "https://finalchapterfc.com";

// "Road to the Final" — the five legends' knockout journeys drawn as parallel
// left-to-right lanes. A symmetric bracket tree (ESPN/FIFA) makes it hard to
// trace ONE nation's path; we only have five paths to draw, so each reads in a
// single straight line. Lit nodes come from each player's wc2026.status (single
// source of truth); opponent/score labels come from the optional wc2026.knockout
// array we fill in per round once the knockouts begin (June 28, 2026).
const description =
  "The road to the 2026 World Cup final, traced one legend at a time. Follow each of the five — Messi, Ronaldo, Modrić, Neymar and De Bruyne — from their group to the final in a single straight line, updated as the knockouts unfold.";

export const metadata = {
  title: "Road to the Final — Each Legend's Path at the 2026 World Cup",
  description,
  alternates: { canonical: "/road-to-the-final" },
  openGraph: {
    title: "Road to the Final — The 2026 World Cup, one legend at a time",
    description,
    url: "/road-to-the-final",
    type: "website",
  },
};

// Sort: still-alive legends first, deepest stage on top; eliminated drop to the
// bottom (also ordered by how far they got). Mirrors /status.
function rank(p) {
  const st = p.wc2026?.status || { stage: "group", alive: true };
  const out = st.alive === false || st.stage === "eliminated";
  return (out ? 0 : 100) + stageIndex(st.stage);
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// "2026-06-28" → "Jun 28"
function shortDate(iso) {
  if (!iso) return "";
  const [, m, d] = iso.split("-");
  return `${MONTHS[parseInt(m, 10) - 1]} ${parseInt(d, 10)}`;
}

// The small caption under each lane node.
function nodeCaption(node, group, groupTeams) {
  if (node.stage === "group") {
    return `Group ${group}`;
  }
  if (node.result) {
    return `${node.result.outcome} ${node.result.score}${
      node.opponent ? ` · ${node.opponent}` : ""
    }`;
  }
  if (node.opponent) {
    return `vs ${node.opponent}`;
  }
  return `from ${shortDate(node.date)}`;
}

// One finishing scenario's projected opponents (R32 → QF). The deeper rounds
// fan out across half the draw, so we stop at the QF where the candidates are
// still few enough to name — that's where the legend-vs-legend collisions are.
function ProjBranch({ title, rounds }) {
  return (
    <div className="proj-branch">
      <div className="proj-branch-title">{title}</div>
      <ol className="proj-rounds">
        {rounds.slice(0, 3).map((r) => (
          <li key={r.stage} className="proj-round">
            <span className="proj-round-stage">{r.short}</span>
            <span className="proj-round-body">
              <span className="proj-round-pos">
                {r.stage === "r32"
                  ? `${r.posLabel} · Group ${r.groups.join("/")}`
                  : `${r.primaryPos} · Group ${r.primaryGroups.join("/")}`}
                {r.hasThirds ? (
                  <span className="proj-or3rd">or a 3rd-place side</span>
                ) : null}
              </span>
              <span className="proj-teams">
                {r.teams.map((t, i) => (
                  <span key={`${t.grp}-${i}`} className="proj-team">
                    <span className="proj-team-flag" aria-hidden="true">
                      {t.flag}
                    </span>
                    {t.name}
                  </span>
                ))}
              </span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

const eventJsonLd = {
  "@context": "https://schema.org",
  "@type": "SportsEvent",
  name: "2026 FIFA World Cup — Knockout Stage",
  description:
    "The knockout rounds of the first 48-team FIFA World Cup: Round of 32, Round of 16, quarter-finals, semi-finals and the final on July 19, 2026.",
  startDate: "2026-06-28",
  endDate: "2026-07-19",
  eventStatus: "https://schema.org/EventScheduled",
  sport: "Association Football",
  url: `${SITE_URL}/road-to-the-final`,
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

export default function RoadToFinalPage() {
  const ordered = [...players].sort((a, b) => rank(b) - rank(a));

  return (
    <>
      <JsonLd data={eventJsonLd} />
      <JsonLdDedupe />
      <Nav />

      {/* Header */}
      <section className="section" style={{ paddingTop: "6.5rem" }}>
        <div className="section-header" style={{ marginBottom: "2.5rem" }}>
          <div className="section-label">World Cup 2026 &middot; Knockouts</div>
          <h1 className="section-title">Road to the Final</h1>
          <p className="section-desc">
            A bracket tree makes it hard to follow one nation&apos;s route.
            So here are just the five that matter &mdash; each legend&apos;s
            path from their group to the final, read in a single straight line.
            The group stage ends June 27; from June 28 each lane fills in with
            real opponents as the knockouts unfold.
          </p>
        </div>

        {/* Lanes */}
        <div className="road-lanes">
          {ordered.map((p) => {
            const st = p.wc2026?.status || { stage: "group", alive: true };
            const out = st.alive === false || st.stage === "eliminated";
            const champ = isChampion(p);
            const road = playerRoad(p);
            const group = p.wc2026?.group || "";
            const groupTeams = p.wc2026?.groupTeams || [];
            // Projected opponents only matter while a legend is still alive and
            // pre-knockout-deep; once they're out or champions, the path is set.
            const proj = !out && !champ ? projectedPaths(p) : null;
            return (
              <div
                key={p.id}
                className={`road-lane${out ? " is-out" : ""}${
                  champ ? " is-champion" : ""
                }`}
                style={{
                  "--player-accent": p.colors?.primary || "var(--accent-gold)",
                  "--player-accent-2":
                    p.colors?.secondary || "var(--accent-gold-dim)",
                }}
              >
                <Link href={`/player/${p.id}`} className="road-lane-head">
                  <span className="road-lane-flag" aria-hidden="true">
                    {p.countryFlag}
                  </span>
                  <span className="road-lane-id">
                    <span className="road-lane-country">{p.country}</span>
                    <span className="road-lane-name">{p.name}</span>
                  </span>
                  <span className="road-lane-standing">
                    {statusStatement(p)}
                  </span>
                </Link>

                <ol className="road-track" aria-label={`${p.country} path`}>
                  {road.map((node, i) => (
                    <li
                      key={node.stage}
                      className={`road-node state-${node.state}`}
                    >
                      <span className="road-node-stage">{node.short}</span>
                      <span className="road-node-cap">
                        {nodeCaption(node, group, groupTeams)}
                      </span>
                    </li>
                  ))}
                  <li
                    className={`road-node road-node-trophy${
                      champ ? " state-reached" : " state-upcoming"
                    }`}
                  >
                    <span className="road-node-stage" aria-hidden="true">
                      🏆
                    </span>
                    <span className="road-node-cap">
                      {champ ? "Champions" : "Final"}
                    </span>
                  </li>
                </ol>

                {proj ? (
                  <div className="road-proj">
                    <div className="road-proj-head">
                      Who they could face
                      <span>
                        {" "}
                        &middot; the bracket is fixed; the actual names lock in
                        once the groups finish (June 27)
                      </span>
                    </div>
                    <div className="road-proj-branches">
                      <ProjBranch
                        title={`If ${p.country} win Group ${proj.group}`}
                        rounds={proj.win}
                      />
                      <ProjBranch
                        title={`If they finish 2nd in Group ${proj.group}`}
                        rounds={proj.runnerUp}
                      />
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        {/* Cross-links */}
        <p
          style={{
            textAlign: "center",
            marginTop: "2.5rem",
            display: "flex",
            gap: "1.5rem",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/status"
            style={{
              color: "var(--accent-gold)",
              fontWeight: 600,
              letterSpacing: "0.02em",
            }}
          >
            Who&apos;s still standing? &rarr;
          </Link>
          <Link
            href="/world-cup-2026-groups"
            style={{
              color: "var(--accent-gold)",
              fontWeight: 600,
              letterSpacing: "0.02em",
            }}
          >
            See all 12 groups &rarr;
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
