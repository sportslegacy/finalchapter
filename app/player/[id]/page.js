import Link from "next/link";
import { notFound } from "next/navigation";
import { players, getPlayerById, getPlayerSlugs } from "../../../data/players";
import Nav from "../../components/Nav";
import ShareCard from "../../components/ShareCard";
import MatchCountdown from "../../components/MatchCountdown";

export function generateStaticParams() {
  return getPlayerSlugs().map((id) => ({ id }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const player = getPlayerById(id);
  if (!player) return {};
  return {
    title: `${player.name} — The Final Chapter | World Cup 2026`,
    description: `${player.name}'s World Cup 2026 journey. Group ${player.wc2026.group}: ${player.wc2026.groupTeams.join(", ")}. ${player.bio}`,
  };
}

function formatMatchDate(dateStr) {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export default async function PlayerPage({ params }) {
  const { id } = await params;
  const player = getPlayerById(id);
  if (!player) notFound();

  const idx = players.findIndex((p) => p.id === player.id);
  const prev = idx > 0 ? players[idx - 1] : null;
  const next = idx < players.length - 1 ? players[idx + 1] : null;

  return (
    <>
      <Nav />

      {/* Profile Hero */}
      <section className="profile-hero">
        <Link href="/" className="back-link">
          &larr; All Legends
        </Link>
        <div className="profile-flag">{player.countryFlag}</div>
        <h1 className="profile-name">{player.name}</h1>
        <div className="profile-details">
          {player.country} &middot; {player.position} &middot; Age{" "}
          {player.ageAtTournament} at WC 2026 &middot; Group{" "}
          {player.wc2026.group}
        </div>
        <div className="profile-quote">&ldquo;{player.quote}&rdquo;</div>
        <div className="profile-stats">
          <div className="profile-stat">
            <div className="profile-stat-value">{player.worldCupGoals}</div>
            <div className="profile-stat-label">WC Goals</div>
          </div>
          <div className="profile-stat">
            <div className="profile-stat-value">{player.worldCupAssists}</div>
            <div className="profile-stat-label">WC Assists</div>
          </div>
          <div className="profile-stat">
            <div className="profile-stat-value">{player.worldCupApps}</div>
            <div className="profile-stat-label">WC Apps</div>
          </div>
          <div className="profile-stat">
            <div className="profile-stat-value">
              {player.worldCups.length - 1}
            </div>
            <div className="profile-stat-label">World Cups</div>
          </div>
        </div>
      </section>

      {/* Final Chapter pull-quote — the thematic anchor */}
      {player.finalChapterReason && (
        <section className="final-chapter-quote">
          <div className="final-chapter-mark">The Final Chapter</div>
          <p className="final-chapter-text">{player.finalChapterReason}</p>
        </section>
      )}

      {/* 2026 Match Schedule */}
      <section className="schedule-section">
        <div className="section-header">
          <div className="section-label">World Cup 2026</div>
          <h2 className="section-title">Group Stage Schedule</h2>
        </div>

        {player.wc2026.matches[0] && (
          <MatchCountdown
            match={player.wc2026.matches[0]}
            country={player.country}
          />
        )}

        <div className="group-header">
          <div className="group-badge">Group {player.wc2026.group}</div>
          <div className="group-teams">
            {player.wc2026.groupTeams.join(" · ")}
          </div>
          <p className="group-storyline">{player.wc2026.storyline}</p>
        </div>

        <div className="match-list">
          {player.wc2026.matches.map((match, i) => (
            <div key={i} className="match-item">
              <div>
                <div className="match-teams">
                  {player.country}
                  <span className="match-vs"> vs </span>
                  {match.opponent}
                </div>
              </div>
              <div className="match-details">
                <div className="match-date">
                  {formatMatchDate(match.date)}
                  {match.time !== "TBD" ? ` · ${match.time}` : ""}
                </div>
                <div className="match-venue">
                  {match.venue !== "TBD"
                    ? `${match.venue}, ${match.city}`
                    : "Venue TBD"}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Milestones at stake — what's on the line in 2026 */}
      {player.milestonesAtStake?.length > 0 && (
        <section className="milestones-section">
          <div className="section-header">
            <div className="section-label">What's on the line</div>
            <h2 className="section-title">Records in Play</h2>
          </div>
          <div className="milestones-grid">
            {player.milestonesAtStake.map((m, i) => (
              <div key={i} className="milestone-card">
                <div className="milestone-headline">{m.headline}</div>
                <p className="milestone-detail">{m.detail}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Career Timeline */}
      <section className="timeline-section">
        <div className="section-header">
          <div className="section-label">World Cup Journey</div>
          <h2 className="section-title">Every Chapter</h2>
        </div>

        <div className="timeline">
          {player.worldCups.map((wc) => {
            const isFuture = wc.year === 2026;
            const isChampion = wc.result?.includes("Champion");
            return (
              <div
                key={wc.year}
                className={`timeline-item ${isFuture ? "future" : ""}`}
              >
                <span className="timeline-emoji">{wc.emoji}</span>
                <div className="timeline-year">{wc.year}</div>
                <div className="timeline-host">{wc.host}</div>
                <div
                  className={`timeline-result ${isChampion ? "champion" : ""}`}
                >
                  {wc.result}
                </div>
                <div className="timeline-highlight">{wc.highlight}</div>
                {!isFuture && (
                  <div className="timeline-stats-row">
                    <span className="timeline-stat">
                      <strong>{wc.goals}</strong> goals
                    </span>
                    <span className="timeline-stat">
                      <strong>{wc.assists}</strong> assists
                    </span>
                    <span className="timeline-stat">
                      <strong>{wc.apps}</strong> apps
                    </span>
                    <span className="timeline-stat">Age {wc.age}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Bio & Honors */}
      <section className="bio-section">
        <p className="bio-text">{player.bio}</p>
        <div className="honors-list">
          {player.careerHonors.map((honor) => (
            <span key={honor} className="honor-tag">
              {honor}
            </span>
          ))}
        </div>
      </section>

      {/* Shareable Card */}
      <ShareCard player={player} />

      {/* Player Navigation */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          maxWidth: "600px",
          margin: "0 auto",
          padding: "0 2rem 4rem",
        }}
      >
        {prev ? (
          <Link href={`/player/${prev.id}`} className="back-link">
            &larr; {prev.name}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/player/${next.id}`}
            className="back-link"
            style={{ textAlign: "right" }}
          >
            {next.name} &rarr;
          </Link>
        ) : (
          <span />
        )}
      </div>

      {/* Footer */}
      <footer className="site-footer">
        <p>
          The Final Chapter &mdash; FIFA World Cup 2026
          <br />
          June 11 &ndash; July 19 &middot; USA &middot; Canada &middot; Mexico
        </p>
      </footer>
    </>
  );
}
