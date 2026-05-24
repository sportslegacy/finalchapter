import Link from "next/link";
import { players, tournament } from "../data/players";
import Countdown from "./components/Countdown";
import Nav from "./components/Nav";

export default function Home() {
  return (
    <>
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
            >
              <div className="card-top">
                <div className="card-flag">{player.countryFlag}</div>
                <div className="card-age">
                  Age at WC
                  <span>{player.ageAtTournament}</span>
                </div>
              </div>
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
