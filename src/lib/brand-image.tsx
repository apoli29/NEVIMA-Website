import { readFile } from "node:fs/promises";
import { join } from "node:path";

/* ==================================================================
   The pictures drawn for search engines and shared links (src/app/og,
   src/app/logo.png, src/app/apple-icon.tsx), from the brand's own files:
   the wordmark and the icon as they are, never redrawn, so the "a" keeps
   its treatment.

   Titles on them are set in Satoshi Medium as Fontshare serves it (its
   TrueType file, which the image renderer can read; the site's own copy
   is WOFF2, which it cannot, and the font's licence does not allow it to
   be converted). Fetched as the images are drawn, at build time. If
   Fontshare cannot be reached, the image is still drawn, in the
   renderer's own face, rather than failing the build.
   ================================================================== */

const asDataUri = async (file: string) =>
  `data:image/svg+xml;base64,${(await readFile(join(process.cwd(), file))).toString("base64")}`;

export const wordmark = () => asDataUri("public/nevima-wordmark-white.svg");
export const icon = () => asDataUri("src/app/icon.svg");

/** The wordmark's width over its height (its viewBox). */
export const WORDMARK_RATIO = 1103 / 243;

export async function satoshiMedium(): Promise<ArrayBuffer | null> {
  try {
    const css = await (await fetch("https://api.fontshare.com/v2/css?f[]=satoshi@500&display=swap")).text();
    const ttf = css.match(/url\('([^']+\.ttf)'\)/)?.[1];
    if (!ttf) return null;
    const font = await fetch(ttf.startsWith("//") ? `https:${ttf}` : ttf);
    return font.ok ? await font.arrayBuffer() : null;
  } catch {
    return null;
  }
}
