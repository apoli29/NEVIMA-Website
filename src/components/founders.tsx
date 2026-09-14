"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import { BoomerangMark } from "./boomerang";
import { Reveal, SectionLabel } from "./primitives";

/* ================================================================== */
/* FOUNDERS — two portraits, one mark, one axis                        */
/*                                                                     */
/* PLACEHOLDER COPY. Both biographies below are invented stand-ins,    */
/* written to the positioning in CLAUDE.md. Replace before launch.     */
/* ================================================================== */

type Fact = { label: string; copy: string };

type Founder = {
  id: "ap" | "ec";
  name: string;
  role: string;
  photo: string;
  alt: string;
  /* The two photographs were taken in very different light. Crop and tone
     are tuned per image so the pair reads as one set. */
  focus: string;
  tone: string;
  /* extra crop, where one frame sits looser than the other */
  crop?: string;
  lead: string;
  /* the record, kept in one column */
  record: Fact[];
  /* why they do it, set against the lead */
  drive: Fact;
};

const FOUNDERS: Founder[] = [
  {
    id: "ap",
    name: "antónio policarpo",
    role: "marca e direção",
    photo: "/founders/ap.jpg",
    alt: "Retrato de António Policarpo",
    focus: "50% 16%",
    tone: "grayscale contrast-[1.06] brightness-[0.82]",
    lead:
      "Desenha a identidade e decide o que fica de fora. Na prática, é quem transforma um briefing confuso numa direção que se defende em duas frases.",
    record: [
      {
        label: "formação",
        copy:
          "Design de Comunicação na Faculdade de Belas-Artes da Universidade de Lisboa, com pós-graduação em estratégia de marca no IADE.",
      },
      {
        label: "percurso",
        copy:
          "Quatro anos entre um estúdio de identidade e trabalho independente para clínicas e imobiliário. Viu processos de agência grande de perto, o suficiente para saber quais das etapas serviam o cliente e quais serviam a estrutura.",
      },
    ],
    drive: {
      label: "motivação",
      copy:
        "Cansou-se de ver boas decisões diluídas em três camadas de aprovação. A nevima nasceu dessa impaciência: menos reuniões, e o trabalho assinado por quem o fez.",
    },
  },
  {
    id: "ec",
    name: "emanuel costa",
    role: "construção e tecnologia",
    photo: "/founders/ec.jpg",
    alt: "Retrato de Emanuel Costa",
    focus: "48% 50%",
    tone: "grayscale contrast-[1.05] brightness-[1.42]",
    crop: "scale-[1.18] -translate-y-[4%]",
    lead:
      "Constrói o que o desenho promete e mede se cumpriu. Trata velocidade, acessibilidade e indexação como parte do projeto, não como acabamento no fim.",
    record: [
      {
        label: "formação",
        copy:
          "Engenharia Informática no Instituto Superior Técnico, com especialização em sistemas e desempenho web.",
      },
      {
        label: "percurso",
        copy:
          "Começou numa equipa de produto, onde percebeu que a maior parte do tempo de um site se perde em processo e não em código. Desde então automatiza tudo o que não exige julgamento humano.",
      },
    ],
    drive: {
      label: "motivação",
      copy:
        "Interessa-lhe a alavanca: ferramentas modernas, incluindo IA, para que duas pessoas entreguem em três semanas o que costuma demorar três meses. O julgamento continua humano. A repetição, não.",
    },
  },
];

/* ------------------------------------------------------------------ */
/* Flight                                                              */
/*                                                                     */
/* One continuous circuit in three acts. The throw: out over the         */
/* portrait that was clicked, climbing, then a wide turn past it. The    */
/* delivery: from up there, down and back in to the rule above the       */
/* biography, dragging the page down with it frame for frame. The        */
/* homecoming: back up the far side of the                               */
/* axis to the hand it left, which is where it waits for the next throw. */
/*                                                                       */
/* ARC is the throw alone, in fractions of the portrait band. The        */
/* left-hand throw is the same curve mirrored on the resting axis.       */
/* ------------------------------------------------------------------ */

const ARC: [number, number][][] = [
  [
    [0.615, 0.36],
    [0.755, 0.22],
    [0.875, 0.26],
  ],
  [
    [0.995, 0.3],
    [1.03, 0.55],
    [0.915, 0.655],
  ],
];
/* where the throw leaves off and the delivery picks up */
const TURN: [number, number] = [0.915, 0.655];

type Geo = {
  w: number;
  bandTop: number;
  bandLeft: number;
  bandW: number;
  bandH: number;
  anchorY: number;
};

const ZERO: Geo = { w: 0, bandTop: 0, bandLeft: 0, bandW: 0, bandH: 0, anchorY: 0 };

function buildPaths(g: Geo, dir: 1 | -1) {
  const fx = (v: number) => g.bandLeft + (dir === 1 ? v : 1 - v) * g.bandW;
  const fy = (v: number) => g.bandTop + v * g.bandH;
  const p = (x: number, y: number) => `${x.toFixed(1)} ${y.toFixed(1)}`;
  const P = (a: [number, number]) => p(fx(a[0]), fy(a[1]));

  const cx = fx(0.5);
  const cy = fy(0.5);

  const arc =
    `M ${p(cx, cy)} ` + ARC.map(([a, b, c]) => `C ${P(a)}, ${P(b)}, ${P(c)}`).join(" ");

  /* Out of the turn it is high and wide over the portrait, so the delivery
     falls away from there and curves back in to land on the axis.

     The first control point has to lie along the tangent the throw arrives
     on, or the two curves meet at a cusp: the mark comes into the turn
     travelling left, and any control point placed to its right makes it
     stop dead and reverse for a frame. Continuing the incoming direction
     instead keeps one unbroken line through the handover. */
  const sy = fy(TURN[1]);
  const drop = g.anchorY - sy;
  const lead = ARC[ARC.length - 1][1];
  const sx = dir === 1 ? 1 : -1;
  const arm = 1.6;
  const descent =
    ` C ${p(
      fx(TURN[0]) + (TURN[0] - lead[0]) * g.bandW * sx * arm,
      fy(TURN[1]) + (TURN[1] - lead[1]) * g.bandH * arm,
    )},` +
    ` ${p(cx + 0.06 * g.bandW * sx, g.anchorY - drop * 0.26)},` +
    ` ${p(cx, g.anchorY)}`;

  /* Home the other way round, so the circuit closes instead of retracing. */
  const rise = cy - g.anchorY;
  const home =
    ` C ${p(fx(0.4), g.anchorY + rise * 0.32)},` +
    ` ${p(fx(0.42), g.anchorY + rise * 0.74)},` +
    ` ${p(cx, cy)}`;

  return { arc, mid: arc + descent, full: arc + descent + home };
}

/* height / width of the mark, used to centre it on the flight path */
const RATIO = 124 / 260;
/* At rest the mark is cocked, not level: level reads as a chevron, and a
   chevron between two portraits reads as a scroll cue. Turned over and
   cocked, the same glyph reads as a boomerang at rest. */
const REST_ANGLE = 152;
/* It comes to rest just above the rule, not on it: centred on the line the
   mark reads as a kink in the hairline rather than as something delivered. */
const ABOVE_RULE = 32;

/* Two moves and one deliberate pause. The throw and the delivery are a single
   tween so the turn between them has no seam. Its two halves are paced by
   `times` rather than by the easing curve, because the curve alone could not
   hold the throw back without also dragging out the landing: the throw gets
   the first 37% of the clock for 40% of the path, the come-in gets the rest,
   which is where it slows. The two easings meet at a matched speed, so the
   handover has no dip in it. It then sits on the text long enough to pass the
   reading over, and goes home. */
const DELIVER_S = 1.69;
const DELIVER_TIMES = [0, 0.367, 1];
const THROW_EASE: [number, number, number, number] = [0.35, 0, 0.7, 0.79];
const LAND_EASE: [number, number, number, number] = [0.25, 0.36, 0.7, 1];
const HOLD_MS = 1000;
const HOME_S = 1.4;
/* An interrupted circuit is called back to the hand at this rate before the
   next throw, scaled by how much of the path is left to cover. */
const RECALL_S = 0.42;
const FRAME_S = 0.3;
/* Where the top of the portraits is set before the throw. The page falls by
   exactly the depth of the delivery, so this height is also what decides
   where the mark ends up: too high and the homecoming finishes behind the
   fixed header. */
const FRAME_TOP = 0.22;
/* The biography is set while the mark is still climbing, so the layout under
   it is final before the page starts moving. */
const REVEAL_AT = 0.7;

const COLS = "grid grid-cols-[1fr_auto_1fr] gap-3 sm:gap-6 md:gap-10";
const LANE = "w-9 sm:w-16 md:w-24";
const BAND = "mx-auto w-full max-w-[46rem]";

/** Anything a run can wait on and also abandon. Motion's playback controls
    carry a `then` of their own shape, so this is structural rather than a
    plain PromiseLike. */
type Cancellable = { stop: () => void; then: (onDone: () => void) => unknown };

/** A pause that can be cut short the same way an animation can. */
function hold(ms: number) {
  let id = 0;
  let done = () => {};
  const p = new Promise<void>((resolve) => {
    done = resolve;
    id = window.setTimeout(resolve, ms);
  });
  return Object.assign(p, {
    stop: () => {
      window.clearTimeout(id);
      done();
    },
  });
}

/** Piecewise linear read of a keyframe pair. */
function at(u: number, stops: number[], out: number[]) {
  if (u <= stops[0]) return out[0];
  for (let i = 1; i < stops.length; i += 1) {
    if (u <= stops[i]) {
      const k = (u - stops[i - 1]) / (stops[i] - stops[i - 1]);
      return out[i - 1] + (out[i] - out[i - 1]) * k;
    }
  }
  return out[out.length - 1];
}

/** Scripted scroll. `instant` matters: the page sets scroll-behavior: smooth,
    which would otherwise fight a per-frame write. */
function scrollTo(target: number, duration: number) {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const to = Math.max(0, Math.min(max, target));
  const from = window.scrollY;
  if (Math.abs(to - from) < 24) return null;
  return animate(from, to, {
    duration,
    ease: [0.33, 0, 0.15, 1],
    onUpdate: (v) => window.scrollTo({ top: v, behavior: "instant" }),
  });
}

export function Founders() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const bandRef = useRef<HTMLDivElement>(null);
  const bioRef = useRef<HTMLDivElement>(null);

  const fullR = useRef<SVGPathElement>(null);
  const fullL = useRef<SVGPathElement>(null);
  const arcR = useRef<SVGPathElement>(null);
  const midR = useRef<SVGPathElement>(null);

  const lens = useRef({ l: 0, r: 0 });
  /* where each act hands over to the next, as fractions of path length */
  const splits = useRef({ a: 0.4, b: 0.72 });
  const dirRef = useRef<1 | -1>(1);
  /** Tears down the run in flight, if there is one. */
  const cancel = useRef<(() => void) | null>(null);

  const [geo, setGeo] = useState<Geo>(ZERO);
  const [dir, setDir] = useState<1 | -1 | 0>(0);
  const [active, setActive] = useState<Founder["id"] | null>(null);
  const [armed, setArmed] = useState<Founder["id"] | null>(null);

  const reduce = useReducedMotion();
  const t = useMotionValue(0);

  /* Measured, so the trajectory is drawn in real pixels at any width. */
  const measure = useCallback(() => {
    const wrap = wrapRef.current;
    const band = bandRef.current;
    const bio = bioRef.current;
    if (!wrap || !band || !bio) return;
    const w = wrap.getBoundingClientRect();
    const b = band.getBoundingClientRect();
    const o = bio.getBoundingClientRect();
    const next: Geo = {
      w: w.width,
      bandTop: b.top - w.top,
      bandLeft: b.left - w.left,
      bandW: b.width,
      bandH: b.height,
      anchorY: o.top - w.top - ABOVE_RULE,
    };
    setGeo((prev) =>
      (Object.keys(next) as (keyof Geo)[]).every((k) => Math.abs(prev[k] - next[k]) < 0.5)
        ? prev
        : next,
    );
  }, []);

  useEffect(() => {
    const wrap = wrapRef.current;
    const band = bandRef.current;
    if (!wrap || !band) return;
    const ro = new ResizeObserver(measure);
    ro.observe(wrap);
    ro.observe(band);
    return () => ro.disconnect();
  }, [measure]);

  const paths = useMemo(
    () =>
      geo.w
        ? { r: buildPaths(geo, 1), l: buildPaths(geo, -1) }
        : { r: { arc: "", mid: "", full: "" }, l: { arc: "", mid: "", full: "" } },
    [geo],
  );

  useEffect(() => {
    if (!geo.w) return;
    const r = fullR.current?.getTotalLength() ?? 0;
    const l = fullL.current?.getTotalLength() ?? 0;
    const a = arcR.current?.getTotalLength() ?? 0;
    const m = midR.current?.getTotalLength() ?? 0;
    lens.current = { r, l };
    /* Each act is appended to the last, so the length of a prefix is exactly
       the point on the full path where the next act begins. Both directions
       are mirror images, so one set of fractions serves both. */
    if (r > 0 && a > 0 && m > 0) splits.current = { a: a / r, b: m / r };
  }, [paths, geo.w]);

  useEffect(
    () => () => {
      cancel.current?.();
    },
    [],
  );

  const pointAt = useCallback(
    (v: number) => {
      const home = {
        x: geo.bandLeft + geo.bandW / 2,
        y: geo.bandTop + geo.bandH / 2,
      };
      const path = dirRef.current === -1 ? fullL.current : fullR.current;
      const len = dirRef.current === -1 ? lens.current.l : lens.current.r;
      if (!path || !len) return home;
      return path.getPointAtLength(Math.max(0, Math.min(1, v)) * len);
    },
    [geo],
  );

  const x = useTransform(t, (v) => pointAt(v).x);
  const y = useTransform(t, (v) => pointAt(v).y);

  /* Four whole turns over the circuit, spread by distance rather than by act,
     so the spin rate is tied to how fast the mark is actually travelling and
     never steps at an act boundary. It ends on the angle it left at, which is
     what makes the end of the path indistinguishable from the start. */
  const rotate = useTransform(t, [0, 1], [REST_ANGLE, REST_ANGLE + 1440]);

  /* Read as distance: small at the top of the throw, closing again as it
     comes down with the biography, full size back in the hand. Flattened
     either side of the turn so the far point is a curve and not a corner. */
  const scale = useTransform(t, (v) => {
    const { a, b } = splits.current;
    if (v <= a) return at(v / a, [0, 0.35, 0.85, 1], [1, 0.74, 0.61, 0.6]);
    if (v <= b) return at((v - a) / (b - a), [0, 0.15, 1], [0.6, 0.62, 0.92]);
    return at((v - b) / (1 - b), [0, 0.55, 1], [0.92, 1.1, 1]);
  });

  const trace = useTransform(t, [0, 0.04, 0.6, 0.9, 1], [0, 0.4, 0.32, 0.2, 0]);

  const throwTo = useCallback(
    async (f: Founder, side: 1 | -1) => {
      setArmed(f.id);

      if (reduce || !geo.w) {
        setActive(f.id);
        setArmed(null);
        return;
      }

      /* A click is never refused, whatever is in the air. The run in progress
         is torn down here, and every step of it is a race against `gone`, so
         a superseded run unwinds on the same frame instead of finishing into
         a state that is no longer its own. */
      cancel.current?.();

      let dead = false;
      const parts: { stop: () => void }[] = [];
      let bury = () => {};
      const gone = new Promise<"gone">((res) => {
        bury = () => res("gone");
      });
      cancel.current = () => {
        dead = true;
        parts.forEach((p) => p.stop());
        bury();
      };

      /** Runs one step. Returns false once this run has been superseded. */
      const step = async (c: Cancellable | null) => {
        if (!c) return !dead;
        parts.push(c);
        const done = new Promise<"done">((res) => {
          c.then(() => res("done"));
        });
        return (await Promise.race([done, gone])) === "done" && !dead;
      };

      try {
        /* Whatever is in flight is called back to the hand before the next
           throw, by whichever end of the circuit is nearer: the way it came
           if it has not turned yet, onward the way it was going if it has.
           Both ends are the resting point, so either is a homecoming. */
        const held = t.get();
        if (held > 0.002 && held < 0.998) {
          const { a } = splits.current;
          const back = held < a;
          const left = back ? held / a : (1 - held) / (1 - a);
          if (!(await step(
            animate(t, back ? 0 : 1, {
              duration: Math.max(0.2, RECALL_S * left),
              ease: [0.35, 0, 0.25, 1],
            }),
          ))) {
            return;
          }
        }

        /* Set the pair at a known height before letting go, so the top of the
           throw is never off screen and the landing always leaves room for
           the biography underneath. It runs alongside the throw rather than
           before it: waiting for it would be the first of the stops. */
        const band = bandRef.current?.getBoundingClientRect();
        let framing: { stop: () => void } | null = null;
        if (band) {
          const want = window.scrollY + band.top - window.innerHeight * FRAME_TOP;
          if (Math.abs(want - window.scrollY) > 60) {
            framing = scrollTo(want, FRAME_S);
            if (framing) parts.push(framing);
          }
        }

        /* The end of the circuit is the start of it, so this is a parameter
           reset the eye never sees. */
        t.set(0);
        dirRef.current = side;
        setDir(side);

        const { a, b } = splits.current;
        let base: number | null = null;
        let from = 0;
        let shown = false;

        const flew = await step(
          animate(t, [0, a, b], {
            duration: DELIVER_S,
            times: DELIVER_TIMES,
            ease: [THROW_EASE, LAND_EASE],
            onUpdate: (v) => {
              if (!shown && v >= a * REVEAL_AT) {
                shown = true;
                setActive(f.id);
              }
              /* The page is not animated on its own clock. Between the turn
                 and the landing it is moved by exactly as much as the mark
                 has fallen, on the same frame, so the two cannot drift and
                 the descent reads as the mark dragging the page after it. */
              if (v <= a || v > b) return;
              if (base === null) {
                framing?.stop();
                base = window.scrollY;
                from = pointAt(a).y;
              }
              const max = document.documentElement.scrollHeight - window.innerHeight;
              window.scrollTo({
                top: Math.max(0, Math.min(max, base + pointAt(v).y - from)),
                behavior: "instant",
              });
            },
          }),
        );
        if (!flew) return;

        /* A beat on the text, so the arrival lands before anything moves
           again and the reader's eye is handed to the copy. */
        if (!(await step(hold(HOLD_MS)))) return;
        await step(animate(t, 1, { duration: HOME_S, ease: [0.4, 0, 0.3, 1] }));
      } finally {
        if (!dead) {
          cancel.current = null;
          setArmed(null);
        }
      }
    },
    [geo.w, reduce, t],
  );

  const open = active ? FOUNDERS.find((f) => f.id === active) : undefined;
  /* measured against the band, not the viewport */
  const size = geo.bandW < 360 ? 32 : geo.bandW < 560 ? 46 : 78;

  return (
    <section id="fundadores" className="relative z-10 bg-ink-1/40 pb-24 md:pb-36">
      <div className="shell">
        <Reveal>
          <SectionLabel index="07">quem somos</SectionLabel>
        </Reveal>

        <div className="mt-7 max-w-[46rem]">
          <Reveal delay={0.06}>
            <h2 className="display h2 max-w-[15ch] text-chalk">
              quem faz é quem <span className="em-thin">assina.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="read mt-6 max-w-[52ch] text-ash">
              Não há gestor de conta a traduzir. São estas as duas pessoas que desenham,
              constroem e atendem o telefone.
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.16}>
          <div ref={wrapRef} className="relative mx-auto mt-16 w-full max-w-[52rem] md:mt-24">
            {/* --- the pair, and the axis between them ----------------- */}
            <div ref={bandRef} className={`${BAND} relative`}>
              <div className={COLS}>
                {FOUNDERS.map((f, i) => {
                  const isOpen = active === f.id;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => throwTo(f, i === 0 ? -1 : 1)}
                      aria-expanded={isOpen}
                      aria-controls="founder-bio"
                      aria-label={`ler o percurso de ${f.name}`}
                      className={`group relative block w-full cursor-pointer overflow-hidden bg-ink-2 transition-transform duration-300 ease-out active:scale-[0.985] ${
                        i === 0 ? "col-start-1" : "col-start-3"
                      }`}
                    >
                      <span className="relative block aspect-[4/5] w-full">
                        <Image
                          src={f.photo}
                          alt={f.alt}
                          fill
                          sizes="(max-width: 768px) 40vw, 320px"
                          quality={90}
                          style={{ objectPosition: f.focus }}
                          className={`object-cover transition-[opacity,filter] duration-700 ease-out ${f.tone} ${f.crop ?? ""} ${
                            isOpen || armed === f.id
                              ? "opacity-100"
                              : active
                                ? "opacity-45 group-hover:opacity-80"
                                : "opacity-70 group-hover:opacity-100"
                          }`}
                        />
                      </span>
                      {/* keeps the lower half of the frame reading as ground */}
                      <span
                        aria-hidden
                        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/55 via-transparent to-transparent"
                      />
                      <span
                        aria-hidden
                        className={`pointer-events-none absolute inset-0 border transition-colors duration-500 ${
                          isOpen
                            ? "border-chalk/35"
                            : "border-transparent group-hover:border-hair-strong"
                        }`}
                      />
                    </button>
                  );
                })}
                <span aria-hidden className={`${LANE} col-start-2 row-start-1`} />
              </div>
            </div>

            {/* Names sit outside the measured band so the mark rests on the
                true centre of the two portraits. */}
            <div className={`${BAND} ${COLS} mt-5`}>
              <Caption founder={FOUNDERS[0]} align="left" open={active === FOUNDERS[0].id} />
              <span aria-hidden className={`${LANE} col-start-2 row-start-1`} />
              <Caption founder={FOUNDERS[1]} align="right" open={active === FOUNDERS[1].id} />
            </div>

            {/* --- what the throw comes back with ---------------------- */}
            <div
              ref={bioRef}
              id="founder-bio"
              aria-live="polite"
              className="mt-14 border-t border-hair pt-12 md:mt-20"
            >
              <div className="min-h-[14rem] sm:min-h-[16rem] md:min-h-[19rem]">
                <AnimatePresence mode="wait" initial={false}>
                  {open ? (
                    <motion.div
                      key={open.id}
                      initial={reduce ? false : { opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={reduce ? undefined : { opacity: 0, y: -10 }}
                      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                      className="grid gap-10 md:grid-cols-[1.05fr_1fr] md:gap-16"
                    >
                      {/* left: the voice. right: the record. */}
                      <div className="space-y-10">
                        <p className="read text-[1.0625rem] text-chalk md:text-[1.125rem]">
                          {open.lead}
                        </p>
                        <div>
                          <p className="mono text-chalk">{open.drive.label}</p>
                          <p className="read mt-3 text-ash">{open.drive.copy}</p>
                        </div>
                      </div>
                      <dl className="space-y-7">
                        {open.record.map((fact) => (
                          <div key={fact.label}>
                            <dt className="mono text-chalk">{fact.label}</dt>
                            <dd className="read mt-3 text-ash">{fact.copy}</dd>
                          </div>
                        ))}
                      </dl>
                    </motion.div>
                  ) : (
                    <motion.p
                      key="idle"
                      initial={reduce ? false : { opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={reduce ? undefined : { opacity: 0 }}
                      transition={{ duration: 0.4 }}
                      className="read max-w-[46ch] text-ash"
                    >
                      Dois percursos diferentes, o mesmo método. Escolha um retrato para ler
                      o de cada um.
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* --- flight overlay -------------------------------------- */}
            <div
              className="pointer-events-none absolute inset-0 z-10 overflow-visible"
              aria-hidden="true"
            >
              {geo.w > 0 && (
                <>
                  <svg className="absolute inset-0 h-full w-full overflow-visible">
                    {/* measured only, never painted */}
                    <path ref={fullR} d={paths.r.full} fill="none" stroke="none" />
                    <path ref={fullL} d={paths.l.full} fill="none" stroke="none" />
                    <path ref={arcR} d={paths.r.arc} fill="none" stroke="none" />
                    <path ref={midR} d={paths.r.mid} fill="none" stroke="none" />
                    {dir !== 0 && !reduce && (
                      <motion.path
                        d={dir === 1 ? paths.r.full : paths.l.full}
                        fill="none"
                        stroke="var(--color-chalk)"
                        strokeWidth={1}
                        strokeLinecap="round"
                        style={{ pathLength: t, opacity: trace }}
                      />
                    )}
                  </svg>

                  <motion.div
                    className="absolute top-0 left-0 will-change-transform"
                    style={{ x, y }}
                  >
                    <motion.div
                      style={{
                        rotate,
                        scale,
                        marginLeft: -size / 2,
                        marginTop: (-size * RATIO) / 2,
                      }}
                      className="text-chalk drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)]"
                    >
                      <BoomerangMark width={size} />
                    </motion.div>
                  </motion.div>
                </>
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Caption({
  founder,
  align,
  open,
}: {
  founder: Founder;
  align: "left" | "right";
  open: boolean;
}) {
  /* Narrow columns cannot hold the mirrored setting without going ragged,
     so the pair is centred until there is room to swing it outward. */
  return (
    <div
      className={
        align === "right"
          ? "col-start-3 text-center md:text-right"
          : "col-start-1 text-center md:text-left"
      }
    >
      <p
        className={`display text-[0.9375rem] leading-tight transition-colors duration-500 sm:text-xl md:text-2xl ${
          open ? "text-chalk" : "text-chalk/70"
        }`}
      >
        {founder.name}
      </p>
      <p className="mono mt-2.5 text-[0.5625rem] leading-[1.5] tracking-[0.14em] text-ash-2 md:text-[0.6875rem] md:tracking-[0.22em]">
        {founder.role}
      </p>
    </div>
  );
}
