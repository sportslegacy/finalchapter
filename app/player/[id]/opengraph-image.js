import { ImageResponse } from "next/og";
import fs from "node:fs";
import path from "node:path";
import { getPlayerById, getPlayerSlugs } from "../../../data/players";

// Per-player OG card. Generated at build time, served at
// /player/<id>/opengraph-image. Falls back to the site-wide
// opengraph-image at app/ if a player can't be found.

export const alt = "The Final Chapter — World Cup 2026";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return getPlayerSlugs().map((id) => ({ id }));
}

export default async function PlayerOGImage({ params }) {
  const { id } = await params;
  const player = getPlayerById(id);
  if (!player) {
    return new ImageResponse((<div />), size);
  }

  // Read the player photo from disk and embed as a base64 data URI —
  // satori can't fetch from arbitrary URLs during build, so the
  // image must be inlined.
  const photoPath = path.join(process.cwd(), "public", player.photo.src);
  const photoBuffer = fs.readFileSync(photoPath);
  const photoDataUri = `data:image/jpeg;base64,${photoBuffer.toString("base64")}`;

  const firstMilestone = player.milestonesAtStake?.[0];
  const photoFocus = player.photo.focus || "center top";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#0a0a0c",
          color: "#f0f0f2",
          fontFamily: "Georgia, serif",
        }}
      >
        {/* Photo column (left half) */}
        <div
          style={{
            width: 540,
            height: 630,
            display: "flex",
            position: "relative",
          }}
        >
          <img
            src={photoDataUri}
            width={540}
            height={630}
            style={{
              width: 540,
              height: 630,
              objectFit: "cover",
              objectPosition: photoFocus,
            }}
          />
          {/* Gradient fade so the photo blends into the dark text panel */}
          <div
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: 160,
              height: 630,
              background:
                "linear-gradient(to right, rgba(10,10,12,0), rgba(10,10,12,1))",
            }}
          />
        </div>

        {/* Text column (right half) */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "70px 70px 70px 20px",
          }}
        >
          {/* The Final Chapter pill */}
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
              marginBottom: 32,
              background: "rgba(212, 168, 83, 0.04)",
            }}
          >
            The Final Chapter · 2026
          </div>

          {/* Player name in gold serif */}
          <div
            style={{
              display: "flex",
              fontSize: 88,
              fontWeight: 700,
              color: "#d4a853",
              lineHeight: 1,
              marginBottom: 20,
              letterSpacing: "-0.01em",
            }}
          >
            {player.name}
          </div>

          {/* Country · position · age */}
          <div
            style={{
              display: "flex",
              fontSize: 28,
              color: "#9a9ab0",
              marginBottom: 40,
              gap: 12,
            }}
          >
            <span>{player.country}</span>
            <span>·</span>
            <span>{player.position}</span>
            <span>·</span>
            <span>Age {player.ageAtTournament}</span>
          </div>

          {/* What's at stake — milestone hook */}
          {firstMilestone && (
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  display: "flex",
                  fontSize: 16,
                  color: "#5a5a72",
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  fontFamily: "sans-serif",
                  marginBottom: 10,
                }}
              >
                What&apos;s at stake
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: 44,
                  fontWeight: 700,
                  color: "#d4a853",
                  fontFamily: "Georgia, serif",
                  lineHeight: 1.1,
                }}
              >
                {firstMilestone.headline}
              </div>
            </div>
          )}
        </div>
      </div>
    ),
    size
  );
}
