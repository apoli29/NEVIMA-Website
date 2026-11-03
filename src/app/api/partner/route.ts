import { after } from "next/server";
import { deliverPartner, waitBefore, type PartnerRequest } from "@/lib/proposal/deliver";
import { allow, caught, clientIp, json, readJson } from "@/lib/proposal/guard";
import { savePartnerToSql } from "@/lib/proposal/sql";
import { readContact, readPartner } from "@/lib/proposal/validate";

/* A development company's request to work with us on a front end (the
   partners' form). No estimate: we get in touch, then send a fixed
   quote. The same guards as the proposal's. */

export const dynamic = "force-dynamic";
/** Room for the SQL copy's second try while a paused database wakes. */
export const maxDuration = 60;

/** Less than this between opening the form and sending is a script. */
const FASTEST_MS = 4000;

export async function POST(request: Request) {
  if (!allow(`partner:${clientIp(request)}`, 5, 15 * 60_000)) {
    return json({ error: "rate_limited" }, 429);
  }
  const body = await readJson(request);
  if (!body || typeof body !== "object" || Array.isArray(body)) return json({ error: "bad_request" }, 400);
  const fields = body as Record<string, unknown>;

  // A bot is told it worked, so it has nothing to learn from.
  const elapsed = Number(fields.elapsedMs);
  if (caught(fields) || !Number.isFinite(elapsed) || elapsed < FASTEST_MS) {
    return json({ ok: true });
  }

  const answers = readPartner(fields.answers);
  if (!answers.ok) return json({ error: "invalid", field: answers.error }, 422);
  const contact = readContact(fields.contact);
  if (!contact.ok) return json({ error: "invalid", field: contact.error }, 422);

  // One request per email in 24 hours, bar the studio's own test addresses.
  const wait = await waitBefore("partner", contact.value.email);
  if (wait > 0) return json({ error: "already_sent", waitMs: wait }, 409);

  const partner: PartnerRequest = {
    at: new Date().toISOString(),
    // The language picked for the reply, else the site's (user, 2026-10-30).
    lang: contact.value.reply ?? (fields.lang === "pt" ? "pt" : "en"),
    answers: answers.value,
    contact: contact.value,
  };

  // A copy in SQL Server once the visitor has their answer, as for
  // proposal requests (user, 2026-11-02; sql.ts).
  after(() => savePartnerToSql(partner, elapsed));

  const delivered = await deliverPartner(partner);
  if (!delivered) return json({ error: "not_configured" }, 503);
  return json({ ok: true });
}
