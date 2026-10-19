// The services' small photos come from images.unsplash.com, which the
// sandbox the audit was written in cannot reach. A local webp of the same
// order of size (14 KB) is served in their place so the page lays out and
// paints the same way. Set REAL_UNSPLASH=1 to load the real ones.
import path from "node:path";

const STAND_IN = path.join(path.dirname(new URL(import.meta.url).pathname), "..", "public", "cofounders", "ec.webp");

export async function standInForUnsplash(context) {
  if (process.env.REAL_UNSPLASH) return;
  await context.route("https://images.unsplash.com/**", (route) =>
    route.fulfill({ path: STAND_IN, contentType: "image/webp" }),
  );
}
