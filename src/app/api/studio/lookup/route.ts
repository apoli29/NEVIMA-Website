import { json, readJson } from "@/lib/proposal/guard";
import { findRequest } from "@/lib/proposal/notion";
import { fromStudio } from "@/lib/proposal/studio";

/* The latest request an email sent, for the composer to fill itself in. */

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!fromStudio(request)) return json({ error: "forbidden" }, 403);
  const body = (await readJson(request)) as { email?: unknown } | null;
  if (typeof body?.email !== "string" || !body.email.includes("@")) return json({ error: "invalid" }, 422);
  if (!process.env.NOTION_TOKEN || !process.env.NOTION_FORM1_LEADS) return json({ error: "not_configured" }, 503);
  const found = await findRequest(process.env.NOTION_FORM1_LEADS, body.email);
  if (!found) return json({ error: "not_found" }, 404);
  return json({ ok: true, request: found });
}
