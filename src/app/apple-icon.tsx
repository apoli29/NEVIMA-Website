import { ImageResponse } from "next/og";
import { icon } from "@/lib/brand-image";

/* The icon an iPhone or iPad puts on the home screen when the site is
   added to it, and some search results show: the site's icon, drawn at
   180px, since those do not read SVG. */

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
  const src = await icon();
  return new ImageResponse(
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" width={180} height={180} />,
    size,
  );
}
