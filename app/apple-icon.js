import { ImageResponse } from "next/og";

// 180×180 PNG generated at build time, used as the iOS home-screen icon
// when someone uses "Add to Home Screen". Static SVG works as a favicon
// but Apple Touch icons must be a raster format.

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(ellipse at top left, #1e1e28 0%, #0a0a0c 100%)",
          color: "#d4a853",
          fontFamily: "Georgia, serif",
          fontSize: 132,
          fontWeight: 700,
          letterSpacing: "-0.04em",
        }}
      >
        F
      </div>
    ),
    size
  );
}
