import { estimate } from "@/lib/proposal/estimate";
import { deliverRequest } from "@/lib/proposal/deliver";
import { allow, caught, clientIp, json, readJson } from "@/lib/proposal/guard";
import { readAnswers, readContact } from "@/lib/proposal/validate";

/* The request for a final proposal. The estimate is worked out again
   here from the answers, so what reaches the studio is the server's
   figure, not whatever the browser says it was shown. */

export const dynamic = "force-dynamic";

/** Less than this between opening the form and sending is a script. */
const FASTEST_MS = 4000;

export async function POST(request: Request) {
  if (!allow(`proposal:${clientIp(request)}`, 5, 15 * 60_000)) {
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

  const answers = readAnswers(fields.answers);
  if (!answers.ok) return json({ error: "invalid", field: answers.error }, 422);
  const contact = readContact(fields.contact);
  if (!contact.ok) return json({ error: "invalid", field: contact.error }, 422);

  const delivered = await deliverRequest({
    at: new Date().toISOString(),
    answers: answers.value,
    estimate: estimate(answers.value),
    contact: contact.value,
  });
  if (!delivered) return json({ error: "not_configured" }, 503);
  return json({ ok: true });
}
