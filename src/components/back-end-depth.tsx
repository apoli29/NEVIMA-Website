"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { useReducedMotion } from "motion/react";
import { useInView, type T } from "./sbs-shared";

/* ==================================================================
   The header's card, gone deeper (user, 2026-11-19)

   A request comes in through the website's form and goes through the
   three solutions, each shown as it really looks when it is done well.

   One business at a time (user, 2026-11-19, third round: mixing them
   in one list made no sense): each sheet shows a clinic first, and
   then, with only its content changing, a property agency and a
   restaurant, so the same solution is seen working for three kinds of
   business. The clinic is the one the request walks through: the form,
   its line in the database, its booking opened in the calendar, its
   confirmation opened with the blanks filling in.

   Then the three shrink and sit side by side, tied, and at the end they
   sit among a few simpler things we also build to measure (portals,
   forms, a waiting list...), every one of them the same small sheet:
   no payments or anything the studio does not build yet.

   Every name, time and number in it is made up.

   It plays 1.5 times faster than it was first written (user,
   2026-11-19): the holds here are divided by SPEED, and the page plays
   every CSS animation at that rate (back-end.tsx), so the two clocks
   stay together.

   With reduced motion asked for, it stands at the end.
   ================================================================== */

export const SPEED = 1.5;

/** Each step, in ms at the written speed; a step with several holds
    shows a different business in each. The form; the database (three
    businesses); the calendar (the clinic with its booking opened, the
    agency, the restaurant); the email (the clinic with its message
    opened, the agency, the restaurant); the three; the whole. */
const HOLDS: number[][] = [[2600], [2700, 2600, 2700], [4700, 2600, 2800], [5400, 2500, 2600], [3200], [6000]];

/** Which sheet the request is in at each step (-1: none of them). */
const ACTIVE = [-1, 0, 1, 2, -1, -1];

/** How the three stand at the end: their size against the open one,
    and the space between them, in the card's width. */
function layout(narrow: boolean) {
  const W = narrow ? 88 : 60;
  const H = narrow ? 62 : 34;
  return {
    W,
    H,
    row: { s: narrow ? 0.3 : 0.32, gap: 3 },
    sys: { s: narrow ? 0.22 : 0.24, gap: 2.6, rowGap: narrow ? 7 : 5.2 },
  };
}

/** Where a sheet stands. `row` is -1, 0 or 1: the others sit above and
    under the three, in the same columns, only at the very end. */
function pose(col: number, at: number, narrow: boolean, row = 0) {
  const L = layout(narrow);
  if (at === 4 || at === 5) {
    const end = at === 4 ? L.row : L.sys;
    const x = (col - 1) * (L.W * end.s + end.gap);
    const y = at === 5 ? row * (L.H * L.sys.s + L.sys.rowGap) : 0;
    return { transform: `translate3d(${x}cqw, ${y}cqw, 0) scale(${end.s})`, opacity: 1 };
  }
  if (ACTIVE[at] === col && row === 0) {
    return { transform: "translate3d(0, 0, 40px) rotateY(-3deg) rotateX(2deg) scale(1)", opacity: 1 };
  }
  // The others wait in a fan at the back, on the right.
  const x = (narrow ? 22 : 27) + col * 4;
  const y = -3 + col * 1.4;
  const z = -260 - col * 70;
  return { transform: `translate3d(${x}cqw, ${y}cqw, ${z}px) rotateY(-34deg) rotateX(6deg) scale(0.55)`, opacity: 0.42 };
}

/** One business's version of a sheet. Shown while it is the one being
    played (`live`, which also starts its own motion), or, when its sheet
    is not being played, if it is the clinic. */
function Layer({ l, v, on, className, children }: { l: number; v: number; on: boolean; className: string; children: ReactNode }) {
  const live = on && v === l;
  const show = live || (!on && l === 0);
  return (
    <div className={`be-lay be-x ${className}`} data-show={show || undefined} data-live={live || undefined}>
      {children}
    </div>
  );
}

/* ---- the three businesses ---------------------------------------- */

function businesses(t: T) {
  return [t("Aesthetic clinic", "Clínica de estética"), t("Property agency", "Imobiliária"), t("Restaurant", "Restaurante")];
}

const mail = (name: string) =>
  name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .split(" ")
    .join(".") + "@exemplo.pt";

/* ---- the database ------------------------------------------------ */

type Req = { who: string; what: string; from: string; at: string; state: string; fresh?: boolean };

function Database({ t, v, on }: { t: T; v: number; on: boolean }) {
  const site = "Website";
  const ans = t("Answered", "Respondido");
  const booked = t("Booked", "Marcado");
  const closed = t("Closed", "Fechado");
  const y = t("Yesterday", "Ontem");
  const sets: { count: string; rows: Req[] }[] = [
    {
      count: "129",
      rows: [
        { who: "Marta Figueiredo", what: t("Assessment appointment", "Consulta de avaliação"), from: site, at: "09:14", state: t("New", "Novo"), fresh: true },
        { who: "Inês Carvalho", what: t("Facial cleansing", "Limpeza de pele"), from: "Instagram", at: "08:31", state: booked },
        { who: "Sara Monteiro", what: t("Laser, 6 sessions", "Laser, 6 sessões"), from: site, at: "08:05", state: ans },
        { who: "Carla Nunes", what: t("Treatment follow-up", "Revisão de tratamento"), from: t("Phone", "Telefone"), at: y, state: booked },
        { who: "Beatriz Lima", what: t("Quote request", "Pedido de orçamento"), from: site, at: y, state: ans },
        { who: "Helena Costa", what: t("Chemical peel", "Peeling químico"), from: "Instagram", at: t("Mon", "Seg"), state: closed },
      ],
    },
    {
      count: "86",
      rows: [
        { who: "Rui Santos", what: t("Viewing, 2-bed in Alvalade", "Visita a um T2 em Alvalade"), from: site, at: "09:02", state: t("New", "Novo"), fresh: true },
        { who: "João Pereira", what: t("Property valuation", "Avaliação de imóvel"), from: site, at: "08:40", state: ans },
        { who: "Marco Dias", what: t("Viewing, house in Cascais", "Visita a moradia em Cascais"), from: site, at: "08:12", state: booked },
        { who: "Teresa Gomes", what: t("Wants to sell a 3-bed", "Quer vender um T3"), from: t("Phone", "Telefone"), at: y, state: ans },
        { who: "Paulo Reis", what: t("1-bed to rent", "Arrendamento de T1"), from: site, at: y, state: booked },
        { who: "Filipa Rocha", what: t("Call me back", "Pedido de contacto"), from: "Instagram", at: t("Mon", "Seg"), state: closed },
      ],
    },
    {
      count: "214",
      rows: [
        { who: "Ana Lopes", what: t("Table for 4, Sat 20:30", "Mesa para 4, sáb. 20:30"), from: site, at: "09:10", state: t("New", "Novo"), fresh: true },
        { who: "Luís Mendes", what: t("Group dinner, 12", "Jantar de grupo, 12"), from: t("Email", "E-mail"), at: "08:44", state: ans },
        { who: "Pedro Costa", what: t("Table for 2, Fri 21:00", "Mesa para 2, sex. 21:00"), from: site, at: "08:20", state: booked },
        { who: "Rita Alves", what: t("Birthday, 8 people", "Aniversário, 8 pessoas"), from: t("Phone", "Telefone"), at: y, state: booked },
        { who: "Nuno Silva", what: t("Group menu", "Menu de grupo"), from: site, at: y, state: ans },
        { who: "Joana Rocha", what: t("Table for 2, tonight", "Mesa para 2, hoje"), from: "Instagram", at: t("Mon", "Seg"), state: closed },
      ],
    },
  ];
  const names = businesses(t);
  return (
    <div className="be-stack">
      {sets.map((set, l) => (
        <Layer key={l} l={l} v={v} on={on} className="be-db">
          <div className="be-x-bar">
            <b>{t("Requests", "Pedidos")}</b>
            <span className="be-x-count">{set.count}</span>
            <span className="be-x-search">{t("Search by name, email…", "Procurar por nome, e-mail…")}</span>
            <span className="be-x-chip">{names[l]}</span>
          </div>
          <div className="be-db-grid">
            <span className="be-db-h">{t("Client", "Cliente")}</span>
            <span className="be-db-h">{t("Request", "Pedido")}</span>
            <span className="be-db-h be-x-wide">{t("Source", "Origem")}</span>
            <span className="be-db-h be-x-wide">{t("Received ↓", "Recebido ↓")}</span>
            <span className="be-db-h">{t("Status", "Estado")}</span>
            {set.rows.map((row, i) => (
              <div key={row.who} className="be-db-row" data-fresh={row.fresh || undefined} style={{ ["--i" as string]: i } as CSSProperties}>
                <span className="be-db-who">
                  <b>{row.who}</b>
                  <em>{mail(row.who)}</em>
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
            <span>{t(`6 of ${set.count} · newest first`, `6 de ${set.count} · mais recentes primeiro`)}</span>
          </div>
        </Layer>
      ))}
    </div>
  );
}

/* ---- the calendar ------------------------------------------------ */

type Slot = { d: number; h: number; n: number; say: string };

function Week({ t, head, taken, fresh, children }: { t: T; head: string; taken: Slot[]; fresh: Slot; children?: ReactNode }) {
  const days = [t("Mon 17", "Seg 17"), t("Tue 18", "Ter 18"), t("Wed 19", "Qua 19"), t("Thu 20", "Qui 20"), t("Fri 21", "Sex 21")];
  const hours = ["09:00", "10:00", "11:00", "12:00", "13:00"];
  return (
    <>
      <div className="be-x-bar">
        <b>{head}</b>
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
        {hours.flatMap((_, r) => days.map((__, c) => <i key={`${r}-${c}`} className="be-cal-cell" style={{ gridRow: r + 2, gridColumn: c + 2 }} />))}
        {taken.map((b, i) => (
          <span key={i} className="be-cal-block" style={{ gridRow: `${b.h + 2} / span ${b.n}`, gridColumn: b.d + 2, ["--i" as string]: i } as CSSProperties}>
            {b.say}
          </span>
        ))}
        <span className="be-cal-block be-cal-new" style={{ gridRow: `${fresh.h + 2} / span ${fresh.n}`, gridColumn: fresh.d + 2 }}>
          {fresh.say}
        </span>
        {children}
      </div>
    </>
  );
}

function Calendar({ t, v, on }: { t: T; v: number; on: boolean }) {
  const names = businesses(t);
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
    <div className="be-stack be-cal">
      {/* the clinic's week, and the new booking opened */}
      <Layer l={0} v={v} on={on} className="be-cal-week">
        <Week
          t={t}
          head={t("Week 47 · appointments", "Semana 47 · consultas")}
          taken={[
            { d: 0, h: 0, n: 2, say: t("Inês C. · facial", "Inês C. · limpeza") },
            { d: 2, h: 1, n: 2, say: t("Sara M. · laser", "Sara M. · laser") },
            { d: 3, h: 0, n: 1, say: t("Team meeting", "Reunião de equipa") },
            { d: 4, h: 2, n: 2, say: t("Helena C. · peel", "Helena C. · peeling") },
            { d: 3, h: 3, n: 2, say: t("Beatriz L. · assessment", "Beatriz L. · avaliação") },
            { d: 1, h: 3, n: 2, say: t("Carla N. · follow-up", "Carla N. · revisão") },
          ]}
          fresh={{ d: 1, h: 1, n: 1, say: t("Marta F. · assessment", "Marta F. · consulta") }}
        >
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
        </Week>
      </Layer>

      {/* the property agency's week of viewings */}
      <Layer l={1} v={v} on={on} className="be-cal-week">
        <Week
          t={t}
          head={t("Week 47 · viewings", "Semana 47 · visitas")}
          taken={[
            { d: 0, h: 0, n: 1, say: t("Marco D. · Cascais", "Marco D. · Cascais") },
            { d: 1, h: 2, n: 2, say: t("Paulo R. · 1-bed", "Paulo R. · T1") },
            { d: 2, h: 0, n: 2, say: t("Teresa G. · valuation", "Teresa G. · avaliação") },
            { d: 3, h: 1, n: 1, say: t("Office meeting", "Reunião no escritório") },
            { d: 4, h: 3, n: 2, say: t("João P. · signing", "João P. · escritura") },
            { d: 0, h: 3, n: 1, say: t("Photo shoot", "Sessão de fotos") },
          ]}
          fresh={{ d: 3, h: 3, n: 1, say: t("Rui S. · 2-bed", "Rui S. · T2") }}
        />
      </Layer>

      {/* the restaurant's tables */}
      <Layer l={2} v={v} on={on} className="be-cal-rest">
        <div className="be-x-bar">
          <b>{t("Saturday 22 Nov · Dinner", "Sábado, 22 nov · Jantar")}</b>
          <span className="be-x-count">{t("38 of 44 seats", "38 de 44 lugares")}</span>
          <span className="be-x-chip">{names[2]}</span>
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
          {tables.flatMap((_, r) => times.map((__, c) => <i key={`${r}-${c}`} className="be-cal-cell" style={{ gridRow: r + 2, gridColumn: c + 2 }} />))}
          {booked.map((b, i) => (
            <span key={i} className="be-cal-block" style={{ gridRow: b.r + 2, gridColumn: `${b.s + 2} / span ${b.n}`, ["--i" as string]: i } as CSSProperties}>
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
      </Layer>
    </div>
  );
}

/* ---- the email --------------------------------------------------- */

type Sent = { to: string; what: string; kind: string; at: string; state: string; fresh?: boolean };

function Email({ t, v, on }: { t: T; v: number; on: boolean }) {
  const names = businesses(t);
  const sentOk = t("Sent", "Enviado");
  const opened = t("Opened", "Aberto");
  const conf = t("Confirmation", "Confirmação");
  const rem = t("Reminder", "Lembrete");
  const fol = t("Follow-up", "Seguimento");
  const y = t("Yesterday", "Ontem");
  const sets: Sent[][] = [
    [
      { to: "Marta Figueiredo", what: t("Appointment confirmed: Tuesday at 10:00", "Consulta confirmada: terça às 10:00"), kind: conf, at: "09:14", state: sentOk, fresh: true },
      { to: "Inês Carvalho", what: t("How did your facial go?", "Como correu a limpeza de pele?"), kind: t("Aftercare", "Pós-consulta"), at: "07:30", state: opened },
      { to: "Sara Monteiro", what: t("Your laser session is tomorrow at 11:00", "A sessão de laser é amanhã às 11:00"), kind: rem, at: "08:00", state: opened },
      { to: "Carla Nunes", what: t("We have your request", "Recebemos o seu pedido"), kind: t("Receipt", "Receção"), at: y, state: t("Answered", "Respondido") },
      { to: "Beatriz Lima", what: t("Your quote is ready", "O seu orçamento está pronto"), kind: t("Quote", "Orçamento"), at: y, state: opened },
    ],
    [
      { to: "Rui Santos", what: t("Viewing confirmed: Thursday at 12:00", "Visita confirmada: quinta às 12:00"), kind: conf, at: "09:03", state: sentOk, fresh: true },
      { to: "Marco Dias", what: t("Your viewing is tomorrow at 09:00", "A visita é amanhã às 09:00"), kind: rem, at: "08:00", state: opened },
      { to: "João Pereira", what: t("Your property's valuation", "A avaliação do seu imóvel"), kind: fol, at: "07:45", state: opened },
      { to: "Teresa Gomes", what: t("We have your request", "Recebemos o seu pedido"), kind: t("Receipt", "Receção"), at: y, state: t("Answered", "Respondido") },
      { to: "Paulo Reis", what: t("Documents for the lease", "Documentos para o arrendamento"), kind: fol, at: y, state: opened },
    ],
    [
      { to: "Ana Lopes", what: t("Table for 4 confirmed: Saturday 20:30", "Mesa para 4 confirmada: sábado 20:30"), kind: conf, at: "09:11", state: sentOk, fresh: true },
      { to: "Pedro Costa", what: t("Your table is tomorrow at 21:00", "A reserva é amanhã às 21:00"), kind: rem, at: "08:00", state: opened },
      { to: "Luís Mendes", what: t("A menu for 12", "Proposta de menu para 12"), kind: t("Quote", "Orçamento"), at: "07:50", state: opened },
      { to: "Rita Alves", what: t("A cake for the birthday?", "Bolo de aniversário: alguma preferência?"), kind: fol, at: y, state: opened },
      { to: "Joana Rocha", what: t("Thank you for coming", "Obrigado pela visita"), kind: t("After the visit", "Pós-visita"), at: y, state: opened },
    ],
  ];
  // The blanks of the template, and what goes in each.
  const slot = (blank: string, value: string, i: number) => (
    <span className="be-mail-slot" style={{ ["--i" as string]: i } as CSSProperties}>
      <span className="be-mail-blank">{blank}</span>
      <span className="be-mail-value">{value}</span>
    </span>
  );
  return (
    <div className="be-stack">
      {sets.map((rows, l) => (
        <Layer key={l} l={l} v={v} on={on} className="be-mail">
          <div className="be-x-bar">
            <b>{t("Sent on their own", "Enviados sozinhos")}</b>
            <span className="be-x-count">{t(`${[14, 9, 22][l]} today`, `${[14, 9, 22][l]} hoje`)}</span>
            <span className="be-x-chip">{names[l]}</span>
          </div>
          <div className="be-db-grid be-mail-grid">
            <span className="be-db-h">{t("To", "Para")}</span>
            <span className="be-db-h">{t("Subject", "Assunto")}</span>
            <span className="be-db-h be-x-wide">{t("Template", "Modelo")}</span>
            <span className="be-db-h be-x-wide">{t("Time", "Hora")}</span>
            <span className="be-db-h">{t("Status", "Estado")}</span>
            {rows.map((row, i) => (
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

          {/* the clinic's message, just sent, opened, its blanks filling */}
          {l === 0 && (
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
          )}
        </Layer>
      ))}
    </div>
  );
}

/* ---- the simpler things around the three, at the end ------------- */

/** What else we build to measure (user, 2026-11-19, third round):
    simple things, nothing the studio does not do yet (no payments).
    Each is the same white sheet as the three, small, with almost no
    detail. Above the three and under them, in their columns. */
function others(t: T) {
  return [
    { col: 0, row: -1, name: t("Client portal", "Portal de clientes") },
    { col: 1, row: -1, name: t("Team portal", "Portal da equipa") },
    { col: 2, row: -1, name: t("Custom forms", "Formulários à medida") },
    { col: 0, row: 1, name: t("Waiting list", "Lista de espera") },
    { col: 1, row: 1, name: t("Review requests", "Pedidos de avaliação") },
    { col: 2, row: 1, name: t("Monthly reports", "Relatórios mensais") },
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

  const [clock, setClock] = useState({ at: 0, v: 0 });
  const run = inView && !reduce;
  useEffect(() => {
    if (!run) return;
    const holds = HOLDS[clock.at];
    const id = window.setTimeout(() => {
      setClock(({ at, v }) => (v + 1 < HOLDS[at].length ? { at, v: v + 1 } : { at: (at + 1) % HOLDS.length, v: 0 }));
    }, holds[clock.v] / SPEED);
    return () => window.clearTimeout(id);
  }, [clock, run]);

  const at = reduce ? 5 : clock.at;
  const v = reduce ? 0 : clock.v;
  const L = layout(narrow);
  const end = at === 4 ? L.row : L.sys;
  const pitch = L.W * end.s + end.gap;
  const sheetH = L.H * end.s;
  const rowPitch = L.H * L.sys.s + L.sys.rowGap;

  const sheets = [
    { k: "db", name: t("Database", "Base de dados"), Body: Database },
    { k: "cal", name: t("Calendar", "Calendário"), Body: Calendar },
    { k: "mail", name: t("Email", "E-mail"), Body: Email },
  ];
  const names = businesses(t);
  const captions = [
    t("A request arrives through the website", "Um pedido chega pelo website"),
    t(`Kept in the database, with everything that was asked · ${names[v]}`, `Fica registado na base de dados, com tudo o que foi pedido · ${names[v]}`),
    t(`It takes its place in the calendar, every detail kept · ${names[v]}`, `Ocupa o seu lugar no calendário, com todos os detalhes · ${names[v]}`),
    t(`The confirmation goes out on its own, its blanks filled · ${names[v]}`, `A confirmação sai sozinha, com os espaços preenchidos · ${names[v]}`),
    t("The three main solutions, tied together", "As três principais soluções, ligadas entre si"),
    t("And simpler ones around them, made to measure", "E outras mais simples à volta, feitas à medida"),
  ];
  const nameStyle = (col: number, row: number) =>
    ({
      ["--x" as string]: `${(col - 1) * pitch}cqw`,
      ["--y" as string]: `${(at === 5 ? row * rowPitch : 0) + sheetH / 2 + 1.4}cqw`,
    }) as CSSProperties;

  return (
    <figure
      ref={ref}
      className="be-ds"
      data-at={at}
      data-still={reduce || undefined}
      role="img"
      aria-label={t(
        "A request from the website's form is kept in the database, takes its place in the calendar, and its confirmation goes out on its own; each solution is shown for a clinic, a property agency and a restaurant. Then the three sit together, among simpler things made to measure: portals, forms, a waiting list, review requests and reports.",
        "Um pedido do formulário do website fica registado na base de dados, ocupa o seu lugar no calendário, e a confirmação sai sozinha; cada solução é mostrada numa clínica, numa imobiliária e num restaurante. Depois as três ficam juntas, entre outras mais simples feitas à medida: portais, formulários, lista de espera, pedidos de avaliação e relatórios.",
      )}
    >
      <div className="be-ds-stage" aria-hidden="true">
        <div className="be-ds-space">
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
          {/* and, at the end, down to the others in each column */}
          {[0, 1, 2].flatMap((col) =>
            [-1, 1].map((row) => (
              <span
                key={`${col}${row}`}
                className="be-ds-vwire"
                style={
                  {
                    // off the centre, so it never runs through a name
                    ["--x" as string]: `${(col - 1) * pitch + L.W * L.sys.s * 0.34}cqw`,
                    ["--y" as string]: `${row * (rowPitch / 2)}cqw`,
                    ["--h" as string]: `${L.sys.rowGap}cqw`,
                    ["--i" as string]: col,
                  } as CSSProperties
                }
              />
            )),
          )}

          {/* the form, where the request starts */}
          <div
            className="be-ds-form"
            data-on={at === 0 || undefined}
            style={{
              transform: at === 0 ? "translate3d(-8cqw, 0, 60px) rotateY(8deg) rotateX(2deg)" : "translate3d(27cqw, -3cqw, -260px) rotateY(-34deg) scale(0.4)",
              opacity: at === 0 ? 1 : 0,
            }}
          >
            <p className="be-x-bar">
              <b>{t("Book an appointment", "Marcar consulta")}</b>
            </p>
            {[
              [t("Name", "Nome"), "Marta Figueiredo"],
              [t("Email", "E-mail"), "marta.figueiredo@exemplo.pt"],
              [t("Service", "Serviço"), t("Assessment appointment", "Consulta de avaliação")],
              [t("Preferred time", "Horário preferido"), t("Tue morning", "Terça de manhã")],
            ].map(([label, value], i) => (
              <span key={label} className="be-ds-field" style={{ ["--i" as string]: i } as CSSProperties}>
                <em>{label}</em>
                <span>{value}</span>
              </span>
            ))}
            <span className="be-ds-send">{t("Send request", "Enviar pedido")}</span>
          </div>

          {/* the others, made to measure: the same sheet, almost bare */}
          {others(t).map((o, i) => {
            const p = pose(o.col, at, narrow, o.row);
            return (
              <div
                key={o.name}
                className="be-ds-sheet be-ds-mini"
                data-shown={at === 5 || undefined}
                style={{ transform: p.transform, ["--i" as string]: i } as CSSProperties}
              >
                <div className="be-x">
                  <div className="be-x-bar">
                    <b>{o.name}</b>
                  </div>
                  <div className="be-mini-lines">
                    <i />
                    <i />
                    <i />
                    <i />
                  </div>
                </div>
              </div>
            );
          })}

          {sheets.map(({ k, Body }, i) => {
            const p = pose(i, at, narrow);
            const on = ACTIVE[at] === i;
            return (
              <div key={k} className="be-ds-sheet" data-k={k} data-on={on || undefined} style={{ transform: p.transform, opacity: p.opacity, zIndex: on ? 5 : 3 - i }}>
                <Body t={t} v={v} on={on} />
              </div>
            );
          })}

          {/* their names, under them, once they are small */}
          {sheets.map((sheet, i) => (
            <span key={sheet.k} className="be-ds-name" style={nameStyle(i, 0)}>
              {sheet.name}
            </span>
          ))}
          {others(t).map((o) => (
            <span key={o.name} className="be-ds-name be-ds-name-mini" style={nameStyle(o.col, o.row)}>
              {o.name}
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
        <p key={`${at}-${v}`} className="be-dc-cap">
          {captions[at]}
        </p>
      </div>
    </figure>
  );
}
