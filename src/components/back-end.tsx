"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { SlideIn } from "./enter";
import { ToneRoom } from "./tone-veil";
import { ProposalAsk } from "./about-faq";
import { useInView, type T } from "./sbs-shared";
import { HoursBars, SavedHours, WeekDonut } from "./back-end-charts";
import { DepthSystem, SPEED } from "./back-end-depth";
import { DragRun, GainStory, GlowTrail, PriceLine, SceneClient, SceneDay, SceneKept } from "./back-end-motion";
import { useT } from "@/lib/use-lang";

/* ==================================================================
   Back-end features

   The service's own page. Reshaped on 2026-11-18 on the user's notes,
   section by section:

   - the header sits on the warm light grey (#f4f4f2) instead of the
     black, with the title at the top of it and, beside the words, a
     rectangular card where one request walks through the back end -
     the side-by-side page's personalization card, in grey;
   - the opening that followed it is gone;
   - "Why should small businesses invest in back end solutions?" is
     white, led by "Busywork doesn't pay the bills", and carries the
     hours of a week in one grey card. The day told twice and the two
     lines of growth left with it: they said the same thing;
   - "Our three main back end solutions" is white, three cards tied to
     their drawings by a thread that draws itself (the leader lines of
     the photo shoot's map), and ends on a grey block for anything the
     three do not cover;
   - the month in three numbers is gone;
   - what a company gains is now nine rows that open, with the titles
     always in view;
   - "How it is built" left the page and is kept whole in
     back-end-built.tsx (it is still the best-looking thing we made
     for it; where it could go is written at the top of that file);
   - a new section says how the price works, before the page ends on
     "Let's work together".

   Every drawing is in back-end-charts.tsx and every number it draws is
   in src/lib/back-end-figures.ts.
   ================================================================== */

/* ---- the header -------------------------------------------------- */

function Head({ t }: { t: T }) {
  return (
    <section data-tone="dark" className="relative isolate text-paper">
      {/* Black, as it was and as the other service headers are (user,
          2026-11-18: the grey was only ever meant for the drawings).
          The title still sits at the top of it. */}
      <header className="shell ps-head be-head" data-tone-body>
        <div className="be-head-top">
          <div className="be-head-words">
            <SlideIn ready>
              <h1 className="display be-head-title">
                {t("Back-end Features", "Funcionalidades de Back End")}
              </h1>
              <p className="mono-label text-paper/55 be-head-kicker">{t("Additional service", "Serviço adicional")}</p>
            </SlideIn>
            <SlideIn ready distance={0} delay={0.08}>
              <p className="ps-head-say be-head-say">
                <span className="font-light sm:block">{t("Even the smallest business", "Até o negócio mais pequeno")}</span>{" "}
                <span className="font-medium sm:block">{t("gains from this.", "ganha com isto.")}</span>
              </p>
            </SlideIn>
          </div>
        </div>
        {/* Under the title now, the whole width (user, 2026-11-19), and
            in depth: the three facts that stood here are what it shows,
            so they left. */}
        <SlideIn ready distance={0} delay={0.12}>
          <DepthSystem t={t} />
        </SlideIn>
      </header>
    </section>
  );
}

/* ---- why a small business invests in a back end ------------------ */

/** The one word the sentence turns on: a black block draws itself
    behind it and the word goes white inside it. */
function Lit({ word, run }: { word: string; run: boolean }) {
  return (
    <span className="be-lit" data-on={run || undefined}>
      <span className="be-lit-block" aria-hidden="true" />
      <span className="be-lit-word">{word}</span>
    </span>
  );
}

function Why({ t }: { t: T }) {
  const reduce = useReducedMotion() ?? false;
  const [ref, inView] = useInView<HTMLParagraphElement>(0.6);
  const [lit, setLit] = useState(false);
  useEffect(() => {
    if (inView) setLit(true);
  }, [inView]);

  return (
    // White now, the three cards black on it (user, 2026-11-19).
    <section aria-labelledby="be-why-title" data-tone="light" className="relative be-why-light">
      <div className="shell ps-sec" data-tone-body>
        <SlideIn ready>
          <p className="mono-label text-ash-2">
            {t(
              "Why should small businesses invest in back end solutions?",
              "Porque deve um negócio pequeno investir em soluções de back end?",
            )}
          </p>
          <h2 id="be-why-title" className="display be-why-title">
            {t("Busywork doesn’t pay the bills", "O trabalho de secretaria não paga as contas")}
          </h2>
        </SlideIn>

        <SlideIn ready distance={0} delay={0.08}>
          <p ref={ref} className="be-why-say">
            {t("Yet, it takes ", "Ainda assim, leva ")}
            <Lit word={t("hours", "horas")} run={lit || reduce} />
            {t(
              " that could be invested in making the business grow",
              " que podiam ser investidas em fazer o negócio crescer",
            )}
          </p>
        </SlideIn>

        {/* The week in three cards, set off as the user's sketch has
            them (2026-11-19), with a light that goes from one to the
            next as the page is scrolled. */}
        <GlowTrail
          cards={[
            <HoursBars key="bars" t={t} dark />,
            <WeekDonut key="ring" t={t} dark />,
            <SavedHours key="saved" t={t} dark />,
          ]}
        />
      </div>
    </section>
  );
}

/* ---- the three solutions ----------------------------------------- */

/** The drawing inside each card. They are the same three interfaces the
    page has always shown, drawn once and still: the card's thread is
    what moves. */
function Draw({ kind }: { kind: "base" | "when" | "mail" }) {
  if (kind === "base") {
    return (
      <span className="be-draw">
        <i className="be-draw-row be-draw-head" />
        <i className="be-draw-row" />
        <i className="be-draw-row" />
        <i className="be-draw-row" />
      </span>
    );
  }
  if (kind === "when") {
    return (
      <span className="be-draw be-draw-cal">
        {Array.from({ length: 21 }, (_, c) => (
          <i key={c} data-take={c === 4 || c === 11 || c === 15 || undefined} />
        ))}
      </span>
    );
  }
  return (
    <span className="be-draw">
      <i className="be-draw-row be-draw-head" />
      <i className="be-draw-row" style={{ ["--w" as string]: "70%" }} />
      <i className="be-draw-row" style={{ ["--w" as string]: "48%" }} />
      <svg className="be-draw-tick" viewBox="0 0 20 20" aria-hidden="true">
        <path d="M4 10.5 L8.5 15 L16 5.5" />
      </svg>
    </span>
  );
}

function Solutions({ t }: { t: T }) {
  const cards = [
    {
      id: "base",
      kind: "base" as const,
      name: t("Databases", "Bases de dados"),
      body: t(
        "Every request and every contact that comes in is written down on its own, in one place, the moment it arrives.",
        "Cada pedido e cada contacto que entra fica escrito sozinho, num só sítio, no momento em que chega.",
      ),
    },
    {
      id: "when",
      kind: "when" as const,
      name: t("Calendars", "Calendários"),
      body: t(
        "The company's activity in one calendar, the services given to clients included, filling itself in as bookings are made.",
        "A atividade da empresa num calendário, incluindo os serviços prestados a clientes, a preencher-se à medida que as marcações entram.",
      ),
    },
    {
      id: "mail",
      kind: "mail" as const,
      name: t("Email automation", "Automatização de e-mails"),
      body: t(
        "From emails that go out on their own to ones written in advance with blanks to fill in, so an answer takes a minute instead of ten.",
        "Desde e-mails que saem sozinhos a e-mails pré-feitos com espaços a preencher, para uma resposta levar um minuto em vez de dez.",
      ),
    },
  ];

  return (
    // The turn to white starts 15% further down than the room's default
    // (75% → 60% of the screen; user, 2026-11-19).
    <section aria-labelledby="be-sol-title" data-tone="light" data-tone-from="0.6" className="relative">
      <div className="shell ps-sec" data-tone-body>
        {/* Dark grey cards now (user, 2026-11-19). On a desk the scroll
            pulls them out of one another from left to right, and the
            block for anything else is born from under them; the thread
            of the photo shoot's map draws itself as each one lands. */}
        <DragRun
          head={
            // One title: the label above it said the same words
            // (2026-11-19).
            <SlideIn ready>
              <p className="mono-label text-ash-2">{t("What we build", "O que construímos")}</p>
              <h2 id="be-sol-title" className="display be-why-title">
                {t("Our three main back end solutions", "As nossas três principais soluções de back end")}
              </h2>
            </SlideIn>
          }
          solutions={cards.map((card) => ({ id: card.id, name: card.name, body: card.body, draw: <Draw kind={card.kind} /> }))}
          slab={
            <div className="be-slab">
              <h3 className="be-slab-say display">
                {t("Need something more specific?", "É preciso algo mais específico?")}
              </h3>
              <p className="be-slab-body">
                {t(
                  "Don’t worry. Tell us what you need in our form and we’ll find a solution for you.",
                  "Não há problema. Basta dizer o que falta no formulário e encontramos uma solução.",
                )}
              </p>
              {/* The form itself, from here (user, 2026-11-19). */}
              <div className="be-slab-ask">
                <ProposalAsk label={t("Get your free proposal", "Pedir proposta gratuita")} />
              </div>
            </div>
          }
        />
      </div>
    </section>
  );
}

/* ---- what a company gains ---------------------------------------- */

/** The nine as the studio wrote them, before they were drawn into
    three (2026-11-19). Kept, not shown. */
export function gains(t: T) {
  return [
    [t("The day is run, not chased", "O dia é gerido, não corrido"), t("Time and activity are organised in one place, and what is left at the end of the day can go into the work that grows the company.", "O tempo e as atividades ficam organizados num só sítio, e o que sobra ao fim do dia pode ir para o trabalho que faz a empresa crescer.")],
    [t("Nothing is lost", "Nada se perde"), t("No request and no contact goes missing: everything is kept and everything is in the same place.", "Nenhum pedido e nenhum contacto se perde: fica tudo guardado e tudo no mesmo sítio.")],
    [t("The client is answered sooner", "O cliente é respondido mais depressa"), t("A confirmation goes out the moment a request arrives, outside working hours included.", "Uma confirmação sai no momento em que o pedido chega, incluindo fora do horário de trabalho.")],
    [t("What is known about a client is kept", "O que se sabe do cliente fica guardado"), t("In interfaces that give something back: what was asked, when, and what was done about it.", "Em interfaces que devolvem alguma coisa: o que foi pedido, quando, e o que se fez a respeito.")],
    [t("Fewer mistakes by hand", "Menos erros à mão"), t("What is copied from one place to another by a person is what gets copied wrong.", "O que é copiado de um lado para o outro por uma pessoa é o que sai errado.")],
    [t("Fewer no-shows", "Menos faltas"), t("Reminders go out on their own, so a booking is not forgotten on either side.", "Os lembretes saem sozinhos, para a marcação não ser esquecida de nenhum dos lados.")],
    [t("Decisions on what happened", "Decisões sobre o que aconteceu"), t("On the business's own numbers rather than on an impression of them.", "Sobre os números do próprio negócio, e não sobre a impressão que se tem deles.")],
    [t("It looks like a company", "Parece uma empresa"), t("A confirmation that arrives, a reminder that comes, an answer that knows the history: that is what reads as professional.", "Uma confirmação que chega, um lembrete que aparece, uma resposta que conhece o histórico: é isso que se lê como profissional.")],
    [t("It grows with the company", "Cresce com a empresa"), t("What is built holds more as more comes in, without starting again from nothing.", "O que se constrói aguenta mais à medida que mais entra, sem recomeçar do zero.")],
  ];
}

/** The nine gains, drawn together into three (user, 2026-11-19: many
    of them said the same thing). Every piece of the nine is still in
    one of the three: the day, decisions and growth; nothing lost, the
    client's history and fewer mistakes; the answer, the reminder and
    looking like a company. The nine are kept above, in gains(), in case
    they are wanted again. */
function three(t: T) {
  // A lead and keyed lines (2026-11-19, second round): the same words
  // as the paragraphs they replace, cut where each fact ends.
  return [
    {
      id: "day",
      name: t("The day is run, not chased", "O dia é gerido, não corrido"),
      lead: t("Time and activity, organised in one place.", "O tempo e as atividades, organizados num só sítio."),
      items: [
        { key: t("What is left of the day", "O que sobra do dia"), rest: t("can go into the work that grows the company.", "pode ir para o trabalho que faz a empresa crescer.") },
        { key: t("Decisions", "As decisões"), rest: t("rest on the business's own numbers, not on an impression of them.", "assentam nos números do próprio negócio, e não na impressão que se tem deles.") },
        { key: t("What is built", "O que se constrói"), rest: t("holds more as more comes in, without starting again from nothing.", "aguenta mais à medida que mais entra, sem recomeçar do zero.") },
      ],
    },
    {
      id: "kept",
      name: t("Nothing is lost", "Nada se perde"),
      lead: t("No request and no contact goes missing: everything is kept, all in the same place.", "Nenhum pedido e nenhum contacto se perde: fica tudo guardado, tudo no mesmo sítio."),
      items: [
        { key: t("Each client's history", "O histórico de cada cliente"), rest: t("what was asked, when, and what was done about it, in interfaces that give it back.", "o que foi pedido, quando, e o que se fez a respeito, em interfaces que o devolvem.") },
        { key: t("Nothing copied by hand", "Nada copiado à mão"), rest: t("from one place to another, which is where mistakes come from.", "de um lado para o outro, que é de onde vêm os erros.") },
      ],
    },
    {
      id: "client",
      name: t("The client feels the difference", "O cliente sente a diferença"),
      lead: t("A confirmation that arrives, a reminder that comes, an answer that knows the history: that is what reads as professional.", "Uma confirmação que chega, um lembrete que aparece, uma resposta que conhece o histórico: é isso que se lê como profissional."),
      items: [
        { key: t("The confirmation", "A confirmação"), rest: t("goes out the moment a request arrives, outside working hours included.", "sai no momento em que o pedido chega, incluindo fora do horário de trabalho.") },
        { key: t("The reminders", "Os lembretes"), rest: t("go out on their own, so a booking is not forgotten on either side.", "saem sozinhos, para a marcação não ser esquecida de nenhum dos lados.") },
      ],
    },
  ];
}

function Gains({ t }: { t: T }) {
  return (
    <section aria-labelledby="be-gain-title" data-tone="light" className="relative">
      <div className="shell ps-sec" data-tone-body>
        <SlideIn ready>
          <p className="mono-label text-ash-2">{t("What a company gains", "O que a empresa ganha")}</p>
          <h2 id="be-gain-title" className="display be-why-title">
            <span className="font-light sm:block">{t("Three things,", "Três coisas,")}</span>{" "}
            <span className="font-medium sm:block">{t("and time is only the first.", "e o tempo é só a primeira.")}</span>
          </h2>
        </SlideIn>

        {/* Option A of 2026-11-19: the three on the left, and on the
            right a card held in place whose drawing changes to the gain
            being read (Linear's features page, through Inspo: only the
            composition). */}
        <GainStory
          t={t}
          gains={three(t)}
          scenes={[<SceneDay key="day" t={t} />, <SceneKept key="kept" t={t} />, <SceneClient key="client" t={t} />]}
        />
      </div>
    </section>
  );
}

/* ---- how the price works ----------------------------------------- */

function Prices({ t }: { t: T }) {
  // In the order they happen now (2026-11-19): the meeting first.
  const stops = [
    {
      id: "meet",
      glyph: "meet" as const,
      name: t("The first meeting", "A reunião inicial"),
      value: t("Free", "Gratuita"),
      body: t(
        "We work out which solutions a business actually needs. It costs nothing and commits to nothing.",
        "Para perceber de que soluções o negócio precisa mesmo. Não custa nada e não compromete a nada.",
      ),
    },
    {
      id: "build",
      glyph: "build" as const,
      name: t("A one-off build", "Um valor de implementação"),
      value: t("In the proposal", "Na proposta"),
      per: t("once", "uma vez"),
      body: t(
        "It follows from which solutions are chosen and from how much they have to be tied to one another.",
        "Depende das soluções escolhidas e de quanto têm de ser interligadas.",
      ),
      note: t(
        "Two that stand on their own cost less to put in than two that have to answer each other.",
        "Duas que vivem sozinhas custam menos a montar do que duas que têm de responder uma à outra.",
      ),
    },
    {
      id: "month",
      glyph: "month" as const,
      name: t("A monthly service", "Um serviço mensal"),
      value: t("In the proposal", "Na proposta"),
      per: t("a month", "por mês"),
      body: t(
        "A token figure on purpose, and it can be one because what we build is thought out so that the upkeep it needs is low.",
        "Simbólico de propósito, e pode sê-lo porque o que construímos já é pensado para que a manutenção necessária seja baixa.",
      ),
    },
  ];

  return (
    <section aria-labelledby="be-price-title" data-tone="dark" className="relative text-paper">
      <div className="shell ps-sec" data-tone-body>
        <SlideIn ready>
          <p className="mono-label text-paper/55">{t("How it works", "Como funciona")}</p>
          <h2 id="be-price-title" className="display be-why-title">
            <span className="font-light sm:block">{t("One build, then a small", "Uma implementação, depois um")}</span>{" "}
            <span className="font-medium sm:block">{t("monthly service.", "serviço mensal pequeno.")}</span>
          </h2>
        </SlideIn>

        {/* Option A of 2026-11-19: a line the scroll draws from one
            stop to the next. */}
        <PriceLine stops={stops} />

        <SlideIn ready distance={0} delay={0.16}>
          <div className="be-price-foot">
            <p className="mono-label">
              {t(
                "Every figure is in the free proposal: the form works the estimate out, with the cost of every service set out.",
                "Todos os valores estão na proposta gratuita: o formulário calcula a estimativa, com o custo de cada serviço discriminado.",
              )}
            </p>
            <ProposalAsk label={t("Get your free proposal", "Pedir proposta gratuita")} />
          </div>
        </SlideIn>
      </div>
    </section>
  );
}

/* ================================================================== */

/** Every animation and transition on the page played 1.5 times as fast,
    all in proportion, delays included (user, 2026-11-19), the way the
    side-by-side page's personalization card is sped up: done on the
    running animations themselves, so the timings written across this
    page and globals.css keep their ratios, and picked up again whenever
    something on the page changes, since each change starts new ones.
    What the scroll drives is not timed, so it is not touched. */
function usePageSpeed(box: React.RefObject<HTMLElement | null>, rate: number) {
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    let frame = 0;
    const fast = () => {
      for (const a of el.getAnimations({ subtree: true })) if (a.playbackRate !== rate) a.playbackRate = rate;
    };
    // Transitions start at the next style pass, after the change that
    // caused them, so look again on the next frame too.
    const both = () => {
      fast();
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(fast);
    };
    both();
    const watch = new MutationObserver(both);
    watch.observe(el, { subtree: true, childList: true, attributes: true });
    return () => {
      watch.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [box, rate]);
}

export function BackEnd() {
  const t = useT();
  const page = useRef<HTMLDivElement>(null);
  usePageSpeed(page, SPEED);
  return (
    <div ref={page} className="contents">
      <ToneRoom>
        <Head t={t} />
        <Why t={t} />
        <Solutions t={t} />
        <Gains t={t} />
        <Prices t={t} />
      </ToneRoom>
    </div>
  );
}
