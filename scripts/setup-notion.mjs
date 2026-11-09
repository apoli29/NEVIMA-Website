/* ==================================================================
   Makes, or brings up to date, the two Notion databases the requests
   go to

   From the project's folder (tsx, because the columns' catalogue is
   TypeScript):

     npx tsx --env-file=.env.local scripts/setup-notion.mjs            updates or makes them
     npx tsx --env-file=.env.local scripts/setup-notion.mjs --ver      writes nothing: says what it would change
     npx tsx --env-file=.env.local scripts/setup-notion.mjs --limpar   also tidies "Pedidos" (below)
     npx tsx --env-file=.env.local scripts/setup-notion.mjs --ensaio   makes "Pedidos (ensaio)" only

   .env.local (never committed) holds:

     NOTION_TOKEN=the integration's secret
     NOTION_PARENT=the address of an empty Notion page, shared with the
                   integration (••• > Connections > the integration)
                   (needed only to make a database)
     NOTION_FORM1_LEADS, NOTION_FORM2_LEADS=the databases' ids, once
                   they exist (needed only to update them)

   A database whose id is in .env.local is updated: the properties it
   lacks are added, the states are put in order with any new one, and
   the selects gain the options they lack, each keeping the id Notion
   gave it (nothing is removed, and no request is touched). One whose id
   is not is made inside NOTION_PARENT, and its id is printed: that goes
   into Vercel as NOTION_FORM1_LEADS or NOTION_FORM2_LEADS
   (src/lib/proposal/deliver.ts).

   --limpar, after that, tidies "Pedidos" (user, 2026-11-09): what the
   columns that left it hold is moved into the ones that took their
   place (MOVED in steps.ts, only where those are still empty); each
   select keeps only its options and any other a request still holds;
   and the columns in REMOVED_COLUMNS are deleted. Only once the site
   that no longer writes them is live: until then it would fail to write
   a request. With --ver it says what it would move and delete, and how
   many requests hold a value in each column to delete.

   The names of the columns of "Pedidos", their options and their order
   are in src/lib/proposal/steps.ts, which the site reads too; the other
   properties' names here are the ones deliver.ts writes: change them
   together.

   --ensaio ignores the ids and makes a new database, "Pedidos (ensaio)",
   inside NOTION_PARENT, with every property, to try the site on (with
   --sem-passos, "Pedidos (ensaio, sem passos)": the columns from before
   the project and the steps, to check a request still arrives without
   them). --base=<id> updates (or, with --ver, reads) only that
   database, as "Pedidos", leaving the ids in .env.local alone: for
   running it again on a trial database.

   Running it twice is harmless once the ids are in .env.local; before
   that, it makes the databases twice.
   ================================================================== */

import {
  CLIENT_COLUMNS,
  MOVED,
  PARTNER_STATES,
  PROJECT_COLUMNS,
  REMOVED_COLUMNS,
  REQUEST_STATES,
  STEP_COLUMNS,
} from "../src/lib/proposal/steps.ts";

const args = new Set(process.argv.slice(2));
const LOOK = args.has("--ver");
const TRIAL = args.has("--ensaio");
const BARE = args.has("--sem-passos");
const TIDY = args.has("--limpar");
const ONLY = [...args].find((a) => a.startsWith("--base="))?.slice("--base=".length).replace(/-/g, "");

const token = process.env.NOTION_TOKEN;
// The address as Notion copies it ends in "?source=copy_link": only the
// path counts, and the page's id is the last 32 characters of it.
const parentPath = (process.env.NOTION_PARENT ?? "").trim().split(/[?#]/)[0].replace(/-/g, "");
const parent = parentPath.match(/[0-9a-f]{32}$/i)?.[0];

if (!token) {
  console.error("Falta NOTION_TOKEN no .env.local.");
  process.exit(1);
}

/* The options each choice starts with, as deliver.ts writes them (in
   Portuguese, commas turned into semicolons: Notion options cannot hold
   commas). Anything else a visitor types, such as another country, is
   added by Notion as it arrives. */
const options = (...names) => names.map((name) => ({ name }));
const one = (...names) => ({ select: { options: options(...names) } });
const euro = { number: { format: "euro" } };

/** Notion's name for a catalogue's type. */
const KIND = { select: "select", multi: "multi_select", date: "date", url: "url", text: "rich_text", checkbox: "checkbox" };

/** A catalogue's column as Notion's API defines it. */
function definition(column) {
  const kind = KIND[column.type];
  return { [kind]: column.options ? { options: column.options } : {} };
}

const common = (states) => ({
  Nome: { title: {} },
  Estado: { select: { options: states } },
  Email: { email: {} },
  Telefone: { phone_number: {} },
  Empresa: { rich_text: {} },
  "Reunião": { date: {} },
  // An email that could not be sent, written by the site (user, 2026-10-31).
  Alertas: { rich_text: {} },
});

// A trial database "sem passos" has only the columns from before the
// project's and the steps'.
const columns = BARE ? CLIENT_COLUMNS : [...CLIENT_COLUMNS, ...PROJECT_COLUMNS, ...STEP_COLUMNS];
const asProperties = (list) => Object.fromEntries(list.map((c) => [c.name, definition(c)]));

const databases = [
  {
    env: "NOTION_FORM1_LEADS",
    title: "Pedidos",
    states: REQUEST_STATES,
    properties: {
      ...common(REQUEST_STATES),
      ...(BARE
        ? { "Serviços": { multi_select: { options: PROJECT_COLUMNS[0].options } } }
        : {}),
      "País": one("Portugal", "Espanha", "Itália", "EUA", "Outro"),
      Idioma: one("pt", "en"),
      Recebido: { date: {} },
      Mensagem: { rich_text: {} },
      Estimativa: { rich_text: {} },
      "Mensal (€)": euro,
      Prazo: { rich_text: {} },
      // What the studio works out for the call: the price with what the
      // client chose (Y), with what the studio suggests (X), and what is
      // agreed. The notes for the call are in each page's body.
      "Valor Y (cliente)": euro,
      "Valor X (sugestões)": euro,
      "Valor final": euro,
      // The client's, the project's and the follow-up's (steps.ts).
      ...asProperties(columns),
    },
    choices: columns.filter((c) => c.type === "select" || c.type === "multi"),
    tidy: true,
  },
  {
    env: "NOTION_FORM2_LEADS",
    title: "Parceiros",
    states: PARTNER_STATES,
    properties: {
      ...common(PARTNER_STATES),
      Projeto: one("Website", "Plataforma", "Aplicação web"),
      "Ecrãs": one("1–10", "11–20", "Mais de 20"),
      "Ecrãs (estimativa)": { rich_text: {} },
      "Inspiração": one("Sim", "Não"),
      Link: { rich_text: {} },
      "Início": one("Menos de uma semana", "1–2 semanas", "3–4 semanas", "Mais de 1 mês"),
      Entrega: one("Menos de 2 semanas", "2–4 semanas", "1–2 meses", "Mais de 2 meses"),
      Modelo: one("Um projeto fechado", "Trabalho contínuo"),
      "Crédito": one("Sim; com crédito", "Não; sem crédito (white label)"),
      NDA: { checkbox: {} },
      Mensagem: { rich_text: {} },
      Idioma: one("pt", "en"),
      Recebido: { date: {} },
    },
    choices: [],
    tidy: false,
  },
];

const headers = {
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
  "Notion-Version": "2022-06-28",
};

async function call(path, method, body) {
  const res = await fetch(`https://api.notion.com/v1${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) {
    console.error(`Falhou (${method} ${path.split("/")[1]}):`, data.code, data.message);
    console.error("Confirma que a página está partilhada com a integração (••• > Ligações).");
    process.exit(1);
  }
  return data;
}

/** A select's options as they should be: the wanted ones in their order,
    each keeping the id and colour Notion has for it, then the others it
    has that `keep` allows (by default, all: sending only the new list
    would delete the others, and empty the requests that hold them). */
function mergedOptions(have, wanted, keep = () => true) {
  const known = new Map(have.map((option) => [option.name, option]));
  const ordered = wanted.map((option) => {
    const old = known.get(option.name);
    return old ? { id: old.id, name: old.name, color: old.color } : { name: option.name, color: option.color };
  });
  const extra = have
    .filter((option) => !wanted.some((w) => w.name === option.name) && keep(option.name))
    .map(({ id, name, color }) => ({ id, name, color }));
  return [...ordered, ...extra];
}

/** A property's options, select or multi-select. */
const optionsOf = (property) => property?.[property.type]?.options ?? [];

/** What to send to bring a database up to date, and what that changes,
    in words: the columns it lacks, the options its selects lack, the
    states in order. */
function updateFor(current, db) {
  const properties = {};
  const added = [];
  const lacking = [];
  const clashes = [];
  for (const [name, wanted] of Object.entries(db.properties)) {
    const type = Object.keys(wanted)[0];
    if (!current[name]) {
      properties[name] = wanted;
      added.push(name);
    } else if (type !== current[name].type) {
      clashes.push(`${name} (é ${current[name].type}, devia ser ${type})`);
    }
  }
  const have = current.Estado?.select?.options ?? [];
  const newStates = db.states.filter((s) => !have.some((h) => h.name === s.name)).map((s) => s.name);
  properties.Estado = { select: { options: mergedOptions(have, db.states) } };
  for (const column of db.choices) {
    const existing = current[column.name];
    const kind = KIND[column.type];
    if (!existing || existing.type !== kind) continue;
    const missing = column.options.filter((w) => !optionsOf(existing).some((h) => h.name === w.name));
    if (!missing.length) continue;
    properties[column.name] = { [kind]: { options: mergedOptions(optionsOf(existing), column.options) } };
    lacking.push(`${column.name}: + ${missing.map((l) => l.name).join(", ")}`);
  }
  return { properties, added, lacking, newStates, clashes };
}

/** Every request in a database, properties only. */
async function rows(id) {
  const all = [];
  let cursor;
  do {
    const page = await call(`/databases/${id}/query`, "POST", { page_size: 100, ...(cursor ? { start_cursor: cursor } : {}) });
    all.push(...page.results);
    cursor = page.has_more ? page.next_cursor : undefined;
  } while (cursor);
  return all;
}

/** A property's value in words, to compare: a select's name, the names
    of a multi-select, "true" for a ticked box, "" when empty. */
function valueOf(property) {
  if (!property) return "";
  const v = property[property.type];
  switch (property.type) {
    case "select":
      return v?.name ?? "";
    case "multi_select":
      return (v ?? []).map((o) => o.name).join(", ");
    case "checkbox":
      return v ? "true" : "";
    case "title":
    case "rich_text":
      return (v ?? []).map((t) => t.plain_text).join("");
    case "date":
      return v?.start ?? "";
    case "formula":
      return "";
    default:
      return v == null ? "" : String(v);
  }
}

/** How many requests hold each value of a select, to compare before and
    after. Names and contacts are never printed. */
function tally(list, names) {
  const counts = Object.fromEntries(names.map((n) => [n, {}]));
  for (const row of list) {
    for (const name of names) {
      const value = valueOf(row.properties?.[name]) || "(vazio)";
      counts[name][value] = (counts[name][value] ?? 0) + 1;
    }
  }
  return counts;
}

/** The tidying of "Pedidos" (--limpar): the moves, request by request;
    each select's options cut to the wanted ones and those in use; the
    columns to delete that exist. */
function tidyFor(current, db, list) {
  const moves = [];
  for (const row of list) {
    const set = {};
    for (const [from, value, to, into] of MOVED) {
      if (!current[from] || !current[to]) continue;
      const now = set[to] ?? valueOf(row.properties?.[to]);
      if (!now && valueOf(row.properties?.[from]) === value) set[to] = into;
    }
    if (Object.keys(set).length) moves.push({ id: row.id, set });
  }
  const inUse = (name) => {
    const used = new Set();
    for (const row of list) for (const v of valueOf(row.properties?.[name]).split(", ")) if (v) used.add(v);
    for (const move of moves) if (move.set[name]) used.add(move.set[name]);
    return used;
  };
  const options = {};
  const cut = [];
  for (const column of [{ name: "Estado", type: "select", options: db.states }, ...db.choices]) {
    const existing = current[column.name];
    const kind = KIND[column.type];
    if (!existing || existing.type !== kind) continue;
    const used = inUse(column.name);
    const merged = mergedOptions(optionsOf(existing), column.options, (name) => used.has(name));
    const gone = optionsOf(existing).filter((h) => !merged.some((m) => m.name === h.name)).map((h) => h.name);
    if (!gone.length) continue;
    options[column.name] = { [kind]: { options: merged } };
    cut.push(`${column.name}: − ${gone.join(", ")}`);
  }
  const removed = REMOVED_COLUMNS.filter((name) => current[name]);
  const filled = Object.fromEntries(
    removed.map((name) => [name, list.filter((row) => valueOf(row.properties?.[name])).length]),
  );
  return { moves, options, cut, removed, filled };
}

const said = (list) => (list.length ? list.join(", ") : "nenhuma");

async function make(db, title) {
  if (!parent) {
    console.error(`Falta NOTION_PARENT no .env.local (para criar ${title}).`);
    process.exit(1);
  }
  const made = await call("/databases", "POST", {
    parent: { type: "page_id", page_id: parent },
    title: [{ type: "text", text: { content: title } }],
    properties: db.properties,
  });
  return made.id.replace(/-/g, "");
}

if (TRIAL) {
  const title = BARE ? "Pedidos (ensaio, sem passos)" : "Pedidos (ensaio)";
  const id = await make(databases[0], title);
  console.log(`${title}: criada. Para apontar o site a ela, só na linha de comandos: NOTION_FORM1_LEADS=${id}`);
}

// A trial run makes its database above and touches no other.
const targets = TRIAL
  ? []
  : ONLY
    ? [{ ...databases[0], id: ONLY }]
    : databases.map((db) => ({ ...db, id: (process.env[db.env] ?? "").replace(/-/g, "") }));

for (const db of targets) {
  const { id } = db;
  if (!id) {
    if (LOOK) console.log(`\n${db.title}: sem ${db.env}, seria criada.`);
    else console.log(`${db.env}=${await make(db, db.title)}`);
    continue;
  }
  let current = (await call(`/databases/${id}`, "GET")).properties;
  const { properties, added, lacking, newStates, clashes } = updateFor(current, db);
  if (LOOK) {
    const list = await rows(id);
    const counts = tally(list, ["Estado"]);
    console.log(`\n${db.title} (só a ver: nada foi escrito)`);
    console.log(`  Colunas novas (${added.length}): ${said(added)}`);
    console.log(`  Opções novas: ${said(lacking)}`);
    console.log(`  Estados novos: ${said(newStates)}`);
    console.log(`  Estados, pela ordem: ${properties.Estado.select.options.map((o) => o.name).join(", ")}`);
    if (clashes.length) console.log(`  ATENÇÃO, tipo diferente (não se muda): ${clashes.join("; ")}`);
    console.log(`  Pedidos hoje: ${list.length}`);
    console.log(`    Estado: ${Object.entries(counts.Estado).map(([v, n]) => `${v} ${n}`).join(" · ")}`);
    if (db.tidy) {
      // As if the columns above had been added: the moves need them.
      const after = { ...current, ...Object.fromEntries(added.map((n) => [n, { type: Object.keys(properties[n])[0], ...properties[n] }])) };
      const { moves, cut, removed, filled } = tidyFor(after, db, list);
      console.log(`  Com --limpar:`);
      console.log(`    Valores a passar para as colunas novas: ${moves.length} pedido(s)`);
      for (const move of moves) console.log(`      ${Object.entries(move.set).map(([k, v]) => `${k} → ${v}`).join(" · ")}`);
      console.log(`    Opções a retirar (sem uso): ${said(cut)}`);
      console.log(`    Colunas a apagar (${removed.length}): ${removed.map((n) => `${n} [${filled[n]} com valor]`).join(", ") || "nenhuma"}`);
    }
    continue;
  }
  await call(`/databases/${id}`, "PATCH", { properties });
  console.log(`${db.title}: atualizada.`);
  console.log(`  Colunas novas: ${said(added)}.`);
  console.log(`  Opções novas: ${said(lacking)}. Estados novos: ${said(newStates)}. Estados em ordem.`);
  if (clashes.length) console.log(`  ATENÇÃO, tipo diferente (não se mudou): ${clashes.join("; ")}`);

  if (TIDY && db.tidy) {
    current = (await call(`/databases/${id}`, "GET")).properties;
    const list = await rows(id);
    const { moves, options: cutOptions, cut, removed } = tidyFor(current, db, list);
    for (const move of moves) {
      await call(`/pages/${move.id}`, "PATCH", {
        properties: Object.fromEntries(Object.entries(move.set).map(([k, v]) => [k, { select: { name: v } }])),
      });
    }
    if (removed.length) {
      await call(`/databases/${id}`, "PATCH", { properties: Object.fromEntries(removed.map((n) => [n, null])) });
    }
    if (Object.keys(cutOptions).length) await call(`/databases/${id}`, "PATCH", { properties: cutOptions });
    console.log(`  Limpeza: ${moves.length} pedido(s) com valores passados para as colunas novas.`);
    console.log(`  Opções retiradas: ${said(cut)}.`);
    console.log(`  Colunas apagadas: ${said(removed)}.`);
  }
}

if (!LOOK && !TRIAL) console.log("\nSe foram criadas bases novas, copia as linhas acima para as variáveis do Vercel e do .env.local.");
