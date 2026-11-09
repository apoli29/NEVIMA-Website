/* ==================================================================
   The columns of "Pedidos", from the client to the signed contract

   One catalogue for the two places that must agree on it: the script
   that makes the Notion database "Pedidos" (scripts/setup-notion.mjs)
   and the site that writes in it (deliver.ts, the composer's route, the
   meeting and mid-call routes). A column renamed here is renamed in
   both. The plan behind the steps is docs/client-tracking-plan.md; the
   table's order and what was merged, docs/backend-decisions.md.

   The table reads in three parts (user, 2026-11-09): the client, then
   the client's project as the form brought it, then the lead's
   follow-up, from the first contact to the signed contract. What comes
   after the contract (deposit, materials, invoices, launch) is not a
   lead's: it will have a table of its own. Every step is a choice of
   options, never a formula: the studio picks, Notion calculates nothing.

   No "server-only" here: the script reads this file too, so it holds
   nothing but names, options and pure functions.
   ================================================================== */

import {
  DESIGN,
  FEATURES,
  FORM_KINDS,
  LANGUAGES,
  PAGE_MODES,
  PAGES,
  PHOTO_PLANS,
  REACH,
  SEARCH_PLANS,
  SECTORS,
  SERVICES,
  TEXTS,
  YES_NO,
  type PageTypeId,
} from "./questions";

/** Notion's colours for a select's options. */
type Color = "default" | "gray" | "brown" | "orange" | "yellow" | "green" | "blue" | "purple" | "pink" | "red";

export type Option = { name: string; color: Color };

export type Column =
  | { name: string; type: "select" | "multi"; options: Option[] }
  | { name: string; type: "date" | "url" | "text" | "checkbox" };

/* The colours read the same in every step: grey not started, yellow
   under way, green done, red gone wrong. */
const o = (name: string, color: Color): Option => ({ name, color });

/** A list of the form's, as options in Portuguese, in its order. */
const plain = (list: readonly { pt: string }[]) => list.map((item) => o(item.pt, "default"));

/** The request's overall state in "Pedidos", in order (the meeting comes
    before the proposal, user 2026-10-27). It ends at the lead's end,
    won or lost (user, 2026-11-09). */
export const REQUEST_STATES: Option[] = [
  o("Novo", "blue"),
  o("Contactado", "yellow"),
  o("Reunião marcada", "purple"),
  o("Reunião feita", "pink"),
  o("Proposta enviada", "orange"),
  o("Ganho", "green"),
  o("Perdido", "gray"),
];

/** The partners' database keeps the states it had: the same. */
export const PARTNER_STATES: Option[] = REQUEST_STATES;

/** The kinds of page, as Notion's options hold them: short, and with no
    comma (Notion's options cannot hold one). */
export const PAGE_TYPE_NAMES: Record<PageTypeId, string> = {
  services: "Serviços (uma página)",
  servicesPages: "Serviços (página por serviço)",
  items: "Itens (sem página própria)",
  itemsPages: "Itens (página por item)",
  team: "Equipa",
  portfolio: "Portefólio e casos",
  gallery: "Galeria",
  prices: "Preços",
  testimonials: "Testemunhos",
  faq: "Perguntas frequentes",
  events: "Eventos",
  process: "Como funciona",
  partners: "Parceiros e marcas",
  work: "Trabalhe connosco",
  resources: "Recursos e descarregáveis",
  projects: "Projetos (uma página)",
  projectsPages: "Projetos (página por projeto)",
  help: "Como ajudar",
  activities: "Eventos e atividades",
  news: "Notícias",
  board: "Equipa e órgãos sociais",
  transparency: "Transparência",
  supporters: "Parceiros e apoios",
  impact: "Impacto e testemunhos",
};

/** "Not sure, you choose" on the pages, as the studio reads it. */
export const PAGES_UNSURE = "Não sei (o estúdio escolhe)";

/** The third level ticked: a project the studio does not take on. */
export const COMPLEX_FEATURE = "Loja / login / pagamentos (fora do âmbito)";

/** The client's columns, before the project (written by the site). */
export const CLIENT_COLUMNS: Column[] = [
  {
    name: "Setor",
    type: "select",
    options: [...plain(SECTORS), o("Uso pessoal", "default"), o("Uma associação sem fins lucrativos", "default")],
  },
];

/** The project as the form brought it, one answer per column (user,
    2026-11-09): until then the answers were only in each page's body.
    A column that does not apply to a request (the photo shoot's, with
    no shoot) stays empty. */
export const PROJECT_COLUMNS: Column[] = [
  { name: "Serviços", type: "multi", options: plain(SERVICES) },
  { name: "Tipo de site", type: "select", options: plain(PAGE_MODES) },
  { name: "N.º de páginas", type: "select", options: plain(PAGES) },
  {
    name: "Páginas e secções",
    type: "multi",
    options: [...Object.values(PAGE_TYPE_NAMES).map((name) => o(name, "default")), o(PAGES_UNSURE, "gray")],
  },
  { name: "Outras páginas", type: "text" },
  { name: "Design", type: "select", options: plain(DESIGN) },
  { name: "Idiomas do site", type: "multi", options: plain(LANGUAGES) },
  {
    name: "Funcionalidades",
    type: "multi",
    options: [...plain(FEATURES), o(COMPLEX_FEATURE, "red")],
  },
  { name: "Emails dos formulários", type: "select", options: plain(FORM_KINDS) },
  { name: "Textos prontos", type: "select", options: plain(TEXTS) },
  { name: "Referências", type: "text" },
  { name: "Tem domínio", type: "select", options: plain(YES_NO) },
  { name: "Urgente", type: "select", options: plain(YES_NO) },
  { name: "Sessão fotográfica", type: "select", options: plain(PHOTO_PLANS) },
  { name: "Local da sessão", type: "text" },
  { name: "SEO e GEO", type: "select", options: plain(SEARCH_PLANS) },
  { name: "Alcance", type: "select", options: plain(REACH) },
  { name: "Site atual", type: "url" },
];

/** The lead's follow-up, in the order of the process, from the first
    contact to the signed contract (docs/client-tracking-plan.md, with
    what was merged on 2026-11-09: one column per step). */
export const STEP_COLUMNS: Column[] = [
  { name: "Responsável", type: "select", options: [o("António", "blue"), o("Emanuel", "purple")] },
  {
    name: "Preparação da chamada",
    type: "select",
    options: [o("Por iniciar", "gray"), o("Iniciada", "yellow"), o("Feita", "green")],
  },
  { name: "Documento de preparação", type: "url" },
  // The invitation, the client's answer and the call's link: one step.
  {
    name: "Marcação",
    type: "select",
    options: [
      o("Convite por enviar", "gray"),
      o("A aguardar resposta", "yellow"),
      o("Vai contactar-nos", "orange"),
      o("Agendada", "blue"),
      o("Link enviado", "green"),
    ],
  },
  {
    name: "Chamada realizada",
    type: "select",
    options: [o("Por efetuar", "gray"), o("Efetuada", "green"), o("Cliente faltou", "red")],
  },
  { name: "Proposta", type: "select", options: [o("Por enviar", "gray"), o("Enviada", "green")] },
  { name: "Válida até", type: "date" },
  // The client's answer to the final proposal's two buttons.
  {
    name: "Chamada de acompanhamento",
    type: "select",
    options: [o("Por responder", "gray"), o("Sim", "green"), o("Não", "default")],
  },
  {
    name: "Contrato",
    type: "select",
    options: [o("Por enviar", "gray"), o("Enviado", "yellow"), o("Assinado", "green")],
  },
  { name: "Assinado em", type: "date" },
  {
    name: "Motivo de perda",
    type: "select",
    options: [
      o("Preço", "default"),
      o("Prazo", "default"),
      o("Escolheu outro", "default"),
      o("Sem resposta", "default"),
      o("Desistiu", "default"),
      o("Outro", "default"),
    ],
  },
  { name: "Histórico", type: "text" },
  { name: "Spam ou teste", type: "checkbox" },
];

/** The columns that left "Pedidos" on 2026-11-09 (user): repeated by
    another, formulas, or after the contract. The script moves what they
    hold into the column that took their place (MOVED), then deletes
    them, and only on demand (--limpar). */
export const REMOVED_COLUMNS = [
  // Merged into "Marcação".
  "Convite",
  "Link da chamada",
  // Formulas: "Chamada" repeated "Marcação" and "Reunião"; "Etapa atual", "Estado".
  "Chamada",
  "Etapa atual",
  // "Alertas" already says when the confirmation did not go.
  "Confirmação",
  // Merged into "Contrato".
  "Contrato enviado",
  "Contrato assinado",
  // Now "Chamada de acompanhamento".
  "Reunião a meio",
  // A technical detail, in English: it stays in the studio's notice.
  "Origem",
  // After the contract: a table of their own, later.
  "Data do acompanhamento",
  "Sinal de 25%",
  "Valor do sinal",
  "Sinal recebido em",
  "Documento do sinal",
  "Materiais",
  "Materiais até",
  "Chamada de validação",
  "Fatura final",
  "Fatura emitida em",
  "Pagamento até",
  "Pagamento final",
  "Recibo",
  "Lançamento",
];

/** What a removed column held, as the column that took its place says
    it: [old column, old value, new column, new value]. Applied only
    where the new column is still empty, before the old one goes.
    "true" stands for a ticked box. */
export const MOVED: [string, string, string, string][] = [
  ["Link da chamada", "Enviado", "Marcação", "Link enviado"],
  ["Convite", "Não enviado", "Marcação", "Convite por enviar"],
  ["Contrato assinado", "Recebido assinado", "Contrato", "Assinado"],
  ["Contrato enviado", "true", "Contrato", "Enviado"],
  ["Contrato assinado", "Por receber", "Contrato", "Por enviar"],
  ["Reunião a meio", "Sim", "Chamada de acompanhamento", "Sim"],
  ["Reunião a meio", "Não", "Chamada de acompanhamento", "Não"],
  ["Reunião a meio", "Por responder", "Chamada de acompanhamento", "Por responder"],
];

/** The order of the columns in "Pedidos", in the table and in each
    request's page (user, 2026-11-09): the client, the project, the
    follow-up, with "Estado" beside the name so a wide table still shows
    where each lead is. Notion's API cannot order columns: they are
    dragged by hand, following this list, which the guide in /interno
    shows. */
export const COLUMN_ORDER: { group: string; columns: string[] }[] = [
  {
    group: "Cliente",
    columns: ["Nome", "Estado", "Email", "Telefone", "Empresa", "Setor", "País", "Idioma", "Recebido"],
  },
  {
    group: "Projeto",
    columns: [
      "Serviços",
      "Tipo de site",
      "N.º de páginas",
      "Páginas e secções",
      "Outras páginas",
      "Design",
      "Idiomas do site",
      "Funcionalidades",
      "Emails dos formulários",
      "Textos prontos",
      "Referências",
      "Tem domínio",
      "Urgente",
      "Sessão fotográfica",
      "Local da sessão",
      "SEO e GEO",
      "Alcance",
      "Site atual",
      "Mensagem",
      "Estimativa",
      "Mensal (€)",
      "Prazo",
    ],
  },
  {
    group: "Acompanhamento",
    columns: [
      "Responsável",
      "Alertas",
      "Preparação da chamada",
      "Documento de preparação",
      "Valor Y (cliente)",
      "Valor X (sugestões)",
      "Marcação",
      "Reunião",
      "Chamada realizada",
      "Proposta",
      "Valor final",
      "Válida até",
      "Chamada de acompanhamento",
      "Contrato",
      "Assinado em",
      "Motivo de perda",
      "Histórico",
      "Spam ou teste",
    ],
  },
];

/** The steps' selects, by name: what readPage reads back. */
export const STEP_SELECTS = STEP_COLUMNS.filter((c) => c.type === "select").map((c) => c.name);

/** What a new request starts with, beside "Estado" Novo. The contract
    and the follow-up call start once the proposal is sent. */
export const ON_ARRIVAL: Record<string, string> = {
  "Preparação da chamada": "Por iniciar",
  "Marcação": "Convite por enviar",
  "Chamada realizada": "Por efetuar",
  Proposta: "Por enviar",
};

/** The states a booking must not take a request back from. */
export const PAST_BOOKING = new Set(["Reunião feita", "Proposta enviada", "Ganho", "Perdido"]);

/** How long a proposal holds, in days (the contract). */
export const OFFER_DAYS = 10;

const LISBON = "Europe/Lisbon";

function lisbonParts(at: Date) {
  return Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: LISBON,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
      .formatToParts(at)
      .map((p) => [p.type, p.value]),
  ) as Record<"year" | "month" | "day" | "hour" | "minute", string>;
}

/** The day, in Lisbon, `days` after `at`: "2026-11-19". */
export function lisbonDayAfter(at: Date, days: number) {
  const p = lisbonParts(at);
  const day = new Date(Date.UTC(+p.year, +p.month - 1, +p.day + days));
  return day.toISOString().slice(0, 10);
}

/** A slot as the history writes it: "2026-11-12T15:00" → "12/11 15:00". */
export const shortSlot = (slot: string) => `${slot.slice(8, 10)}/${slot.slice(5, 7)} ${slot.slice(11, 16)}`;

/** Who did it, for the history: the partner's first name, "cliente" or "site". */
export const firstName = (signer: string) => signer.trim().split(/\s+/)[0] ?? signer;

/** One line of "Histórico": "09/11 17:32 · Convite enviado (António)",
    on Lisbon's clock. */
export function historyLine(what: string, who: string, at = new Date()) {
  const p = lisbonParts(at);
  return `${p.day}/${p.month} ${p.hour}:${p.minute} · ${what} (${who})`;
}

/** The longest "Histórico" kept: past it, the oldest lines go. */
export const HISTORY_MAX = 6000;

/** The history with one more line at the end, its oldest lines cut
    while it is longer than HISTORY_MAX. */
export function withLine(history: string, line: string) {
  const lines = [...history.split("\n").filter((l) => l.trim()), line];
  while (lines.length > 1 && lines.join("\n").length > HISTORY_MAX) lines.shift();
  return lines.join("\n").slice(-HISTORY_MAX);
}
