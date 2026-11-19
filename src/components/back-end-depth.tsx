"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { useReducedMotion } from "motion/react";
import { useInView, type T } from "./sbs-shared";

/* ==================================================================
   The header's card, gone deeper (user, 2026-11-19, second round)

   The same walk as before (a request comes in through the website's
   form and goes through the three solutions), but each solution is now
   shown as it really looks when it is done well:

   - the database: requests landing one per line, each with who, what,
     where it came from, when and where it stands, under a search, a
     filter and a count, saved as they arrive;
   - the calendar: a week, its hours and the bookings in it; the new one
     lands, and is opened to show everything kept about it; then the
     same calendar as a restaurant's reservations, by table and by hour;
   - the email: the messages that went out on their own, one per line,
     then the one just sent, opened, with its blanks filling in.

   Then the three shrink and sit side by side, tied, and at the end they
   are three among many: a larger back end, drawn with almost no detail,
   for the solutions made to the measure of each business.

   Every name, time and number in it is made up.

   With reduced motion asked for, it stands at the end.
   ================================================================== */

/** How long each step is held, in ms: the form, the database, the
    calendar, the restaurant, the email, the three, the whole system. */
const HOLD = [2600, 5600, 6400, 5000, 6400, 3200, 6000];

/** Which sheet the request is in at each step (-1: none of them). */
const ACTIVE = [-1, 0, 1, 1, 2, -1, -1];

/** How the three stand at the end: their size against the open one,
    and the space between them, in the card's width. */
function layout(narrow: boolean) {
  const W = narrow ? 88 : 60;
  return {
    W,
    H: narrow ? 62 : 34,
    row: { s: narrow ? 0.3 : 0.32, gap: 3 },
    sys: { s: narrow ? 0.22 : 0.19, gap: 2.4 },
  };
}

function pose(i: number, at: number, narrow: boolean) {
  const L = layout(narrow);
  if (at === 5 || at === 6) {
    const { s, gap } = at === 5 ? L.row : L.sys;
    const x = (i - 1) * (L.W * s + gap);
    return { transform: `translate3d(${x}cqw, 0, 0) scale(${s})`, opacity: 1 };
  }
  if (ACTIVE[at] === i) {
    return { transform: "translate3d(0, 0, 40px) rotateY(-3deg) rotateX(2deg) scale(1)", opacity: 1 };
  }
  // The others wait in a fan at the back, on the right.
  const x = (narrow ? 22 : 27) + i * 4;
  const y = -3 + i * 1.4;
  const z = -260 - i * 70;
  return { transform: `translate3d(${x}cqw, ${y}cqw, ${z}px) rotateY(-34deg) rotateX(6deg) scale(0.55)`, opacity: 0.42 };
}

/* ---- the database ------------------------------------------------ */

function Database({ t }: { t: T }) {
  const rows = [
    { who: "Marta Figueiredo", mail: "marta.f@exemplo.pt", what: t("Assessment appointment", "Consulta de avaliação"), from: "Website", at: "09:14", state: t("New", "Novo"), fresh: true },
    { who: "Rui Santos", mail: "rui.santos@exemplo.pt", what: t("Viewing, 2-bed flat", "Visita a um T2"), from: "Website", at: "08:52", state: t("Answered", "Respondido") },
    { who: "Inês Carvalho", mail: "ines.c@exemplo.pt", what: t("Facial cleansing", "Limpeza de pele"), from: "Instagram", at: "08:31", state: t("Booked", "Marcado") },
    { who: "João Pereira", mail: "jpereira@exemplo.pt", what: t("Property valuation", "Avaliação de imóvel"), from: "Website", at: t("Yesterday", "Ontem"), state: t("Answered", "Respondido") },
    { who: "Ana Lopes", mail: "ana.lopes@exemplo.pt", what: t("Table for 4", "Mesa para 4"), from: t("Phone", "Telefone"), at: t("Yesterday", "Ontem"), state: t("Booked", "Marcado") },
    { who: "Tiago Moura", mail: "tiago.m@exemplo.pt", what: t("Quote request", "Pedido de orçamento"), from: "Website", at: t("Mon", "Seg"), state: t("Closed", "Fechado") },
  ];
  return (
    <div className="be-x be-db">
      <div className="be-x-bar">
        <b>{t("Requests", "Pedidos")}</b>
        <span className="be-x-count">129</span>
        <span className="be-x-search">{t("Search by name, email…", "Procurar por nome, e-mail…")}</span>
        <span className="be-x-chip">{t("This week", "Esta semana")}</span>
      </div>
      <div className="be-db-grid">
        <span className="be-db-h">{t("Client", "Cliente")}</span>
        <span className="be-db-h">{t("Request", "Pedido")}</span>
        <span className="be-db-h be-x-wide">{t("Source", "Origem")}</span>
        <span className="be-db-h be-x-wide">{t("Received ↓", "Recebido ↓")}</span>
        <span className="be-db-h">{t("Status", "Estado")}</span>
        {rows.map((row, i) => (
          <div key={row.who} className="be-db-row" data-fresh={row.fresh || undefined} style={{ ["--i" as string]: i } as CSSProperties}>
            <span className="be-db-who">
              <b>{row.who}</b>
              <em>{row.mail}</em>
            </span>
            <span>{row.what}</span>
            <span className="be-x-wide">{row.from}</span>
            <span className="be-x-wide be-x-mono">{row.at}</span>
            <span>
              <i className="be-x-pill" data-fresh={row.fresh || undefined}>
                {row.state}
              </i>
            </span>
          </div>
        ))}
      </div>
      <div className="be-x-foot">
        <span>
          <i className="be-x-live" /> {t("Saved as it arrives", "Guardado à chegada")}
        </span>
        <span>{t("6 of 129 · newest first", "6 de 129 · mais recentes primeiro")}</span>
      </div>
    </div>
  );
}

/* ---- the calendar, and the restaurant ---------------------------- */

function Calendar({ t }: { t: T }) {
  const days = [t("Mon 17", "Seg 17"), t("Tue 18", "Ter 18"), t("Wed 19", "Qua 19"), t("Thu 20", "Qui 20"), t("Fri 21", "Sex 21")];
  const hours = ["09:00", "10:00", "11:00", "12:00", "13:00"];
  const taken = [
    { d: 0, h: 0, n: 2, say: t("Rui S. · viewing", "Rui S. · visita") },
    { d: 2, h: 1, n: 2, say: t("João P. · valuation", "João P. · avaliação") },
    { d: 3, h: 0, n: 1, say: t("Team meeting", "Reunião de equipa") },
    { d: 4, h: 2, n: 2, say: t("Inês C. · facial", "Inês C. · limpeza") },
    { d: 3, h: 3, n: 2, say: t("Tiago M. · quote", "Tiago M. · orçamento") },
    { d: 0, h: 3, n: 1, say: t("Supplier", "Fornecedor") },
    { d: 1, h: 3, n: 2, say: t("Carla N. · follow-up", "Carla N. · revisão") },
  ];
  const tables = [
    { n: t("Table 1", "Mesa 1"), seats: 2 },
    { n: t("Table 2", "Mesa 2"), seats: 4 },
    { n: t("Table 3", "Mesa 3"), seats: 4 },
    { n: t("Table 4", "Mesa 4"), seats: 6 },
    { n: t("Table 5", "Mesa 5"), seats: 2 },
    { n: t("Table 6", "Mesa 6"), seats: 8 },
  ];
  const times = ["19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00", "22:30"];
  const booked = [
    { r: 0, s: 0, n: 3, say: "Costa · 2" },
    { r: 1, s: 1, n: 4, say: "Mendes · 4" },
    { r: 3, s: 0, n: 5, say: t("Birthday · 6", "Aniversário · 6") },
    { r: 4, s: 4, n: 3, say: "Silva · 2" },
    { r: 5, s: 2, n: 5, say: t("Group · 8", "Grupo · 8") },
    { r: 0, s: 4, n: 3, say: "Rocha · 2" },
  ];

  return (
    <div className="be-x be-cal">
      {/* the week of a clinic */}
      <div className="be-cal-view be-cal-week">
        <div className="be-x-bar">
          <b>{t("Week 47 · 17–21 Nov", "Semana 47 · 17–21 nov")}</b>
          <span className="be-x-arrows">‹ ›</span>
          <span className="be-x-seg">
            <i data-on>{t("Week", "Semana")}</i>
            <i>{t("Day", "Dia")}</i>
          </span>
        </div>
        <div className="be-cal-grid">
          <span />
          {days.map((d) => (
            <span key={d} className="be-cal-day">
              {d}
            </span>
          ))}
          {hours.map((h, r) => (
            <span key={h} className="be-cal-hour" style={{ gridRow: r + 2 }}>
              {h}
            </span>
          ))}
          {hours.flatMap((_, r) =>
            days.map((__, c) => <i key={`${r}-${c}`} className="be-cal-cell" style={{ gridRow: r + 2, gridColumn: c + 2 }} />),
          )}
          {taken.map((b, i) => (
            <span
              key={i}
              className="be-cal-block"
              style={{ gridRow: `${b.h + 2} / span ${b.n}`, gridColumn: b.d + 2, ["--i" as string]: i } as CSSProperties}
            >
              {b.say}
            </span>
          ))}
          <span className="be-cal-block be-cal-new" style={{ gridRow: "3 / span 1", gridColumn: 3 }}>
            {t("Marta F. · assessment", "Marta F. · consulta")}
          </span>
          {/* the booking, opened: everything kept about it */}
          <div className="be-cal-detail">
            <p className="be-cal-detail-head">
              <b>{t("Assessment appointment", "Consulta de avaliação")}</b>
              <i className="be-x-pill" data-fresh>
                {t("Confirmed", "Confirmada")}
              </i>
            </p>
            <dl>
              <dt>{t("Client", "Cliente")}</dt>
              <dd>Marta Figueiredo</dd>
              <dt>{t("When", "Quando")}</dt>
              <dd>{t("Tue 18 Nov · 10:00–10:45", "Ter, 18 nov · 10:00–10:45")}</dd>
              <dt>{t("With", "Com")}</dt>
              <dd>{t("Dr Sofia Reis · Room 2", "Dra. Sofia Reis · Sala 2")}</dd>
              <dt>{t("Contact", "Contacto")}</dt>
              <dd className="be-x-mono">912 *** 418</dd>
              <dt>{t("Reminder", "Lembrete")}</dt>
              <dd>{t("24 h before, by email", "24 h antes, por e-mail")}</dd>
              <dt>{t("Notes", "Notas")}</dt>
              <dd>{t("First visit. Sensitive skin.", "Primeira consulta. Pele sensível.")}</dd>
              <dt>{t("Came from", "Origem")}</dt>
              <dd>{t("Website form · request #129", "Formulário do website · pedido n.º 129")}</dd>
            </dl>
          </div>
        </div>
      </div>

      {/* the same calendar, for a restaurant */}
      <div className="be-cal-view be-cal-rest">
        <div className="be-x-bar">
          <b>{t("Saturday 22 Nov · Dinner", "Sábado, 22 nov · Jantar")}</b>
          <span className="be-x-count">{t("38 of 44 seats", "38 de 44 lugares")}</span>
          <span className="be-x-chip">{t("Restaurant", "Restaurante")}</span>
        </div>
        <div className="be-rest-grid">
          <span />
          {times.map((tm) => (
            <span key={tm} className="be-cal-day">
              {tm}
            </span>
          ))}
          {tables.map((tb, r) => (
            <span key={tb.n} className="be-cal-hour" style={{ gridRow: r + 2 }}>
              {tb.n} <em>· {tb.seats}</em>
            </span>
          ))}
          {tables.flatMap((_, r) =>
            times.map((__, c) => <i key={`${r}-${c}`} className="be-cal-cell" style={{ gridRow: r + 2, gridColumn: c + 2 }} />),
          )}
          {booked.map((b, i) => (
            <span
              key={i}
              className="be-cal-block"
              style={{ gridRow: b.r + 2, gridColumn: `${b.s + 2} / span ${b.n}`, ["--i" as string]: i } as CSSProperties}
            >
              {b.say}
            </span>
          ))}
          <span className="be-cal-block be-cal-new" style={{ gridRow: 4, gridColumn: "5 / span 4" }}>
            Ana L. · 4
          </span>
        </div>
        <div className="be-x-foot">
          <span>
            <i className="be-x-live" /> {t("Tonight's reminders sent at 12:00", "Lembretes de hoje enviados às 12:00")}
          </span>
          <span>{t("2 seats free at 21:00", "2 lugares livres às 21:00")}</span>
        </div>
      </div>
    </div>
  );
}

/* ---- the email --------------------------------------------------- */

function Email({ t }: { t: T }) {
  const sent = [
    { to: "Marta Figueiredo", what: t("Appointment confirmed: Tuesday at 10:00", "Consulta confirmada: terça às 10:00"), kind: t("Confirmation", "Confirmação"), at: "09:14", state: t("Sent", "Enviado"), fresh: true },
    { to: "Ana Lopes", what: t("Table for 4 confirmed: Saturday", "Mesa para 4 confirmada: sábado"), kind: t("Confirmation", "Confirmação"), at: "09:02", state: t("Opened", "Aberto") },
    { to: "Rui Santos", what: t("Your viewing is tomorrow at 09:00", "A visita é amanhã às 09:00"), kind: t("Reminder", "Lembrete"), at: "08:00", state: t("Opened", "Aberto") },
    { to: "Inês Carvalho", what: t("How did your facial go?", "Como correu a limpeza de pele?"), kind: t("Follow-up", "Pós-consulta"), at: "07:30", state: t("Opened", "Aberto") },
    { to: "João Pereira", what: t("We have your request", "Recebemos o seu pedido"), kind: t("Receipt", "Receção"), at: t("Yesterday", "Ontem"), state: t("Answered", "Respondido") },
  ];
  // The blanks of the template, and what goes in each.
  const slot = (blank: string, value: string, i: number) => (
    <span className="be-mail-slot" style={{ ["--i" as string]: i } as CSSProperties}>
      <span className="be-mail-blank">{blank}</span>
      <span className="be-mail-value">{value}</span>
    </span>
  );
  return (
    <div className="be-x be-mail">
      <div className="be-x-bar">
        <b>{t("Sent on their own", "Enviados sozinhos")}</b>
        <span className="be-x-count">{t("14 today", "14 hoje")}</span>
        <span className="be-x-chip">{t("Templates · 6", "Modelos · 6")}</span>
      </div>
      <div className="be-db-grid be-mail-grid">
        <span className="be-db-h">{t("To", "Para")}</span>
        <span className="be-db-h">{t("Subject", "Assunto")}</span>
        <span className="be-db-h be-x-wide">{t("Template", "Modelo")}</span>
        <span className="be-db-h be-x-wide">{t("Time", "Hora")}</span>
        <span className="be-db-h">{t("Status", "Estado")}</span>
        {sent.map((row, i) => (
          <div key={row.to} className="be-db-row" data-fresh={row.fresh || undefined} style={{ ["--i" as string]: i } as CSSProperties}>
            <span className="be-db-who">
              <b>{row.to}</b>
            </span>
            <span>{row.what}</span>
            <span className="be-x-wide">{row.kind}</span>
            <span className="be-x-wide be-x-mono">{row.at}</span>
            <span>
              <i className="be-x-pill" data-fresh={row.fresh || undefined}>
                {row.state}
              </i>
            </span>
          </div>
        ))}
      </div>

      {/* the one just sent, opened, its blanks filling in */}
      <div className="be-mail-open">
        <p className="be-mail-meta">
          <span>
            {t("To", "Para")} <b>Marta Figueiredo</b>
          </span>
          <span>{t("Template: appointment confirmed", "Modelo: confirmação de consulta")}</span>
        </p>
        <p className="be-mail-subject">{t("Your appointment is confirmed", "A sua consulta está confirmada")}</p>
        <p className="be-mail-body">
          {t("Hello ", "Olá, ")}
          {slot(t("{name}", "{nome}"), "Marta", 0)}
          {t(". Your ", ". A sua ")}
          {slot(t("{service}", "{serviço}"), t("assessment appointment", "consulta de avaliação"), 1)}
          {t(" is confirmed for ", " está confirmada para ")}
          {slot(t("{date}", "{data}"), t("Tuesday 18 November at 10:00", "terça-feira, 18 de novembro, às 10:00"), 2)}
          {t(", with ", ", com a ")}
          {slot(t("{who}", "{quem}"), t("Dr Sofia Reis", "Dra. Sofia Reis"), 3)}
          {t(". We'll send a reminder the day before.", ". Enviamos um lembrete na véspera.")}
        </p>
        <p className="be-x-foot be-mail-foot">
          <span>
            <i className="be-x-live" /> {t("Sent 0.4 s after the request", "Enviado 0,4 s depois do pedido")}
          </span>
          <span className="be-x-mono">convite.ics</span>
        </p>
      </div>
    </div>
  );
}

/* ---- the larger system, at the end ------------------------------- */

/** The solutions made to measure, around the three: almost no detail,
    only their names, so the three stay the ones that are read. */
function others(t: T) {
  return [
    { x: 12, y: 15, to: 0, name: t("Payments", "Pagamentos") },
    { x: 33, y: 13, to: 0, name: t("Invoicing", "Faturação") },
    { x: 67, y: 13, to: 2, name: t("Client area", "Área de cliente") },
    { x: 88, y: 15, to: 2, name: t("Reviews", "Avaliações") },
    { x: 12, y: 85, to: 0, name: t("Stock", "Stock") },
    { x: 33, y: 87, to: 1, name: t("Team rota", "Escalas da equipa") },
    { x: 67, y: 87, to: 1, name: t("SMS reminders", "Lembretes por SMS") },
    { x: 88, y: 85, to: 2, name: t("Reports", "Relatórios") },
  ];
}

export function DepthSystem({ t }: { t: T }) {
  const reduce = useReducedMotion() ?? false;
  const [ref, inView] = useInView<HTMLElement>(0.2);
  // Narrow by the card's own width, the same measure its container
  // queries use (globals.css), so the poses and the sizes agree.
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const watch = new ResizeObserver(([entry]) => setNarrow((entry?.contentRect.width ?? 1000) < 600));
    watch.observe(el);
    return () => watch.disconnect();
  }, [ref]);
  const [step, setStep] = useState(0);
  const run = inView && !reduce;

  useEffect(() => {
    if (!run) return;
    const id = window.setTimeout(() => setStep((s) => (s + 1) % HOLD.length), HOLD[step]);
    return () => window.clearTimeout(id);
  }, [step, run]);

  const at = reduce ? 6 : step;
  const L = layout(narrow);
  const end = at === 5 ? L.row : L.sys;
  const pitch = L.W * end.s + end.gap;
  const centre = (i: number) => 50 + (i - 1) * pitch;

  const sheets = [
    { k: "db", name: t("Database", "Base de dados"), body: <Database t={t} /> },
    { k: "cal", name: t("Calendar", "Calendário"), body: <Calendar t={t} /> },
    { k: "mail", name: t("Email", "E-mail"), body: <Email t={t} /> },
  ];
  const captions = [
    t("A request arrives through the website", "Um pedido chega pelo website"),
    t("It is kept in the database, with everything that was asked", "Fica registado na base de dados, com tudo o que foi pedido"),
    t("It takes its place in the calendar, with every detail kept", "Ocupa o seu lugar no calendário, com todos os detalhes guardados"),
    t("The same calendar, as a restaurant's reservations", "O mesmo calendário, como reservas de um restaurante"),
    t("The confirmation goes out on its own, its blanks filled in", "A confirmação sai sozinha, com os espaços já preenchidos"),
    t("The three main solutions, tied together", "As três principais soluções, ligadas entre si"),
    t("And others, made to the measure of each business", "E outras, feitas à medida de cada negócio"),
  ];

  return (
    <figure
      ref={ref}
      className="be-ds"
      data-at={at}
      data-still={reduce || undefined}
      role="img"
      aria-label={t(
        "A request from the website's form is kept in the database with everything that was asked, takes its place in the calendar (shown also as a restaurant's reservations), and its confirmation goes out on its own. Then the three solutions sit together, among others made to the measure of each business.",
        "Um pedido do formulário do website fica registado na base de dados com tudo o que foi pedido, ocupa o seu lugar no calendário (também mostrado como reservas de um restaurante), e a confirmação sai sozinha. Depois as três soluções ficam juntas, entre outras feitas à medida de cada negócio.",
      )}
    >
      <div className="be-ds-stage" aria-hidden="true">
        <div className="be-ds-space">
          {/* the larger system: drawn under the three, only at the end */}
          <svg className="be-ds-net" viewBox="0 0 100 100" preserveAspectRatio="none">
            {others(t).map((o, i) => (
              <path
                key={i}
                d={`M ${o.x} ${o.y} L ${o.x} 50 L ${centre(o.to)} 50`}
                pathLength={100}
                style={{ ["--i" as string]: i } as CSSProperties}
              />
            ))}
          </svg>
          {others(t).map((o, i) => (
            <span key={o.name} className="be-ds-node" style={{ left: `${o.x}%`, top: `${o.y}%`, ["--i" as string]: i } as CSSProperties}>
              <b>{o.name}</b>
              <i />
              <i />
            </span>
          ))}

          {/* the wires between the three, once they sit together */}
          {[0, 1].map((w) => (
            <span
              key={w}
              className="be-ds-wire"
              style={{ ["--x" as string]: `${(w === 0 ? -1 : 1) * (pitch / 2)}cqw`, ["--w" as string]: `${end.gap}cqw` } as CSSProperties}
            >
              <i />
            </span>
          ))}

          {/* the form, where the request starts */}
          <div
            className="be-ds-form"
            data-on={at === 0 || undefined}
            style={{
              transform:
                at === 0
                  ? "translate3d(-8cqw, 0, 60px) rotateY(8deg) rotateX(2deg)"
                  : "translate3d(27cqw, -3cqw, -260px) rotateY(-34deg) scale(0.4)",
              opacity: at === 0 ? 1 : 0,
            }}
          >
            <p className="be-x-bar">
              <b>{t("Book an appointment", "Marcar consulta")}</b>
            </p>
            <span className="be-ds-field" style={{ ["--i" as string]: 0 } as CSSProperties}>
              <em>{t("Name", "Nome")}</em>
              <span>Marta Figueiredo</span>
            </span>
            <span className="be-ds-field" style={{ ["--i" as string]: 1 } as CSSProperties}>
              <em>{t("Email", "E-mail")}</em>
              <span>marta.f@exemplo.pt</span>
            </span>
            <span className="be-ds-field" style={{ ["--i" as string]: 2 } as CSSProperties}>
              <em>{t("Service", "Serviço")}</em>
              <span>{t("Assessment appointment", "Consulta de avaliação")}</span>
            </span>
            <span className="be-ds-field" style={{ ["--i" as string]: 3 } as CSSProperties}>
              <em>{t("Preferred time", "Horário preferido")}</em>
              <span>{t("Tue morning", "Terça de manhã")}</span>
            </span>
            <span className="be-ds-send">{t("Send request", "Enviar pedido")}</span>
          </div>

          {sheets.map((sheet, i) => {
            const p = pose(i, at, narrow);
            return (
              <div
                key={sheet.k}
                className="be-ds-sheet"
                data-k={sheet.k}
                data-on={ACTIVE[at] === i || undefined}
                style={{ transform: p.transform, opacity: p.opacity, zIndex: ACTIVE[at] === i ? 5 : 3 - i }}
              >
                {sheet.body}
              </div>
            );
          })}

          {/* their names, under them, once they are small */}
          {sheets.map((sheet, i) => (
            <span
              key={sheet.k}
              className="be-ds-name"
              style={{ ["--x" as string]: `${(i - 1) * pitch}cqw`, ["--y" as string]: `${(L.H * end.s) / 2 + 1.6}cqw` } as CSSProperties}
            >
              {sheet.name}
            </span>
          ))}
        </div>
      </div>

      <div className="be-dc-foot be-ds-foot" aria-hidden="true">
        <span className="be-dc-steps">
          {captions.map((_, i) => (
            <i key={i} data-on={at === i || undefined} data-done={at > i || undefined} />
          ))}
        </span>
        <p key={at} className="be-dc-cap">
          {captions[at]}
        </p>
      </div>
    </figure>
  );
}
