/* ==================================================================
   Makes, or brings up to date, the two Notion databases the requests
   go to

   From the project's folder (tsx, because the steps' catalogue is
   TypeScript):

     npx tsx --env-file=.env.local scripts/setup-notion.mjs            updates or makes them
     npx tsx --env-file=.env.local scripts/setup-notion.mjs --ver      writes nothing: says what it would change
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
   the steps' selects gain the options they lack, each keeping the id
   Notion gave it (nothing is removed, and no request is touched). The
   formulas go in a second call, once the columns they read exist. One
   whose id is not is made inside NOTION_PARENT, and its id is printed:
   that goes into Vercel as NOTION_FORM1_LEADS or NOTION_FORM2_LEADS
   (src/lib/proposal/deliver.ts).

   The names of the request's steps, their options and formulas are in
   src/lib/proposal/steps.ts, which the site reads too; the other
   properties' names here are the ones deliver.ts writes: change them
   together.

   --ver reads the databases and lists the columns it would add, the
   options it would add and how many requests hold each state today.
   --ensaio ignores the ids and makes a new database, "Pedidos (ensaio)",
   inside NOTION_PARENT, with every property, to try the formulas and the
   site on (with --sem-passos, "Pedidos (ensaio, sem passos)": the
   columns from before the steps, to check a request still arrives
   without them). --base=<id> updates (or, with --ver, reads) only that
   database, as "Pedidos", leaving the ids in .env.local alone: for
   running it again on a trial database. --formulas sends the formulas
   again even where they exist, after a change to one.

   Running it twice is harmless once the ids are in .env.local; before
   that, it makes the databases twice.
   ================================================================== */

import { PARTNER_STATES, REQUEST_STATES, STEP_COLUMNS } from "../src/lib/proposal/steps.ts";

const args = new Set(process.argv.slice(2));
const LOOK = args.has("--ver");
const TRIAL = args.has("--ensaio");
const BARE = args.has("--sem-passos");
const FORMULAS = args.has("--formulas");
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
   commas). Anything else a visitor types, such as another business, is
   added by Notion as it arrives. */
const options = (...names) => names.map((name) => ({ name }));
const one = (...names) => ({ select: { options: options(...names) } });
const euro = { number: { format: "euro" } };

/** A step's column as Notion's API defines it. */
function definition(column) {
  switch (column.type) {
    case "select":
      return { select: { options: column.options } };
    case "date":
      return { date: {} };
    case "url":
      return { url: {} };
    case "text":
      return { rich_text: {} };
    case "checkbox":
      return { checkbox: {} };
    case "formula":
      return { formula: { expression: column.expression } };
  }
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

const steps = BARE ? [] : STEP_COLUMNS;
// A trial database "sem passos" has the states from before the steps,
// which are the partners' still.
const requestStates = BARE ? PARTNER_STATES : REQUEST_STATES;

const databases = [
  {
    env: "NOTION_FORM1_LEADS",
    title: "Pedidos",
    states: requestStates,
    properties: {
      ...common(requestStates),
      "Serviços": {
        multi_select: { options: options("Web design", "Identidade visual", "Sessão fotográfica", "SEO", "GEO") },
      },
      Setor: one(
        "Saúde e estética",
        "Imobiliário",
        "Restauração e hotelaria",
        "Loja / comércio",
        "Serviços profissionais",
        "Uso pessoal",
        "Outro",
      ),
      "País": one("Portugal", "Espanha", "Itália", "EUA", "Outro"),
      Estimativa: { rich_text: {} },
      "Mensal (€)": euro,
      Prazo: { rich_text: {} },
      // What the studio works out for the call: the price with what the
      // client chose (Y), with what the studio suggests (X), and what is
      // agreed. The notes for the call are in each page's body.
      "Valor Y (cliente)": euro,
      "Valor X (sugestões)": euro,
      "Valor final": euro,
      "Contrato enviado": { checkbox: {} },
      // The client's answer to the final proposal's two buttons; with the
      // steps it also has "Por responder", until the answer comes.
      "Reunião a meio": one("Sim", "Não"),
      Mensagem: { rich_text: {} },
      Idioma: one("pt", "en"),
      Origem: one("page", "overlay", "other"),
      Recebido: { date: {} },
      // The steps, from the form to the last payment (steps.ts). The
      // formulas come after, in a call of their own.
      ...Object.fromEntries(steps.filter((c) => c.type !== "formula").map((c) => [c.name, definition(c)])),
    },
    formulas: steps.filter((c) => c.type === "formula"),
    selects: steps.filter((c) => c.type === "select"),
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
    formulas: [],
    selects: [],
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
    each keeping the id and colour Notion has for it, then any other
    option it has (one Notion or a partner made). Sending only the new
    list would delete the others, and empty the requests that hold them. */
function mergedOptions(have, wanted) {
  const known = new Map(have.map((option) => [option.name, option]));
  const ordered = wanted.map((option) => {
    const old = known.get(option.name);
    return old ? { id: old.id, name: old.name, color: old.color } : { name: option.name, color: option.color };
  });
  const extra = have
    .filter((option) => !wanted.some((w) => w.name === option.name))
    .map(({ id, name, color }) => ({ id, name, color }));
  return [...ordered, ...extra];
}

/** What to send to bring a database up to date, and what that changes,
    in words: the columns it lacks, the options its steps' selects lack,
    the states in order. Formulas are left to formulasFor. */
function updateFor(current, db) {
  const properties = {};
  const added = [];
  const options = [];
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
  for (const column of db.selects) {
    const existing = current[column.name];
    if (!existing || existing.type !== "select") continue;
    const lacking = column.options.filter((w) => !existing.select.options.some((h) => h.name === w.name));
    if (!lacking.length) continue;
    properties[column.name] = { select: { options: mergedOptions(existing.select.options, column.options) } };
    options.push(`${column.name}: + ${lacking.map((l) => l.name).join(", ")}`);
  }
  return { properties, added, options, newStates, clashes };
}

/** The formulas a database lacks (or all of them, with --formulas). */
function formulasFor(current, db) {
  const missing = db.formulas.filter((f) => FORMULAS || !current[f.name]);
  return Object.fromEntries(missing.map((f) => [f.name, definition(f)]));
}

/** How many requests hold each value of a select, to compare before and
    after. Names and contacts are never printed. */
async function tally(id, names) {
  const counts = Object.fromEntries(names.map((n) => [n, {}]));
  let cursor;
  let total = 0;
  do {
    const page = await call(`/databases/${id}/query`, "POST", { page_size: 100, ...(cursor ? { start_cursor: cursor } : {}) });
    for (const row of page.results) {
      total += 1;
      for (const name of names) {
        const value = row.properties?.[name]?.select?.name ?? "(vazio)";
        counts[name][value] = (counts[name][value] ?? 0) + 1;
      }
    }
    cursor = page.has_more ? page.next_cursor : undefined;
  } while (cursor);
  return { total, counts };
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
  const formulas = formulasFor({}, db);
  if (Object.keys(formulas).length) await call(`/databases/${made.id}`, "PATCH", { properties: formulas });
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
  if (id) {
    const current = await call(`/databases/${id}`, "GET");
    const { properties, added, options, newStates, clashes } = updateFor(current.properties, db);
    const formulas = formulasFor(current.properties, db);
    if (LOOK) {
      const counted = ["Estado", ...(current.properties["Reunião a meio"] ? ["Reunião a meio"] : [])];
      const { total, counts } = await tally(id, counted);
      console.log(`\n${db.title} (só a ver: nada foi escrito)`);
      console.log(`  Colunas novas (${added.length}): ${said(added)}`);
      console.log(`  Fórmulas novas (${Object.keys(formulas).length}): ${said(Object.keys(formulas))}`);
      console.log(`  Opções novas: ${said(options)}`);
      console.log(`  Estados novos: ${said(newStates)}`);
      console.log(`  Estados, pela ordem: ${properties.Estado.select.options.map((o) => o.name).join(", ")}`);
      if (clashes.length) console.log(`  ATENÇÃO, tipo diferente (não se muda): ${clashes.join("; ")}`);
      console.log(`  Pedidos hoje: ${total}`);
      for (const name of counted) {
        console.log(`    ${name}: ${Object.entries(counts[name]).map(([v, n]) => `${v} ${n}`).join(" · ")}`);
      }
      continue;
    }
    await call(`/databases/${id}`, "PATCH", { properties });
    if (Object.keys(formulas).length) await call(`/databases/${id}`, "PATCH", { properties: formulas });
    console.log(`${db.title}: atualizada.`);
    console.log(`  Colunas novas: ${said(added)}.`);
    console.log(`  Fórmulas: ${said(Object.keys(formulas))}.`);
    console.log(`  Opções novas: ${said(options)}. Estados novos: ${said(newStates)}. Estados em ordem.`);
    if (clashes.length) console.log(`  ATENÇÃO, tipo diferente (não se mudou): ${clashes.join("; ")}`);
    continue;
  }
  if (LOOK) {
    console.log(`\n${db.title}: sem ${db.env}, seria criada.`);
    continue;
  }
  console.log(`${db.env}=${await make(db, db.title)}`);
}

if (!LOOK && !TRIAL) console.log("\nSe foram criadas bases novas, copia as linhas acima para as variáveis do Vercel e do .env.local.");
