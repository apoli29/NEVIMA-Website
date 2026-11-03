import { allow, clientIp, json, readJson } from "@/lib/proposal/guard";
import { COOKIE, fromStudio, hasKey, MAX_AGE, sessionFor } from "@/lib/proposal/studio";

/* The door to /interno: the key in, a cookie out (src/lib/proposal/studio.ts).

   The door's page sends the key with fetch and gets JSON back. When the
   page's script has not run yet (a slow phone, a blocked script), the
   same form posts here as a plain form instead, and the answer is a
   redirect back to /interno, with the cookie or with the reason in
   ?porta=, so pressing "Entrar" never does nothing (user, 2026-11-03).

   GET says whether the request already carries a valid session: the
   page asks right after a right key, to tell a browser that refused the
   cookie from one that kept it. */

export const dynamic = "force-dynamic";

const cookieFor = (session: string) =>
  `${COOKIE}=${session}; Path=/; Max-Age=${MAX_AGE}; HttpOnly; SameSite=Lax${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;

export async function GET(request: Request) {
  return json({ inside: fromStudio(request) });
}

export async function POST(request: Request) {
  const asForm = (request.headers.get("content-type") ?? "").includes("application/x-www-form-urlencoded");
  const answer = (error: string | null, status: number, session?: string) => {
    if (asForm) {
      const to = new URL("/interno", request.url);
      if (error) to.searchParams.set("porta", error);
      const res = new Response(null, { status: 303, headers: { Location: to.pathname + to.search, "Cache-Control": "no-store" } });
      if (session) res.headers.set("Set-Cookie", cookieFor(session));
      return res;
    }
    const res = json(error ? { error } : { ok: true }, status);
    if (session) res.headers.set("Set-Cookie", cookieFor(session));
    return res;
  };

  // Checked first, so tries on a site with no key are not held against anyone.
  if (!hasKey()) return answer("no_key", 503);
  // A short wait (user, 2026-10-30): the key is long, so this only slows a
  // script down, and a partner who mistypes is not locked out for long.
  if (!allow(`studio:${clientIp(request)}`, 10, 60_000)) return answer("rate_limited", 429);

  let typed: unknown;
  if (asForm) {
    try {
      typed = (await request.formData()).get("key");
    } catch {
      typed = null;
    }
  } else {
    typed = ((await readJson(request)) as { key?: unknown } | null)?.key;
  }

  const session = sessionFor(typed);
  if (!session) return answer("wrong_key", 401);
  return answer(null, 200, session);
}
