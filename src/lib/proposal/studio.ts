import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

/* ==================================================================
   The studio's own door: /interno

   One key for the two partners, STUDIO_KEY in Vercel. Typed once, it
   leaves a cookie that holds a hash of the key, never the key, for 30
   days; changing the key closes every open session. Without STUDIO_KEY
   the door stays shut.

   It keeps out the curious, not a determined attacker: no accounts, no
   second factor. What is behind it sends email as the studio and
   changes requests in Notion, so the key is long and kept out of the
   repository.
   ================================================================== */

export const COOKIE = "nevima_studio";
export const MAX_AGE = 60 * 60 * 24 * 30;

/** The key, without the stray space or line break that pasting it into
    Vercel can bring along. */
const studioKey = () => process.env.STUDIO_KEY?.trim() || "";

/** False when this deployment has no key at all: nothing typed can open
    the door, and the door says so instead of "wrong key". */
export const hasKey = () => Boolean(studioKey());

const hash = (key: string) => createHmac("sha256", key).update("nevima:studio").digest("base64url");

/** The cookie's value for a key typed at the door, or null when it is not the key. */
export function sessionFor(typed: unknown): string | null {
  const key = studioKey();
  if (!key || typeof typed !== "string" || !typed.trim()) return null;
  const a = Buffer.from(hash(typed.trim()));
  const b = Buffer.from(hash(key));
  return timingSafeEqual(a, b) ? hash(key) : null;
}

/** True when the cookie was left by the door. */
export function isStudio(cookie: string | undefined): boolean {
  const key = studioKey();
  if (!key || !cookie) return false;
  const a = Buffer.from(cookie);
  const b = Buffer.from(hash(key));
  return a.length === b.length && timingSafeEqual(a, b);
}

/** The same check on a request's own cookies. */
export function fromStudio(request: Request): boolean {
  const cookie = request.headers
    .get("cookie")
    ?.split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${COOKIE}=`))
    ?.slice(COOKIE.length + 1);
  return isStudio(cookie);
}
