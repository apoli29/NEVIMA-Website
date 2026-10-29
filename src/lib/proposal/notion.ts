import "server-only";

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
  /** A time on a clock, "2026-11-06T15:00", in a time zone. */
  localDate: (local: string, zone: string) => ({ date: { start: `${local}:00`, time_zone: zone } }),
  checkbox: (value: boolean) => ({ checkbox: value }),
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

/** The new page's address, or null when it could not be made (or Notion
    is not set up). */
export async function createPage(
  databaseId: string | undefined,
  properties: Record<string, unknown>,
  children: unknown[],
): Promise<string | null> {
  const token = process.env.NOTION_TOKEN;
  if (!token || !databaseId) return null;
  try {
    const res = await fetch(`${API}/pages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "Notion-Version": VERSION,
      },
      body: JSON.stringify({
        parent: { database_id: databaseId },
        properties: Object.fromEntries(Object.entries(properties).filter(([, v]) => v !== undefined)),
        children,
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) {
      // What Notion says about a refusal names the property, never the visitor's words.
      const why = (await res.json().catch(() => ({}))) as { code?: string; message?: string };
      console.error("[nevima:notion] status", res.status, why.code ?? "", clip(why.message ?? "", 200));
      return null;
    }
    const page = (await res.json()) as { url?: string };
    return page.url ?? "";
  } catch (error) {
    console.error("[nevima:notion] failed", error instanceof Error ? error.name : "error");
    return null;
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
};

type RawPage = { id?: string; url?: string; properties?: Record<string, Record<string, unknown>> };

function readPage(page: RawPage): RequestPage | null {
  if (!page.id) return null;
  const p = page.properties ?? {};
  const text = (key: string, kind: "title" | "rich_text") =>
    ((p[key]?.[kind] as { plain_text?: string }[] | undefined) ?? []).map((t) => t.plain_text ?? "").join("");
  const select = (key: string) => (p[key]?.select as { name?: string } | null | undefined)?.name ?? "";
  const date = (key: string) => (p[key]?.date as { start?: string } | null | undefined)?.start ?? "";
  return {
    id: page.id,
    url: page.url ?? "",
    name: text("Nome", "title"),
    email: (p.Email?.email as string | null | undefined) ?? "",
    company: text("Empresa", "rich_text"),
    lang: select("Idioma") === "pt" ? "pt" : "en",
    state: select("Estado"),
    received: date("Recebido"),
    meeting: date("Reunião"),
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

/** True once the page's properties were changed. */
export async function updatePage(pageId: string, properties: Record<string, unknown>): Promise<boolean> {
  const token = process.env.NOTION_TOKEN;
  if (!token) return false;
  try {
    const res = await fetch(`${API}/pages/${pageId}`, {
      method: "PATCH",
      headers: headers(token),
      body: JSON.stringify({
        properties: Object.fromEntries(Object.entries(properties).filter(([, v]) => v !== undefined)),
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) {
      const why = (await res.json().catch(() => ({}))) as { code?: string; message?: string };
      console.error("[nevima:notion] update status", res.status, why.code ?? "", clip(why.message ?? "", 200));
      return false;
    }
    return true;
  } catch (error) {
    console.error("[nevima:notion] update failed", error instanceof Error ? error.name : "error");
    return false;
  }
}
