import { allow, clientIp, json, readJson } from "@/lib/proposal/guard";
import { COOKIE, hasKey, MAX_AGE, sessionFor } from "@/lib/proposal/studio";

/* The door to /interno: the key in, a cookie out (src/lib/proposal/studio.ts). */

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!allow(`studio:${clientIp(request)}`, 8, 15 * 60_000)) return json({ error: "rate_limited" }, 429);
  if (!hasKey()) return json({ error: "no_key" }, 503);
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
