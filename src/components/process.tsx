"use client";

import { memo, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { flushSync } from "react-dom";
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import type { Copy, Lang } from "@/lib/i18n";
import { servicePath } from "@/lib/services";
import { useHref, useLang, useT } from "@/lib/use-lang";
import { SlideIn } from "./enter";
import { PassLink } from "./floating-nav";
import { useInkAlign } from "./ink-align";
import { useOriginFade, useProposal } from "./proposal-flow";
import { jumpTo } from "./smooth-scroll";
import { Glass } from "./cta-glass";

/* ==================================================================
   How we work

   The studio's whole process, step by step (the user's brief,
   2026-10-07, rewritten 2026-10-12): steps in four phases, told as
   "you" and "we". Each step keeps the shape the stages had: its name
   on the black marker, a principle in the title face, what happens,
   and who does it in the mono small print. Prices are not here: they
   change by country and the estimate gives them right (user's pick).
   What the studio has not settled yet (the SEO list, the delay before
   launch, the rules for later changes) is left out until it is.

   The steps run sideways (the user's ask, 2026-10-06; this section
   once ran down the about page). The section holds still on the screen
   while it is read, and scrolling down slides the row from right to
   left instead of moving the page; once the last step is in, the page
   carries on. A black rail runs over the row and fills from the left
   as it slides, with a stop at each step that is filled in once it has
   been reached: the order is shown that way, rather than by numbers on
   the headings. Each step stands in a column ruled off from the next
   by a hairline, the way the index is ruled.

   Each phase is headed over its own steps, and its heading holds at the
   left edge while its steps slide by under it, until the next phase
   pushes it off (its name alone: the user dropped the lines under it): wherever the row has got to, the phase it is in is in
   view. The services done only on request are left out of the row until
   the visitor chooses them in the keys over it, and then say so on their
   marker. Calls to action stand where they are asked for by the step: the
   free proposal at the estimate and at the end, a service's own page
   where that service comes in.
   ================================================================== */

type Who = "You" | "Us" | "You and us";

const WHO: Record<Who, Copy> = {
  // In Portuguese the client is named, never addressed (user, 2026-10-18).
  You: { en: "You", pt: "Cliente" },
  Us: { en: "Us", pt: "Nevima" },
  "You and us": { en: "You and us", pt: "Cliente e Nevima" },
};

/** The services only done if the client asks for them. */
type Extra = "photo" | "identity" | "seo" | "geo";
const EXTRAS: { id: Extra; label: Copy }[] = [
  { id: "photo", label: { en: "Photo shoot", pt: "Sessão fotográfica" } },
  { id: "identity", label: { en: "Visual identity", pt: "Identidade visual" } },
  { id: "seo", label: { en: "SEO", pt: "SEO" } },
  { id: "geo", label: { en: "GEO", pt: "GEO" } },
];

type Cta = { proposal: true } | { href: string; label: string };

type Step = {
  id: string;
  name: string;
  principle: string;
  text: string;
  who: Who;
  /** Only if the client asks for it (the brief's "só se requisitado"):
      the extra service it belongs to. Shown only once that service has
      been chosen above the row. */
  extra?: Extra;
  /** Long words: the column is made wider rather than the words cut. */
  wide?: boolean;
  cta?: Cta[];
};

type Phase = {
  id: string;
  name: string;
  /** Kept for the record; the user had the phases headed by their names
      alone (2026-10-07), so neither this nor `takes` is shown. */
  intro: string;
  takes?: string;
  steps: Step[];
};

const explore = (slug: string, title: string): Cta => ({
  href: servicePath(slug),
  label: `Explore ${title}`,
});

/* ==================================================================
   The same steps in Portuguese, by id: each phase's name, and each
   step's name, principle, text and call to action. Everything else
   (order, who, extras, widths) is the English record's.
   ================================================================== */

const PT_PHASES: Record<string, string> = {
  proposal: "Proposta e contrato",
  production: "Produção",
  launch: "Revisão e lançamento",
  after: "Depois do lançamento",
};

const PT_STEPS: Record<string, Pick<Step, "name" | "principle" | "text"> & { cta?: string }> = {
  estimate: {
    name: "Estimativa de preço",
    principle: "Primeiro, apresentamos uma estimativa de preço.",
    text: "Fornecemos um formulário que, quando preenchido, apresenta uma estimativa para o projeto, com base nas respostas fornecidas.",
  },
  analysis: {
    name: "Definimos o preço exato",
    principle: "Enviamos o orçamento real.",
    text: "Analisamos as respostas e, em poucas horas, enviamos o preço exato do projeto, sempre com a respetiva justificação.",
  },
  contract: {
    name: "O contrato",
    principle: "Tudo acordado por escrito.",
    text: "Assim que recebemos resposta ao orçamento, enviamos o contrato, com todas as condições do trabalho definidas por escrito.",
  },
  materials: {
    name: "Os materiais",
    principle: "O prazo começa com a entrega dos materiais.",
    text: "Com o contrato, pedimos tudo aquilo de que precisamos: as fotografias já existentes do negócio, o logótipo e o símbolo, e o que mais o projeto exigir. O trabalho começa assim que tivermos tudo.",
  },
  photo: {
    name: "A sessão fotográfica",
    principle: "Imagens próprias.",
    text: "Combinamos uma data e, quando se aplique, uma taxa de deslocação. Consoante o andamento da sessão, indicamos uma data de entrega das fotografias e dos vídeos finais, e só começamos a construir o website quando estiverem prontos. Depois de pagos, ficam inteiramente do cliente, que os pode usar também noutros projetos.",
  },
  identity: {
    name: "Começamos pela identidade",
    principle: "Primeiro, a identidade.",
    text: "Acreditamos que um website só deve ser começado quando tudo aquilo de que precisa está pronto. Por isso, desenhamos primeiro o logótipo e o símbolo, e construímos o website a partir deles.",
    cta: "Saber mais sobre Identidade Visual",
  },
  trademark: {
    name: "O registo da marca",
    principle: "Uma marca registada.",
    text: "Com a identidade pronta, marcamos uma reunião, incluída no preço, para registar a marca em conjunto com o cliente.",
  },
  strategy: {
    name: "Uma chamada de acompanhamento (opcional)",
    principle: "Primeiro a estrutura, depois a conversa.",
    text: "Esta chamada não é obrigatória: só acontece se o cliente disser que a pretende. Nesse caso, quando parte do website estiver construída, marcamos uma chamada para mostrar a direção que está a tomar. Ajustamos o que for necessário com base no feedback, para que o resultado vá ao encontro do gosto do cliente e o website final dificilmente precise de alterações.",
  },
  finish: {
    name: "Conclusão do website e SEO básico",
    principle: "Concluído, e pronto para ser encontrado.",
    text: "Concluímos o website e aplicamos o SEO básico que vem com o nosso serviço de web design. Depois, marcamos uma chamada para apresentar o resultado final e receber a aprovação ou os pedidos de alteração. As primeiras quatro alterações pequenas, de até 15 minutos cada, não são cobradas; para algo maior, enviamos um orçamento antes de começar.",
  },
  hosting: {
    name: "Logística",
    principle: "Tratamos da logística.",
    text: "Tratamos de tudo o que envolve o website, desde as páginas legais (política de privacidade, política de cookies e as restantes, cujo conteúdo é da responsabilidade do negócio; nós colocamo-las no website) até ao alojamento e à ligação do domínio.",
  },
  seo: {
    name: "Aplicamos práticas de SEO",
    principle: "Primeiro aplicado, depois publicado.",
    text: "Para trazer tráfego desde o primeiro dia, aplicamos o nosso trabalho pontual de SEO antes de o website ficar online. Este trabalho tem mais efeito nos primeiros meses; para que o tráfego não caia depois disso, recomendamos o nosso serviço mensal.",
    cta: "Saber mais sobre SEO",
  },
  geo: {
    name: "Aplicamos práticas de GEO",
    principle: "Recomendado desde o primeiro dia.",
    text: "Também é feito antes do lançamento, para que as ferramentas de IA tenham mais probabilidade de recomendar o negócio desde o dia em que fica online.",
    cta: "Saber mais sobre GEO",
  },
  "launch-step": {
    name: "Lançamento",
    principle: "Com a aprovação final, fica online.",
    text: "Colocamos o website online, pronto para os clientes do negócio e para todos os que contam para ele.",
  },
  "later-changes": {
    name: "Apoio depois do lançamento",
    principle: "Sempre que for preciso.",
    text: "Continuamos totalmente disponíveis para o que for necessário.",
  },
};

/** The phases in a language. */
function phasesIn(lang: Lang): Phase[] {
  if (lang === "en") return PHASES;
  return PHASES.map((phase) => ({
    ...phase,
    name: PT_PHASES[phase.id] ?? phase.name,
    steps: phase.steps.map((step) => {
      const pt = PT_STEPS[step.id];
      if (!pt) return step;
      const { cta: label, ...words } = pt;
      return {
        ...step,
        ...words,
        cta: step.cta?.map((cta) => ("proposal" in cta || !label ? cta : { ...cta, label })),
      };
    }),
  }));
}

const PHASES: Phase[] = [
  {
    id: "proposal",
    name: "Proposal and contract",
    intro:
      "You get an estimate, we reply with the exact price, and we only start once the contract is signed and your materials are in.",
    steps: [
      {
        id: "estimate",
        name: "Get a price estimate",
        principle: "See the price first.",
        text: "Fill in a short form and it works out an estimate for your project from your answers.",
        who: "You",
        cta: [{ proposal: true }],
      },
      {
        id: "analysis",
        name: "We set the exact price",
        principle: "We send you the real quote.",
        text: "We read through your answers and come back with the exact price for your project within a few hours, always with the reasoning behind it.",
        who: "Us",
      },
      {
        id: "contract",
        name: "The contract",
        principle: "Everything agreed in writing.",
        text: "As soon as you reply to the quote, we send over the contract, with every term of the work set out in writing.",
        who: "You and us",
      },
      {
        id: "materials",
        name: "Your materials",
        principle: "The clock starts with you.",
        text: "With the contract, we ask for everything we need from you: photos you already have of your business, your logo and symbol, and anything else the project calls for. Work begins the moment we have everything.",
        who: "You",
      },
    ],
  },
  {
    id: "production",
    name: "Production",
    intro:
      "We start with all your materials in hand, and once part of the site is built we have a call if you would like one, to correct course early rather than at the end.",
    takes:
      "Varies by project, from 4 working days for a one-page site, counted from the day all your materials are in.",
    steps: [
      {
        id: "photo",
        name: "The photo shoot",
        extra: "photo",
        principle: "Images of your own.",
        text: "We agree a date with you, plus a travel fee where one applies. Depending on how the shoot goes, we give you a delivery date for the final photos and videos, and only start building your website once they are ready. Once paid for, they are entirely yours, free to use in other projects too.",
        who: "Us",
        wide: true,
      },
      {
        id: "identity",
        name: "We start with the identity",
        extra: "identity",
        principle: "Identity first.",
        text: "We believe a website should only be started once everything it needs is ready. So we design your logo and symbol first, and build with them in hand.",
        who: "Us",
        cta: [explore("visual-identity", "Visual Identity")],
      },
      {
        id: "trademark",
        name: "Registering your trademark",
        extra: "identity",
        principle: "Your brand, registered.",
        text: "With your identity ready, we book a meeting, included in the price, to register your trademark together.",
        who: "You and us",
      },
      {
        id: "strategy",
        name: "A call for your feedback (optional)",
        principle: "Structure first, then we talk.",
        text: "This call is not mandatory: it only happens if you tell us you would like it. If so, once part of your website is built, we book a call to show you where it is heading. Whatever your feedback calls for, we adjust, so the result fits your taste and the finished website is far less likely to need changes.",
        who: "You and us",
        wide: true,
      },
      {
        id: "finish",
        name: "Finishing the website and basic SEO",
        principle: "Finished, and ready to be found.",
        text: "We finish the website and apply the basic SEO that comes with our web design service. Then we arrange a call to walk you through the final result, where you either approve it or ask for changes. Your first four small changes, of up to 15 minutes each, are free; for anything bigger, you get a quote before we start.",
        // The client now sees the result and asks for changes here.
        who: "You and us",
        wide: true,
      },
      {
        id: "hosting",
        name: "Logistics",
        principle: "We handle the logistics.",
        text: "We take care of everything around the website, from the legal pages (privacy policy, cookie policy and the rest, whose content is your business's responsibility; we put them on the website) to hosting it and connecting your domain.",
        who: "Us",
      },
    ],
  },
  {
    id: "launch",
    name: "Review and launch",
    intro: "SEO and GEO, if you asked for them, are applied before your site goes live.",
    steps: [
      {
        id: "seo",
        name: "We apply SEO practices",
        extra: "seo",
        principle: "Applied, then published.",
        text: "To bring in traffic from day one, we apply our one-off SEO work before your website goes live. It carries you through the first months; to keep traffic from slipping after that, we recommend our monthly service.",
        who: "Us",
        wide: true,
        cta: [explore("seo", "SEO")],
      },
      {
        id: "geo",
        name: "We apply GEO practices",
        extra: "geo",
        principle: "Recommended from day one.",
        text: "This is also done before launch, so AI tools are more likely to recommend your business from the day it goes online.",
        who: "Us",
        cta: [explore("geo", "GEO")],
      },
      {
        id: "launch-step",
        name: "Launch",
        principle: "Your say, then it goes live.",
        text: "We put your website online, ready for your clients and everyone else who matters to your business.",
        who: "Us",
      },
    ],
  },
  {
    id: "after",
    name: "After launch",
    intro: "With your site live, we stay on hand for whatever you need.",
    steps: [
      {
        id: "later-changes",
        name: "Still here after launch",
        principle: "Here when you need us.",
        text: "Whatever you need, we stay fully on hand.",
        who: "You",
      },
    ],
  },
];


/** Scrolled pixels per pixel slid. It was 1.6 (the user found the row
    too quick at 1); the user then found the whole section too long to
    scroll through and asked for it 1.5 times faster, so 1.6 / 1.5, and
    then 1.2 times faster again, and 1.5 times faster after that. */
const SLOW = 1.6 / 1.5 / 1.2 / 1.5;

/* Measured before the first paint in the browser; the server has no
   layout to measure. */
const useIsomorphicLayout = typeof window === "undefined" ? useEffect : useLayoutEffect;

/** A phone, upright or on its side, or a small tablet: the section is set
    as it is on a computer, but the row is not slid by the page's scroll:
    a sideways swipe takes the visitor along the process, and the page's
    own scroll carries on down past it (user, 2026-10-19: on small screens
    the slide was too long a scroll to sit through on the way down;
    2026-10-20, after a key to open it had been tried: no key, sideways is
    the process, down is the page). */
const COMPACT = "(max-width: 1023px), (max-height: 500px)";
/** Too short a screen for the held screen to show the heading and the row
    together (a phone on its side, the smallest upright phones, a netbook):
    the row is swiped sideways instead of slid by the scroll, as it is with
    reduced motion. From 600px down it is the `short` variant's height
    (globals.css); an upright phone needs 660px for the held screen. */
const SHORT = "(max-height: 600px), (max-width: 767px) and (max-height: 660px)";
/** Whether a media query matches, read before the first paint in the
    browser (false on the server, where nothing is shown yet: the section
    is far under the opening's curtain). */
function useMedia(query: string) {
  const [match, setMatch] = useState(false);
  useIsomorphicLayout(() => {
    const list = window.matchMedia(query);
    const read = () => setMatch(list.matches);
    read();
    list.addEventListener("change", read);
    return () => list.removeEventListener("change", read);
  }, [query]);
  return match;
}

/** Where a phase stands in the row and how wide its heading is. */
type PhaseBox = { left: number; width: number; head: number };

type Layout = {
  /** How far the row has to travel to bring its last step in. */
  travel: number;
  /** The rail's height in the row: the top of the steps. */
  railTop: number;
  /** The rail's length: the row, less its padding on the right. */
  railWidth: number;
  /** Where each step's stop stands along the rail. */
  stops: number[];
  phases: PhaseBox[];
};

const NO_LAYOUT: Layout = { travel: 0, railTop: 0, railWidth: 1, stops: [], phases: [] };

let fold: (() => (() => void) | null) | null = null;

/** For a trip up the page past How we work (the foot's service links,
    user 2026-10-13): its pinned stretch, the length of the row's slide, is
    taken out while the page goes by, so it passes as one still screen at
    its end instead of running its slide backwards. Nothing on screen moves
    as it folds. Returns the way to unfold it, or null when there is
    nothing to fold (reduced motion, or it is not above the page yet). */
export function foldProcess() {
  return fold?.() ?? null;
}

let seek: ((id?: string) => boolean) | null = null;

/** Brings How we work on screen, the row slid so that the step named by
    `id` (a step's id, e.g. "strategy") stands in the middle of the screen,
    and has that step blink three times; with no id, the section's start.
    Asked for from other pages (the about page's FAQ links to
    /#process-strategy, see home.tsx). False while the section is not
    measured yet. */
export function showProcess(id?: string) {
  return seek?.(id) ?? false;
}

export function Process({ ready }: { ready: boolean }) {
  const reduce = useReducedMotion() ?? false;
  const section = useRef<HTMLElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const screen = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLOListElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  useInkAlign(titleRef, subRef);

  // On a phone, or on a screen too short to hold it, the row is swiped
  // rather than slid (see COMPACT, SHORT).
  const compact = useMedia(COMPACT);
  const short = useMedia(SHORT);
  /** The screen is a screen tall, held while it is read: everywhere but a
      phone or a screen too short for it. */
  const screenful = !short && !compact;
  /** ... and the row slid by the scroll across it (not with reduced
      motion, where it is scrolled sideways). */
  const pinned = !reduce && screenful;
  const pinnedNow = useRef(pinned);
  pinnedNow.current = pinned;

  // The extra services the visitor has chosen to see: their steps join the
  // row; until then the row is the process every project goes through.
  const [extras, setExtras] = useState<Extra[]>([]);
  const toggle = (id: Extra) =>
    setExtras((was) => (was.includes(id) ? was.filter((e) => e !== id) : [...was, id]));
  const t = useT();
  const lang = useLang();
  // The same objects from one render to the next, so a step or a phase
  // heading is only drawn again when it changes (see StepCard, PhaseHead).
  const phases = useMemo(
    () =>
      phasesIn(lang).map((phase) => ({
        ...phase,
        steps: phase.steps.filter((step) => !step.extra || extras.includes(step.extra)),
      })),
    [lang, extras],
  );
  const stepCount = phases.reduce((n, phase) => n + phase.steps.length, 0);

  const [layout, setLayout] = useState<Layout>(NO_LAYOUT);
  useIsomorphicLayout(() => {
    const measure = () => {
      const t = track.current;
      const v = viewport.current;
      const sc = screen.current;
      if (!t || !v || !sc) return;
      // The row starts after the viewport's left padding (the shell's
      // edge), so that much less of the viewport is there to show it.
      const lead = parseFloat(getComputedStyle(v).paddingLeft) || 0;
      const trail = parseFloat(getComputedStyle(t).paddingRight) || 0;
      const phases = [...t.querySelectorAll<HTMLElement>("[data-phase]")].map((el) => ({
        left: el.offsetLeft,
        width: el.offsetWidth,
        head: el.querySelector<HTMLElement>("[data-phase-head]")?.offsetWidth ?? 0,
      }));
      const steps = [...t.querySelectorAll<HTMLElement>("[data-step]")];
      const first = t.querySelector<HTMLElement>("[data-steps]");
      setLayout({
        travel: Math.max(0, Math.ceil(t.scrollWidth - (v.clientWidth - lead))),
        railTop: first?.offsetTop ?? 0,
        railWidth: Math.max(1, t.scrollWidth - trail),
        stops: steps.map((el) => (el.offsetParent as HTMLElement | null)?.offsetLeft ?? 0).map(
          (base, i) => base + steps[i]!.offsetLeft,
        ),
        phases,
      });
    };
    measure();
    const watch = new ResizeObserver(measure);
    if (track.current) watch.observe(track.current);
    if (viewport.current) watch.observe(viewport.current);
    if (screen.current) watch.observe(screen.current);
    document.fonts?.ready.then(measure);
    return () => watch.disconnect();
  }, []);

  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  // Where the row stands: the page's scroll, unless held (see foldProcess).
  const held = useMotionValue(-1);
  const progress = useTransform([held, scrollYProgress], ([h, p]: number[]) => (h! >= 0 ? h! : p!));
  const x = useTransform(progress, [0, 1], [0, -layout.travel]);

  /* Where the browser can tie an animation to the scroll itself (a view
     timeline on the section), the row, the rail's fill and the phase
     headings are slid by it, on the compositor, with the page's own
     scrolling: set from script, as below, they are a frame or more behind a
     finger whenever the phone is busy, and the row shudders against the
     page (user, 2026-10-19: How we work "trava muito no telemóvel"). The
     same lines, the same stops: only who moves them changes. The script
     still moves them while the row is held (see foldProcess) and where the
     browser has no view timelines. */
  const [folded, setFolded] = useState(false);
  const [heldOn, setHeldOn] = useState(false);
  useMotionValueEvent(held, "change", (h) => setHeldOn((was) => (was === h >= 0 ? was : h >= 0)));
  const [timelines, setTimelines] = useState(false);
  useEffect(() => setTimelines(typeof window !== "undefined" && "ViewTimeline" in window), []);
  const scrolled = timelines && pinned && !heldOn && !folded && layout.travel > 0;
  const rail = useRef<HTMLSpanElement>(null);
  // In the layout phase, so a fold (which commits at once, see foldProcess)
  // hands the row back to the script before the next frame is drawn.
  useIsomorphicLayout(() => {
    const el = section.current;
    const row = track.current;
    if (!scrolled || !el || !row) return;
    const ViewTimelineCtor = (window as unknown as { ViewTimeline: new (o: { subject: Element; axis?: string }) => AnimationTimeline }).ViewTimeline;
    const timeline = new ViewTimelineCtor({ subject: el, axis: "block" });
    // The section's whole held stretch: its top at the screen's top to its
    // foot at the screen's foot (useScroll's "start start" to "end end").
    const range = { timeline, rangeStart: "contain 0%", rangeEnd: "contain 100%", fill: "both", easing: "linear" } as KeyframeAnimationOptions;
    const travel = layout.travel;
    const runs: Animation[] = [
      row.animate([{ transform: "translateX(0px)" }, { transform: `translateX(${-travel}px)` }], range),
    ];
    if (rail.current) {
      runs.push(rail.current.animate([{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], range));
    }
    // Each heading held at the row's edge from where its phase reaches it
    // until its last step carries it off (PhaseHead's hold, as keyframes).
    row.querySelectorAll<HTMLElement>("[data-phase-head]").forEach((head, p) => {
      const box = layout.phases[p];
      if (!box) return;
      const room = Math.max(0, box.width - box.head);
      const at = (q: number) => Math.min(Math.max(travel * q - box.left, 0), room);
      const from = Math.min(Math.max(box.left / travel, 0), 1);
      const to = Math.min(Math.max((box.left + room) / travel, 0), 1);
      const frames: Keyframe[] = [{ offset: 0, transform: `translateX(${at(0)}px)` }];
      if (from > 0 && from < 1) frames.push({ offset: from, transform: `translateX(${at(from)}px)` });
      if (to > from && to < 1) frames.push({ offset: to, transform: `translateX(${at(to)}px)` });
      frames.push({ offset: 1, transform: `translateX(${at(1)}px)` });
      runs.push(head.animate(frames, range));
    });
    return () => runs.forEach((run) => run.cancel());
  }, [scrolled, layout]);

  // Folded for a trip up the page past it (see foldProcess).
  useEffect(() => {
    if (!pinned) return;
    fold = () => {
      const el = section.current;
      // Only once it has been gone through, so it stands at its end.
      if (!el || el.getBoundingClientRect().bottom > window.innerHeight + 1) return null;
      const before = el.offsetHeight;
      held.set(1);
      flushSync(() => setFolded(true));
      // What it gave up, taken off the scroll in the same frame, so
      // nothing on screen moves.
      jumpTo(window.scrollY - (before - el.offsetHeight));
      return () => {
        flushSync(() => setFolded(false));
        const top = el.getBoundingClientRect().top;
        if (top >= window.innerHeight) {
          held.set(-1);
          return;
        }
        // Still in sight at the foot of the screen (its top below the top
        // of the screen, so the page has it at its start): the row eases
        // back there, then follows the page again.
        void animate(held, 0, { duration: 0.8, ease: [0.22, 1, 0.36, 1] }).then(() =>
          held.set(-1),
        );
      };
    };
    return () => {
      fold = null;
    };
  }, [pinned, held]);

  // Found from elsewhere (see showProcess): the page is put where the
  // row's slide has the step in the middle of the screen.
  const layoutNow = useRef(layout);
  layoutNow.current = layout;
  useEffect(() => {
    seek = (id) => {
      const el = section.current;
      const t = track.current;
      const v = viewport.current;
      const at = layoutNow.current;
      if (!el || !t || !v || (id && at.stops.length === 0)) return false;
      const top = el.getBoundingClientRect().top + window.scrollY;
      let p = 0;
      const card = id ? document.getElementById(`step-${id}`)?.closest<HTMLElement>("[data-step]") : null;
      if (card && at.travel > 0) {
        const i = [...t.querySelectorAll<HTMLElement>("[data-step]")].indexOf(card);
        const lead = parseFloat(getComputedStyle(v).paddingLeft) || 0;
        const room = v.clientWidth - lead;
        p = Math.min(Math.max((at.stops[i]! - (room - card.offsetWidth) / 2) / at.travel, 0), 1);
      }
      if (pinnedNow.current) jumpTo(top + p * Math.max(0, el.offsetHeight - window.innerHeight));
      else {
        // Not held: the page to the section, and the row swiped to the step.
        jumpTo(top);
        v.scrollLeft = p * at.travel;
      }
      if (card) {
        card.removeAttribute("data-flash");
        // Read once so the blink starts again if it was already running.
        void card.offsetWidth;
        window.setTimeout(() => card.setAttribute("data-flash", ""), 350);
        window.setTimeout(() => card.removeAttribute("data-flash"), 350 + 2600);
      }
      return true;
    };
    return () => {
      seek = null;
    };
  }, []);

  // Which stops the rail's fill has reached.
  const [reached, setReached] = useState(1);
  useMotionValueEvent(progress, "change", (p) => {
    const tip = p * layout.railWidth + 1;
    const n = Math.max(1, layout.stops.filter((at) => at <= tip).length);
    setReached((was) => (was === n ? was : n));
  });

  let index = 0;

  return (
    <section
      ref={section}
      id="how-we-work"
      aria-labelledby="process-title"
      className="relative z-10 bg-paper"
      // The next section starts right at the foot of the pinned screen, so
      // its black comes up from the bottom of the screen the moment the pin
      // lets go (user, 2026-10-15), never while the row is still sliding.
      style={
        pinned
          ? { height: folded ? "var(--screen)" : `calc(var(--screen) + ${Math.round(layout.travel * SLOW)}px)` }
          : undefined
      }
    >
      {/* The heading and the row as one block, the row close under the
          heading, held in the middle of the screen below the bar while the
          row slides (user, 2026-10-15: hung from the top it sat too close
          under the bar and the whole section too high). */}
      <div
        ref={screen}
        className={
          screenful
            ? "prc-screen sticky top-0 flex h-(--screen) flex-col justify-center overflow-hidden pt-[clamp(5.5rem,11svh,6.5rem)] pb-[clamp(1.5rem,4svh,3rem)] low-phone:pt-[4.375rem] low-phone:pb-2.5"
            : // Shut, or on a screen too short to hold it: the section
              // simply as tall as what it holds.
              "flex flex-col pt-[clamp(5.5rem,11svh,6.5rem)] pb-(--section-gap)"
        }
      >
        <div className="shell">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
            <SlideIn ready={ready}>
              <h2
                ref={titleRef}
                id="process-title"
                className="display text-[clamp(2rem,4.2vw,4.25rem)] text-ink low-phone:text-[1.75rem]"
              >
                <span className="block font-light">{t("How we work.", "Como trabalhamos.")}</span>
                <span className="block font-medium">{t("The whole process, in detail.", "Todo o processo, em detalhe.")}</span>
              </h2>
            </SlideIn>
            <SlideIn ready={ready} from="right" delay={0.12} className="max-w-[19rem] shrink-0 max-md:hidden lg:text-right">
              <p ref={subRef} className="text-[0.9375rem] leading-[1.45] text-balance text-ash">
                {t(
                  "It all comes down to one idea: take out everything that doesn’t move your project forward, and keep you close to everything that does.",
                  "Tudo se resume a uma ideia: eliminar tudo o que não faz avançar o projeto e envolver o cliente em tudo o que o faz avançar.",
                )}
              </p>
            </SlideIn>
          </div>
        </div>

        {/* The extra services, to be chosen into the row. */}
        <div className="shell mt-[clamp(1rem,3svh,1.75rem)] low-phone:mt-3">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2.5 low-phone:gap-y-1.5">
            <p id="prc-extras" className="mono-label text-ink">
              {t(
                "Choose the services you want to see how we handle each one",
                "Escolher os serviços adicionais para ver como tratamos de cada um",
              )}
            </p>
            <div role="group" aria-labelledby="prc-extras" className="flex flex-wrap gap-1.5">
              {EXTRAS.map((extra) => (
                <button
                  key={extra.id}
                  type="button"
                  aria-pressed={extras.includes(extra.id)}
                  onClick={() => toggle(extra.id)}
                  className="prop-chip prc-chip mono-label"
                >
                  <span aria-hidden="true" className="prc-chip-mark">
                    {extras.includes(extra.id) ? "\u2212" : "+"}
                  </span>
                  {t(extra.label)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* The row, set against the shell's left edge and free to run past
            the right edge of the screen; it is slid, not scrolled. With
            reduced motion, or on a screen too short to hold it, it is
            simply scrolled sideways, as it is on a phone (see COMPACT). */}
        <div
          ref={viewport}
          id="prc-row"
          className={`prc-viewport mt-[clamp(1rem,3.5svh,2.5rem)] low-phone:mt-3 ${pinned ? "" : "overflow-x-auto"}`}
        >
          <motion.ol
            ref={track}
            className="prc-track"
            style={
              {
                x: pinned && !scrolled ? x : 0,
                "--prc-rail-top": `${layout.railTop}px`,
                "--prc-rail-width": `${layout.railWidth}px`,
              } as never
            }
          >
            {/* The rail over the steps: grey for the way still to go, black
                for the way come. */}
            <span aria-hidden="true" className="prc-rail" />
            <motion.span
              ref={rail}
              aria-hidden="true"
              className="prc-rail prc-rail-fill"
              style={{ scaleX: pinned && !scrolled ? progress : 1 }}
            />
            {phases.map((phase, p) => (
              <li key={phase.id} data-phase aria-labelledby={`phase-${phase.id}`} className="prc-phase">
                <PhaseHead
                  phase={phase}
                  box={layout.phases[p]}
                  x={x}
                  reduce={!pinned || scrolled}
                />
                <ol data-steps className="prc-steps">
                  {phase.steps.map((step) => {
                    const i = index++;
                    return (
                      <StepCard
                        key={step.id}
                        step={step}
                        n={i}
                        count={stepCount}
                        on={!pinned || i < reached}
                      />
                    );
                  })}
                </ol>
              </li>
            ))}
            <li className="prc-end">
              <h3 className="display text-[clamp(1.5rem,2.1vw,2.125rem)] leading-[1.02] font-light text-ink">
                {t("It all starts with your estimate.", "Tudo começa com uma estimativa.")}
              </h3>
              <p className="mt-4 text-[clamp(0.9375rem,1vw,1rem)] leading-[1.5] text-justify hyphens-auto text-ash">
                {t(
                  "Tell us what you need and see a price range straight away. Your proposal is free.",
                  "Basta indicar o que é necessário para ver de imediato um intervalo de preço. A proposta é gratuita.",
                )}
              </p>
              <div className="mt-7">
                <ProposalCta />
              </div>
              {/* For development companies: the partners' form at the
                  foot of the page (user, 2026-10-18). */}
              <a href="#partner" className="prc-partner mt-5 inline-flex items-center gap-2 self-start">
                {t("Are you a development company? Partner with us", "Empresas de desenvolvimento: parcerias")}
                <span aria-hidden="true">&rarr;</span>
              </a>
            </li>
          </motion.ol>
        </div>
      </div>
    </section>
  );
}

/* A phase's heading. Held at the row's left edge while its steps slide by
   under it, and carried off by its own last step once that has gone past. */
/* Drawn again only when its own props change: the row's stops being
   reached re-render the section, and every heading and step with it. */
const PhaseHead = memo(function PhaseHead({
  phase,
  box,
  x,
  reduce,
}: {
  phase: Phase;
  box: PhaseBox | undefined;
  x: MotionValue<number>;
  reduce: boolean;
}) {
  const hold = useTransform(x, (v) => {
    if (!box || reduce) return 0;
    const room = Math.max(0, box.width - box.head);
    return Math.min(Math.max(-v - box.left, 0), room);
  });
  return (
    <motion.div data-phase-head className="prc-head" style={{ x: hold }}>
      <h3
        id={`phase-${phase.id}`}
        className="display text-[clamp(1.25rem,1.5vw,1.5rem)] leading-[1.05] font-medium text-ink"
      >
        {phase.name}
      </h3>
    </motion.div>
  );
});

const StepCard = memo(function StepCard({ step, n, count, on }: { step: Step; n: number; count: number; on: boolean }) {
  const t = useT();
  const href = useHref();
  return (
    <li
      data-step
      aria-labelledby={`step-${step.id}`}
      className={`prc-stage ${step.wide ? "prc-wide" : ""}`}
    >
      <span aria-hidden="true" data-on={on ? "" : undefined} className="abt-stop prc-stop" />
      {/* An extra service says so first, on the same marker. */}
      <p className="mono-label leading-[1.75]">
        <span className="idx-title prc-eyebrow">
          {step.extra && (
            <>
              <span className="prc-eyebrow-ask">{t("If you request", "Se pedido")}</span>
              <span aria-hidden="true" className="prc-eyebrow-bar">
                |
              </span>
            </>
          )}
          {step.name}
        </span>
        <span className="sr-only">{t(`, step ${n + 1} of ${count}`, `, passo ${n + 1} de ${count}`)}</span>
      </p>
      <h4
        id={`step-${step.id}`}
        className="display mt-3.5 text-[clamp(1.3125rem,1.9vw,1.875rem)] leading-[1.04] font-light text-ink md:mt-5 low-phone:mt-2.5"
      >
        {step.principle}
      </h4>
      <p className="mt-3 mb-5 text-[clamp(0.875rem,1vw,1rem)] leading-[1.5] text-justify hyphens-auto text-ash md:mt-4 md:mb-6 low-phone:mt-2 low-phone:mb-3.5">
        {step.text}
      </p>
      {step.cta && (
        <div className="mt-auto mb-5 flex flex-wrap gap-x-7 gap-y-5 pl-1 md:mb-6 low-phone:mb-3.5">
          {step.cta.map((cta) =>
            "proposal" in cta ? (
              <ProposalCta key="proposal" />
            ) : (
              <PassLink
                key={cta.href}
                href={href(cta.href)}
                label={<Label>{cta.label}</Label>}
                className="cta-drop inline-flex text-[0.875rem] leading-none"
              />
            ),
          )}
        </div>
      )}
      <dl className={`${step.cta ? "" : "mt-auto"} grid grid-cols-2 gap-x-4 border-t border-ink/15 pt-3 low-phone:pt-2`}>
        <div>
          <dt className="mono-label text-ash-2">{t("Who", "Quem")}</dt>
          <dd className="mono-label mt-1 text-ink">{t(WHO[step.who])}</dd>
        </div>
      </dl>
    </li>
  );
});

function Label({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <span aria-hidden="true" className="ml-2 inline-block">
        &rarr;
      </span>
    </>
  );
}

/* "Get your free proposal": the same form the index opens, grown here out
   of this button. The button keeps its place, unseen, while the form is
   out, and the form comes back to it on closing. */
function ProposalCta() {
  const proposal = useProposal();
  const t = useT();
  const button = useRef<HTMLButtonElement>(null);
  const [launched, setLaunched] = useState(false);
  const present = proposal?.present ?? false;
  useEffect(() => {
    if (!present) setLaunched(false);
  }, [present]);
  useOriginFade(button, proposal?.progress, launched && present);
  if (!proposal) return null;
  return (
    <button
      ref={button}
      type="button"
      aria-haspopup="dialog"
      aria-expanded={launched && proposal.open}
      onClick={() => {
        if (!button.current) return;
        setLaunched(true);
        proposal.show(button.current, button.current, false);
      }}
      className="cta-drop relative isolate inline-flex items-center justify-center text-[0.875rem] leading-none whitespace-nowrap"
          >
      <Glass />
      <span className="btn-neu-face">
        <Label>{t("Get your free proposal", "Pedir proposta gratuita")}</Label>
      </span>
    </button>
  );
}
