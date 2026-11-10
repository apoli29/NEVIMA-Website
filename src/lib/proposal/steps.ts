/* ==================================================================
   The columns of "Pedidos", from the client to the signed contract

   One catalogue for the two places that must agree on it: the script
   that makes the Notion database "Pedidos" (scripts/setup-notion.mjs)
   and the site that writes in it (deliver.ts, the composer's route, the
   meeting and mid-call routes). A column renamed here is renamed in
   both. The plan behind the steps is docs/client-tracking-plan.md; the
   table's order and what was merged, docs/backend-decisions.md.

   The table reads in three parts (user, 2026-11-09): the client, then
   the client's project as the form brought it (the services, and every
   other answer in one column of text), then the lead's
   follow-up, from the first contact to the signed contract. What comes
   after the contract (deposit, materials, invoices, launch) is not a
   lead's: it will have a table of its own. Every step is a choice of
   options, never a formula: the studio picks, Notion calculates nothing.

   No "server-only" here: the script reads this file too, so it holds
   nothing but names, options and pure functions.
   ================================================================== */

import {
  ALL_PAGE_TYPES,
  DESIGN,
  FEATURES,
  LANGUAGES,
  PAGES,
  PHOTO_PLANS,
  REACH,
  REGIONS,
  SEARCH_PLANS,
  SECTORS,
  SERVICES,
  labelOf,
  type Answers,
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

/** The client's columns, before the project (written by the site). */
export const CLIENT_COLUMNS: Column[] = [
  {
    name: "Setor",
    type: "select",
    options: [...plain(SECTORS), o("Uso pessoal", "default"), o("Uma associação sem fins lucrativos", "default")],
  },
];

/** The column with the project's characteristics, all in one text (user,
    2026-11-09: one column instead of one per answer). */
export const PROJECT_TEXT = "Características do projeto";

/** The project's columns: the services, and everything else the form
    asked, in one column of text (projectLines). */
export const PROJECT_COLUMNS: Column[] = [
  { name: "Serviços", type: "multi", options: plain(SERVICES) },
  { name: PROJECT_TEXT, type: "text" },
];

/** A line of "Características do projeto": its title (in bold in
    Notion) and what follows it. */
export type ProjectLine = { label: string; value: string };

/** The project's characteristics as the studio reads them: one line per
    subject, in Portuguese, in the form's order. A subject the form did
    not ask (no photo shoot, say) has no line. Every answer is read as
    possibly missing, so a request from before a question existed gets
    the lines it can. */
export function projectLines(answers: Answers): ProjectLine[] {
  const pt = (list: Parameters<typeof labelOf>[0], id: string | undefined) =>
    id && list.some((item) => item.id === id) ? labelOf(list, id, "pt") : "";
  const { web, photo, search } = answers;
  const lines: ProjectLine[] = [];
  const add = (label: string, ...parts: (string | false | undefined)[]) => {
    const value = parts.filter(Boolean).join(" · ");
    if (value) lines.push({ label, value });
  };

  if (web) {
    const landing = web.pageMode === "landing";
    const mode =
      web.pageMode === "landing"
        ? "Landing page (tudo numa só página)"
        : web.pageMode === "website"
          ? "Website"
          : web.pageMode === "unsure"
            ? "Landing page ou website: não sabe"
            : "";
    const size = landing ? "" : web.pages === "unsure" ? "páginas por definir" : pt(PAGES, web.pages) && `${pt(PAGES, web.pages)} páginas`;
    const design = web.design === "unsure" ? "Design por definir (não sabe)" : pt(DESIGN, web.design) && `Design ${pt(DESIGN, web.design)}`;
    add("Site", mode, size, design);

    const kinds = (web.pageTypes ?? []).map((id) => pt(ALL_PAGE_TYPES, id) || id);
    const others = web.pageOthers ?? [];
    if (!landing && (kinds.length || others.length || web.pagesUnsure)) {
      add(
        "Páginas e secções",
        "Página principal, Sobre nós e Contactos (sempre incluídas)",
        ...kinds,
        others.length > 0 && `escritas pelo cliente: ${others.join(", ")}`,
        web.pagesUnsure && "mais algumas, à escolha do estúdio",
      );
    }

    const languages = (web.languages ?? []).map((id) =>
      id === "other" ? (web.languagesOther ? web.languagesOther : "Outras") : id === "unsure" ? "Não sabe" : pt(LANGUAGES, id),
    );
    add("Idiomas", languages.join(", "));

    const emails = web.formKind === "simple" ? "emails manuais" : web.formKind === "complex" ? "emails automatizados" : "";
    const features = (web.features ?? []).map((id) =>
      (id === "forms" || id === "newsletter") && emails ? `${pt(FEATURES, id)} (${emails})` : pt(FEATURES, id),
    );
    if (web.complex) features.push("Loja, login, pagamentos ou ligação a software interno (fora do que o estúdio faz)");
    add("Funcionalidades", features.length ? features.join(" · ") : web.features ? "Nenhuma: só apresentar" : "");

    add(
      "Textos",
      web.texts === "yes" ? "O cliente já os tem" : web.texts === "no" ? "O cliente não os tem (o estúdio escreve-os)" : web.texts === "unsure" ? "Não sabe" : "",
    );
    add("Domínio", web.domain === "yes" ? "Já tem" : web.domain === "no" ? "Não tem" : "");
    add("Urgente", web.urgent === "yes" ? "Sim" : web.urgent === "no" ? "Não" : "");
    const references = web.references ?? [];
    add("Referências", references.length ? references.join(" · ") : web.noReferences ? "Não tem" : "");
  }

  if (photo) {
    const plan = photo.plan === "unsure" ? "Plano por definir (não sabe)" : pt(PHOTO_PLANS, photo.plan);
    const region = photo.region && photo.region !== "mainland" ? ` (${pt(REGIONS, photo.region)})` : "";
    const town = photo.town?.trim();
    add("Sessão fotográfica", plan, town && `em ${town}${region}`);
  }

  if (search) {
    const plan = search.seoPlan === "unsure" ? "Modalidade por definir (não sabe)" : pt(SEARCH_PLANS, search.seoPlan);
    const pages = !web && search.pages ? (search.pages === "unsure" ? "páginas: não sabe" : `${pt(PAGES, search.pages)} páginas`) : "";
    add(
      "SEO e GEO",
      plan,
      search.reach && `Alcance ${pt(REACH, search.reach).toLowerCase()}`,
      search.site && `Site atual: ${search.site}`,
      pages,
    );
  }
  return lines;
}

/** The columns of "Pedidos" the partners renamed in Notion (2026-11-09),
    by what they hold. Notion knows a column by its name, to the space:
    a column renamed there and not here stops the site writing a request
    ("Parceiros" keeps the first names: "Empresa", "Idioma", "Reunião").
    Change a name here in the same moment as in Notion. */
export const PEDIDOS = {
  company: "Nome da Empresa",
  lang: "Idiomas escolhidos",
  meeting: "Data da Reunião",
  owner: "Responsável por contactar",
  /** The proposal's email, with the contract (Por enviar, Enviado). */
  offer: "E-mail da Proposta +  Contrato",
  validUntil: "Válido até",
  /** The client's answer to the proposal's two buttons. Ends in a space. */
  followUp: "Chamada de acompanhamento (sim / não) ? ",
  /** The contract being drawn up (Por fazer, Feito), by hand. */
  contract: "Contrato",
  /** Whether the signed contract came back (Sim, Não), by hand. */
  contractReceived: "Contrato Recebido?",
} as const;

/** The lead's follow-up, in the order of the process, from the first
    contact to the signed contract (docs/client-tracking-plan.md, with
    what was merged on 2026-11-09: one column per step). */
export const STEP_COLUMNS: Column[] = [
  { name: PEDIDOS.owner, type: "select", options: [o("António", "blue"), o("Emanuel", "purple")] },
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
  { name: PEDIDOS.offer, type: "select", options: [o("Por enviar", "gray"), o("Enviado", "green")] },
  { name: PEDIDOS.validUntil, type: "date" },
  // The client's answer to the final proposal's two buttons.
  {
    name: PEDIDOS.followUp,
    type: "select",
    options: [o("Por responder", "gray"), o("Sim", "green"), o("Não", "default")],
  },
  { name: PEDIDOS.contract, type: "select", options: [o("Por fazer", "gray"), o("Feito", "green")] },
  { name: PEDIDOS.contractReceived, type: "select", options: [o("Não", "gray"), o("Sim", "green")] },
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
  // The project, one column per answer (earlier the same day): now all
  // in "Características do projeto".
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
    columns: ["Nome", "Estado", "Email", "Telefone", PEDIDOS.company, "Setor", "País", PEDIDOS.lang, "Recebido"],
  },
  {
    group: "Projeto",
    columns: ["Serviços", PROJECT_TEXT, "Mensagem", "Estimativa", "Mensal (€)", "Prazo"],
  },
  {
    group: "Acompanhamento",
    columns: [
      PEDIDOS.owner,
      "Alertas",
      "Preparação da chamada",
      "Documento de preparação",
      "Marcação",
      PEDIDOS.meeting,
      "Chamada realizada",
      PEDIDOS.offer,
      "Valor final",
      PEDIDOS.validUntil,
      PEDIDOS.followUp,
      PEDIDOS.contract,
      PEDIDOS.contractReceived,
      "Motivo de perda",
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
  [PEDIDOS.offer]: "Por enviar",
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
