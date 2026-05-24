export function navigateToSection(sectionId) {
  const hash = `#${sectionId}`;

  if (window.location.pathname === "/") {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.replaceState(null, "", hash);
      return;
    }
  }

  window.location.assign(hash.startsWith("#") ? `/${hash}` : `/#${sectionId}`);
}
