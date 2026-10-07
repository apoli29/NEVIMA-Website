import "server-only";

/* ==================================================================
   Keeping the two endpoints from being abused

   - A limit on requests per IP, over a sliding window.
   - The hidden field (`nickname`), which people never see and bots fill.
   - A minimum time between opening the form and sending a request.
   - A cap on the size of a request body.

   The limit is kept in memory, so on Vercel each running instance
   counts on its own and a cold start forgets: it stops a script hammering
   one instance, not a determined attack. If spam gets through, the
   same check can be moved onto a shared store (Upstash Redis has a free
   tier) without changing the routes.
   ================================================================== */

const hits = new Map<string, number[]>();

/** True when this key is still under `limit` requests in the last `windowMs`. */
export function allow(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  // Keep the map from growing without end on a long-lived instance.
  if (hits.size > 5000) {
    for (const [k, times] of hits) if (!times.some((t) => now - t < windowMs)) hits.delete(k);
  }
  return true;
}

export function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

/** The largest request body either endpoint accepts, in bytes. */
const MAX_BODY = 16 * 1024;

/** The body as JSON, or null when it is too large or not JSON. */
export async function readJson(request: Request): Promise<unknown | null> {
  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > MAX_BODY) return null;
  try {
    const raw = await request.text();
    if (raw.length > MAX_BODY) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/** The hidden field was filled in: a bot, not a person. */
export const caught = (body: Record<string, unknown>) =>
  typeof body.nickname === "string" && body.nickname.trim() !== "";

export const json = (data: unknown, status = 200) =>
  Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
