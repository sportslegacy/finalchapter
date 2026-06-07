"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { players } from "../../data/players";
import { navigateToSection } from "../lib/navigate-to-section";

const SECTIONS = [
  { id: "tournament", label: "Tournament" },
  { id: "legends", label: "Legends" },
  { id: "cities", label: "Cities" },
];

// The standalone tournament pages (not homepage sections). Reused by both the
// desktop "Tournament" dropdown panel and the mobile hamburger drawer so the
// two stay in sync.
const TOURNAMENT_PAGES = [
  { href: "/status", label: "Who's Still Standing" },
  { href: "/road-to-the-final", label: "Road to the Final" },
  { href: "/world-cup-2026-format", label: "How the 2026 Format Works" },
  { href: "/world-cup-2026-groups", label: "All 12 Groups" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [legendsOpen, setLegendsOpen] = useState(false);
  const [tournamentOpen, setTournamentOpen] = useState(false);
  const legendsRef = useRef(null);
  const tournamentRef = useRef(null);

  const closeAll = useCallback(() => {
    setMenuOpen(false);
    setLegendsOpen(false);
    setTournamentOpen(false);
  }, []);

  const onSectionClick = useCallback(
    (e, sectionId) => {
      e.preventDefault();
      closeAll();
      navigateToSection(sectionId);
    },
    [closeAll]
  );

  // On the homepage, clicking the logo otherwise navigates to "/" — a no-op when
  // the path is unchanged, so a scrolled-down user sees nothing happen. Scroll
  // to top instead. On player pages, let the Link navigate normally.
  const onLogoClick = useCallback(
    (e) => {
      closeAll();
      if (window.location.pathname === "/") {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
        window.history.replaceState(null, "", "/");
      }
    },
    [closeAll]
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("nav-menu-open", menuOpen);
    return () => document.body.classList.remove("nav-menu-open");
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") closeAll();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen, closeAll]);

  useEffect(() => {
    if (!legendsOpen) return;
    const onClick = (e) => {
      const inPanel = legendsRef.current?.contains(e.target);
      const onToggle = e.target.closest(".nav-legends-toggle");
      if (!inPanel && !onToggle) {
        setLegendsOpen(false);
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [legendsOpen]);

  useEffect(() => {
    if (!tournamentOpen) return;
    const onClick = (e) => {
      const inPanel = tournamentRef.current?.contains(e.target);
      const onToggle = e.target.closest(".nav-tournament-toggle");
      if (!inPanel && !onToggle) {
        setTournamentOpen(false);
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [tournamentOpen]);

  return (
    <nav
      className={`site-nav ${scrolled ? "scrolled" : ""} ${menuOpen ? "menu-open" : ""} ${legendsOpen ? "legends-open" : ""} ${tournamentOpen ? "tournament-open" : ""}`}
    >
      <div className="nav-primary">
        <div className="nav-brand">
          <button
            type="button"
            className="nav-menu-btn"
            aria-expanded={menuOpen}
            aria-controls="nav-menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => {
              setMenuOpen((open) => !open);
              setLegendsOpen(false);
              setTournamentOpen(false);
            }}
          >
            <span className="nav-menu-icon" aria-hidden="true" />
          </button>
          <Link href="/" className="nav-logo" onClick={onLogoClick}>
            <span className="nav-logo-full">The Final Chapter</span>
            <span className="nav-logo-short">Final Chapter</span>
          </Link>
        </div>

        <ul className="nav-links">
          <li className="nav-tournament-item">
            <div className="nav-legends-split">
              <a
                href="/#tournament"
                className="nav-legends-label"
                onClick={(e) => onSectionClick(e, "tournament")}
              >
                Tournament
              </a>
              <button
                type="button"
                className="nav-legends-toggle nav-tournament-toggle"
                aria-expanded={tournamentOpen}
                aria-controls="nav-tournament-panel"
                aria-label={
                  tournamentOpen ? "Hide tournament pages" : "Show tournament pages"
                }
                onClick={(e) => {
                  e.stopPropagation();
                  setTournamentOpen((open) => !open);
                  setLegendsOpen(false);
                  setMenuOpen(false);
                }}
              >
                <svg className="nav-chevron" viewBox="0 0 12 12" aria-hidden="true">
                  <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </button>
            </div>
          </li>
          <li className="nav-legends-item">
            <div className="nav-legends-split">
              <a
                href="/#legends"
                className="nav-legends-label"
                onClick={(e) => onSectionClick(e, "legends")}
              >
                Legends
              </a>
              <button
                type="button"
                className="nav-legends-toggle"
                aria-expanded={legendsOpen}
                aria-controls="nav-legends-panel"
                aria-label={legendsOpen ? "Hide player list" : "Show player list"}
                onClick={(e) => {
                  e.stopPropagation();
                  setLegendsOpen((open) => !open);
                  setTournamentOpen(false);
                  setMenuOpen(false);
                }}
              >
                <svg className="nav-chevron" viewBox="0 0 12 12" aria-hidden="true">
                  <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </button>
            </div>
          </li>
          <li>
            <a href="/#cities" onClick={(e) => onSectionClick(e, "cities")}>
              Cities
            </a>
          </li>
        </ul>
      </div>

      {tournamentOpen && (
        <div
          id="nav-tournament-panel"
          className="nav-legends-panel nav-tournament-panel"
          ref={tournamentRef}
        >
          <p className="nav-legends-panel-heading">World Cup 2026</p>
          <ul className="nav-legends-panel-list">
            {TOURNAMENT_PAGES.map((page) => (
              <li key={page.href}>
                <Link
                  href={page.href}
                  className="nav-legends-panel-player nav-tournament-panel-link"
                  onClick={closeAll}
                >
                  {page.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {legendsOpen && (
        <div id="nav-legends-panel" className="nav-legends-panel" ref={legendsRef}>
          <p className="nav-legends-panel-heading">Jump to a player</p>
          <ul className="nav-legends-panel-list">
            {players.map((player) => (
              <li key={player.id}>
                <Link
                  href={`/player/${player.id}`}
                  className="nav-legends-panel-player"
                  onClick={closeAll}
                >
                  <span className="nav-player-flag">{player.countryFlag}</span>
                  {player.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        type="button"
        className="nav-overlay"
        aria-hidden={!menuOpen}
        tabIndex={menuOpen ? 0 : -1}
        onClick={closeAll}
      />

      <div
        id="nav-menu"
        className="nav-drawer"
        aria-hidden={!menuOpen}
        inert={!menuOpen || undefined}
      >
        <p className="nav-drawer-label">Navigate</p>
        <ul className="nav-drawer-links">
          <li>
            <Link href="/" className="nav-drawer-link" onClick={closeAll}>
              Home
            </Link>
          </li>
          {TOURNAMENT_PAGES.map((page) => (
            <li key={page.href}>
              <Link
                href={page.href}
                className="nav-drawer-link"
                onClick={closeAll}
              >
                {page.label}
              </Link>
            </li>
          ))}
          {SECTIONS.map(({ id, label }) => (
            <li key={id}>
              <a
                href={`/#${id}`}
                className="nav-drawer-link"
                onClick={(e) => onSectionClick(e, id)}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
        <p className="nav-drawer-label">Players</p>
        <ul className="nav-drawer-links nav-drawer-players">
          {players.map((player) => (
            <li key={player.id}>
              <Link
                href={`/player/${player.id}`}
                className="nav-drawer-link nav-drawer-player"
                onClick={closeAll}
              >
                <span>{player.countryFlag}</span>
                {player.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
