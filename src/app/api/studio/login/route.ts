import { allow, clientIp, json, readJson } from "@/lib/proposal/guard";
import { COOKIE, hasKey, MAX_AGE, sessionFor } from "@/lib/proposal/studio";

/* The door to /interno: the key in, a cookie out (src/lib/proposal/studio.ts). */

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  // Checked first, so tries on a site with no key are not held against anyone.
  if (!hasKey()) return json({ error: "no_key" }, 503);
  // A short wait (user, 2026-10-30): the key is long, so this only slows a
  // script down, and a partner who mistypes is not locked out for long.
  if (!allow(`studio:${clientIp(request)}`, 10, 60_000)) return json({ error: "rate_limited" }, 429);
  const body = (await readJson(request)) as { key?: unknown } | null;
  const session = sessionFor(body?.key);
  if (!session) return json({ error: "wrong_key" }, 401);
  const res = json({ ok: true });
  res.headers.set(
    "Set-Cookie",
    `${COOKIE}=${session}; Path=/; Max-Age=${MAX_AGE}; HttpOnly; SameSite=Strict${process.env.NODE_ENV === "production" ? "; Secure" : ""}`,
  );
  return res;
}
