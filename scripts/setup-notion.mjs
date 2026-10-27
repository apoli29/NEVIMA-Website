/* ==================================================================
   Makes the two Notion databases the requests go to

   Run once, from the project's folder:

     node --env-file=.env.local scripts/setup-notion.mjs

   .env.local (never committed) needs two lines:

     NOTION_TOKEN=the integration's secret
     NOTION_PARENT=the address of an empty Notion page, shared with the
                   integration (••• > Connections > the integration)

   It makes "Pedidos" and "Parceiros" inside that page and prints their
   ids: those go into Vercel as NOTION_PROPOSALS_DB and NOTION_PARTNERS_DB
   (src/lib/proposal/deliver.ts). The names of the properties here are
   the ones deliver.ts writes: change them together.

   Running it twice makes the databases twice.
   ================================================================== */

const token = process.env.NOTION_TOKEN;
// The address as Notion copies it ends in "?source=copy_link": only the
// path counts, and the page's id is the last 32 characters of it.
const parentPath = (process.env.NOTION_PARENT ?? "").trim().split(/[?#]/)[0].replace(/-/g, "");
const parent = parentPath.match(/[0-9a-f]{32}$/i)?.[0];

if (!token || !parent) {
  console.error("Falta NOTION_TOKEN ou NOTION_PARENT (o endereço da página) no .env.local.");
  process.exit(1);
}

const states = [
  { name: "Novo", color: "blue" },
  { name: "Contactado", color: "yellow" },
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

const common = {
  Nome: { title: {} },
  Estado: { select: { options: states } },
  Email: { email: {} },
  Telefone: { phone_number: {} },
  Empresa: { rich_text: {} },
};

const databases = [
  {
    env: "NOTION_PROPOSALS_DB",
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
      "Mensal (€)": { number: { format: "euro" } },
      Prazo: { rich_text: {} },
      Mensagem: { rich_text: {} },
      Idioma: one("pt", "en"),
      Origem: one("page", "overlay", "other"),
      Recebido: { date: {} },
    },
  },
  {
    env: "NOTION_PARTNERS_DB",
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

for (const db of databases) {
  const res = await fetch("https://api.notion.com/v1/databases", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "Notion-Version": "2022-06-28",
    },
    body: JSON.stringify({
      parent: { type: "page_id", page_id: parent },
      title: [{ type: "text", text: { content: db.title } }],
      properties: db.properties,
    }),
  });
  const body = await res.json();
  if (!res.ok) {
    console.error(`Não consegui criar "${db.title}":`, body.code, body.message);
    console.error("Confirma que a página está partilhada com a integração (••• > Ligações).");
    process.exit(1);
  }
  console.log(`${db.env}=${body.id.replace(/-/g, "")}`);
}

console.log("\nCopia estas duas linhas para as variáveis do Vercel (e do .env.local, se testares em local).");
