import { json } from "@/lib/proposal/guard";
import { syncDatabase } from "@/lib/proposal/sync";

/* The nightly run that puts into SQL Server every request Notion has
   and SQL Server is missing (sync.ts). Vercel calls it once a day
   (vercel.json) with "Authorization: Bearer <CRON_SECRET>"; any other
   caller is turned away, so nobody can wake the database at will. */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
/** A paused database can take two minutes to answer (sql.ts). */
export const maxDuration = 300;

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error("[nevima:sync] CRON_SECRET is not set: nothing done");
    return json({ error: "not_configured" }, 503);
  }
  if (req.headers.get("authorization") !== `Bearer ${secret}`) return json({ error: "forbidden" }, 401);

  const proposals = await syncDatabase("proposal");
  // SQL Server down: the partners wait for the next night too.
  const reports = proposals.sqlDown ? [proposals] : [proposals, await syncDatabase("partner")];
  for (const r of reports) {
    console.info("[nevima:sync]", r.kind, r.ready ? "" : "not ready", `pending ${r.pending}`, `copied ${r.copied}`, `failed ${r.failed}`, r.sqlDown ? "sql down" : "");
  }
  return json({ ok: true, reports });
}
