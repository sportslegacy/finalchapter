"use client";

import { useState, useEffect } from "react";
import { useServerOffset } from "../lib/useServerOffset";

// Knockout-proof live score. Instead of polling around a pre-known kickoff for a
// pre-known opponent (which needs fixture data per round), this asks ESPN's free
// public scoreboard "is <country> playing right now?" — so it covers the WHOLE
// tournament (group AND knockouts) with zero per-round data. We only ever match
// the legend's OWN nation name (5 clean names, verified against ESPN's
// displayName); the opponent is whatever ESPN reports, so tricky opponent names
// (Côte d'Ivoire, Korea Republic, …) can never break it. Renders null whenever
// the nation isn't playing, and on any fetch/parse error — so it can never break
// the page, and a changed ESPN API just makes it silently dormant.

function canon(name) {
  return String(name || "")
    .toLowerCase()
    .replace(/\bdr\b/g, " ")
    .replace(/[^a-z ]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .sort()
    .join(" ");
}
function sameTeam(a, b) {
  const ca = canon(a);
  const cb = canon(b);
  return !!ca && !!cb && (ca === cb || ca.includes(cb) || cb.includes(ca));
}

// Shared scoreboard cache so N <LiveNow> on one page (e.g. /status with 5 cards)
// collapse to ONE network request per refresh cycle, not N. Keyed by date range;
// 25s TTL; concurrent callers share the single in-flight promise.
const SB_TTL = 25000;
const _sb = new Map(); // range -> { at, data, inflight }
function getScoreboard(range) {
  const now = Date.now();
  const hit = _sb.get(range);
  if (hit && hit.data && now - hit.at < SB_TTL) return Promise.resolve(hit.data);
  if (hit && hit.inflight) return hit.inflight;
  const inflight = fetch(
    "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=" +
      range,
    { cache: "no-store" }
  )
    .then((r) => r.json())
    .then((data) => {
      _sb.set(range, { at: Date.now(), data, inflight: null });
      return data;
    })
    .catch((err) => {
      const h = _sb.get(range) || {};
      _sb.set(range, { at: h.at || 0, data: h.data || null, inflight: null });
      throw err;
    });
  _sb.set(range, { at: hit?.at || 0, data: hit?.data || null, inflight });
  return inflight;
}

const HOUR = 3600 * 1000;
// Show a finished game for this long after kickoff (covers 2h regulation +
// extra time + penalties + a short post-FT grace) so the score never vanishes
// the instant the whistle blows; after that the recorded result / standings own
// it. ESPN's status.state is authoritative for live-vs-final; this window only
// bounds how long a FINISHED game lingers.
const FT_GRACE_MS = 3.5 * HOUR;

export default function LiveNow({ country, showFinal = false }) {
  const [info, setInfo] = useState(null);
  const offset = useServerOffset();

  useEffect(() => {
    let cancelled = false;
    let timer = null;

    // ESPN buckets games by US Eastern date. Query yesterday→tomorrow (ET) so a
    // live game is always in range regardless of the day boundary OR a wrong
    // device clock (anchored to the server's time via `offset`). EDT = UTC-4
    // for the whole Jun–Jul tournament.
    const range = () => {
      const now = Date.now() + offset;
      const etDay = (d) =>
        new Date(now - 4 * HOUR + d * 24 * HOUR)
          .toISOString()
          .slice(0, 10)
          .replace(/-/g, "");
      return `${etDay(-1)}-${etDay(1)}`;
    };

    async function poll() {
      try {
        const j = await getScoreboard(range());
        if (cancelled) return false;
        const nowMs = Date.now() + offset;
        const mine = (e) =>
          (e.competitions?.[0]?.competitors || []).some((c) =>
            sameTeam(c.team?.displayName, country)
          );
        const evs = (j.events || []).filter(mine);
        // Prefer a genuinely in-progress game; else the most recent finished one
        // still inside the grace window.
        let chosen = evs.find((e) => e.status?.type?.state === "in");
        let live = !!chosen;
        if (!chosen) {
          // Most-recent finished game still inside the grace window. Precompute
          // the kickoff and drop non-finite dates so a malformed ESPN `date`
          // can't produce an undefined sort order.
          const recent = evs
            .filter((e) => e.status?.type?.state === "post")
            .map((e) => ({ e, ko: new Date(e.date).getTime() }))
            .filter(({ ko }) => Number.isFinite(ko) && nowMs - ko < FT_GRACE_MS)
            .sort((a, b) => b.ko - a.ko)[0]?.e;
          if (recent) {
            chosen = recent;
            live = false;
          }
        }
        if (!chosen) {
          setInfo(null);
          return false;
        }
        const comp = chosen.competitions[0];
        const me = comp.competitors.find((c) =>
          sameTeam(c.team?.displayName, country)
        );
        const opp = comp.competitors.find(
          (c) => !sameTeam(c.team?.displayName, country)
        );
        setInfo({
          live,
          detail: live
            ? chosen.status?.type?.shortDetail ||
              chosen.status?.displayClock ||
              "LIVE"
            : "FT",
          mine: Number(me?.score ?? 0),
          opp: Number(opp?.score ?? 0),
          oppName: opp?.team?.displayName || "",
        });
        return live;
      } catch {
        return false; // keep prior state (null stays null); never throw to render
      }
    }

    let inFlight = false;
    async function tick() {
      // Re-entrancy guard: only ever one poll chain in flight. Without it, a
      // restart() that lands while we're parked at `await poll()` (timer still
      // null) would spawn a second self-rescheduling chain and double requests.
      if (cancelled || inFlight) return;
      inFlight = true;
      let isLive = false;
      try {
        isLive = await poll();
      } finally {
        inFlight = false;
      }
      if (cancelled) return;
      // Don't schedule the next poll while the tab is hidden — restart() resumes.
      if (document.visibilityState !== "visible") {
        timer = null;
        return;
      }
      if (timer) clearTimeout(timer);
      // Poll fast while a game is live, slowly when idle — gentle on ESPN.
      timer = setTimeout(tick, isLive ? 30000 : 90000);
    }

    // Resume + refresh the moment the tab returns to the foreground OR is
    // restored from bfcache (mobile Safari, where visibilitychange is flaky and
    // pageshow is the only reliable signal). The inFlight guard makes a double
    // fire (pageshow + visibilitychange on the same restore) a safe no-op.
    const restart = () => {
      if (document.visibilityState !== "visible") return;
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      tick();
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") restart();
      else if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    };

    tick();
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("pageshow", restart);
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("pageshow", restart);
    };
  }, [country, offset]);

  // Live-only by default: a finished game's score is already shown by the
  // recorded result (status note, "Last:" line, schedule W/D/L card), so the FT
  // line would just duplicate it. Only the homepage hero — which has no
  // recorded-result line and briefly bridges the FT→record gap — opts in via
  // showFinal.
  if (!info || (!info.live && !showFinal)) return null;
  return (
    <div
      className={`live-score${info.live ? " is-live" : ""}`}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-label={`${country} ${info.mine}, ${info.oppName} ${info.opp} — ${
        info.live ? `live ${info.detail}` : "full time"
      }`}
    >
      <span className="live-score-tag">
        {info.live ? <span className="live-dot" aria-hidden="true" /> : null}
        {info.live ? `LIVE · ${info.detail}` : "FT"}
      </span>
      <span className="live-score-line">
        {country}{" "}
        <strong>
          {info.mine}&ndash;{info.opp}
        </strong>{" "}
        {info.oppName}
      </span>
    </div>
  );
}
