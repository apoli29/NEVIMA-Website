import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: { qualities: [90] },
  async redirects() {
    return [
      // The portfolio page is still to be built (user, 2026-10-11): until
      // then the bar's Portfolio and the services' call land on the first
      // case study. Take this out when src/app/portfolio exists.
      { source: "/portfolio", destination: "/work/bsmartish", permanent: false },
    ];
  },
};

export default nextConfig;
