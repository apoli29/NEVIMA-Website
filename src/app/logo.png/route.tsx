import { ImageResponse } from "next/og";
import { icon } from "@/lib/brand-image";

/* The studio's logo for search engines (the Organization in
   src/lib/seo.ts): the site's icon, square at 512px, which they ask for
   at 112px or more. Drawn once, at build time. */

export const dynamic = "force-static";

export async function GET() {
  const src = await icon();
  return new ImageResponse(
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" width={512} height={512} />,
    { width: 512, height: 512 },
  );
}
