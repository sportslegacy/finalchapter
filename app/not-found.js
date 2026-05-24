import Link from "next/link";
import Nav from "./components/Nav";

export const metadata = {
  title: "Lost on the pitch — The Final Chapter",
  description: "That page isn't on the team sheet.",
};

const linkStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.5rem",
  padding: "0.75rem 1.5rem",
  fontSize: "0.85rem",
  color: "var(--accent-gold)",
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  fontWeight: 600,
  border: "1px solid var(--accent-gold-dim)",
  borderRadius: "var(--radius)",
  transition: "background 0.2s, color 0.2s",
};

export default function NotFound() {
  return (
    <>
      <Nav />
      <section
        className="hero"
        style={{ textAlign: "center", minHeight: "70vh" }}
      >
        <div className="hero-badge">404 · Off the pitch</div>
        <h1 className="hero-title">Wrong way, legend.</h1>
        <p className="hero-subtitle">
          That page isn&apos;t on the team sheet. The match is still on — head
          back and pick a legend to follow.
        </p>
        <div
          style={{
            display: "flex",
            gap: "1rem",
            marginTop: "2rem",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <Link href="/" style={linkStyle}>
            ← Back to home
          </Link>
          <Link href="/#legends" style={linkStyle}>
            Meet the legends
          </Link>
        </div>
      </section>
    </>
  );
}
