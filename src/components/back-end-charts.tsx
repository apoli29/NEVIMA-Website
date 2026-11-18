"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { useInView, type T } from "./sbs-shared";
import { useLang } from "@/lib/use-lang";
import {
  COST,
  GROWTH,
  MONTH,
  TASKS,
  WEEK,
  WEEK_HOURS,
  autoHours,
  manualHours,
  savedHours,
} from "@/lib/back-end-figures";

/* ==================================================================
   The figures on the back-end page

   Drawings, not pictures of drawings: every one of them is built here,
   in the site's own black and white, with no charting library and no
   colour the brand does not have. Two marks have to tell one series
   from another without colour, so they differ in weight and in fill,
   and every series is named on the drawing itself.

   The rules they all keep (user, 2026-11-17):

   - every number comes from src/lib/back-end-figures.ts, and only from
     there, so one edit moves the drawing, the axis and the totals
     together;
   - every drawing carries "Valores ilustrativos" under it;
   - it draws itself once, when it is reached, and never again;
   - the value is readable by pointer and by keyboard, and it is also
     written on the drawing or beside it, so the tooltip only ever adds
     to what is already legible;
   - with reduced motion asked for, everything is simply there.

   The method is the dataviz skill's: one hue, thin marks, hairline
   axes, labels only where they carry the story, a 2px gap of the
   surface between touching marks, and the hit area bigger than the
   mark. The composition of the counter (a number set into the
   sentence that reads it) came from Bandcamp through Inspo; the flow
   of tools came from n8n's canvas.
   ================================================================== */

/* ---- the pieces they share --------------------------------------- */

/** Reached once, drawn once: it never plays a second time. */
function useSeenOnce<E extends Element>(threshold = 0.3) {
  const [ref, inView] = useInView<E>(threshold);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (inView) setSeen(true);
  }, [inView]);
  return [ref, seen] as const;
}

/** A number counting up to its value, on the clock rather than on
    frames, so a throttled tab still lands on the right number. */
function useCount(target: number, run: boolean, ms = 1400) {
  const [value, setValue] = useState(run ? target : 0);
  useEffect(() => {
    if (!run) return;
    if (ms <= 0) {
      setValue(target);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const step = (now: number) => {
      const at = Math.min(1, (now - start) / ms);
      // Fast at first and easing out, the way a tally settles.
      const eased = 1 - Math.pow(1 - at, 3);
      setValue(target * eased);
      if (at < 1) raf = requestAnimationFrame(step);
      else setValue(target);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, run, ms]);
  return value;
}

/** Numbers as each language writes them (1.284 / 1,284; 12,4 / 12.4). */
function useNum() {
  const lang = useLang();
  return (value: number, decimals = 0) =>
    value.toLocaleString(lang === "pt" ? "pt-PT" : "en-GB", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
}

/** Every drawing sits in one of these: its own name above it, and the
    warning that the numbers are made up under it. */
function Figure({
  name,
  t,
  dark,
  children,
  foot,
}: {
  name: string;
  t: T;
  dark?: boolean;
  children: React.ReactNode;
  foot?: React.ReactNode;
}) {
  return (
    <figure className="bef" data-dark={dark || undefined}>
      <figcaption className="bef-name">{name}</figcaption>
      {children}
      <p className="bef-mark mono-label">
        {foot ? <span className="bef-foot">{foot}</span> : null}
        <span>{t("Illustrative figures", "Valores ilustrativos")}</span>
      </p>
    </figure>
  );
}

/* ---- 1. two ways a business grows -------------------------------- */

const LOW = 100;
const HIGH = 250;
const atX = (i: number, n: number) => (i / (n - 1)) * 100;
const atY = (v: number) => ((HIGH - v) / (HIGH - LOW)) * 100;
const line = (values: readonly number[]) =>
  values.map((v, i) => `${i === 0 ? "M" : "L"} ${atX(i, values.length)} ${atY(v)}`).join(" ");

export function GrowthLines({ t }: { t: T }) {
  const reduce = useReducedMotion() ?? false;
  const [ref, seen] = useSeenOnce<HTMLDivElement>(0.3);
  const run = seen || reduce;
  const num = useNum();
  const [at, setAt] = useState<number | null>(null);
  const plot = useRef<HTMLDivElement>(null);
  const n = GROWTH.digital.length;
  const month = (i: number) => 1 + i * GROWTH.everyMonths;

  const read = (clientX: number) => {
    const box = plot.current?.getBoundingClientRect();
    if (!box || box.width === 0) return;
    const share = (clientX - box.left) / box.width;
    setAt(Math.max(0, Math.min(n - 1, Math.round(share * (n - 1)))));
  };

  return (
    <Figure
      t={t}
      dark
      name={t(
        "Turnover over two years, the first month as 100",
        "Faturação ao longo de dois anos, com o primeiro mês como 100",
      )}
    >
      <div
        ref={ref}
        className="bef-line"
        data-run={run || undefined}
        data-still={reduce || undefined}
      >
        <div
          ref={plot}
          className="bef-plot"
          tabIndex={0}
          role="img"
          aria-label={t(
            `Two lines over ${month(n - 1)} months. With digital processes, turnover reaches ${GROWTH.digital[n - 1]}; by hand, ${GROWTH.manual[n - 1]}.`,
            `Duas linhas ao longo de ${month(n - 1)} meses. Com processos digitais, a faturação chega a ${GROWTH.digital[n - 1]}; à mão, chega a ${GROWTH.manual[n - 1]}.`,
          )}
          onPointerMove={(e) => read(e.clientX)}
          onPointerLeave={() => setAt(null)}
          onBlur={() => setAt(null)}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") setAt((i) => Math.min(n - 1, (i ?? -1) + 1));
            else if (e.key === "ArrowLeft") setAt((i) => Math.max(0, (i ?? n) - 1));
            else if (e.key === "Escape") setAt(null);
            else return;
            e.preventDefault();
          }}
        >
          {/* The ticks live inside the plot, so they line up with the
              grid whatever room is left above it. */}
          <div className="bef-ticks" aria-hidden="true">
            {[250, 200, 150, 100].map((tick) => (
              <span key={tick} style={{ top: `${atY(tick)}%` }}>
                {num(tick)}
              </span>
            ))}
          </div>

          <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            {/* The lines are uncovered left to right rather than drawn
                by a dash: a dash measured in screen pixels over a
                stretched box breaks into pieces. */}
            <clipPath id="bef-wipe" clipPathUnits="userSpaceOnUse">
              <rect className="bef-wipe" x="0" y="-20" width="100" height="140" />
            </clipPath>
            {[250, 200, 150, 100].map((tick) => (
              <line
                key={tick}
                className="bef-grid"
                x1="0"
                x2="100"
                y1={atY(tick)}
                y2={atY(tick)}
                vectorEffect="non-scaling-stroke"
              />
            ))}
            {/* The faint one first, so the lit one crosses over it. */}
            <g clipPath="url(#bef-wipe)">
              <path
                className="bef-path bef-path-manual"
                d={line(GROWTH.manual)}
                vectorEffect="non-scaling-stroke"
              />
              <path
                className="bef-path bef-path-digital"
                d={line(GROWTH.digital)}
                vectorEffect="non-scaling-stroke"
              />
            </g>
            {at !== null && (
              <line
                className="bef-cross"
                x1={atX(at, n)}
                x2={atX(at, n)}
                y1="0"
                y2="100"
                vectorEffect="non-scaling-stroke"
              />
            )}
          </svg>

          {/* Round things stay out of the stretched box. */}
          <span
            className="bef-dot bef-dot-digital"
            style={{ left: "100%", top: `${atY(GROWTH.digital[n - 1])}%` }}
            aria-hidden="true"
          />
          <span
            className="bef-dot bef-dot-manual"
            style={{ left: "100%", top: `${atY(GROWTH.manual[n - 1])}%` }}
            aria-hidden="true"
          />
          {at !== null && (
            <>
              <span
                className="bef-dot bef-dot-at"
                style={{ left: `${atX(at, n)}%`, top: `${atY(GROWTH.digital[at])}%` }}
                aria-hidden="true"
              />
              <span
                className="bef-dot bef-dot-at bef-dot-faint"
                style={{ left: `${atX(at, n)}%`, top: `${atY(GROWTH.manual[at])}%` }}
                aria-hidden="true"
              />
              <span
                className="bef-tip"
                style={{ left: `${atX(at, n)}%` }}
                data-edge={at === 0 ? "start" : at === n - 1 ? "end" : undefined}
              >
                <span className="mono-label bef-tip-when">
                  {t(`Month ${month(at)}`, `Mês ${month(at)}`)}
                </span>
                <span className="bef-tip-row">
                  <i className="bef-key" />
                  <b>{num(GROWTH.digital[at])}</b>
                  <em>{t("with digital", "com digital")}</em>
                </span>
                <span className="bef-tip-row">
                  <i className="bef-key bef-key-faint" />
                  <b>{num(GROWTH.manual[at])}</b>
                  <em>{t("by hand", "à mão")}</em>
                </span>
              </span>
            </>
          )}
        </div>

        {/* The two series named on the drawing, not in a colour key. */}
        <span className="bef-said bef-said-digital" style={{ ["--y" as string]: atY(GROWTH.digital[n - 1]) }}>
          <b>{num(GROWTH.digital[n - 1])}</b>
          <span>{t("with digital processes", "com processos digitais")}</span>
        </span>
        <span className="bef-said bef-said-manual" style={{ ["--y" as string]: atY(GROWTH.manual[n - 1]) }}>
          <b>{num(GROWTH.manual[n - 1])}</b>
          <span>{t("all by hand", "tudo à mão")}</span>
        </span>

        <div className="bef-when mono-label" aria-hidden="true">
          <span>{t("Month 1", "Mês 1")}</span>
          <span>{t(`Month ${month(n - 1)}`, `Mês ${month(n - 1)}`)}</span>
        </div>
      </div>
    </Figure>
  );
}

/* ---- 2. a month, in three numbers -------------------------------- */

export function MonthCards({ t }: { t: T }) {
  const reduce = useReducedMotion() ?? false;
  const [ref, seen] = useSeenOnce<HTMLDivElement>(0.4);
  const run = seen || reduce;
  const cards = [
    { v: MONTH.requests, name: t("Requests received", "Pedidos recebidos"), say: t("Written down on their own", "Escritos sozinhos") },
    { v: MONTH.bookings, name: t("Bookings this week", "Marcações da semana"), say: t("In one calendar", "Num só calendário") },
    { v: MONTH.emails, name: t("Emails sent", "E-mails enviados"), say: t("Automatic or pre-written", "Automáticos ou pré-feitos") },
  ];
  return (
    <Figure t={t} name={t("One month of a small business", "Um mês de um negócio pequeno")}>
      <div ref={ref} className="bef-cards">
        {cards.map((card, i) => (
          <Card key={card.name} {...card} run={run} still={reduce} i={i} />
        ))}
      </div>
    </Figure>
  );
}

function Card({ v, name, say, run, still, i }: { v: number; name: string; say: string; run: boolean; still: boolean; i: number }) {
  const num = useNum();
  const shown = useCount(v, run, still ? 0 : 1200 + i * 150);
  return (
    <div className="bef-card">
      <p className="bef-card-v">{num(Math.round(shown))}</p>
      <p className="bef-card-name">{name}</p>
      <p className="mono-label bef-card-say">{say}</p>
    </div>
  );
}

/* ---- 3. the hours of a week -------------------------------------- */

function taskName(key: string, t: T) {
  switch (key) {
    case "pedidos":
      return t("Writing down requests", "Apontar pedidos");
    case "respostas":
      return t("Answering and confirming", "Responder e confirmar");
    case "marcacoes":
      return t("Bookings and reminders", "Marcações e lembretes");
    case "procura":
      return t("Looking for information", "Procurar informação");
    default:
      return t("Records and invoicing", "Registos e faturação");
  }
}

export function HoursBars({ t, dark }: { t: T; dark?: boolean }) {
  const reduce = useReducedMotion() ?? false;
  const [ref, seen] = useSeenOnce<HTMLDivElement>(0.3);
  const run = seen || reduce;
  const num = useNum();
  const top = Math.max(...TASKS.map((task) => task.manual));
  const hour = (v: number) => t(`${num(v, 1)} h a week`, `${num(v, 1)} h por semana`);

  return (
    <Figure
      t={t}
      dark={dark}
      name={t("Hours a week, by hand and with a back end", "Horas por semana, à mão e com um back end")}
    >
      <div ref={ref} className="bef-bars" data-run={run || undefined} data-still={reduce || undefined}>
        {TASKS.map((task, i) => (
          <div key={task.key} className="bef-group" style={{ ["--i" as string]: i }}>
            <div className="bef-stems">
              <button
                type="button"
                className="bef-bar bef-bar-manual"
                style={{ ["--h" as string]: `${(task.manual / top) * 100}%` }}
              >
                <span className="bef-bar-tip">
                  <b>{hour(task.manual)}</b>
                  <em>{t("by hand", "à mão")}</em>
                </span>
              </button>
              <button
                type="button"
                className="bef-bar bef-bar-auto"
                style={{ ["--h" as string]: `${(task.auto / top) * 100}%` }}
              >
                <span className="bef-bar-tip">
                  <b>{hour(task.auto)}</b>
                  <em>{t("with a back end", "com um back end")}</em>
                </span>
              </button>
            </div>
            <p className="bef-group-name">{taskName(task.key, t)}</p>
            <p className="mono-label bef-group-v">
              {num(task.manual, 1)} h → {num(task.auto, 1)} h
            </p>
          </div>
        ))}
      </div>
      <p className="bef-legend">
        <span className="bef-legend-key bef-legend-manual" aria-hidden="true" />
        {t("By hand", "À mão")}
        <span className="bef-legend-key bef-legend-auto" aria-hidden="true" />
        {t("With a back end", "Com um back end")}
      </p>
    </Figure>
  );
}

export function WeekDonut({ t, dark }: { t: T; dark?: boolean }) {
  const reduce = useReducedMotion() ?? false;
  const [ref, seen] = useSeenOnce<HTMLDivElement>(0.4);
  const run = seen || reduce;
  const num = useNum();
  const [at, setAt] = useState<number | null>(null);
  const name = (key: string) =>
    key === "work"
      ? t("The work itself", "O trabalho em si")
      : key === "grow"
        ? t("Given back to the business", "Devolvido ao negócio")
        : t("What is left by hand", "O que sobra à mão");

  // Where each part starts, around the ring, with a gap of surface
  // between them rather than a stroke.
  const GAP = 1.2;
  let run0 = 0;
  const parts = WEEK.map((part) => {
    const share = (part.hours / WEEK_HOURS) * 100;
    const start = run0;
    run0 += share;
    return { ...part, share, start };
  });

  return (
    <Figure t={t} dark={dark} name={t("The week of 40 hours, after", "A semana de 40 horas, depois")}>
      <div ref={ref} className="bef-ring" data-run={run || undefined} data-still={reduce || undefined}>
        <svg viewBox="0 0 100 100" role="img" aria-label={parts.map((p) => `${name(p.key)}: ${num(p.hours, 1)} h`).join("; ")}>
          {parts.map((part, i) => (
            <circle
              key={part.key}
              className="bef-arc"
              data-on={at === i || undefined}
              cx="50"
              cy="50"
              r="38"
              pathLength={100}
              strokeDashoffset={-part.start}
              style={{ ["--i" as string]: i, ["--len" as string]: Math.max(0, part.share - GAP) }}
              onPointerEnter={() => setAt(i)}
              onPointerLeave={() => setAt(null)}
              onFocus={() => setAt(i)}
              onBlur={() => setAt(null)}
              tabIndex={0}
            />
          ))}
        </svg>
        <p className="bef-ring-mid" aria-hidden="true">
          <b>{num(at === null ? WEEK_HOURS : parts[at].hours, at === null ? 0 : 1)}</b>
          <span className="mono-label">
            {at === null ? t("hours a week", "horas por semana") : name(parts[at].key)}
          </span>
        </p>
      </div>
      <dl className="bef-parts">
        {parts.map((part, i) => (
          <div key={part.key} data-on={at === i || undefined}>
            <dt>
              <span className="bef-parts-key" data-i={i} aria-hidden="true" />
              {name(part.key)}
            </dt>
            <dd>
              {/* A half point is kept where there is one: rounded to
                  whole numbers the three add up to 101. */}
              {num(part.hours, 1)} h · {num(part.share, part.share % 1 === 0 ? 0 : 1)}%
            </dd>
          </div>
        ))}
      </dl>
    </Figure>
  );
}

export function SavedHours({ t, dark }: { t: T; dark?: boolean }) {
  const reduce = useReducedMotion() ?? false;
  const [ref, seen] = useSeenOnce<HTMLParagraphElement>(0.5);
  const num = useNum();
  const shown = useCount(savedHours, seen || reduce, reduce ? 0 : 1600);
  return (
    <div className="bef-saved" data-dark={dark || undefined}>
      <p ref={ref} className="bef-saved-say">
        {t("A week by hand spends", "Uma semana à mão gasta")}{" "}
        <span className="bef-saved-in">{num(manualHours, 1)} h</span>{" "}
        {t("on work nobody pays for. With a back end it spends", "em trabalho que ninguém paga. Com um back end gasta")}{" "}
        <span className="bef-saved-in">{num(autoHours, 1)} h</span>.
      </p>
      <p className="bef-saved-big">
        <b>{num(shown, 1)}</b>
        <span className="mono-label">{t("hours a week, back", "horas por semana, devolvidas")}</span>
      </p>
      <p className="bef-mark mono-label">{t("Illustrative figures", "Valores ilustrativos")}</p>
    </div>
  );
}

/* ---- 4. the tools, and what a month costs ------------------------ */

/** The flow is drawn twice, because a phone reads it standing up and a
    desk reads it lying down. One of the two is on screen at a time. */
function flowShape(wide: boolean) {
  return wide
    ? { w: 760, h: 300, box: { w: 168, h: 52 }, site: [16, 124], tools: [[296, 28], [296, 124], [296, 220]], out: [576, 124] }
    : { w: 340, h: 520, box: { w: 180, h: 48 }, site: [80, 12], tools: [[20, 140], [140, 248], [20, 356]], out: [80, 456] };
}

export function ToolFlow({ t, names }: { t: T; names: string[] }) {
  const reduce = useReducedMotion() ?? false;
  const [ref, seen] = useSeenOnce<HTMLDivElement>(0.3);
  const run = seen && !reduce;
  const [wide, setWide] = useState(true);

  useEffect(() => {
    const watch = window.matchMedia("(min-width: 820px)");
    const read = () => setWide(watch.matches);
    read();
    watch.addEventListener("change", read);
    return () => watch.removeEventListener("change", read);
  }, []);

  const s = flowShape(wide);
  const mid = (xy: number[]) => [xy[0] + s.box.w / 2, xy[1] + s.box.h / 2];
  const wires = s.tools.flatMap((tool, i) => {
    const from = mid(s.site);
    const to = mid(tool);
    const end = mid(s.out);
    const bend = (a: number[], b: number[]) =>
      wide
        ? `M ${a[0] + s.box.w / 2} ${a[1]} C ${(a[0] + b[0]) / 2 + s.box.w / 4} ${a[1]}, ${(a[0] + b[0]) / 2 - s.box.w / 4} ${b[1]}, ${b[0] - s.box.w / 2} ${b[1]}`
        : `M ${a[0]} ${a[1] + s.box.h / 2} C ${a[0]} ${(a[1] + b[1]) / 2}, ${b[0]} ${(a[1] + b[1]) / 2}, ${b[0]} ${b[1] - s.box.h / 2}`;
    return [
      { id: `in-${i}`, d: bend(from, to), i },
      { id: `out-${i}`, d: bend(to, end), i: i + 3 },
    ];
  });

  const Box = ({ xy, name, lit }: { xy: number[]; name: string; lit?: boolean }) => (
    <g className="bef-node" data-lit={lit || undefined}>
      <rect x={xy[0]} y={xy[1]} width={s.box.w} height={s.box.h} rx="2" />
      <text x={xy[0] + s.box.w / 2} y={xy[1] + s.box.h / 2}>
        {name}
      </text>
    </g>
  );

  return (
    <Figure
      t={t}
      dark
      name={t("The website, the tools and the client", "O website, as ferramentas e o cliente")}
      foot={t("Tool names set by the studio", "Nomes das ferramentas definidos pelo estúdio")}
    >
      <div ref={ref} className="bef-flow" data-run={run || undefined}>
        <svg
          viewBox={`0 0 ${s.w} ${s.h}`}
          role="img"
          aria-label={t(
            "The website feeds three tools, and the three answer the client.",
            "O website alimenta três ferramentas, e as três respondem ao cliente.",
          )}
        >
          {wires.map((wire) => (
            <path key={wire.id} className="bef-wire" d={wire.d} vectorEffect="non-scaling-stroke" />
          ))}
          {run &&
            wires.map((wire) => (
              <circle key={`run-${wire.id}`} className="bef-bead" r="3.5">
                <animateMotion dur="3.2s" begin={`${wire.i * 0.45}s`} repeatCount="indefinite" path={wire.d} />
              </circle>
            ))}
          <Box xy={s.site} name={t("The website", "O website")} lit />
          {s.tools.map((tool, i) => (
            <Box key={i} xy={tool} name={names[i]} />
          ))}
          <Box xy={s.out} name={t("The client", "O cliente")} lit />
        </svg>
      </div>
    </Figure>
  );
}

export function CostBars({ t }: { t: T }) {
  const reduce = useReducedMotion() ?? false;
  const [ref, seen] = useSeenOnce<HTMLDivElement>(0.4);
  const run = seen || reduce;
  const num = useNum();
  const top = Math.max(COST.traditional, COST.ours);
  const rows = [
    { v: COST.traditional, name: t("A system built the usual way", "Uma solução tradicional") },
    { v: COST.ours, name: t("Our monthly service", "O nosso serviço mensal"), ours: true },
  ];
  return (
    <Figure t={t} dark name={t("What a month costs", "O que custa um mês")}>
      <div ref={ref} className="bef-cost" data-run={run || undefined} data-still={reduce || undefined}>
        {rows.map((row, i) => (
          <div key={row.name} className="bef-cost-row" style={{ ["--i" as string]: i }}>
            <p className="bef-cost-name">{row.name}</p>
            <span className="bef-cost-lane">
              <button
                type="button"
                className="bef-cost-bar"
                data-ours={row.ours || undefined}
                style={{ ["--w" as string]: `${(row.v / top) * 100}%` }}
              >
                <span className="bef-bar-tip">
                  <b>
                    {num(row.v)} € {t("a month", "por mês")}
                  </b>
                  <em>{row.name}</em>
                </span>
              </button>
              <span className="bef-cost-v">{num(row.v)} €</span>
            </span>
          </div>
        ))}
      </div>
    </Figure>
  );
}

/* ---- the header's card ------------------------------------------- */

/** One request walking through the back end, on a loop, in the shape
    the side-by-side page's personalization card has (user, 2026-11-18:
    the same card, the same kind of animation, in grey): the steps
    listed down one side, the thing itself happening on the other.

    Four steps: the form is sent, the request is kept in the database,
    the booking takes its place in the calendar, the confirmation goes
    out. Then a new request starts.

    With reduced motion asked for it stands at the end of the walk,
    every step done and nothing moving. */
export function ProcessCard({ t }: { t: T }) {
  const reduce = useReducedMotion() ?? false;
  const [ref, seen] = useSeenOnce<HTMLElement>(0.25);
  const [step, setStep] = useState(0);
  const run = seen && !reduce;

  useEffect(() => {
    if (!run) return;
    const id = window.setTimeout(() => setStep((s) => (s + 1) % 4), step === 3 ? 2600 : 2200);
    return () => window.clearTimeout(id);
  }, [step, run]);

  const at = reduce ? 3 : step;
  const steps = [
    { n: "01", name: t("The form is sent", "O formulário é enviado") },
    { n: "02", name: t("The request is kept", "O pedido fica guardado") },
    { n: "03", name: t("The booking is made", "A marcação é criada") },
    { n: "04", name: t("The client is answered", "O cliente é respondido") },
  ];

  return (
    <figure
      ref={ref}
      className="be-pc"
      data-at={at}
      data-still={reduce || undefined}
      role="img"
      aria-label={t(
        "A request sent from the website's form is kept in the database, becomes a booking in the calendar, and the confirmation goes out on its own.",
        "Um pedido enviado pelo formulário do website fica guardado na base de dados, passa a marcação no calendário, e a confirmação sai sozinha.",
      )}
    >
      <div className="be-pc-side">
        <p className="mono-label be-pc-kicker">{t("A request, from end to end", "Um pedido, do início ao fim")}</p>
        <ol className="be-pc-steps">
          {steps.map((s, i) => (
            <li key={s.n} className="be-pc-step" data-on={at === i || undefined} data-done={at > i || undefined}>
              <span className="mono-label be-pc-n" aria-hidden="true">
                {s.n}
              </span>
              <span className="be-pc-name">{s.name}</span>
              {i < steps.length - 1 && (
                <span className="be-pc-wire" aria-hidden="true">
                  {at === i + 1 && !reduce && <span className="be-pc-bead" />}
                </span>
              )}
            </li>
          ))}
        </ol>
      </div>

      <div className="be-pc-stage" aria-hidden="true">
        <div className="be-pc-panel" data-on={at === 0 || undefined}>
          <span className="be-pc-sheet">
            <span className="be-pc-bar be-pc-bar-head" />
            <span className="be-pc-field" style={{ ["--i" as string]: 0 }} />
            <span className="be-pc-field" style={{ ["--i" as string]: 1 }} />
            <span className="be-pc-field be-pc-field-tall" style={{ ["--i" as string]: 2 }} />
            <span className="be-pc-send" />
          </span>
        </div>

        <div className="be-pc-panel" data-on={at === 1 || undefined}>
          <span className="be-pc-sheet">
            <span className="be-pc-thead">
              <i /> <i /> <i />
            </span>
            <span className="be-pc-trow be-pc-trow-new">
              <i /> <i /> <i />
            </span>
            <span className="be-pc-trow">
              <i /> <i /> <i />
            </span>
            <span className="be-pc-trow">
              <i /> <i /> <i />
            </span>
          </span>
        </div>

        <div className="be-pc-panel" data-on={at === 2 || undefined}>
          <span className="be-pc-sheet">
            <span className="be-pc-bar be-pc-bar-head" />
            <span className="be-pc-cal">
              {Array.from({ length: 21 }, (_, c) => (
                <i key={c} data-take={c === 10 || undefined} />
              ))}
            </span>
          </span>
        </div>

        <div className="be-pc-panel" data-on={at === 3 || undefined}>
          <span className="be-pc-sheet">
            <span className="be-pc-bar be-pc-bar-head" />
            <span className="be-pc-bar" style={{ ["--w" as string]: "72%" }} />
            <span className="be-pc-bar" style={{ ["--w" as string]: "54%" }} />
            <span className="be-pc-mailfoot">
              <svg className="be-pc-tick" viewBox="0 0 20 20">
                <path d="M4 10.5 L8.5 15 L16 5.5" />
              </svg>
            </span>
          </span>
        </div>
      </div>
    </figure>
  );
}
