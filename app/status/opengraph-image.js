import { ImageResponse } from "next/og";
import { players, statusHeadline, stageLabel } from "../../data/players";

// OG card for the /status "Who's Still Standing" hub. Generated at build time,
// served at /status/opengraph-image. Lists the five legends with their current
// stage so a shared link previews the live state of the chase.

export const alt = "Who's Still Standing — Legends at the 2026 World Cup";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function StatusOGImage() {
  const aliveCount = players.filter((p) => {
    const st = p.wc2026?.status || { alive: true };
    return st.alive !== false && st.stage !== "eliminated";
  }).length;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#0a0a0c",
          color: "#f0f0f2",
          fontFamily: "Georgia, serif",
          padding: "64px 70px",
        }}
      >
        {/* Pill */}
        <div
          style={{
            display: "flex",
            alignSelf: "flex-start",
            padding: "10px 22px",
            border: "1px solid rgba(212, 168, 83, 0.45)",
            borderRadius: 999,
            color: "#d4a853",
            fontSize: 18,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            fontFamily: "sans-serif",
            marginBottom: 28,
            background: "rgba(212, 168, 83, 0.04)",
          }}
        >
          The Final Chapter · World Cup 2026
        </div>

        {/* Headline */}
        <div
          style={{
            display: "flex",
            fontSize: 80,
            fontWeight: 700,
            color: "#d4a853",
            lineHeight: 1,
            marginBottom: 14,
            letterSpacing: "-0.01em",
          }}
        >
          Who&apos;s Still Standing?
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 28,
            color: "#9a9ab0",
            marginBottom: 36,
            fontFamily: "sans-serif",
          }}
        >
          {aliveCount} of {players.length} legends still in it
        </div>

        {/* Legend rows */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {players.map((p) => {
            const st = p.wc2026?.status || { stage: "group", alive: true };
            const out = st.alive === false || st.stage === "eliminated";
            const accent = p.colors?.primary || "#d4a853";
            return (
              <div
                key={p.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  fontSize: 30,
                  fontFamily: "sans-serif",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    width: 14,
                    height: 14,
                    borderRadius: 999,
                    background: out ? "#5a5a72" : accent,
                    marginRight: 18,
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    width: 360,
                    color: out ? "#7a7a90" : "#f0f0f2",
                    fontWeight: 600,
                  }}
                >
                  {p.name}
                </div>
                <div
                  style={{
                    display: "flex",
                    color: out ? "#7a7a90" : "#9a9ab0",
                  }}
                >
                  {out ? "Out · " : ""}
                  {stageLabel(st.stage)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    ),
    size
  );
}
