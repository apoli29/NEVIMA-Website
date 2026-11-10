import "server-only";
import { historyLine, PEDIDOS, STEP_SELECTS, withLine } from "./steps";

/* ==================================================================
   Notion, as far as the requests need it: one new page in a database

   The studio's inbox is two Notion databases (proposal requests, and
   partners), made by scripts/setup-notion.mjs. A request is a page in
   one of them: its answers are the page's properties, and the longer
   things (the estimate's lines, the raw answers) are in the page.

   Notion limits what it takes, so everything is trimmed to it: 2000
   characters per piece of text, no commas or more than 100 characters in
   the name of a select option.
   ================================================================== */

const API = "https://api.notion.com/v1";
const VERSION = "2022-06-28";
const TIMEOUT_MS = 10_000;

const clip = (value: string, max: number) => (value.length > max ? value.slice(0, max) : value);

/** Text as Notion wants it: pieces of at most 2000 characters. */
function pieces(value: string) {
  const out: { type: "text"; text: { content: string } }[] = [];
  for (let at = 0; at < value.length && out.length < 100; at += 2000) {
    out.push({ type: "text", text: { content: value.slice(at, at + 2000) } });
  }
  return out;
}

/** A property's value. `undefined` leaves the property out. */
export const prop = {
  title: (value: string) => ({ title: pieces(clip(value, 200) || "Sem nome") }),
  text: (value: string) => (value ? { rich_text: pieces(value) } : undefined),
  select: (value: string) => {
    const name = clip(value.replace(/,/g, ";").trim(), 100);
    return name ? { select: { name } } : undefined;
  },
  multi: (values: string[]) => ({
    multi_select: values.map((v) => ({ name: clip(v.replace(/,/g, ";").trim(), 100) })).filter((o) => o.name),
  }),
  email: (value: string) => (value ? { email: value } : undefined),
  phone: (value: string) => (value ? { phone_number: value } : undefined),
  number: (value: number | null) => (value === null || !Number.isFinite(value) ? undefined : { number: value }),
  date: (iso: string) => ({ date: { start: iso } }),
  /** A day with no time: "2026-11-19". */
  day: (iso: string) => ({ date: { start: iso.slice(0, 10) } }),
  /** A time on a clock, "2026-11-06T15:00", in a time zone. */
  localDate: (local: string, zone: string) => ({ date: { start: `${local}:00`, time_zone: zone } }),
  checkbox: (value: boolean) => ({ checkbox: value }),
  url: (value: string) => (value ? { url: clip(value.trim(), 2000) } : undefined),
  /** Lines of text, each with its title in bold: "Site: Website · …". */
  lines: (lines: { label: string; value: string }[]) => {
    const parts = lines.flatMap((line, i) => [
      { type: "text", text: { content: `${i ? "\n" : ""}${line.label}: ` }, annotations: { bold: true } },
      ...pieces(line.value),
    ]);
    return parts.length ? { rich_text: parts.slice(0, 100) } : undefined;
  },
};

export const block = {
  heading: (value: string) => ({
    object: "block",
    type: "heading_2",
    heading_2: { rich_text: pieces(value) },
  }),
  subheading: (value: string) => ({
    object: "block",
    type: "heading_3",
    heading_3: { rich_text: pieces(value) },
  }),
  /** A line left blank, for the studio to write in. */
  blank: () => ({
    object: "block",
    type: "paragraph",
    paragraph: { rich_text: [] },
  }),
  bullet: (value: string) => ({
    object: "block",
    type: "bulleted_list_item",
    bulleted_list_item: { rich_text: pieces(value) },
  }),
  json: (value: string) => ({
    object: "block",
    type: "code",
    code: { language: "json", rich_text: pieces(value) },
  }),
};

const defined = (properties: Record<string, unknown>) =>
  Object.fromEntries(Object.entries(properties).filter(([, v]) => v !== undefined));

/* The partners rename and delete columns in Notion by hand, and Notion
   refuses a whole page or change over one column it does not have (or
   of another type). So a refusal that names a column is answered by
   sending the rest again without it: a renamed column costs that one
   value, never the request (user, 2026-11-10). What was left out goes to
   the log and, on a new page, to its "Alertas". */
const MISSING = [/^(.+?) is not a property that exists/, /^(.+?) is expected to be /];

type Sent = { ok: boolean; status: number; data: Record<string, unknown>; dropped: string[] };

/** Sends `properties` (with `send`), leaving out, one at a time, each
    column Notion says it does not have, up to a dozen. */
async function sendLeavingOut(
  properties: Record<string, unknown>,
  send: (properties: Record<string, unknown>) => Promise<Response>,
): Promise<Sent> {
  const left = defined(properties);
  const dropped: string[] = [];
  for (let tries = 0; ; tries += 1) {
    const res = await send(left);
    const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    const column =
      res.status === 400 && tries < 12
        ? MISSING.map((pattern) => String(data.message ?? "").match(pattern)?.[1]).find((name) => name && name in left)
        : undefined;
    if (!column) return { ok: res.ok, status: res.status, data, dropped };
    delete left[column];
    dropped.push(column);
  }
}

/** The new page's address and the columns left out of it (Notion no
    longer has them), or null when it could not be made (or Notion is
    not set up). `extra` (the project's text, the steps) goes with the
    rest; when Notion refuses the page for another reason than a missing
    column, it is made again without `extra`, so a request never depends
    on it. */
export async function createPage(
  databaseId: string | undefined,
  properties: Record<string, unknown>,
  children: unknown[],
  extra?: Record<string, unknown>,
): Promise<{ url: string; dropped: string[] } | null> {
  let made = await postPage(databaseId, { ...properties, ...extra }, children);
  if (made.status === 400 && extra) {
    console.error("[nevima:notion] sem os passos", 400);
    made = await postPage(databaseId, properties, children);
  }
  if (!made.ok) {
    if (made.status) {
      // What Notion says about a refusal names the property, never the visitor's words.
      console.error("[nevima:notion] status", made.status, String(made.data.code ?? ""), clip(String(made.data.message ?? ""), 200));
    }
    return null;
  }
  if (made.dropped.length) console.error("[nevima:notion] colunas em falta", made.dropped.join(", "));
  return { url: String(made.data.url ?? ""), dropped: made.dropped };
}

/** What "Alertas" says about the columns a new page was made without.
    The history is left out of it: it is a nicety, and the partners
    removed its column. */
export function droppedAlert(dropped: string[]) {
  const named = dropped.filter((name) => name !== "Histórico");
  return named.length ? `Colunas que já não existem no Notion, por preencher: ${named.join(", ")}` : "";
}

/** Makes the page, leaving out the columns Notion does not have. */
async function postPage(databaseId: string | undefined, properties: Record<string, unknown>, children: unknown[]): Promise<Sent> {
  const token = process.env.NOTION_TOKEN;
  if (!token || !databaseId) return { ok: false, status: 0, data: {}, dropped: [] };
  try {
    return await sendLeavingOut(properties, (left) =>
      fetch(`${API}/pages`, {
        method: "POST",
        headers: headers(token),
        body: JSON.stringify({ parent: { database_id: databaseId }, properties: left, children }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      }),
    );
  } catch (error) {
    console.error("[nevima:notion] failed", error instanceof Error ? error.name : "error");
    return { ok: false, status: 0, data: {}, dropped: [] };
  }
}

/** When this email last sent a request to the database, if that was
    since `sinceIso`; null when it did not. Also null when Notion cannot
    say: a visitor is let through rather than turned away over a fault
    that is ours. Relies on the databases' "Email" (stored in lower case)
    and "Recebido" properties. */
export async function lastRequestSince(
  databaseId: string | undefined,
  email: string,
  sinceIso: string,
): Promise<string | null> {
  const token = process.env.NOTION_TOKEN;
  if (!token || !databaseId) return null;
  try {
    const res = await fetch(`${API}/databases/${databaseId}/query`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "Notion-Version": VERSION,
      },
      body: JSON.stringify({
        filter: {
          and: [
            { property: "Email", email: { equals: email } },
            { property: "Recebido", date: { on_or_after: sinceIso } },
          ],
        },
        sorts: [{ property: "Recebido", direction: "descending" }],
        page_size: 1,
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) {
      const why = (await res.json().catch(() => ({}))) as { code?: string; message?: string };
      console.error("[nevima:notion] query status", res.status, why.code ?? "", clip(why.message ?? "", 200));
      return null;
    }
    const found = (await res.json()) as { results?: { properties?: { Recebido?: { date?: { start?: string } } } }[] };
    return found.results?.[0]?.properties?.Recebido?.date?.start ?? null;
  } catch (error) {
    console.error("[nevima:notion] query failed", error instanceof Error ? error.name : "error");
    return null;
  }
}

const headers = (token: string) => ({
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
  "Notion-Version": VERSION,
});

/** A request as the studio's composer and the meeting page need it. */
export type RequestPage = {
  id: string;
  url: string;
  name: string;
  email: string;
  company: string;
  lang: "en" | "pt";
  state: string;
  received: string;
  meeting: string;
  /** The name of the call's date column on this page: "Pedidos" and
      "Parceiros" name it differently (steps.ts, PEDIDOS). */
  meetingKey: string;
  /** "Sim", "Não" or "Por responder": whether the client wants the
      follow-up call. */
  midCall: string;
  /** Emails that could not be sent: nobody else would know. */
  alerts: string;
  /** One line per event: date, what, who (steps.ts). */
  history: string;
  /** Each step's select, by its column's name ("" when empty or the
      column does not exist yet). */
  steps: Record<string, string>;
};

type RawPage = { id?: string; url?: string; properties?: Record<string, Record<string, unknown>> };

function readPage(page: RawPage): RequestPage | null {
  if (!page.id) return null;
  const p = page.properties ?? {};
  const text = (key: string, kind: "title" | "rich_text") =>
    ((p[key]?.[kind] as { plain_text?: string }[] | undefined) ?? []).map((t) => t.plain_text ?? "").join("");
  const select = (key: string) => (p[key]?.select as { name?: string } | null | undefined)?.name ?? "";
  const date = (key: string) => (p[key]?.date as { start?: string } | null | undefined)?.start ?? "";
  // The page's own name for a column: "Pedidos"' first, else "Parceiros"'.
  const key = (pedidos: string, parceiros: string) => (pedidos in p ? pedidos : parceiros);
  const meetingKey = key(PEDIDOS.meeting, "Reunião");
  return {
    id: page.id,
    url: page.url ?? "",
    name: text("Nome", "title"),
    email: (p.Email?.email as string | null | undefined) ?? "",
    company: text(key(PEDIDOS.company, "Empresa"), "rich_text"),
    lang: select(key(PEDIDOS.lang, "Idioma")) === "pt" ? "pt" : "en",
    state: select("Estado"),
    received: date("Recebido"),
    meeting: date(meetingKey),
    meetingKey,
    midCall: select(PEDIDOS.followUp),
    alerts: text("Alertas", "rich_text"),
    history: text("Histórico", "rich_text"),
    steps: Object.fromEntries(STEP_SELECTS.map((name) => [name, select(name)])),
  };
}

/** The latest request this email sent to the database, or null. */
export async function findRequest(databaseId: string | undefined, email: string): Promise<RequestPage | null> {
  const token = process.env.NOTION_TOKEN;
  if (!token || !databaseId) return null;
  try {
    const res = await fetch(`${API}/databases/${databaseId}/query`, {
      method: "POST",
      headers: headers(token),
      body: JSON.stringify({
        filter: { property: "Email", email: { equals: email.trim().toLowerCase() } },
        sorts: [{ property: "Recebido", direction: "descending" }],
        page_size: 1,
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) {
      console.error("[nevima:notion] find status", res.status);
      return null;
    }
    const found = (await res.json()) as { results?: RawPage[] };
    return found.results?.[0] ? readPage(found.results[0]) : null;
  } catch (error) {
    console.error("[nevima:notion] find failed", error instanceof Error ? error.name : "error");
    return null;
  }
}

/** A request's page, or null when it cannot be read. */
export async function getRequest(pageId: string): Promise<RequestPage | null> {
  const token = process.env.NOTION_TOKEN;
  if (!token) return null;
  try {
    const res = await fetch(`${API}/pages/${pageId}`, { headers: headers(token), signal: AbortSignal.timeout(TIMEOUT_MS) });
    if (!res.ok) {
      console.error("[nevima:notion] get status", res.status);
      return null;
    }
    return readPage((await res.json()) as RawPage);
  } catch (error) {
    console.error("[nevima:notion] get failed", error instanceof Error ? error.name : "error");
    return null;
  }
}

/** A page's id, from its address as Notion gives it. */
export const pageIdFromUrl = (url: string) => url.split(/[?#]/)[0].replace(/-/g, "").match(/[0-9a-f]{32}$/i)?.[0] ?? "";

/** Says on the page that an email could not be sent, after what it
    already says. A failure here only reaches the log. */
export const addAlert = (pageId: string, current: string, words: string) =>
  updatePage(pageId, { Alertas: prop.text(current ? `${current} · ${words}` : words) });

/** True once the page's properties were changed: at least one of them,
    when Notion no longer has some (they are left out, and logged). */
export async function updatePage(pageId: string, properties: Record<string, unknown>): Promise<boolean> {
  const token = process.env.NOTION_TOKEN;
  if (!token) return false;
  try {
    const sent = await sendLeavingOut(properties, (left) =>
      fetch(`${API}/pages/${pageId}`, {
        method: "PATCH",
        headers: headers(token),
        body: JSON.stringify({ properties: left }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      }),
    );
    if (sent.dropped.length) console.error("[nevima:notion] colunas em falta", sent.dropped.join(", "));
    if (!sent.ok) {
      console.error("[nevima:notion] update status", sent.status, String(sent.data.code ?? ""), clip(String(sent.data.message ?? ""), 200));
      return false;
    }
    return sent.dropped.length < Object.keys(defined(properties)).length;
  } catch (error) {
    console.error("[nevima:notion] update failed", error instanceof Error ? error.name : "error");
    return false;
  }
}

/** Moves a request's steps on and adds a line to its "Histórico", in one
    change, after what the site already wrote: the steps never stand in
    the way of what the client or the studio did. True once Notion took
    it; a failure only reaches the log. `history` is the page's
    "Histórico" as read before. The history is a nicety: with no column
    for it (the partners removed it, 2026-11-10) the line is left out,
    and a change that was only the line counts as done. */
export async function setSteps(
  pageId: string,
  history: string,
  steps: Record<string, string>,
  what: string,
  who: string,
  more: Record<string, unknown> = {},
) {
  const done = await updatePage(pageId, {
    ...Object.fromEntries(Object.entries(steps).map(([name, value]) => [name, prop.select(value)])),
    ...more,
    "Histórico": prop.text(withLine(history, historyLine(what, who))),
  });
  return done || Object.keys(steps).length + Object.keys(more).length === 0;
}
