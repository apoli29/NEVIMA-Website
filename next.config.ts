import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: { qualities: [90] },
  // The SQL Server driver runs as Node loads it, not bundled (src/lib/proposal/sql.ts).
  serverExternalPackages: ["mssql"],
};

export default nextConfig;
