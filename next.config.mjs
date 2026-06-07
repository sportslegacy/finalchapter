/** @type {import('next').NextConfig} */
const nextConfig = {
  // Hide the floating "N" dev indicator badge in the bottom-left during `next dev`.
  devIndicators: false,

  // Short, easy-to-type/share aliases → canonical SEO pages. The long
  // keyword slugs stay canonical (sitemap + metadata point at them); these
  // 308s just rescue the short forms people guess/type. Vercel serves
  // redirects at the edge, so they work on a fully static deploy.
  async redirects() {
    return [
      { source: "/format", destination: "/world-cup-2026-format", permanent: true },
      { source: "/groups", destination: "/world-cup-2026-groups", permanent: true },
      { source: "/group", destination: "/world-cup-2026-groups", permanent: true },
    ];
  },
};

export default nextConfig;
