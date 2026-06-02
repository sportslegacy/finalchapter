import Link from "next/link";
import { players, tournament } from "../../data/players";
import Nav from "../components/Nav";
import JsonLd from "../components/JsonLd";
import JsonLdDedupe from "../components/JsonLdDedupe";

const SITE_URL = "https://finalchapterfc.com";

// Dedicated, indexable explainer targeting the very high-volume
// "World Cup 2026 format" search intent — a query cluster the homepage
// can't rank for (its intent is "the five legends"). This page has its
// own keyword-led title/H1/description and cross-links into the player
// pages, funnelling format-searchers toward the editorial content.
const description =
  "How the first 48-team World Cup works: 12 groups, 104 matches, the new Round of 32, and the best-third-place rule that decides who advances in 2026.";

export const metadata = {
  title: "World Cup 2026 Format Explained: 48 Teams & Round of 32",
  description,
  alternates: { canonical: "/world-cup-2026-format" },
  openGraph: {
    title: "World Cup 2026 Format Explained — 48 Teams, 12 Groups, Round of 32",
    description,
    url: "/world-cup-2026-format",
    type: "article",
  },
};

// FAQPage schema mirrors the on-page Q&A (shared source: tournament.faqs).
const faqJsonLd = (faqs) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
});

// SportsEvent so the page is eligible for event rich results on
// format/tournament queries (mirrors the homepage event schema).
const eventJsonLd = {
  "@context": "https://schema.org",
  "@type": "SportsEvent",
  name: "2026 FIFA World Cup",
  description:
    "The first 48-team FIFA World Cup: 12 groups of four, 104 matches, a new Round of 32, hosted across the USA, Canada, and Mexico from June 11 to July 19, 2026.",
  startDate: "2026-06-11",
  endDate: "2026-07-19",
  eventStatus: "https://schema.org/EventScheduled",
  sport: "Association Football",
  url: `${SITE_URL}/world-cup-2026-format`,
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
  organizer: {
    "@type": "Organization",
    name: "FIFA",
    url: "https://www.fifa.com",
  },
};

export default function FormatPage() {
  return (
    <>
      <JsonLd data={eventJsonLd} />
      {tournament.faqs?.length > 0 && (
        <JsonLd data={faqJsonLd(tournament.faqs)} />
      )}
      <JsonLdDedupe />
      <Nav />

      {/* Header */}
      <section className="section" style={{ paddingTop: "6.5rem" }}>
        <div className="section-header" style={{ marginBottom: "2.5rem" }}>
          <div className="section-label">FIFA World Cup 2026 &middot; Format Guide</div>
          <h1 className="section-title">World Cup 2026 Format, Explained</h1>
          <p className="section-desc">
            The 2026 World Cup is the most-changed edition in the tournament&apos;s
            history &mdash; 48 teams, 12 groups, a brand-new Round of 32, and a
            third-place rule that keeps more nations alive than ever. Here&apos;s
            exactly how it works, and what it means for the five legends playing
            their final chapter.
          </p>
        </div>

        {/* At a glance */}
        <div className="tournament-grid">
          <div className="tournament-card">
            <div className="tournament-card-icon">⚽</div>
            <div className="tournament-card-title">48 Teams</div>
            <div className="tournament-card-desc">
              Expanded from 32 for the first time ever, split into 12 groups of
              four.
            </div>
          </div>
          <div className="tournament-card">
            <div className="tournament-card-icon">🏟️</div>
            <div className="tournament-card-title">104 Matches</div>
            <div className="tournament-card-desc">
              Up from 64, played across 16 cities in the USA, Canada and Mexico.
            </div>
          </div>
          <div className="tournament-card">
            <div className="tournament-card-icon">🆕</div>
            <div className="tournament-card-title">Round of 32</div>
            <div className="tournament-card-desc">
              A new opening knockout round &mdash; the first time 32 teams reach
              the bracket.
            </div>
          </div>
          <div className="tournament-card">
            <div className="tournament-card-icon">📅</div>
            <div className="tournament-card-title">June 11 &mdash; July 19</div>
            <div className="tournament-card-desc">
              Group stage June 11&ndash;27; knockouts June 28 to the final on
              July 19.
            </div>
          </div>
        </div>

        <p style={{ textAlign: "center", marginTop: "2rem" }}>
          <Link
            href="/world-cup-2026-groups"
            style={{
              color: "var(--accent-gold)",
              fontWeight: 600,
              letterSpacing: "0.02em",
            }}
          >
            See the full draw &mdash; all 48 teams, 12 groups &rarr;
          </Link>
        </p>
      </section>

      {/* The group stage */}
      <section className="section" id="group-stage">
        <div className="section-header">
          <div className="section-label">Step 1</div>
          <h2 className="section-title">The Group Stage</h2>
        </div>
        <div className="format-prose">
          <p>
            The 48 qualified nations are drawn into{" "}
            <strong>12 groups of four teams</strong>. Just like every World Cup
            before it, each team plays <strong>three group-stage matches</strong>
            , one against every other side in its group. That familiar rhythm is
            unchanged &mdash; what changes is how many teams survive it.
          </p>
          <p>
            The group stage runs from the opening match on{" "}
            <strong>June 11 through June 27, 2026</strong>. Mexico open the
            tournament at the Estadio Azteca in Mexico City; from there, all 12
            groups play out before the knockout rounds begin.
          </p>
        </div>
      </section>

      {/* How teams advance */}
      <section className="section" id="advancing">
        <div className="section-header">
          <div className="section-label">Step 2</div>
          <h2 className="section-title">Who Advances: The Best-Third-Place Rule</h2>
        </div>
        <div className="format-prose">
          <p>
            This is the single biggest change, and the one most fans get wrong.
            From each group, the <strong>top two teams</strong> advance
            automatically &mdash; that&apos;s 24 nations. They are joined by the{" "}
            <strong>eight best third-placed teams</strong> from across all 12
            groups, completing a 32-team knockout bracket.
          </p>
          <p>
            After the group games finish, the 12 third-placed teams are ranked
            against each other in a single table. The order is decided by{" "}
            <strong>points</strong>, then <strong>goal difference</strong>, then{" "}
            <strong>goals scored</strong>, with team-conduct and FIFA-ranking
            tie-breakers after that. The top eight go through; the bottom four go
            home.
          </p>
          <p>
            The practical upshot: <strong>finishing third no longer means
            automatic elimination</strong>, so more teams stay alive into the
            final round of group fixtures. But it cuts both ways &mdash; a
            third-placed team from a brutal group can still miss out if eight
            others post better records.
          </p>
          <p className="format-callout">
            Can you win your group and still go home? <strong>No.</strong> Every
            group winner and runner-up is guaranteed a place in the Round of 32.
            Only third-placed teams have to sweat the math.
          </p>
        </div>
      </section>

      {/* The knockout path */}
      <section className="section" id="round-of-32">
        <div className="section-header">
          <div className="section-label">Step 3</div>
          <h2 className="section-title">The New Round of 32 &amp; Knockout Path</h2>
        </div>
        <div className="format-prose">
          <p>
            Because 32 teams now survive the groups instead of 16, the knockout
            stage opens with a <strong>Round of 32</strong> &mdash; a round that
            has never existed in World Cup history. From there the bracket
            follows the classic single-elimination path:
          </p>
          <p className="format-path">
            Round of 32 &rarr; Round of 16 &rarr; Quarter-finals &rarr;
            Semi-finals &rarr; Final
          </p>
          <p>
            The knockouts run from <strong>June 28 to July 19, 2026</strong>,
            ending with the final at <strong>MetLife Stadium</strong> in New
            Jersey. One consequence of the extra round: a team that reaches the
            final now plays <strong>eight matches in total</strong>, one more
            than the seven required to win in 2022.
          </p>
        </div>
      </section>

      {/* Key dates */}
      <section className="section">
        <div className="key-dates">
          <h2 className="key-dates-title">Key Dates</h2>
          <div className="key-dates-list">
            {tournament.keyDates.map((kd) => (
              <div key={kd.date + kd.event} className="key-date-item">
                <span className="key-date-date">
                  {new Date(kd.date + "T12:00:00").toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <span className="key-date-event">{kd.event}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What it means for the legends — cross-link into player pages */}
      <section className="section" id="legends-format">
        <div className="section-header">
          <div className="section-label">The Stakes</div>
          <h2 className="section-title">What It Means for the Five Legends</h2>
          <p className="section-desc">
            With eight of twelve third-placed teams advancing, the new format
            could be a lifeline &mdash; letting a legend&apos;s nation drop a
            group game and still reach the knockouts. Here&apos;s where each of
            them lands in the draw.
          </p>
        </div>
        <div className="cities-grid">
          {players.map((p) => (
            <Link
              key={p.id}
              href={`/player/${p.id}`}
              className="city-chip"
              style={{ textDecoration: "none" }}
            >
              <span className="city-name">
                {p.countryFlag} {p.name}
              </span>
              <span className="city-venue">
                Group {p.wc2026.group} &middot; {p.country}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* FAQ */}
      {tournament.faqs?.length > 0 && (
        <section className="faq-section" id="faq">
          <div className="section-header">
            <div className="section-label">Common Questions</div>
            <h2 className="section-title">2026 World Cup Format FAQ</h2>
          </div>
          <div className="faq-list">
            {tournament.faqs.map((f, i) => (
              <div key={i} className="faq-item">
                <h3 className="faq-q">{f.q}</h3>
                <p className="faq-a">{f.a}</p>
              </div>
            ))}
          </div>
        </section>
      )}

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
            Back to the legends &rarr;
          </Link>
        </p>
      </footer>
    </>
  );
}
