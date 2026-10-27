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
const parentRaw = process.env.NOTION_PARENT ?? "";
const parent = parentRaw.replace(/-/g, "").match(/[0-9a-f]{32}(?=[^0-9a-f]*$)/i)?.[0];

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
      "Serviços": { multi_select: {} },
      Setor: { select: {} },
      "País": { select: {} },
      Estimativa: { rich_text: {} },
      "Mensal (€)": { number: { format: "euro" } },
      Prazo: { rich_text: {} },
      Mensagem: { rich_text: {} },
      Idioma: { select: {} },
      Origem: { select: {} },
      Recebido: { date: {} },
    },
  },
  {
    env: "NOTION_PARTNERS_DB",
    title: "Parceiros",
    properties: {
      ...common,
      Projeto: { select: {} },
      "Ecrãs": { select: {} },
      "Ecrãs (estimativa)": { rich_text: {} },
      "Inspiração": { select: {} },
      Link: { rich_text: {} },
      "Início": { select: {} },
      Entrega: { select: {} },
      Modelo: { select: {} },
      "Crédito": { select: {} },
      NDA: { checkbox: {} },
      Mensagem: { rich_text: {} },
      Idioma: { select: {} },
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
