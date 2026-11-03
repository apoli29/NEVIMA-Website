import type { NextConfig } from "next";

/* Sent with every response: the browser is told to keep to HTTPS, not to
   guess file types, how much of the address to pass on when a visitor
   leaves, and that the site uses no camera, microphone or location. */
const SECURITY_HEADERS = [
  { key: "Strict-Transport-Security", value: "max-age=63072000" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  images: { qualities: [90] },
  // Each language has its own root layout, so a missing page has one of
  // its own above both (src/app/global-not-found.tsx).
  experimental: { globalNotFound: true },
  async headers() {
    return [
      { source: "/:path*", headers: SECURITY_HEADERS },
      // Search engines list the site only at nevima.studio: on any other
      // address (Vercel's own, before the domain is linked; www, until it
      // is sent on) every page is closed to them, so no copy of the site
      // is indexed under another name. Lifts itself once the site is
      // served from nevima.studio (docs/seo-decisions.md).
      {
        source: "/:path*",
        missing: [{ type: "host", value: "nevima.studio" }],
        headers: [{ key: "X-Robots-Tag", value: "noindex" }],
      },
    ];
  },
};

export default nextConfig;
