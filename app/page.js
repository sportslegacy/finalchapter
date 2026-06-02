import Link from "next/link";
import { players, tournament } from "../data/players";
import Countdown from "./components/Countdown";
import Nav from "./components/Nav";
import JsonLd from "./components/JsonLd";
import JsonLdDedupe from "./components/JsonLdDedupe";

const SITE_URL = "https://finalchapterfc.com";

// SportsEvent schema for the tournament itself + ItemList schema for
// the five legends being celebrated. Google reads JSON-LD to enable
// rich snippets in search results — fact boxes, image carousels,
// Knowledge Panel-style displays.
const eventJsonLd = {
  "@context": "https://schema.org",
  "@type": "SportsEvent",
  name: "2026 FIFA World Cup",
  alternateName: ["FIFA World Cup 2026", "The Final Chapter"],
  description:
    "The first 48-team FIFA World Cup, hosted across USA, Canada, and Mexico from June 11 to July 19, 2026.",
  startDate: "2026-06-11",
  endDate: "2026-07-19",
  eventStatus: "https://schema.org/EventScheduled",
  eventAttendanceMode: "https://schema.org/MixedEventAttendanceMode",
  sport: "Association Football",
  url: SITE_URL,
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

// FAQPage schema mirroring the on-page tournament-format Q&A. Targets the very
// high-volume "how does the 2026 World Cup work / third-place rule / Round of
// 32" search intent. Rich-result eligibility is limited to a few domains, but
// the markup stays valid and the copy serves People Also Ask + on-page intent.
const tournamentFaqJsonLd = (faqs) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
});

const legendsListJsonLd = (playersData) => ({
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Five Legends Playing Their Final World Cup",
  description:
    "Messi, Ronaldo, Modrić, Neymar, De Bruyne — one last time on the biggest stage.",
  itemListElement: playersData.map((player, i) => ({
    "@type": "ListItem",
    position: i + 1,
    item: {
      "@type": "Person",
      name: player.name,
      nationality: player.country,
      url: `${SITE_URL}/player/${player.id}`,
      image: `${SITE_URL}${player.photo.src}`,
    },
  })),
});

// Self-referential canonical so Google consolidates the www and apex
// copies of the homepage (both serve 200) onto the apex URL.
export const metadata = {
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <>
      <JsonLd data={eventJsonLd} />
      <JsonLd data={legendsListJsonLd(players)} />
      {tournament.faqs?.length > 0 && (
        <JsonLd data={tournamentFaqJsonLd(tournament.faqs)} />
      )}
      <JsonLdDedupe />
      <Nav />

      {/* Hero */}
      <section className="hero">
        <div className="hero-badge">
          FIFA World Cup 2026 &middot; 48 Teams &middot; 16 Cities
        </div>
        <h1 className="hero-title">The Final Chapter</h1>
        <p className="hero-subtitle">
          The first-ever 48-team World Cup. Three host nations. And for five
          legends of the game, one final chance to write their World Cup story.
        </p>
        <div className="hero-year">USA &middot; Canada &middot; Mexico</div>
        <a className="scroll-indicator" href="#legends">
          <span>Meet the legends</span>
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="2">
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </a>
      </section>

      {/* Countdown */}
      <Countdown />

      {/* Tournament Overview */}
      <section className="section" id="tournament">
        <div className="section-header">
          <div className="section-label">The Tournament</div>
          <h2 className="section-title">World Cup 2026</h2>
          <p className="section-desc">
            The biggest World Cup in history. 48 nations, 12 groups, 104 matches
            across 16 cities in three countries.
          </p>
        </div>

        <div className="tournament-grid">
          <div className="tournament-card">
            <div className="tournament-card-icon">📅</div>
            <div className="tournament-card-title">June 11 &mdash; July 19</div>
            <div className="tournament-card-desc">
              Opening match at Estadio Azteca, Mexico City. Final at MetLife
              Stadium, New Jersey.
            </div>
          </div>
          <div className="tournament-card">
            <div className="tournament-card-icon">🌎</div>
            <div className="tournament-card-title">3 Host Nations</div>
            <div className="tournament-card-desc">
              11 cities in the USA, 3 in Mexico, 2 in Canada. The first
              tri-nation World Cup ever.
            </div>
          </div>
          <div className="tournament-card">
            <div className="tournament-card-icon">⚽</div>
            <div className="tournament-card-title">48 Teams</div>
            <div className="tournament-card-desc">
              Expanded from 32 for the first time. 12 groups of 4, with the top
              2 and best 3rd-place teams advancing.
            </div>
          </div>
          <div className="tournament-card">
            <div className="tournament-card-icon">🏟️</div>
            <div className="tournament-card-title">16 Venues</div>
            <div className="tournament-card-desc">
              From MetLife Stadium in New York to Estadio Azteca in Mexico City
              and BC Place in Vancouver.
            </div>
          </div>
        </div>

        {/* Key Dates */}
        <div className="key-dates">
          <h3 className="key-dates-title">Key Dates</h3>
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

      {/* Tournament FAQ — answers the high-volume "how does the 2026 format
          work" search intent; one legend-specific Q&A differentiates from the
          generic ESPN/FIFA explainers. JSON-LD emitted above. */}
      {tournament.faqs?.length > 0 && (
        <section className="faq-section" id="faq">
          <div className="section-header">
            <div className="section-label">How It Works</div>
            <h2 className="section-title">The New Format, Explained</h2>
            <p className="section-desc">
              The first 48-team World Cup changes more than any edition before
              it. Here&apos;s what&apos;s new — and what it means for the five
              legends chasing one last title.
            </p>
          </div>
          <div className="faq-list">
            {tournament.faqs.map((f, i) => (
              <div key={i} className="faq-item">
                <h3 className="faq-q">{f.q}</h3>
                <p className="faq-a">{f.a}</p>
              </div>
            ))}
          </div>
          <p style={{ textAlign: "center", marginTop: "1.75rem" }}>
            <Link
              href="/world-cup-2026-format"
              style={{
                color: "var(--accent-gold)",
                fontWeight: 600,
                letterSpacing: "0.02em",
              }}
            >
              Read the full 2026 format guide &rarr;
            </Link>
          </p>
        </section>
      )}

      {/* Players Grid */}
      <section className="section" id="legends">
        <div className="section-header">
          <div className="section-label">The Farewell Five</div>
          <h2 className="section-title">One Last Time</h2>
          <p className="section-desc">
            They&apos;ve defined an era. Now they step onto the pitch for the
            final chapter of their World Cup stories.
          </p>
        </div>

        <div className="players-grid">
          {players.map((player) => (
            <Link
              key={player.id}
              href={`/player/${player.id}`}
              className="player-card"
              style={{
                "--player-accent": player.colors?.primary || "var(--accent-gold)",
                "--player-accent-2":
                  player.colors?.secondary || "var(--accent-gold-dim)",
              }}
            >
              <div className="card-photo">
                <img
                  src={player.photo.src}
                  alt={player.name}
                  loading="lazy"
                  style={{ objectPosition: player.photo.focus || "center top" }}
                />
                <div className="card-flag">{player.countryFlag}</div>
                <div className="card-age">
                  Age at WC <span>{player.ageAtTournament}</span>
                </div>
              </div>
              <div className="card-body">
                <h3 className="card-name">{player.name}</h3>
                <div className="card-country">
                  {player.country} &middot; {player.position} &middot; Group{" "}
                  {player.wc2026.group}
                </div>
                <div className="card-meta">
                  <div className="card-stat">
                    <div className="card-stat-value">{player.worldCupGoals}</div>
                    <div className="card-stat-label">WC Goals</div>
                  </div>
                  <div className="card-stat">
                    <div className="card-stat-value">{player.worldCupApps}</div>
                    <div className="card-stat-label">WC Apps</div>
                  </div>
                  <div className="card-stat">
                    <div className="card-stat-value">
                      {player.worldCups.length - 1}
                    </div>
                    <div className="card-stat-label">World Cups</div>
                  </div>
                </div>
                <div className="card-group-preview">
                  <span className="card-group-label">
                    Group {player.wc2026.group}:
                  </span>{" "}
                  {player.wc2026.groupTeams.join(", ")}
                </div>
                <div className="card-cta">
                  View their story <span>&rarr;</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Host Cities */}
      <section className="section" id="cities">
        <div className="section-header">
          <div className="section-label">16 Host Cities</div>
          <h2 className="section-title">The Stage</h2>
        </div>
        <div className="cities-grid">
          {tournament.hostCities.map((hc) => (
            <div key={hc.city} className="city-chip">
              <span className="city-name">{hc.city}</span>
              <span className="city-venue">{hc.venue}</span>
            </div>
          ))}
        </div>
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
          Built with love for the beautiful game.
        </p>
      </footer>
    </>
  );
}
