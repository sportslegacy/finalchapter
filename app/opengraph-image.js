import { ImageResponse } from "next/og";

// Generated at build time and served at /opengraph-image.
// 1200×630 is the canonical OG/Twitter card size.

export const alt = "The Final Chapter — World Cup 2026";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(ellipse at top, #16161d 0%, #0a0a0c 70%)",
          color: "#f0f0f2",
          padding: "80px",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            padding: "12px 28px",
            border: "1px solid rgba(212,168,83,0.5)",
            borderRadius: "999px",
            color: "#d4a853",
            fontSize: "22px",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            fontFamily: "sans-serif",
          }}
        >
          FIFA World Cup 2026 · 48 Teams
        </div>

        <div
          style={{
            display: "flex",
            fontSize: "140px",
            fontWeight: 700,
            color: "#d4a853",
            lineHeight: 1,
            marginTop: "44px",
            textAlign: "center",
          }}
        >
          The Final Chapter
        </div>

        <div
          style={{
            display: "flex",
            fontSize: "32px",
            color: "#9a9ab0",
            marginTop: "36px",
            textAlign: "center",
            maxWidth: "900px",
            lineHeight: 1.35,
          }}
        >
          Messi · Ronaldo · Modrić · Neymar · De Bruyne
        </div>

        <div
          style={{
            display: "flex",
            fontSize: "24px",
            color: "#5a5a72",
            marginTop: "24px",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            fontFamily: "sans-serif",
          }}
        >
          One last time on the biggest stage
        </div>
      </div>
    ),
    size
  );
}
