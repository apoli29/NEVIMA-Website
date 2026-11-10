import "server-only";
import { estimate } from "./estimate";
import type { PartnerRequest, ProposalRequest } from "./deliver";
import { findRequest, prop, updatePage } from "./notion";
import type { Contact } from "./questions";
import { savePartnerToSql, saveRequestToSql } from "./sql";
import { readAnswers, readPartner } from "./validate";

/* ==================================================================
   Every request in Notion also in SQL Server (user, 2026-11-09)

   Notion is where every request lands; SQL Server keeps a copy, written
   by the routes once the visitor has their answer (sql.ts). That copy
   can fail: a paused database, a changed password. "Every request on
   both sides, even with the computer off" (user) is kept by a column
   and a nightly run:

   - Each Notion database has a checkbox, "SQL", ticked once the request
     is in SQL Server. The routes tick it right after their copy is
     written (markSaved).
   - Every night, Vercel runs /api/cron/sql-sync (vercel.json), which
     takes the last 30 days' pages with "SQL" unticked, writes each one
     to SQL Server from the page itself (its properties and the raw
     answers under "Respostas") and ticks it. Nothing unticked, no call
     to SQL Server: the free database is woken only when it has to be.

   Writing twice is harmless: the procedures know a request already
   there by its email and time, and skip it (nevima-db.sql).
   ================================================================== */

const API = "https://api.notion.com/v1";
const VERSION = "2022-06-28";
const TIMEOUT_MS = 15_000;

/** The column, in both Notion databases. */
export const SQL_COLUMN = "SQL";
/** How far back the nightly run looks. */
const LOOK_BACK_DAYS = 30;
/** At most this many requests a night, inside the route's 300 seconds. */
const MAX_PER_RUN = 20;

type Kind = "proposal" | "partner";
const DATABASE: Record<Kind, () => string | undefined> = {
  proposal: () => process.env.NOTION_FORM1_LEADS,
  partner: () => process.env.NOTION_FORM2_LEADS,
};

type RawPage = { id: string; properties?: Record<string, Record<string, unknown>> };
type RawBlock = { type?: string; [key: string]: unknown };

async function notion<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T | null> {
  const token = process.env.NOTION_TOKEN;
  if (!token) return null;
  try {
    const res = await fetch(`${API}${path}`, {
      method: init.method ?? "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "Notion-Version": VERSION,
      },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) {
      console.error("[nevima:sync] notion status", res.status, path.split("/")[1] ?? "");
      return null;
    }
    return (await res.json()) as T;
  } catch (error) {
    console.error("[nevima:sync] notion failed", error instanceof Error ? error.name : "error");
    return null;
  }
}

/** Adds the "SQL" checkbox to the database when it is not there yet.
    False when the database cannot be read or changed. */
async function ensureColumn(databaseId: string): Promise<boolean> {
  const db = await notion<{ properties?: Record<string, unknown> }>(`/databases/${databaseId}`);
  if (!db) return false;
  if (db.properties && SQL_COLUMN in db.properties) return true;
  const changed = await notion(`/databases/${databaseId}`, {
    method: "PATCH",
    body: { properties: { [SQL_COLUMN]: { checkbox: {} } } },
  });
  return changed !== null;
}

/** The pages received in the last days whose "SQL" box is unticked. */
async function pending(databaseId: string): Promise<RawPage[]> {
  const since = new Date(Date.now() - LOOK_BACK_DAYS * 86_400_000).toISOString();
  const pages: RawPage[] = [];
  let cursor: string | undefined;
  do {
    const found = await notion<{ results?: RawPage[]; has_more?: boolean; next_cursor?: string | null }>(
      `/databases/${databaseId}/query`,
      {
        method: "POST",
        body: {
          filter: {
            and: [
              { property: SQL_COLUMN, checkbox: { equals: false } },
              { property: "Recebido", date: { on_or_after: since } },
            ],
          },
          sorts: [{ property: "Recebido", direction: "ascending" }],
          page_size: 100,
          ...(cursor ? { start_cursor: cursor } : {}),
        },
      },
    );
    if (!found) break;
    pages.push(...(found.results ?? []));
    cursor = found.has_more ? (found.next_cursor ?? undefined) : undefined;
  } while (cursor && pages.length < MAX_PER_RUN);
  return pages.slice(0, MAX_PER_RUN);
}

const plain = (pieces: unknown) =>
  ((pieces as { plain_text?: string }[] | undefined) ?? []).map((t) => t.plain_text ?? "").join("");

/** The raw answers the page keeps under its "Respostas" heading. */
async function rawAnswers(pageId: string): Promise<unknown> {
  let cursor: string | undefined;
  let underAnswers = false;
  do {
    const found = await notion<{ results?: RawBlock[]; has_more?: boolean; next_cursor?: string | null }>(
      `/blocks/${pageId}/children?page_size=100${cursor ? `&start_cursor=${cursor}` : ""}`,
    );
    if (!found) return null;
    for (const b of found.results ?? []) {
      if (b.type?.startsWith("heading_")) {
        underAnswers = plain((b[b.type] as { rich_text?: unknown })?.rich_text).trim() === "Respostas";
      } else if (underAnswers && b.type === "code") {
        try {
          return JSON.parse(plain((b.code as { rich_text?: unknown })?.rich_text));
        } catch {
          return null;
        }
      }
    }
    cursor = found.has_more ? (found.next_cursor ?? undefined) : undefined;
  } while (cursor);
  return null;
}

/** The request's contact, language, origin and time, from the page's
    properties (deliver.ts writes them). */
function fields(page: RawPage) {
  const p = page.properties ?? {};
  const text = (key: string) => plain(p[key]?.rich_text);
  const select = (key: string) => (p[key]?.select as { name?: string } | null | undefined)?.name ?? "";
  const contact: Contact = {
    name: plain(p.Nome?.title),
    email: (p.Email?.email as string | null | undefined) ?? "",
    phone: (p.Telefone?.phone_number as string | null | undefined) ?? "",
    company: text("Empresa"),
    message: text("Mensagem"),
  };
  const origin = select("Origem");
  return {
    contact,
    lang: (select("Idioma") === "pt" ? "pt" : "en") as "pt" | "en",
    origin: (origin === "page" || origin === "overlay" ? origin : "other") as ProposalRequest["origin"],
    at: (p.Recebido?.date as { start?: string } | null | undefined)?.start ?? "",
  };
}

/** Writes one page's request to SQL Server: "copied" once it is there,
    "unreadable" when the page lacks what it needs, "sql" when SQL Server
    would not take it. */
async function copy(kind: Kind, page: RawPage): Promise<"copied" | "unreadable" | "sql"> {
  const { contact, lang, origin, at } = fields(page);
  if (!contact.email || !at) return "unreadable";
  const raw = await rawAnswers(page.id);
  if (kind === "proposal") {
    const answers = readAnswers(raw);
    if (!answers.ok) {
      console.error("[nevima:sync] answers unreadable", kind, answers.error);
      return "unreadable";
    }
    const request: ProposalRequest = {
      origin,
      at,
      lang,
      answers: answers.value,
      estimate: estimate(answers.value, undefined, lang),
      contact,
    };
    return (await saveRequestToSql(request, null)) !== null ? "copied" : "sql";
  }
  const answers = readPartner(raw);
  if (!answers.ok) {
    console.error("[nevima:sync] answers unreadable", kind, answers.error);
    return "unreadable";
  }
  const request: PartnerRequest = { at, lang, answers: answers.value, contact };
  return (await savePartnerToSql(request, null)) !== null ? "copied" : "sql";
}

export type SyncReport = {
  kind: Kind;
  pending: number;
  copied: number;
  failed: number;
  ready: boolean;
  /** SQL Server would not take a request even after its two minutes of
      tries: the rest wait for the next night. */
  sqlDown: boolean;
};

/** The nightly run for one database. */
export async function syncDatabase(kind: Kind): Promise<SyncReport> {
  const databaseId = DATABASE[kind]();
  const report: SyncReport = { kind, pending: 0, copied: 0, failed: 0, ready: false, sqlDown: false };
  if (!databaseId || !(await ensureColumn(databaseId))) return report;
  report.ready = true;
  const pages = await pending(databaseId);
  report.pending = pages.length;
  for (const page of pages) {
    const result = await copy(kind, page);
    if (result === "sql") {
      report.failed++;
      report.sqlDown = true;
      break;
    }
    const ticked = result === "copied" && (await updatePage(page.id, { [SQL_COLUMN]: prop.checkbox(true) }));
    if (ticked) report.copied++;
    else report.failed++;
  }
  return report;
}

/** Ticks "SQL" on the request's page once the route's copy is written:
    the newest page for that email, if it is this request (same time,
    give or take two minutes). A failure only means the nightly run will
    find it unticked, see it is already in SQL Server, and tick it. */
export async function markSaved(kind: Kind, email: string, at: string): Promise<void> {
  const page = await findRequest(DATABASE[kind](), email);
  if (!page) return;
  const gap = Math.abs(new Date(page.received).getTime() - new Date(at).getTime());
  if (!(gap <= 120_000)) return;
  await updatePage(page.id, { [SQL_COLUMN]: prop.checkbox(true) });
}
