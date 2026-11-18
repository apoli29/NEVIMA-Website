"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";
import { SlideIn } from "./enter";
import { ToneRoom } from "./tone-veil";
import { ProposalAsk } from "./about-faq";
import { useInView, type T } from "./sbs-shared";
import { HoursBars, ProcessCard, SavedHours, WeekDonut } from "./back-end-charts";
import { TO_FILL } from "@/lib/work";
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
  const facts = [
    { v: t("Requests and contacts", "Pedidos e contactos"), l: t("Kept on their own", "Guardados sozinhos") },
    { v: t("Calendars and bookings", "Calendários e reservas"), l: t("The company's activity", "A atividade da empresa") },
    { v: t("Emails", "E-mails"), l: t("Automatic or pre-written", "Automáticos ou pré-preenchidos") },
  ];
  return (
    <section data-tone="light" className="relative isolate be-grey">
      {/* The grey the side-by-side card's sheets are set on (user,
          2026-11-18): it holds the black type as firmly as the white
          sections below do, and tells the header from them. */}
      <header className="shell ps-head be-head" data-tone-body>
        <div className="be-head-top">
          <div className="be-head-words">
            <SlideIn ready>
              <h1 className="display be-head-title">
                {t("Back-end Features", "Funcionalidades de Back End")}
              </h1>
              <p className="mono-label text-ash-2 be-head-kicker">{t("Additional service", "Serviço adicional")}</p>
            </SlideIn>
            <SlideIn ready distance={0} delay={0.08}>
              <p className="ps-head-say be-head-say">
                <span className="font-light sm:block">{t("Even the smallest business", "Até o negócio mais pequeno")}</span>{" "}
                <span className="font-medium sm:block">{t("gains from this.", "ganha com isto.")}</span>
              </p>
            </SlideIn>
          </div>
          <SlideIn ready distance={0} delay={0.12}>
            <ProcessCard t={t} />
          </SlideIn>
        </div>
        <SlideIn ready distance={0} delay={0.16}>
          <dl className="ps-head-facts be-head-facts">
            {facts.map((f) => (
              <div key={f.l}>
                <dt>{f.v}</dt>
                <dd className="mono-label">{f.l}</dd>
              </div>
            ))}
          </dl>
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
    <section aria-labelledby="be-why-title" data-tone="light" className="relative">
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

        {/* The week, in one card: where the hours go by hand and with a
            back end, how the week is left afterwards, and how much of it
            comes back. */}
        <SlideIn ready distance={0} delay={0.14}>
          <div className="be-card be-card-week">
            <div className="be-card-two">
              <HoursBars t={t} />
              <WeekDonut t={t} />
            </div>
            <SavedHours t={t} />
          </div>
        </SlideIn>
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
  const reduce = useReducedMotion() ?? false;
  const [ref, inView] = useInView<HTMLDivElement>(0.25);
  const drawn = inView || reduce;

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
    <section aria-labelledby="be-sol-title" data-tone="light" className="relative">
      <div className="shell ps-sec" data-tone-body>
        <SlideIn ready>
          <p className="mono-label text-ash-2">
            {t("Our three main back end solutions", "As nossas três principais soluções de back end")}
          </p>
          <h2 id="be-sol-title" className="display be-why-title">
            {t("Our three back end solutions", "As nossas três soluções de back end")}
          </h2>
        </SlideIn>

        {/* The thread of the photo shoot's map, brought here (user,
            2026-11-18): it draws itself from the name down to the
            drawing when the three are reached, and again under the
            pointer. */}
        <div ref={ref} className="be-sols" data-drawn={drawn || undefined} data-still={reduce || undefined}>
          {cards.map((card, i) => (
            <article key={card.id} className="be-sol" style={{ ["--i" as string]: i }}>
              <h3 className="be-sol-name">{card.name}</h3>
              {/* The map's leader line, brought here: down from the
                  name, across to the drawing, and a dot where it
                  lands. It draws itself once the three are reached. */}
              <svg className="be-sol-thread" viewBox="0 0 160 44" aria-hidden="true">
                <path className="be-sol-lead" d="M 1 1 L 1 30 L 74 30" />
                <circle className="be-sol-dot" cx="74" cy="30" r="2.6" />
              </svg>
              <Draw kind={card.kind} />
              <p className="be-sol-body">{card.body}</p>
            </article>
          ))}
        </div>

        <SlideIn ready distance={0} delay={0.2}>
          <div className="be-slab">
            <h3 className="be-slab-say display">
              <span className="font-light sm:block">{t("Need something more specific? Don’t worry.", "É preciso algo mais específico? Não há problema.")}</span>{" "}
              <span className="font-medium sm:block">
                {t("Tell us what you need in our form and we’ll find a solution for you.", "Basta dizer o que falta no formulário e encontramos uma solução.")}
              </span>
            </h3>
            <div className="be-slab-foot">
              <ProposalAsk label={t("Get your free proposal", "Pedir proposta gratuita")} />
            </div>
          </div>
        </SlideIn>
      </div>
    </section>
  );
}

/* ---- what a company gains ---------------------------------------- */

function gains(t: T) {
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

function Gains({ t }: { t: T }) {
  return (
    <section aria-labelledby="be-gain-title" data-tone="light" className="relative">
      <div className="shell ps-sec" data-tone-body>
        <SlideIn ready>
          <p className="mono-label text-ash-2">{t("What a company gains", "O que a empresa ganha")}</p>
          <h2 id="be-gain-title" className="display be-why-title">
            <span className="font-light sm:block">{t("Nine things,", "Nove coisas,")}</span>{" "}
            <span className="font-medium sm:block">{t("and time is only the first.", "e o tempo é só a primeira.")}</span>
          </h2>
        </SlideIn>

        {/* The nine fit on one screen now (user, 2026-11-18): the names
            stay in view and a row opens when it is asked to. Built on
            <details>, so it works with the keyboard and without any
            script at all. */}
        <SlideIn ready distance={0} delay={0.08}>
          <div className="be-nine">
            {gains(t).map(([name, body], i) => (
              <details key={name} className="be-nine-row" name="be-nine">
                <summary>
                  <span className="mono-label be-nine-n" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="be-nine-name">{name}</span>
                  <span className="be-nine-mark" aria-hidden="true" />
                </summary>
                <p className="be-nine-body">{body}</p>
              </details>
            ))}
          </div>
        </SlideIn>
      </div>
    </section>
  );
}

/* ---- how the price works ----------------------------------------- */

function Prices({ t }: { t: T }) {
  const rows = [
    {
      n: "01",
      head: t("A one-off build", "Um valor de implementação"),
      body: t(
        `${TO_FILL}. It follows from which solutions are chosen and from how much they have to be tied to one another: two that stand on their own cost less to put in than two that have to answer each other.`,
        `${TO_FILL}. Depende das soluções escolhidas e de quanto têm de ser interligadas: duas que vivem sozinhas custam menos a montar do que duas que têm de responder uma à outra.`,
      ),
    },
    {
      n: "02",
      head: t("A monthly service", "Um serviço mensal"),
      body: t(
        `${TO_FILL} a month. It is a token figure on purpose, and it can be one because what we build is already thought out so that the upkeep it needs is low.`,
        `${TO_FILL} por mês. O valor é simbólico de propósito, e pode sê-lo porque o que construímos já é pensado para que a manutenção necessária seja baixa.`,
      ),
    },
    {
      n: "03",
      head: t("The first meeting, free", "A reunião inicial, gratuita"),
      body: t(
        "Before any of that, we sit down and work out which solutions a business actually needs. It costs nothing and it commits to nothing.",
        "Antes disso, reunimos para perceber de que soluções o negócio precisa mesmo. Não custa nada e não compromete a nada.",
      ),
    },
  ];

  return (
    <section aria-labelledby="be-price-title" data-tone="light" className="relative be-grey">
      <div className="shell ps-sec" data-tone-body>
        <SlideIn ready>
          <p className="mono-label text-ash-2">{t("How the price works", "Como funcionam os preços")}</p>
          <h2 id="be-price-title" className="display be-why-title">
            <span className="font-light sm:block">{t("One build, then a small", "Uma implementação, depois um")}</span>{" "}
            <span className="font-medium sm:block">{t("monthly service.", "serviço mensal pequeno.")}</span>
          </h2>
        </SlideIn>

        <SlideIn ready distance={0} delay={0.08}>
          <dl className="be-price">
            {rows.map((row) => (
              <div key={row.n} className="be-price-row">
                <dt>
                  <span className="mono-label be-price-n" aria-hidden="true">
                    {row.n}
                  </span>
                  <span className="be-price-head">{row.head}</span>
                </dt>
                <dd className="be-price-body">{row.body}</dd>
              </div>
            ))}
          </dl>
        </SlideIn>

        <SlideIn ready distance={0} delay={0.16}>
          <div className="be-price-foot">
            <p className="mono-label">
              {t(
                "The two figures are the studio's to set; the form works an estimate out meanwhile.",
                "Os dois valores são definidos pelo estúdio; entretanto, o formulário calcula uma estimativa.",
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

export function BackEnd() {
  const t = useT();
  return (
    <ToneRoom>
      <Head t={t} />
      <Why t={t} />
      <Solutions t={t} />
      <Gains t={t} />
      <Prices t={t} />
    </ToneRoom>
  );
}
