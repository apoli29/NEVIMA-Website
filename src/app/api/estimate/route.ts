import { estimate } from "@/lib/proposal/estimate";
import { recordSimulation } from "@/lib/proposal/deliver";
import { allow, caught, clientIp, json, readJson } from "@/lib/proposal/guard";
import { readAnswers } from "@/lib/proposal/validate";

/* The free-proposal estimate. Takes the answers, checks them, prices them
   against the table in lib/proposal/pricing.ts and sends back only the
   lines, the total, the timeline and what is on request: never the table. */

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!allow(`estimate:${clientIp(request)}`, 30, 10 * 60_000)) {
    return json({ error: "rate_limited" }, 429);
  }
  const body = await readJson(request);
  if (!body || typeof body !== "object" || Array.isArray(body)) return json({ error: "bad_request" }, 400);
  const fields = body as Record<string, unknown>;
  if (caught(fields)) return json({ error: "bad_request" }, 400);

  const answers = readAnswers(fields.answers);
  if (!answers.ok) return json({ error: "invalid", field: answers.error }, 422);

  const result = estimate(answers.value);
  await recordSimulation({ at: new Date().toISOString(), answers: answers.value, estimate: result });
  return json({ estimate: result });
}
