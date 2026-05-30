/**
 * Server component: emits a JSON-LD <script> into the static HTML.
 *
 * IMPORTANT: this is NOT a client component. A previous attempt rendered the
 * ld+json script from a client component, which caused a React 19 hydration
 * mismatch (Minified React error #418) — when hydration throws, the whole tree
 * fails to attach event handlers and client-side <Link> navigation dies
 * site-wide. Keeping this server-only means the script is plain static markup
 * with nothing to hydrate.
 *
 * On production, React still re-inserts the inline script during hydration,
 * leaving a duplicate (Google flagged "Duplicate field FAQPage"). The duplicate
 * is removed at runtime by <JsonLdDedupe />, which renders nothing.
 */
export default function JsonLd({ data }) {
  if (!data) return null;
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
