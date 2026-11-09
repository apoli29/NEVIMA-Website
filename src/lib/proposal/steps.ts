/* ==================================================================
   The steps of a request, from the form to the last payment

   One catalogue for the two places that must agree on it: the script
   that makes the Notion database "Pedidos" (scripts/setup-notion.mjs)
   and the site that writes in it (deliver.ts, the composer's route, the
   meeting and mid-call routes). A column renamed here is renamed in
   both. The plan behind it is docs/client-tracking-plan.md, section 8.

   Each step is a column of its own on the request's row, in Portuguese
   like the rest of the studio's Notion. Some are written by the site,
   most by the studio by hand; a step that does not apply to a client
   stays empty.

   No "server-only" here: the script reads this file too, so it holds
   nothing but names, options and pure functions.
   ================================================================== */

/** Notion's colours for a select's options. */
type Color = "default" | "gray" | "brown" | "orange" | "yellow" | "green" | "blue" | "purple" | "pink" | "red";

export type Option = { name: string; color: Color };

export type Column =
  | { name: string; type: "select"; options: Option[] }
  | { name: string; type: "date" | "url" | "text" | "checkbox" }
  | { name: string; type: "formula"; expression: string };

/* The colours read the same in every step: grey not started, yellow
   under way, green done, red gone wrong. */
const o = (name: string, color: Color): Option => ({ name, color });

/** The request's overall state in "Pedidos", in order (the meeting comes
    before the proposal, user 2026-10-27; "Em projeto" and "Concluído"
    from the client-tracking plan, 2026-11-09). */
export const REQUEST_STATES: Option[] = [
  o("Novo", "blue"),
  o("Contactado", "yellow"),
  o("Reunião marcada", "purple"),
  o("Reunião feita", "pink"),
  o("Proposta enviada", "orange"),
  o("Ganho", "green"),
  o("Em projeto", "brown"),
  o("Concluído", "default"),
  o("Perdido", "gray"),
];

/** The partners' database keeps the states it had. */
export const PARTNER_STATES: Option[] = [
  o("Novo", "blue"),
  o("Contactado", "yellow"),
  o("Reunião marcada", "purple"),
  o("Reunião feita", "pink"),
  o("Proposta enviada", "orange"),
  o("Ganho", "green"),
  o("Perdido", "gray"),
];

/* The formulas, in Notion's formula language. */

/* "Qui 26 nov, 15:00". Notion's formatDate writes the names in English,
   so the weekday ("d", 0 for Sunday) and the month ("M", 1 to 12) are
   looked up in Portuguese. */
const CALL = [
  `if(prop("Marcação") == "Agendada", if(empty(prop("Reunião")), "Agendada, falta a hora",`,
  `["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].at(toNumber(formatDate(prop("Reunião"), "d"))) + " " +`,
  `formatDate(prop("Reunião"), "D") + " " +`,
  `["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"].at(toNumber(formatDate(prop("Reunião"), "M")) - 1) +`,
  `", " + formatDate(prop("Reunião"), "HH:mm")),`,
  `if(prop("Marcação") == "Vai contactar-nos", "Cliente vai contactar-nos", "Por marcar"))`,
].join("\n");

// "612,63 €": a quarter of "Valor final", in cents, written the Portuguese way.
const DEPOSIT = [
  `if(empty(prop("Valor final")), "",`,
  `lets(c, round(prop("Valor final") * 25),`,
  `format(floor(c / 100)) + "," + padStart(format(c % 100), 2, "0") + " €"))`,
].join("\n");

const MATERIALS_BY = `dateAdd(prop("Assinado em"), 8, "days")`;

// The 72 hours of the contract's clause 6.2.
const PAYMENT_BY = `dateAdd(prop("Fatura emitida em"), 3, "days")`;

const CURRENT_STEP = [
  `if(prop("Estado") == "Perdido", "Perdido",`,
  `if(prop("Preparação da chamada") != "Feita", "Preparar a chamada",`,
  `if(prop("Convite") != "Enviado", "Enviar o convite",`,
  `if(prop("Marcação") != "Agendada", "Marcação da chamada",`,
  `if(prop("Link da chamada") != "Enviado", "Enviar o link da chamada",`,
  `if(prop("Chamada realizada") != "Efetuada", "Fazer a chamada",`,
  `if(prop("Proposta") != "Enviada", "Enviar a proposta",`,
  `if(prop("Contrato assinado") != "Recebido assinado", "Contrato por assinar",`,
  `if(prop("Sinal de 25%") != "Recebido", "Sinal de 25%",`,
  `if(prop("Materiais") != "Completos", "Materiais",`,
  `if(prop("Chamada de validação") != "Feita", "Chamada de validação",`,
  `if(prop("Pagamento final") != "Recebido", "Pagamento final",`,
  `if(prop("Lançamento") != "Lançado", "Lançamento", "Concluído")))))))))))))`,
].join("\n");

/** The columns the steps add to "Pedidos", in the order of the process
    (docs/client-tracking-plan.md, 8.3). "Reunião a meio" already exists:
    it gains "Por responder". */
export const STEP_COLUMNS: Column[] = [
  { name: "Confirmação", type: "select", options: [o("Enviada", "green"), o("Falhou", "red")] },
  {
    name: "Preparação da chamada",
    type: "select",
    options: [o("Por iniciar", "gray"), o("Iniciada", "yellow"), o("Feita", "green")],
  },
  { name: "Documento de preparação", type: "url" },
  { name: "Convite", type: "select", options: [o("Não enviado", "gray"), o("Enviado", "green")] },
  {
    name: "Marcação",
    type: "select",
    options: [o("A aguardar resposta", "yellow"), o("Vai contactar-nos", "orange"), o("Agendada", "green")],
  },
  { name: "Chamada", type: "formula", expression: CALL },
  {
    name: "Link da chamada",
    type: "select",
    options: [o("Aguarda marcação", "gray"), o("Por enviar", "yellow"), o("Enviado", "green")],
  },
  {
    name: "Chamada realizada",
    type: "select",
    options: [o("Por efetuar", "gray"), o("Efetuada", "green"), o("Cliente faltou", "red")],
  },
  { name: "Proposta", type: "select", options: [o("Por enviar", "gray"), o("Enviada", "green")] },
  { name: "Válida até", type: "date" },
  {
    name: "Reunião a meio",
    type: "select",
    options: [o("Sim", "default"), o("Não", "default"), o("Por responder", "gray")],
  },
  {
    name: "Chamada de acompanhamento",
    type: "select",
    options: [o("A marcar", "gray"), o("Marcada", "yellow"), o("Feita", "green")],
  },
  { name: "Data do acompanhamento", type: "date" },
  {
    name: "Contrato assinado",
    type: "select",
    options: [o("Por receber", "gray"), o("Recebido assinado", "green")],
  },
  { name: "Assinado em", type: "date" },
  {
    name: "Sinal de 25%",
    type: "select",
    options: [o("Por pedir", "gray"), o("Pedido", "yellow"), o("Recebido", "green")],
  },
  { name: "Valor do sinal", type: "formula", expression: DEPOSIT },
  { name: "Sinal recebido em", type: "date" },
  { name: "Documento do sinal", type: "select", options: [o("Por emitir", "gray"), o("Emitido", "green")] },
  {
    name: "Materiais",
    type: "select",
    options: [o("Por receber", "gray"), o("Incompletos", "yellow"), o("Completos", "green")],
  },
  { name: "Materiais até", type: "formula", expression: MATERIALS_BY },
  {
    name: "Chamada de validação",
    type: "select",
    options: [o("A marcar", "gray"), o("Marcada", "yellow"), o("Feita", "green")],
  },
  { name: "Fatura final", type: "select", options: [o("Por emitir", "gray"), o("Emitida", "green")] },
  { name: "Fatura emitida em", type: "date" },
  { name: "Pagamento até", type: "formula", expression: PAYMENT_BY },
  {
    name: "Pagamento final",
    type: "select",
    options: [o("Por receber", "gray"), o("Recebido", "green"), o("Em atraso", "red")],
  },
  { name: "Recibo", type: "select", options: [o("Por emitir", "gray"), o("Emitido", "green")] },
  { name: "Lançamento", type: "select", options: [o("Por lançar", "gray"), o("Lançado", "green")] },
  { name: "Etapa atual", type: "formula", expression: CURRENT_STEP },
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
  { name: "Responsável", type: "select", options: [o("António", "blue"), o("Emanuel", "purple")] },
  { name: "Histórico", type: "text" },
  { name: "Spam ou teste", type: "checkbox" },
];

/** The order of the columns in "Pedidos", in the table and in each
    request's page (user, 2026-11-09): where the client is, then what the
    form brought, then the steps in the order of the process. Notion's
    API cannot order columns: the partners drag them by hand, following
    this list, which the guide in /interno shows. */
export const COLUMN_ORDER: { group: string; columns: string[] }[] = [
  { group: "Resumo", columns: ["Nome", "Estado", "Etapa atual", "Responsável", "Alertas"] },
  {
    group: "Formulário",
    columns: [
      "Email",
      "Telefone",
      "Empresa",
      "Idioma",
      "Serviços",
      "Setor",
      "País",
      "Estimativa",
      "Mensal (€)",
      "Prazo",
      "Mensagem",
      "Origem",
      "Recebido",
    ],
  },
  {
    group: "Até à chamada",
    columns: [
      "Confirmação",
      "Preparação da chamada",
      "Documento de preparação",
      "Valor Y (cliente)",
      "Valor X (sugestões)",
      "Convite",
      "Marcação",
      "Reunião",
      "Chamada",
      "Link da chamada",
      "Chamada realizada",
    ],
  },
  {
    group: "Proposta",
    columns: [
      "Proposta",
      "Valor final",
      "Contrato enviado",
      "Válida até",
      "Reunião a meio",
      "Chamada de acompanhamento",
      "Data do acompanhamento",
    ],
  },
  {
    group: "Contrato e sinal",
    columns: [
      "Contrato assinado",
      "Assinado em",
      "Sinal de 25%",
      "Valor do sinal",
      "Sinal recebido em",
      "Documento do sinal",
      "Materiais",
      "Materiais até",
    ],
  },
  {
    group: "Projeto até aos 100%",
    columns: [
      "Chamada de validação",
      "Fatura final",
      "Fatura emitida em",
      "Pagamento até",
      "Pagamento final",
      "Recibo",
      "Lançamento",
    ],
  },
  { group: "Fecho", columns: ["Motivo de perda", "Histórico", "Spam ou teste"] },
];

/** The steps' selects, by name: what readPage reads back. */
export const STEP_SELECTS = STEP_COLUMNS.filter((c) => c.type === "select").map((c) => c.name);

/** What a new request starts with, beside "Estado" Novo. The steps
    after the contract start only once the proposal is sent. */
export const ON_ARRIVAL: Record<string, string> = {
  "Preparação da chamada": "Por iniciar",
  Convite: "Não enviado",
  "Link da chamada": "Aguarda marcação",
  "Chamada realizada": "Por efetuar",
  Proposta: "Por enviar",
};

/** What sending the proposal opens, each only while still empty: sending
    it again never takes back a step that has moved on. */
export const ON_OFFER: Record<string, string> = {
  "Reunião a meio": "Por responder",
  "Contrato assinado": "Por receber",
  "Sinal de 25%": "Por pedir",
  "Documento do sinal": "Por emitir",
  Materiais: "Por receber",
};

/** The states a booking must not take a request back from. */
export const PAST_BOOKING = new Set(["Reunião feita", "Proposta enviada", "Ganho", "Em projeto", "Concluído", "Perdido"]);

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
