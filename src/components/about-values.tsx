"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useLang, useT } from "@/lib/use-lang";
import { SlideIn } from "./enter";
import { useInkAlign } from "./ink-align";
import { useSeen } from "./use-seen";
import { padX, padY, useValuesWater, type ValuesControl } from "./values-water";

/* ==================================================================
   Values

   The second screen's water again, white under a moving sheet of it,
   with the section's title and its subtitle at the head (title on the
   left, subtitle justified on the right, level with it), and under them
   four drops of black glass lying on the water, one to a value, with no
   names: what each drop stands for is only found by choosing it.

   So the drops have to ask to be pressed. The cue is a callout of the
   kind films draw over a camera feed when a target is picked out: from
   the edge of one drop a fine line runs off at an angle, turns level,
   and "Click here" is written along the level stretch, the line under it
   as its underline. It never stops while the four are apart: it moves
   from drop to drop, a ring striking the water where it lands, two up
   at once; the drop under the pointer only swells a little (no callout
   of its own: the moving one is cue enough, the user's ask); once the four are together it points at the piece they made
   and says how to let them go.

   Choosing one pulls all four together into a single uneven piece of
   glass, and the value chosen is set on it in white (see
   values-water.ts). The values are not four separate claims: each only
   holds with the other three, and the join is that said without words.
   A press anywhere on the water, or Esc, lets the four go back.

   The four are the studio's own (user, 2026-10-13): their content as
   the user wrote it, only the writing adapted to read naturally in
   English (user, 2026-10-16: adapt the writing, never the content).

   The drops are drawn on a canvas; what is pressed is a real button set
   exactly under each one, so the page works from the keyboard and to a
   screen reader as it does to the pointer.
   ================================================================== */

const VALUES = [
  {
    id: "quality",
    name: "Efficiency with quality",
    text: "We focus on making all of our processes efficient, without ever compromising the quality we deliver. The result? Excellent websites, delivered in less time and with outstanding value for money.",
  },
  {
    id: "open",
    name: "Transparency",
    text: "For us, it\u2019s non-negotiable that our clients know how we work and how we put a value on what we do. That’s why we explain our whole process and aim to give you a price estimate right from the start.",
  },
  {
    id: "ease",
    name: "Making it easy",
    text: "We want our clients to be free of every logistical worry, from registering the domain and getting the website hosted to registering the trademark (if applicable). We follow the process closely, support you throughout and, wherever we legally and practically can, do it ourselves.",
  },
  {
    id: "current",
    name: "Committed to the cutting edge",
    text: "We\u2019re whole\u00adheart\u00adedly com\u00admit\u00adted to being as in\u00adno\u00adva\u00adtive as possible, in the tools we use and in our practices and processes. We constantly adapt our workflow precisely so we can offer a service with a level of innovation well above the norm.",
  },
] as const;

/* The four in Portuguese, from the studio's own originals (see
   docs/about-decisions.md), carried to the content the English has now. */
const PT_VALUES: Record<(typeof VALUES)[number]["id"], { name: string; text: string }> = {
  quality: {
    name: "Eficiência com qualidade",
    text: "Focamo-nos em tornar todos os nossos processos eficientes, sem nunca comprometer a qualidade que entregamos. O resultado? Websites de excelência, feitos num prazo reduzido e com uma relação qualidade-preço elevadíssima.",
  },
  open: {
    name: "Transparência",
    text: "Para nós, é absolutamente indispensável que os nossos clientes conheçam a forma como trabalhamos e como atribuímos valor ao nosso trabalho. É por isso que explicamos todo o nosso processo e procuramos apresentar, logo à partida, uma estimativa de orçamento.",
  },
  ease: {
    name: "Facilitar",
    text: "Queremos que os nossos clientes fiquem livres de qualquer preocupação logística, do registo do domínio e do alojamento do website ao registo da marca (se aplicável). Acompanhamos o processo de perto, prestamos apoio do início ao fim e, sempre que a lei e a prática o permitem, tratamos nós disso.",
  },
  current: {
    name: "Compromisso com o vanguardismo",
    text: "Estamos inteiramente em\u00adpe\u00adnha\u00addos em ser o mais i\u00adno\u00adva\u00addo\u00adres possível, nas ferramentas que usamos e nas nossas práticas e processos. Adaptamos cons\u00adtan\u00adte\u00admen\u00adte a nossa forma de trabalhar precisamente para oferecer um serviço com um nível de inovação muito acima da norma.",
  },
};

/** What the callout points at: a drop, or the piece the four made. */
type Aim = { kind: "drop"; i: number } | { kind: "piece" } | null;

export function AboutValues() {
  const reduce = useReducedMotion() ?? false;
  const section = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const field = useRef<HTMLDivElement>(null);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const mergedRef = useRef<HTMLButtonElement>(null);
  useInkAlign(titleRef, subRef);
  const seen = useSeen(field, { threshold: 0.35 });
  const t = useT();
  const lang = useLang();
  const values = lang === "pt" ? VALUES.map((v) => ({ ...v, ...PT_VALUES[v.id] })) : VALUES;

  // The value on show, from the moment it is chosen until the four are
  // back where they lay; and whether the words are fully in on the piece.
  const [chosen, setChosen] = useState<number | null>(null);
  const [joined, setJoined] = useState(false);
  // Whether focus should come back to the chosen drop once they part, and
  // which one that is.
  const returnFocus = useRef(false);
  const focusBack = useRef<number | null>(null);

  // "Click" where there is a pointer that can hover, "Tap" where there is
  // not. Read once mounted: the server cannot know.
  const [tap, setTap] = useState(false);
  useEffect(() => {
    if (!window.matchMedia("(hover: hover)").matches) setTap(true);
  }, []);

  // The callouts. While the four are apart they never stop: each drop
  // that calls keeps its callout through the next call, so two are up at
  // once, the older one going a moment before a third comes (timed by the
  // water, see values-water.ts). Once joined, a single one points at the
  // piece.
  const [calls, setCalls] = useState<{ i: number; id: number }[]>([]);

  const aims: { key: string; aim: NonNullable<Aim> }[] = joined
    ? [{ key: "piece", aim: { kind: "piece" } }]
    : chosen !== null
      ? []
      : [
          ...calls.map((c) => ({ key: `call-${c.id}`, aim: { kind: "drop" as const, i: c.i } })),        ];

  const control = useRef<ValuesControl>({
    target: 0,
    lead: 0,
    slots: [],
    merged: null,
    remeasure: true,
    beckon: true,
    hover: -1,
    onJoined: () => {},
    onParted: () => {},
    onBeckon: () => {},
    onBeckonEnd: () => {},
    probe: null,
  });

  const tell = useCallback((name: string, detail?: number) => {
    section.current?.dispatchEvent(new CustomEvent(name, { detail }));
  }, []);

  control.current.onJoined = () => setJoined(true);
  control.current.onParted = () => {
    focusBack.current = returnFocus.current ? control.current.lead : null;
    returnFocus.current = false;
    setChosen(null);
  };
  control.current.onBeckon = (i, id) =>
    setCalls((c) => [...c.filter((x) => x.i !== i), { i, id }]);
  control.current.onBeckonEnd = (id) => setCalls((c) => c.filter((x) => x.id !== id));


  // Once the piece they made can be pressed, it holds the focus.
  useEffect(() => {
    if (joined) mergedRef.current?.focus({ preventScroll: true });
  }, [joined]);

  // Once the buttons are pressable again.
  useEffect(() => {
    if (chosen !== null || focusBack.current === null) return;
    buttons.current[focusBack.current]?.focus({ preventScroll: true });
    focusBack.current = null;
  }, [chosen]);

  useValuesWater(canvas, control, reduce);

  // The words are laid out on the chosen value before the four set off,
  // so they travel to the size the piece will actually need.
  useLayoutEffect(() => {
    control.current.merged = mergedRef.current;
    control.current.remeasure = true;
  }, [chosen]);

  const choose = (i: number, event: MouseEvent<HTMLButtonElement>) => {
    if (chosen !== null) return;
    setChosen(i);
    setCalls([]);
    control.current.lead = i;
    control.current.target = 1;
    control.current.hover = -1;
    // From the keyboard there is no click on the water, so the drop
    // strikes it itself.
    if (event.detail === 0) tell("values:pick", i);
    tell("values:change");
  };

  const part = useCallback(() => {
    if (control.current.target === 0) return;
    returnFocus.current = mergedRef.current === document.activeElement;
    control.current.target = 0;
    setJoined(false);
    tell("values:change");
  }, [tell]);

  useEffect(() => {
    if (chosen === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") part();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [chosen, part]);

  const value = values[chosen ?? 0];
  const on = seen || reduce;
  // Where each callout up on the water was drawn, so a new one can keep
  // clear of them (see Callout).
  const placed = useRef(new Map<string, Lead>());

  return (
    <section
      ref={section}
      id="values"
      aria-labelledby="values-title"
      // While the four are together, a press anywhere on the water lets
      // them go: on a phone there is no Esc, and the piece is not the only
      // thing a thumb will aim at.
      onClick={() => {
        if (joined) part();
      }}
      data-joined={joined ? "" : undefined}
      className="abt-val relative isolate flex min-h-[100svh] flex-col justify-center overflow-hidden bg-paper pt-[calc(var(--section-gap)*0.85)]"
    >
      <canvas
        ref={canvas}
        aria-hidden="true"
        className="absolute inset-0 -z-10 block size-full"
      />

      {/* A whole screen of water (user, 2026-10-14: the values are a
          section of their own), the heading and the drops held in the
          middle of it. A little less room above than a section's usual head room, and
          below as much as it takes for the space under the drops (whose
          glass reaches past their buttons) to match the space over the
          title, so the heading and the drops sit as one piece in the
          middle of the water. */}
      <div className="shell flex flex-col pb-[3.25rem] md:pb-[8rem]">
        {/* Side by side from md: the title on the left, the subtitle
            justified on the right, its first line level with the top of
            the title's (see ink-align.ts). */}
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between md:gap-10">
          <SlideIn ready>
            <h2
              ref={titleRef}
              id="values-title"
              className="display text-[clamp(2.25rem,4.2vw,4.25rem)] text-ink"
            >
              <span className="block font-light">{t("Four values.", "Quatro valores.")}</span>
              <span className="block font-medium">{t("One way of working.", "Uma forma de trabalhar.")}</span>
            </h2>
          </SlideIn>
          <SlideIn ready from="right" delay={0.12} className="w-full max-w-[20rem] shrink-0">
            <p ref={subRef} className="abt-val-sub text-[0.9375rem] leading-[1.45] text-ash">
              {t(
                "Each one shapes the way we work. Choose one to find out how.",
                "Cada um molda a forma como trabalhamos. Basta escolher um para descobrir como.",
              )}
            </p>
          </SlideIn>
        </div>

        {/* Room above the drops for the callouts, and enough height
            either way for the piece the four become. */}
        <div ref={field} className="relative flex items-center pt-40 pb-10 md:pt-40 md:pb-12">
          <ul
            aria-label={t("Values: choose one to read it", "Valores: escolher um para o ler")}
            data-chosen={chosen === null ? undefined : ""}
            className="abt-val-list grid w-full grid-cols-2 gap-y-16 md:grid-cols-4"
          >
            {values.map((v, i) => (
              <motion.li
                key={v.id}
                className="flex justify-center"
                initial={false}
                animate={{ opacity: on ? 1 : 0 }}
                transition={{ duration: 0.6, delay: reduce ? 0 : 0.2 + i * 0.12 }}
              >
                <button
                  ref={(el) => {
                    buttons.current[i] = el;
                  }}
                  type="button"
                  aria-pressed={chosen === i}
                  aria-controls="value-drop"
                  aria-label={v.name}
                  // While the four are together, the piece they made is the
                  // one thing to press.
                  disabled={chosen !== null}
                  onClick={(event) => choose(i, event)}
                  onPointerEnter={(event) => {
                    if (event.pointerType !== "mouse" || chosen !== null) return;
                    control.current.hover = i;
                    tell("values:change");
                  }}
                  onPointerLeave={() => {
                    if (control.current.hover === i) control.current.hover = -1;
                  }}
                  className="abt-val-slot"
                >
                  <span
                    ref={(el) => {
                      control.current.slots[i] = el;
                    }}
                    aria-hidden="true"
                    className="abt-val-hit block rounded-full"
                  />
                </button>
              </motion.li>
            ))}
          </ul>

          {/* The value, set on the piece the four become. Always laid out,
              so they always know the size they are going to; seen only
              once they have met (its opacity is set by the water). */}
          <div className="pointer-events-none absolute inset-0 grid place-items-center px-1">
            <button
              ref={mergedRef}
              id="value-drop"
              type="button"
              onClick={part}
              inert={!joined}
              data-joined={joined ? "" : undefined}
              style={{ opacity: 0 }}
              className="abt-val-drop"
            >
              <span className="abt-val-name display block">{value.name}</span>
              <span className="abt-val-text block">{value.text}</span>
              <span className="sr-only">
                {t(". Press to see all four values again.", ". Carregar para voltar a ver os quatro valores.")}
              </span>
            </button>
          </div>
        </div>
      </div>

      {!reduce && on && (
        <AnimatePresence>
          {aims.map(({ key, aim }) => (
            <Callout
              key={key}
              id={key}
              placed={placed.current}
              aim={aim}
              label={
                aim.kind === "piece"
                  ? tap
                    ? t("Tap to close", "Tocar para fechar")
                    : t("Click to close", "Clicar para fechar")
                  : tap
                    ? t("Tap here", "Tocar aqui")
                    : t("Click here", "Clicar aqui")
              }
              section={section}
              slots={control.current.slots}
              piece={mergedRef}
              control={control}
            />
          ))}
        </AnimatePresence>
      )}

      <p className="sr-only" aria-live="polite">
        {joined ? `${value.name}. ${value.text}` : ""}
      </p>
    </section>
  );
}

/* ================================================================== */
/* The callout                                                          */
/* ================================================================== */

/** Where the callout is drawn, in the section's pixels: the point on the
    target it starts from, the corner where it turns level, how long the
    level run is and which way it goes. */
type Lead = { ax: number; ay: number; bx: number; by: number; run: number; dir: 1 | -1 };

/* The callouts are set as one system (the user found them scattered):
   each starts on its drop, on a white-filled ring set just inside the
   drop's outline as a target is marked, runs up and out at forty-five
   degrees, and turns level on a line shared by the whole row, a little
   over the tops of the drops, so every "Click here" stands on the same
   rule. One that would run into another already up takes the next line
   up instead, the same distance higher, so there are never more than two
   heights. The ring is pinned to its drop as it drifts; the words stay
   where they were set. */

/** The level run, the least it may be cut to, how far the first shared
    line sits over the row of drops, and how far apart the lines are. */
const RUN = 128;
const MIN_RUN = 90;
const LIFT = 26;
const LEVEL_STEP = 40;
/** How far from the drop's middle to its outline the ring sits. */
const INSET = 0.8;

type Box = { l: number; r: number; t: number; b: number };

/** What a callout covers: its slanted stretch, and its level run with
    the words over it. */
function boxesOf(lead: Lead): Box[] {
  const end = lead.bx + lead.dir * lead.run;
  return [
    {
      l: Math.min(lead.ax, lead.bx),
      r: Math.max(lead.ax, lead.bx),
      t: Math.min(lead.ay, lead.by),
      b: Math.max(lead.ay, lead.by),
    },
    { l: Math.min(lead.bx, end), r: Math.max(lead.bx, end), t: lead.by - 24, b: lead.by + 2 },
  ];
}

function collides(a: Lead, b: Lead) {
  const pad = 10;
  return boxesOf(a).some((x) =>
    boxesOf(b).some(
      (y) => x.l < y.r + pad && x.r + pad > y.l && x.t < y.b + pad && x.b + pad > y.t,
    ),
  );
}

function Callout({
  id,
  placed,
  aim,
  label,
  section,
  slots,
  piece,
  control,
}: {
  id: string;
  /** Every callout up, by id: read to keep clear of, written once placed. */
  placed: Map<string, Lead>;
  aim: NonNullable<Aim>;
  label: string;
  section: React.RefObject<HTMLElement | null>;
  slots: (HTMLElement | null)[];
  piece: React.RefObject<HTMLButtonElement | null>;
  control: React.RefObject<ValuesControl>;
}) {
  const [lead, setLead] = useState<Lead | null>(null);
  const ring = useRef<SVGGElement>(null);
  const line = useRef<SVGPathElement>(null);
  const key = aim.kind === "drop" ? `drop-${aim.i}` : "piece";

  /** Where the ring sits on drop i, for a callout going dir, in the
      section's pixels: just inside the drop's outline, read off the water;
      or, before the water is drawing, worked out from the drop's button. */
  const anchor = (i: number, dir: 1 | -1, box: DOMRect) => {
    const p = control.current.probe?.(i, dir);
    if (p) {
      return {
        x: p.cx + (p.ex - p.cx) * INSET,
        y: p.cy + (p.ey - p.cy) * INSET,
      };
    }
    const b = slots[i]?.getBoundingClientRect();
    if (!b) return null;
    const reach = b.width * 0.27;
    return {
      x: b.left - box.left + b.width / 2 + dir * reach,
      y: b.top - box.top + b.height / 2 - reach,
    };
  };

  // Placed from the page whenever the target changes, and again if the
  // window does.
  useLayoutEffect(() => {
    const measure = () => {
      const sec = section.current;
      const box = sec?.getBoundingClientRect();
      if (!sec || !box) return setLead(null);
      // Inside the page's columns, as everything else on the wall is: the
      // shell's content edges, in section pixels.
      const shell = sec.querySelector<HTMLElement>(".shell");
      const pad = shell ? parseFloat(getComputedStyle(shell).paddingLeft) || 16 : 16;
      const sb = shell?.getBoundingClientRect();
      const minX = sb ? sb.left - box.left + pad : 16;
      const maxX = sb ? sb.right - box.left - pad : box.width - 16;

      if (aim.kind === "drop") {
        const hit = slots[aim.i]?.getBoundingClientRect();
        if (!hit) return setLead(null);
        // The row's first shared line: over the tops of the drops in this
        // row (their buttons are all one size, so one top serves).
        const base = hit.top - box.top - LIFT;
        const make = (dir: 1 | -1, level: number): Lead | null => {
          const a = anchor(aim.i, dir, box);
          if (!a) return null;
          const by = base - level * LEVEL_STEP;
          const bx = a.x + dir * Math.max(a.y - by, 12);
          const room = dir === 1 ? maxX - bx : bx - minX;
          return { ax: a.x, ay: a.y, bx, by, run: Math.min(RUN, room), dir };
        };
        // To the right of the drop, unless the words would run off the
        // page; then the other way; then each a line higher.
        const cx = hit.left - box.left + hit.width / 2;
        const first: 1 | -1 = cx + hit.width * 0.3 + hit.width * 0.4 + RUN > maxX ? -1 : 1;
        const other = -first as 1 | -1;
        const others = [...placed].filter(([k]) => k !== id).map(([, l]) => l);
        const tries = [make(first, 0), make(other, 0), make(first, 1), make(other, 1), make(first, 2)]
          .filter((l): l is Lead => !!l && l.run >= MIN_RUN);
        // Where no placement keeps clear (two neighbours on a phone), this
        // call goes without its callout rather than run into the other;
        // the drop still strikes the water.
        const pick = tries.find((l) => !others.some((o) => collides(l, o))) ?? null;
        if (pick) placed.set(id, pick);
        setLead(pick);
      } else {
        const el = piece.current;
        if (!el) return setLead(null);
        const r = el.getBoundingClientRect();
        // The piece reaches past the words' box by the margin it is laid
        // out with (see measure() in values-water.ts).
        const fs = parseFloat(getComputedStyle(el).fontSize) || 16;
        const b = {
          left: r.left - padX() * fs,
          right: r.right + padX() * fs,
          top: r.top - padY() * fs,
          width: r.width + 2 * padX() * fs,
        };
        const left = b.left - box.left;
        const right = b.right - box.left;
        const rise = 46;
        const need = rise + RUN + 24;
        const make = (ax: number, ay: number, dir: 1 | -1, up: 1 | -1): Lead => {
          const bx = ax + dir * rise;
          const room = dir === 1 ? maxX - bx : bx - minX;
          return { ax, ay, bx, by: ay - up * rise, run: Math.min(RUN + 24, room), dir };
        };
        // Off whichever end of the piece has room; where neither has, up
        // off its top, towards the wider side, unless that runs into the
        // heading over it (a wide piece reaches up to the title on a
        // laptop): then down off its foot instead.
        let lead: Lead;
        if (maxX - right >= need) {
          lead = make(right + 4, b.top - box.top - 4, 1, 1);
        } else if (left - minX >= need) {
          lead = make(left - 4, b.top - box.top - 4, -1, 1);
        } else {
          const dir: 1 | -1 = right - minX > maxX - left ? -1 : 1;
          const ax = dir === -1 ? right - b.width * 0.18 : left + b.width * 0.18;
          lead = make(ax, b.top - box.top - 2, dir, 1);
          const heading = [...sec.querySelectorAll<HTMLElement>("#values-title, .abt-val-sub")].map((h) => {
            const hr = h.getBoundingClientRect();
            return { l: hr.left - box.left, r: hr.right - box.left, t: hr.top - box.top, b: hr.bottom - box.top };
          });
          const pad = 12;
          const hits = boxesOf(lead).some((x) =>
            heading.some((y) => x.l < y.r + pad && x.r + pad > y.l && x.t < y.b + pad && x.b + pad > y.t),
          );
          if (hits) {
            const foot = r.bottom - box.top + padY() * fs;
            lead = make(ax, foot + 2, dir, -1);
          }
        }
        placed.set(id, lead);
        setLead(lead);
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("resize", measure);
      placed.delete(id);
    };
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  // The ring follows its drop as the drop drifts, and the slanted stretch
  // with it; the turn and the words stay put. Only while the section is
  // near the screen: off it, the water under the drops is held still too,
  // and every frame spent here was a layout read and a repaint for nothing.
  useEffect(() => {
    if (!lead || aim.kind !== "drop") return;
    let frame = 0;
    const near = new IntersectionObserver(
      ([entry]) => {
        cancelAnimationFrame(frame);
        frame = entry?.isIntersecting ? requestAnimationFrame(follow) : 0;
      },
      { rootMargin: "25% 0px 25% 0px" },
    );
    const follow = () => {
      const box = section.current?.getBoundingClientRect();
      const a = box ? anchor(aim.i, lead.dir, box) : null;
      if (a) {
        ring.current?.setAttribute("transform", `translate(${a.x} ${a.y})`);
        line.current?.setAttribute(
          "d",
          `M ${a.x} ${a.y} L ${lead.bx} ${lead.by} L ${lead.bx + lead.dir * lead.run} ${lead.by}`,
        );
      }
      frame = requestAnimationFrame(follow);
    };
    frame = requestAnimationFrame(follow);
    if (section.current) near.observe(section.current);
    return () => {
      near.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [lead]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!lead) return null;
  return (
    <motion.svg
      aria-hidden="true"
      className="abt-callout pointer-events-none absolute inset-0 z-30 size-full overflow-visible"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.18 } }}
    >
      {/* The leader: up and out at forty-five degrees, then level. */}
      <motion.path
        ref={line}
        d={`M ${lead.ax} ${lead.ay} L ${lead.bx} ${lead.by} L ${lead.bx + lead.dir * lead.run} ${lead.by}`}
        className="abt-callout-line"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.45, delay: 0.1, ease: [0.65, 0, 0.35, 1] }}
      />
      {/* The mark on the target: a white ring with a black dot, set on the
          drop itself, so it reads on the black glass. */}
      <g ref={ring} transform={`translate(${lead.ax} ${lead.ay})`}>
        <motion.circle
          cx={0}
          cy={0}
          className="abt-callout-ring"
          initial={{ r: 16, opacity: 0 }}
          animate={{ r: 7, opacity: 1 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        />
        <circle cx={0} cy={0} r={2.5} className="abt-callout-dot" />
      </g>
      {/* Written along the level run, the line under it as its
          underline, as it is drawn out. */}
      <text
        x={lead.dir === 1 ? lead.bx + 2 : lead.bx - 2}
        y={lead.by - 8}
        textAnchor={lead.dir === 1 ? "start" : "end"}
        className="abt-callout-text"
      >
        <Typed text={label} delayMs={400} />
      </text>
    </motion.svg>
  );
}

/* Written out a letter at a time, as a readout on a screen is. */
function Typed({ text, delayMs }: { text: string; delayMs: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    setN(0);
    let id = 0;
    const start = window.setTimeout(() => {
      id = window.setInterval(() => {
        setN((v) => {
          if (v >= text.length) window.clearInterval(id);
          return Math.min(v + 1, text.length);
        });
      }, 32);
    }, delayMs);
    return () => {
      window.clearTimeout(start);
      window.clearInterval(id);
    };
  }, [text, delayMs]);
  return <>{text.slice(0, n)}</>;
}
