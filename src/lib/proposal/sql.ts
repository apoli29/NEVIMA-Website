import "server-only";
import sql from "mssql";
import type { ProposalRequest } from "./deliver";

/* ==================================================================
   A copy of every proposal request in the studio's SQL Server

   Beside Notion, not instead of it (user, 2026-11-01): Notion stays
   where the studio works on a request (states, the meeting, the
   composer), and the database keeps every request as a record that
   queries can be run on. The tables, the procedure and the view are
   made by scripts/sql/nevima-db.sql.

   It never decides whether a request was delivered: that is still
   Notion's (deliver.ts). The route writes here after it has answered
   the visitor (`after()`), so a slow or sleeping database never makes
   anyone wait, and a failure only reaches the log, without the
   visitor's details.

   The database is Azure SQL's free offer, which pauses when unused: the
   first connection after a pause is refused while it wakes, so a
   refused write is tried once more after a short wait.

   Environment variables (set in Vercel, never in the repository):
   - MSSQL_SERVER    e.g. nevima-rg-de.database.windows.net
   - MSSQL_DATABASE  Nevima
   - MSSQL_USER      nevima_site (may only run the procedure)
   - MSSQL_PASSWORD
   Without all four, nothing is written and nothing fails.
   ================================================================== */

/** Time to wait before the second try, while a paused database wakes. */
const RETRY_AFTER_MS = 20_000;

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

async function insert(settings: sql.config, request: ProposalRequest, elapsedMs: number) {
  const db = await connect(settings);
  const result = await db
    .request()
    .input("Respostas", sql.NVarChar(sql.MAX), JSON.stringify(request.answers))
    .input("Contacto", sql.NVarChar(sql.MAX), JSON.stringify(request.contact))
    .input("Idioma", sql.Char(2), request.lang)
    .input("Origem", sql.VarChar(30), request.origin)
    .input("TempoMs", sql.Int, Math.min(Math.max(Math.round(elapsedMs), 0), 2_147_483_647))
    .input("Estimativa", sql.NVarChar(sql.MAX), JSON.stringify(request.estimate))
    .output("NovoId", sql.Int)
    .execute("dbo.usp_InserirPedidoProposta");
  return result.output.NovoId as number;
}

/** What the log may say about a failure: its kind and code, never a value. */
function why(error: unknown) {
  if (error instanceof Error) {
    const { code, number } = error as Error & { code?: string; number?: number };
    return [error.name, code, number].filter(Boolean).join(" ");
  }
  return "error";
}

/** Writes the request to SQL Server. The new row's id, or null when it
    was not written (not configured, or refused twice). */
export async function saveRequestToSql(request: ProposalRequest, elapsedMs: number): Promise<number | null> {
  const settings = config();
  if (!settings) return null;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const id = await insert(settings, request, elapsedMs);
      console.info("[nevima:sql] saved", id);
      return id;
    } catch (error) {
      console.error("[nevima:sql] failed", `attempt ${attempt}`, why(error));
      if (attempt === 1) await new Promise((wake) => setTimeout(wake, RETRY_AFTER_MS));
    }
  }
  return null;
}
