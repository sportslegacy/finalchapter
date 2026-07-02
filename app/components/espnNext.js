// Shared ESPN client helpers for /road-to-the-final (used by both RoadProjLive —
// the projection panel — and RoadNextOpp — the lane's upcoming-opponent caption),
// so the whole page makes ONE standings request and ONE scoreboard request,
// cached. ESPN's API is CORS:* + keyless, so this stays a static export. Every
// function is defensive (returns null/empty on bad input) so a changed API can
// never break a page.

import { tournament } from "../../data/players";

export function canon(name) {
  return String(name || "")
    .toLowerCase()
    .replace(/\bdr\b/g, " ")
    .replace(/[^a-z ]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .sort()
    .join(" ");
}
export function sameTeam(a, b) {
  const ca = canon(a);
  const cb = canon(b);
  return !!ca && !!cb && (ca === cb || ca.includes(cb) || cb.includes(ca));
}

// group letter → [{name,flag}] + a flat lookup so a resolved team keeps our flag.
export const GROUP_TEAMS = {};
const ALL_TEAMS = [];
for (const g of tournament.groups) {
  GROUP_TEAMS[g.id] = g.teams.map((t) => ({ name: t.name, flag: t.flag }));
  for (const t of g.teams) ALL_TEAMS.push({ name: t.name, flag: t.flag });
}
export function teamWithFlag(name) {
  const ours = ALL_TEAMS.find((t) => sameTeam(t.name, name));
  return ours ? { name: ours.name, flag: ours.flag } : { name, flag: "" };
}

// --- cached fetchers (60s; in-flight dedup) ------------------------------
function makeCache(getUrl) {
  let c = { at: 0, data: null, inflight: null };
  return () => {
    const now = Date.now();
    if (c.data && now - c.at < 60000) return Promise.resolve(c.data);
    if (c.inflight) return c.inflight;
    c.inflight = fetch(getUrl(), { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => {
        c = { at: Date.now(), data: j, inflight: null };
        return j;
      })
      .catch(() => {
        c.inflight = null;
        return null;
      });
    return c.inflight;
  };
}

export const getStandings = makeCache(
  () => "https://site.api.espn.com/apis/v2/sports/soccer/fifa.world/standings"
);
export const getScoreboard = makeCache(() => {
  const day = (o) =>
    new Date(Date.now() + o * 864e5).toISOString().slice(0, 10).replace(/-/g, "");
  return `https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=${day(
    -2
  )}-${day(12)}`;
});

// standings JSON → { letter: { complete, winner, runnerUp } } (our name+flag).
export function resolveGroups(json) {
  const out = {};
  const groups = [];
  const walk = (n) => {
    if (!n || typeof n !== "object") return;
    if (typeof n.name === "string" && /^Group [A-L]$/.test(n.name) && n.standings?.entries) {
      groups.push(n);
    } else {
      for (const k in n) walk(n[k]);
    }
  };
  walk(json);
  for (const grp of groups) {
    const letter = grp.name.split(" ")[1];
    const stat = (e, name) => {
      const s = (e.stats || []).find((x) => x.name === name);
      return s ? Number(s.value) : 0;
    };
    const entries = grp.standings.entries
      .map((e) => ({
        name: e.team?.displayName || "?",
        rank: stat(e, "rank"),
        played: stat(e, "gamesPlayed"),
      }))
      .sort((a, b) => (a.rank || 99) - (b.rank || 99));
    const complete = entries.length === 4 && entries.every((e) => e.played >= 3);
    const toOurs = (nm) => ({ ...teamWithFlag(nm), grp: letter });
    out[letter] = {
      complete,
      winner: entries[0] ? toOurs(entries[0].name) : null,
      runnerUp: entries[1] ? toOurs(entries[1].name) : null,
    };
  }
  return out;
}

// The nation's NEXT upcoming fixture with a REAL opponent (ESPN lists these once
// the feeding games resolve; still-open slots read "Round of 32 X Winner"). →
// { name, flag } or null.
export function resolveNextOpponent(sb, country) {
  let best = null;
  for (const e of sb?.events || []) {
    if (e.status?.type?.state !== "pre") continue;
    const names = (e.competitions?.[0]?.competitors || []).map((c) => c.team?.displayName);
    if (!names.some((n) => sameTeam(n, country))) continue;
    const opp = names.find((n) => !sameTeam(n, country)) || "";
    if (!opp || /winner|round of/i.test(opp)) continue; // placeholder slot
    const ko = new Date(e.date).getTime();
    if (!Number.isFinite(ko)) continue;
    if (!best || ko < best.ko) best = { ko, opp };
  }
  return best ? teamWithFlag(best.opp) : null;
}
