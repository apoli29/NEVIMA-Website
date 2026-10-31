/* ==================================================================
   Makes, or brings up to date, the two Notion databases the requests
   go to

   From the project's folder:

     node --env-file=.env.local scripts/setup-notion.mjs

   .env.local (never committed) holds:

     NOTION_TOKEN=the integration's secret
     NOTION_PARENT=the address of an empty Notion page, shared with the
                   integration (••• > Connections > the integration)
                   (needed only to make a database)
     NOTION_FORM1_LEADS, NOTION_FORM2_LEADS=the databases' ids, once
                   they exist (needed only to update them)

   A database whose id is in .env.local is updated: the properties it
   lacks are added, and the states are put in order with any new one
   (nothing is removed, and no request is touched). One whose id is not
   is made inside NOTION_PARENT, and its id is printed: that goes into
   Vercel as NOTION_FORM1_LEADS or NOTION_FORM2_LEADS
   (src/lib/proposal/deliver.ts). The names of the properties here are
   the ones deliver.ts writes: change them together.

   Running it twice is harmless once the ids are in .env.local; before
   that, it makes the databases twice.
   ================================================================== */

const token = process.env.NOTION_TOKEN;
// The address as Notion copies it ends in "?source=copy_link": only the
// path counts, and the page's id is the last 32 characters of it.
const parentPath = (process.env.NOTION_PARENT ?? "").trim().split(/[?#]/)[0].replace(/-/g, "");
const parent = parentPath.match(/[0-9a-f]{32}$/i)?.[0];

if (!token) {
  console.error("Falta NOTION_TOKEN no .env.local.");
  process.exit(1);
}

/* The states a request goes through, in order. The meeting comes before
   the proposal (user, 2026-10-27): the form is the preparation for a
   call, and the final proposal comes out of it. */
const states = [
  { name: "Novo", color: "blue" },
  { name: "Contactado", color: "yellow" },
  { name: "Reunião marcada", color: "purple" },
  { name: "Reunião feita", color: "pink" },
  { name: "Proposta enviada", color: "orange" },
  { name: "Ganho", color: "green" },
  { name: "Perdido", color: "gray" },
];

/* The options each choice starts with, as deliver.ts writes them (in
   Portuguese, commas turned into semicolons: Notion options cannot hold
   commas). Anything else a visitor types, such as another business, is
   added by Notion as it arrives. */
const options = (...names) => names.map((name) => ({ name }));
const one = (...names) => ({ select: { options: options(...names) } });
const euro = { number: { format: "euro" } };

const common = {
  Nome: { title: {} },
  Estado: { select: { options: states } },
  Email: { email: {} },
  Telefone: { phone_number: {} },
  Empresa: { rich_text: {} },
  "Reunião": { date: {} },
  // An email that could not be sent, written by the site (user, 2026-10-31).
  Alertas: { rich_text: {} },
};

const databases = [
  {
    env: "NOTION_FORM1_LEADS",
    title: "Pedidos",
    properties: {
      ...common,
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
      // The client's answer to the final proposal's two buttons.
      "Reunião a meio": one("Sim", "Não"),
      Mensagem: { rich_text: {} },
      Idioma: one("pt", "en"),
      Origem: one("page", "overlay", "other"),
      Recebido: { date: {} },
    },
  },
  {
    env: "NOTION_FORM2_LEADS",
    title: "Parceiros",
    properties: {
      ...common,
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

/** What to send to bring a database up to date: the properties it lacks,
    and the states in order, each keeping the id Notion gave it, with any
    other option it has (one Notion made) kept after them. */
function updateFor(current, wanted) {
  const properties = {};
  for (const [name, definition] of Object.entries(wanted)) {
    if (!current[name]) properties[name] = definition;
  }
  const have = current.Estado?.select?.options ?? [];
  const known = new Map(have.map((option) => [option.name, option]));
  const ordered = states.map((state) => ({ ...(known.get(state.name) ?? {}), ...state, color: known.get(state.name)?.color ?? state.color }));
  const extra = have.filter((option) => !states.some((state) => state.name === option.name));
  properties.Estado = { select: { options: [...ordered, ...extra] } };
  return properties;
}

for (const db of databases) {
  const id = (process.env[db.env] ?? "").replace(/-/g, "");
  if (id) {
    const current = await call(`/databases/${id}`, "GET");
    const properties = updateFor(current.properties, db.properties);
    const added = Object.keys(properties).filter((name) => name !== "Estado");
    await call(`/databases/${id}`, "PATCH", { properties });
    console.log(`${db.title}: atualizada. Novas colunas: ${added.length ? added.join(", ") : "nenhuma"}. Estados em ordem.`);
    continue;
  }
  if (!parent) {
    console.error(`Falta ${db.env} (para atualizar) ou NOTION_PARENT (para criar) no .env.local.`);
    process.exit(1);
  }
  const made = await call("/databases", "POST", {
    parent: { type: "page_id", page_id: parent },
    title: [{ type: "text", text: { content: db.title } }],
    properties: db.properties,
  });
  console.log(`${db.env}=${made.id.replace(/-/g, "")}`);
}

console.log("\nSe foram criadas bases novas, copia as linhas acima para as variáveis do Vercel e do .env.local.");
