import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  players,
  getPlayerById,
  getPlayerSlugs,
  statusHeadline,
  statusStatement,
  stageLabel,
  stageIndex,
  STAGE_ORDER,
  STAGE_SHORT,
} from "../../../data/players";
import Nav from "../../components/Nav";
import MatchCountdown from "../../components/MatchCountdown";
import CountUp from "../../components/CountUp";
import GoalChart from "../../components/GoalChart";
import JsonLd from "../../components/JsonLd";
import JsonLdDedupe from "../../components/JsonLdDedupe";
import ShopLinks from "../../components/ShopLinks";

export function generateStaticParams() {
  return getPlayerSlugs().map((id) => ({ id }));
}

const ORDINALS = ["", "first", "second", "third", "fourth", "fifth", "sixth"];

export async function generateMetadata({ params }) {
  const { id } = await params;
  const player = getPlayerById(id);
  if (!player) return {};
  const ordinal = ORDINALS[player.worldCups.length] || `${player.worldCups.length}th`;
  const status = player.wc2026?.status || { stage: "group", alive: true };
  const live = status.stage !== "group" || status.alive === false;
  const head = statusHeadline(player);

  // Answer-led title + description: GSC shows the page ranks ~7 for high-volume
  // "is <player> playing / is this <player>'s last World Cup" queries but gets
  // near-zero CTR. Leading with the explicit "Yes" answer in the SERP wins the
  // click. Kept ≤160 chars so search engines show the description un-truncated.
  //
  // Once the tournament is underway, the live "still in / out / champion"
  // question becomes the higher-volume query — so the title flips to follow
  // demand ("Is X still in the 2026 World Cup?") and the description leads with
  // the current standing. Pre-tournament it stays on the evergreen "last World
  // Cup?" framing that's been pulling the impressions.
  const description = live
    ? `${head.a} ${player.name}'s ${ordinal} and likely last World Cup at ${player.ageAtTournament}. Records, milestones & full schedule.`
    : `Yes — ${player.name} plays for ${player.country} at the 2026 World Cup, his ${ordinal} and likely last at ${player.ageAtTournament}. Group ${player.wc2026.group}. Records, milestones & full schedule.`;
  const title = live
    ? `${head.q} ${head.a.split("—")[0].trim()} — The Final Chapter`
    : `Is 2026 ${player.name}'s Last World Cup? Yes — The Final Chapter`;
  return {
    title,
    description,
    alternates: { canonical: `/player/${player.id}` },
    openGraph: {
      title: `${player.name} — The Final Chapter | World Cup 2026`,
      description,
      url: `/player/${player.id}`,
      type: "profile",
    },
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

const SITE_URL = "https://finalchapterfc.com";

// Person schema for SEO — gives Google enough structured data to
// surface Knowledge Panel-style displays on player-name queries.
function buildPersonJsonLd(player) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: player.name,
    alternateName: player.fullName,
    nationality: { "@type": "Country", name: player.country },
    birthDate: player.birthDate,
    jobTitle: "Professional Footballer",
    description: player.bio,
    image: `${SITE_URL}${player.photo.src}`,
    url: `${SITE_URL}/player/${player.id}`,
    knowsAbout: ["Association Football", "FIFA World Cup"],
    award: player.careerHonors,
    memberOf: {
      "@type": "SportsTeam",
      name: `${player.country} national football team`,
      sport: "Association Football",
    },
    subjectOf: {
      "@type": "SportsEvent",
      name: "2026 FIFA World Cup",
      description:
        "The first 48-team FIFA World Cup, hosted across the USA, Canada, and Mexico from June 11 to July 19, 2026.",
      startDate: "2026-06-11",
      endDate: "2026-07-19",
      eventStatus: "https://schema.org/EventScheduled",
      sport: "Association Football",
      image: `${SITE_URL}${player.photo.src}`,
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
      performer: {
        "@type": "SportsTeam",
        name: `${player.country} national football team`,
      },
      organizer: {
        "@type": "Organization",
        name: "FIFA",
        url: "https://www.fifa.com",
      },
    },
  };
}

// FAQPage schema — mirrors the on-page Q&A so search engines can associate
// the answers with the long-tail queries they target ("is 2026 X's last
// World Cup", etc.). Note: Google now limits FAQ *rich results* to a few
// authoritative domains, but the markup remains valid and the on-page copy
// still serves the search intent + People Also Ask.
function buildFaqJsonLd(player) {
  if (!player.faqs?.length) return null;
  // Lead the FAQ markup with the live status Q&A so the "is X still in / out of
  // the World Cup" intent is the first question search engines associate with
  // the page once the tournament is underway.
  const head = statusHeadline(player);
  const statusQ = { q: head.q, a: head.a };
  const entries = [statusQ, ...player.faqs];
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: entries.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export default async function PlayerPage({ params }) {
  const { id } = await params;
  const player = getPlayerById(id);
  if (!player) notFound();

  const idx = players.findIndex((p) => p.id === player.id);
  const prev = idx > 0 ? players[idx - 1] : null;
  const next = idx < players.length - 1 ? players[idx + 1] : null;
  const faqJsonLd = buildFaqJsonLd(player);
  const firstName = player.name.split(" ")[0];

  // Live tournament status → editorial status strip + compact progress track.
  const status = player.wc2026?.status || { stage: "group", alive: true };
  const head = statusHeadline(player);
  const statusLine = statusStatement(player);
  const curIdx = stageIndex(status.stage);
  const eliminated = status.alive === false || status.stage === "eliminated";
  const isChampion = status.stage === "champion";

  return (
    <>
      <JsonLd data={buildPersonJsonLd(player)} />
      {faqJsonLd && <JsonLd data={faqJsonLd} />}
      <JsonLdDedupe />
      <Nav />

      <div
        className="player-accent-scope"
        style={{
          "--player-accent": player.colors?.primary || "var(--accent-gold)",
          "--player-accent-2":
            player.colors?.secondary || "var(--accent-gold-dim)",
        }}
      >

      {/* Live status strip — an editorial standing line + progress track that
          gives returning visitors a reason to come back as the tournament
          unfolds. (Answer-led SEO phrasing lives in the <title>/meta/FAQ
          JSON-LD; on the page a snippet-box reads off-brand.) */}
      <section
        className={`status-banner${eliminated ? " is-out" : ""}${
          isChampion ? " is-champion" : ""
        }`}
        aria-label={`${player.name} 2026 World Cup status`}
      >
        <div className="status-banner-inner">
          <p className="status-banner-label">World Cup 2026</p>
          <p className="status-banner-a">{statusLine}</p>
          <ol className="status-track" aria-hidden="true">
            {STAGE_ORDER.map((stage, i) => {
              const reached = !eliminated && i <= curIdx;
              const here = i === curIdx;
              return (
                <li
                  key={stage}
                  className={`status-step${reached ? " reached" : ""}${
                    here ? " current" : ""
                  }${here && eliminated ? " out" : ""}`}
                >
                  {STAGE_SHORT[stage]}
                </li>
              );
            })}
          </ol>
          {status.note ? (
            <p className="status-banner-note">{status.note}</p>
          ) : null}
        </div>
      </section>

      {/* Profile Hero */}
      <section className="profile-hero">
        <Link href="/#legends" className="back-link">
          &larr; All Legends
        </Link>
        {player.photo ? (
          <div className="profile-photo">
            <Image
              src={player.photo.src}
              alt={`${player.name} portrait`}
              width={720}
              height={900}
              priority
              sizes="(max-width: 600px) 80vw, 360px"
              style={{ objectPosition: player.photo.focus || "center top" }}
            />
            <span className="profile-photo-flag" aria-hidden="true">
              {player.countryFlag}
            </span>
          </div>
        ) : (
          <div className="profile-flag">{player.countryFlag}</div>
        )}
        <h1 className="profile-name">{player.name}</h1>
        <div className="profile-details">
          {player.country} &middot; {player.position} &middot; Age{" "}
          {player.ageAtTournament} at WC 2026 &middot; Group{" "}
          {player.wc2026.group}
        </div>
        <div className="profile-quote">&ldquo;{player.quote}&rdquo;</div>
        <div className="profile-stats">
          <div className="profile-stat">
            <CountUp value={player.worldCupGoals} className="profile-stat-value" />
            <div className="profile-stat-label">WC Goals</div>
          </div>
          <div className="profile-stat">
            <CountUp value={player.worldCupAssists} className="profile-stat-value" />
            <div className="profile-stat-label">WC Assists</div>
          </div>
          <div className="profile-stat">
            <CountUp value={player.worldCupApps} className="profile-stat-value" />
            <div className="profile-stat-label">WC Apps</div>
          </div>
          <div className="profile-stat">
            <CountUp
              value={player.worldCups.length - 1}
              className="profile-stat-value"
            />
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

        {/* Count down to the next UNPLAYED match (first one without a result).
            Adding a result to a played match advances this automatically —
            same single edit that drives the status strip. Hidden once all
            group games have results (knockout games aren't in matches[]). */}
        {(() => {
          const nextMatch = player.wc2026.matches.find((m) => !m.result);
          return nextMatch ? (
            <MatchCountdown match={nextMatch} country={player.country} />
          ) : null;
        })()}

        <div className="group-header">
          <div className="group-badge">Group {player.wc2026.group}</div>
          <div className="group-teams">
            {player.wc2026.groupTeams.join(" · ")}
          </div>
          <p className="group-storyline">{player.wc2026.storyline}</p>
        </div>

        <div className="match-list">
          {player.wc2026.matches.map((match, i) => (
            <div
              key={i}
              className={`match-item${match.result ? " is-played" : ""}`}
            >
              <div>
                <div className="match-teams">
                  {player.country}
                  <span className="match-vs"> vs </span>
                  {match.opponent}
                </div>
                {match.result?.scorers ? (
                  <div className="match-scorers">{match.result.scorers}</div>
                ) : null}
              </div>
              <div className="match-details">
                {match.result ? (
                  <div
                    className={`match-result outcome-${match.result.outcome.toLowerCase()}`}
                  >
                    <span className="match-result-badge">
                      {match.result.outcome}
                    </span>
                    <span className="match-result-score">
                      {match.result.score}
                    </span>
                    <span className="match-result-ft">FT</span>
                  </div>
                ) : (
                  <>
                    <div className="match-date">
                      {formatMatchDate(match.date)}
                      {match.time !== "TBD" ? ` · ${match.time}` : ""}
                    </div>
                    <div className="match-venue">
                      {match.venue !== "TBD"
                        ? `${match.venue}, ${match.city}`
                        : "Venue TBD"}
                    </div>
                  </>
                )}
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

        <div className="goal-chart-wrap">
          <div className="goal-chart-caption">Goals by World Cup</div>
          <GoalChart worldCups={player.worldCups} />
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
        {player.relatedPlayers?.length > 0 && (
          <div className="related-players">
            <span className="related-players-label">Also in The Final Chapter</span>
            <div className="related-players-list">
              {player.relatedPlayers.map((rel) => {
                const other = getPlayerById(rel.id);
                if (!other) return null;
                return (
                  <Link
                    key={rel.id}
                    href={`/player/${other.id}`}
                    className="related-player"
                  >
                    <span className="related-player-flag" aria-hidden="true">
                      {other.countryFlag}
                    </span>
                    <span className="related-player-name">{other.name}</span>
                    <span className="related-player-rel">{rel.relation}</span>
                    <span aria-hidden="true">&rarr;</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* Fan shop — Amazon Associates affiliate links (kit + books) */}
      <ShopLinks player={player} />

      {/* FAQ — targets long-tail "is 2026 X's last World Cup" search queries */}
      {player.faqs?.length > 0 && (
        <section className="faq-section">
          <div className="section-header">
            <div className="section-label">Common Questions</div>
            <h2 className="section-title">
              {firstName}&apos;s 2026 World Cup, Answered
            </h2>
          </div>
          <div className="faq-list">
            {player.faqs.map((f, i) => (
              <div key={i} className="faq-item">
                <h3 className="faq-q">{f.q}</h3>
                <p className="faq-a">{f.a}</p>
              </div>
            ))}
          </div>
        </section>
      )}

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

      {/* Photo credit (CC attribution) */}
      {player.photo && (
        <div className="photo-credit">
          Photo:{" "}
          <a href={player.photo.sourceUrl} target="_blank" rel="noopener noreferrer">
            {player.photo.credit}
          </a>
          ,{" "}
          <a href={player.photo.licenseUrl} target="_blank" rel="noopener noreferrer">
            {player.photo.license}
          </a>
          , via Wikimedia Commons (resized).
        </div>
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
