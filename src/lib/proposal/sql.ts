import "server-only";
import sql from "mssql";
import type { PartnerRequest, ProposalRequest } from "./deliver";

/* ==================================================================
   A copy of every request in the studio's SQL Server

   Both forms (user, 2026-11-02): proposal requests in PedidosProposta,
   partners in PedidosParceria. Beside Notion, not instead of it (user,
   2026-11-01): Notion stays where the studio works on a request
   (states, the meeting, the composer), and the database keeps every
   request as a record that queries can be run on. The tables, the
   procedures and the view are made by scripts/sql/nevima-db.sql.

   It never decides whether a request was delivered: that is still
   Notion's (deliver.ts). The route writes here after it has answered
   the visitor (`after()`), so a slow or sleeping database never makes
   anyone wait, and a failure only reaches the log, without the
   visitor's details.

   The database is Azure SQL's free offer, which pauses when unused: the
   first connection after a pause is refused (error 40613) and starts the
   wake, which "is generally about one minute" (Microsoft). One retry 20
   seconds later was not enough: a request sent in the evening, after a
   quiet afternoon, reached Notion and not SQL (user, 2026-11-09). A
   refused write is now tried again after 20, 40 and 60 seconds, two
   minutes in all, inside the routes' maxDuration.

   Environment variables (set in Vercel, never in the repository):
   - MSSQL_SERVER    e.g. nevima-rg-de.database.windows.net
   - MSSQL_DATABASE  Nevima
   - MSSQL_USER      nevima_site (may only run the two procedures)
   - MSSQL_PASSWORD
   Without all four, nothing is written and nothing fails.
   ================================================================== */

/** The waits before each new try, while a paused database wakes. */
const RETRY_WAITS_MS = [20_000, 40_000, 60_000];

function config(): sql.config | null {
  const { MSSQL_SERVER, MSSQL_DATABASE, MSSQL_USER, MSSQL_PASSWORD } = process.env;
  if (!MSSQL_SERVER || !MSSQL_DATABASE || !MSSQL_USER || !MSSQL_PASSWORD) return null;
  return {
    server: MSSQL_SERVER,
    database: MSSQL_DATABASE,
    user: MSSQL_USER,
    password: MSSQL_PASSWORD,
    port: 1433,
    options: { encrypt: true, trustServerCertificate: false },
    pool: { max: 2, min: 0, idleTimeoutMillis: 30_000 },
    connectionTimeout: 15_000,
    requestTimeout: 15_000,
  };
}

/* One pool per running instance, kept between requests. */
let pool: Promise<sql.ConnectionPool> | null = null;

function connect(settings: sql.config) {
  if (!pool) {
    pool = new sql.ConnectionPool(settings).connect().catch((error) => {
      pool = null; // the next try opens a new one
      throw error;
    });
  }
  return pool;
}

/* The request's own time goes in as the row's, the same as the Notion
   page's "Recebido": with the email, it is how the procedures know a
   request already saved (the route's copy and the nightly catch-up,
   sync.ts, may both try it), and skip it. */
type Insert = (db: sql.ConnectionPool) => Promise<{ id: number; inserted: boolean }>;

const received = (iso: string) => {
  const at = new Date(iso);
  return Number.isNaN(at.getTime()) ? null : at;
};

const outcome = (output: Record<string, unknown>) => ({
  id: output.NovoId as number,
  inserted: output.Inserido !== false,
});

const proposalInsert = (request: ProposalRequest, elapsedMs: number | null): Insert => async (db) => {
  const result = await db
    .request()
    .input("Respostas", sql.NVarChar(sql.MAX), JSON.stringify(request.answers))
    .input("Contacto", sql.NVarChar(sql.MAX), JSON.stringify(request.contact))
    .input("Idioma", sql.Char(2), request.lang)
    .input("Origem", sql.VarChar(30), request.origin)
    .input("TempoMs", sql.Int, clampMs(elapsedMs))
    .input("Estimativa", sql.NVarChar(sql.MAX), JSON.stringify(request.estimate))
    .input("CriadoEm", sql.DateTime2(0), received(request.at))
    .output("NovoId", sql.Int)
    .output("Inserido", sql.Bit)
    .execute("dbo.usp_InserirPedidoProposta");
  return outcome(result.output);
};

const partnerInsert = (request: PartnerRequest, elapsedMs: number | null): Insert => async (db) => {
  const result = await db
    .request()
    .input("Respostas", sql.NVarChar(sql.MAX), JSON.stringify(request.answers))
    .input("Contacto", sql.NVarChar(sql.MAX), JSON.stringify(request.contact))
    .input("Idioma", sql.Char(2), request.lang)
    .input("TempoMs", sql.Int, clampMs(elapsedMs))
    .input("CriadoEm", sql.DateTime2(0), received(request.at))
    .output("NovoId", sql.Int)
    .output("Inserido", sql.Bit)
    .execute("dbo.usp_InserirPedidoParceria");
  return outcome(result.output);
};

/** The time it took to fill in, or null when not known (a request put
    back from Notion). */
const clampMs = (ms: number | null) =>
  ms === null || !Number.isFinite(ms) ? null : Math.min(Math.max(Math.round(ms), 0), 2_147_483_647);

/** What the log may say about a failure: its kind and code, never a value. */
function why(error: unknown) {
  if (error instanceof Error) {
    const { code, number } = error as Error & { code?: string; number?: number };
    return [error.name, code, number].filter(Boolean).join(" ");
  }
  return "error";
}

/** Runs the insert, again after each wait while it is refused.
    The row's id (new, or the one already there), or null when it could
    not be written. */
async function save(kind: "proposal" | "partner", insert: Insert): Promise<number | null> {
  const settings = config();
  if (!settings) return null;
  for (let attempt = 1; attempt <= RETRY_WAITS_MS.length + 1; attempt++) {
    try {
      const { id, inserted } = await insert(await connect(settings));
      console.info("[nevima:sql]", inserted ? "saved" : "already there", kind, id);
      return id;
    } catch (error) {
      console.error("[nevima:sql] failed", kind, `attempt ${attempt}`, why(error));
      const wait = RETRY_WAITS_MS[attempt - 1];
      if (wait !== undefined) await new Promise((wake) => setTimeout(wake, wait));
    }
  }
  return null;
}

/** A proposal request, into PedidosProposta. */
export const saveRequestToSql = (request: ProposalRequest, elapsedMs: number | null) =>
  save("proposal", proposalInsert(request, elapsedMs));

/** A partner request, into PedidosParceria. */
export const savePartnerToSql = (request: PartnerRequest, elapsedMs: number | null) =>
  save("partner", partnerInsert(request, elapsedMs));
