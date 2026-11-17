"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { SlideIn } from "./enter";
import { ToneRoom } from "./tone-veil";
import { ProposalAsk } from "./about-faq";
import { Illuminated } from "./services";
import { useInView, type T } from "./sbs-shared";
import { TO_FILL } from "@/lib/work";
import { useT } from "@/lib/use-lang";
import { CostBars, GrowthLines, HoursBars, MonthCards, SavedHours, ToolFlow, WeekDonut } from "./back-end-charts";

/* ==================================================================
   Back-end features

   The service's own page (user, 2026-11-17), set as the photo shoot's
   and the visual identity's are, so the four read as one system: the
   same header, one ToneRoom turning under the tonal veil, the same
   SlideIn on every heading, the same leading line at the head of each
   section.

   It is the most technical of the services, and is written as the user
   asked: for someone who runs a small business, the practical result
   first and the machinery afterwards. No jargon stands alone.

   Four sections, from the studio's brief:

   1. Why, even for the smallest business. The statement is lit word by
      word as it is read (Illuminated, the comparison's own), and under
      it a working day told twice: by hand, and with the work taken off
      the hands.
   2. What they are, in three things the reader can watch: a request
      landing in a table on its own, a calendar filling itself in, and
      an email writing itself with its blanks filled. Each is a place
      for the real screen: while the file is missing, the little
      interface plays there instead, so nothing is ever empty.
   3. What a company gains, as a ruled ledger: nine lines, every one of
      them something the studio claims and nothing more. No invented
      figure - "hours saved a week" would be one, and there is none.
   4. Simple, efficient, made for small and medium businesses. The
      tools, how they are tied together and what the monthly service
      costs are the studio's to give; until it does, they read
      [a preencher], as everything unfilled on this site does.

   PLACES FOR THE SCREENS. public/back-end/ holds them, named after
   what belongs in them (see its README).

   References through Inspo: n8n's workflow canvas (nodes tied by wires
   on a dark ground) for the diagram, Factory's pricing (mono ordinals,
   ruled rows) for the ledger. Their colour and type stay with them.
   ================================================================== */

/* ---- the header -------------------------------------------------- */

function Head({ t }: { t: T }) {
  const facts = [
    { v: t("Requests and contacts", "Pedidos e contactos"), l: t("Kept on their own", "Guardados sozinhos") },
    { v: t("Calendars and bookings", "Calendários e reservas"), l: t("The company's activity", "A atividade da empresa") },
    { v: t("Emails", "E-mails"), l: t("Automatic or pre-written", "Automáticos ou pré-preenchidos") },
  ];
  return (
    <section data-tone="dark" className="relative isolate text-paper">
      {/* No drop of its own: the bar carries one all the way down and
          the page ends on "Let's work together". */}
      <header className="shell ps-head" data-tone-body>
        <SlideIn ready>
          <p className="mono-label text-paper/55">{t("Additional service", "Serviço adicional")}</p>
          <h1 className="display mt-7 max-w-[18ch] text-[clamp(2.5rem,6vw,4.75rem)] leading-[0.98] font-light">
            {t("Back-end Features", "Funcionalidades de Back End")}
          </h1>
        </SlideIn>
        <SlideIn ready distance={0} delay={0.08}>
          <p className="ps-head-say">
            <span className="font-light sm:block">{t("Even the smallest business", "Até o negócio mais pequeno")}</span>{" "}
            <span className="font-medium sm:block">{t("gains from this.", "ganha com isto.")}</span>
          </p>
        </SlideIn>
        <SlideIn ready distance={0} delay={0.16}>
          <dl className="ps-head-facts">
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

/* ---- the opening ------------------------------------------------- */

function Opening({ t }: { t: T }) {
  return (
    <section data-tone="light" className="relative">
      <div className="shell ps-open" data-tone-body>
        <SlideIn ready>
          <p className="mono-label text-ash-2">{t("What this is, in plain words", "O que isto é, por palavras simples")}</p>
          <h2 className="display ps-open-title">
            <span className="font-light sm:block">{t("The part of the website", "A parte do website")}</span>{" "}
            <span className="font-medium sm:block">{t("that does the paperwork.", "que trata da papelada.")}</span>
          </h2>
        </SlideIn>
        <SlideIn ready distance={0} delay={0.08} className="ps-open-say">
          <p>
            {t(
              "A request comes in and writes itself down. A booking takes its own place in the calendar. A confirmation goes out at eleven at night without anybody being awake for it.",
              "Um pedido entra e fica escrito sozinho. Uma marcação ocupa o seu lugar no calendário. Uma confirmação sai às onze da noite sem ninguém estar acordado para isso.",
            )}
          </p>
          <p>
            {t(
              "That is what a back end is: not a thing the client of the business ever sees, but the reason nothing is lost and nobody is kept waiting.",
              "É isso um back end: não é nada que o cliente do negócio chegue a ver, mas é a razão de nada se perder e de ninguém ficar à espera.",
            )}
          </p>
        </SlideIn>
      </div>
    </section>
  );
}

/* ---- 1. why, even for the smallest business ---------------------- */

/** A working day, told twice. The second one is shorter because the
    tasks that were done by hand are not done by hand any more. */
function day(t: T) {
  return [
    { task: t("Write down the request that came in", "Apontar o pedido que entrou"), gone: true },
    { task: t("Copy the contact into a list", "Copiar o contacto para uma lista"), gone: true },
    { task: t("Answer to confirm", "Responder a confirmar"), gone: true },
    { task: t("Write the booking into the calendar", "Escrever a marcação no calendário"), gone: true },
    { task: t("Remember to remind the client", "Lembrar-se de avisar o cliente"), gone: true },
    { task: t("Look for last month's contact", "Procurar o contacto do mês passado"), gone: true },
    { task: t("Do the work itself", "Fazer o trabalho em si"), gone: false },
  ];
}

function Why({ t }: { t: T }) {
  const reduce = useReducedMotion() ?? false;
  /* Two watchers, not one: a box taller than the window never reaches a
     fraction of itself, so each piece watches its own box. */
  const [claimRef, claimIn] = useInView<HTMLDivElement>(0.6);
  const [dayRef, dayIn] = useInView<HTMLDivElement>(0.2);
  const shown = claimIn || reduce;
  const ran = dayIn || reduce;
  const rows = day(t);
  const claim = t(
    "With the growth of the digital world and of artificial intelligence, no company grows today without using the digital to assist or automate what it does internally.",
    "Com o crescimento do digital e das inteligências artificiais, nenhuma empresa cresce hoje sem usar o digital para assistir ou automatizar os processos internos.",
  );

  return (
    <section aria-labelledby="be-why-title" data-tone="dark" className="relative text-paper">
      <div className="shell ps-sec" data-tone-body>
        <SlideIn ready>
          <p className="mono-label text-paper/55">{t("Why, even for the smallest business", "Porquê, mesmo para o negócio mais pequeno")}</p>
          <h2 id="be-why-title" className="display ps-title">
            <span className="font-light sm:block">{t("The work nobody is paid for", "O trabalho que ninguém paga")}</span>{" "}
            <span className="font-medium sm:block">{t("is the work that eats the day.", "é o que come o dia.")}</span>
          </h2>
        </SlideIn>

        <SlideIn ready distance={0} delay={0.08}>
          <div ref={claimRef} className="be-claim">
            {/* The light only runs once the sentence is reached: it is
                read as it is lit, as the home page's comparison is. Until
                then the same words stand in the same place, in the same
                type, so nothing moves when it starts. */}
            {shown ? (
              <Illuminated
                reduce={reduce}
                delayMs={0}
                durationMs={2600}
                className="be-claim-line"
                text={claim}
              />
            ) : (
              <p className="be-claim-line">{claim}</p>
            )}
          </div>
        </SlideIn>

        <div ref={dayRef} className="be-day" data-in={ran || undefined}>
          <div className="be-col">
            <p className="mono-label be-col-head">{t("A day by hand", "Um dia à mão")}</p>
            <ul className="be-list">
              {rows.map((r) => (
                <li key={r.task}>{r.task}</li>
              ))}
            </ul>
          </div>
          <div className="be-col be-col-after">
            <p className="mono-label be-col-head">{t("The same day, with a back end", "O mesmo dia, com um back end")}</p>
            <ul className="be-list">
              {rows.map((r, i) => (
                <li key={r.task} data-gone={r.gone || undefined} style={{ ["--i" as string]: i }}>
                  <span>{r.task}</span>
                </li>
              ))}
            </ul>
            <p className="be-left">
              {t("What is left is the work itself.", "O que sobra é o trabalho em si.")}
            </p>
          </div>
        </div>

        {/* And the same thing over two years: the two ways a business
            grows, drawn. The numbers are illustrative and say so. */}
        <GrowthLines t={t} />
      </div>
    </section>
  );
}

/* ---- 2. what they are -------------------------------------------- */

/** A place for the real screen. While the file is missing, the little
    interface plays in it, so the reader always has something to watch
    and the shape never changes. */
function Screen({ src, label, kind, t }: { src: string; label: string; kind: "table" | "calendar" | "email"; t: T }) {
  const [broken, setBroken] = useState(false);

  if (!broken) {
    return (
      <span className="be-screen">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt=""
          draggable={false}
          ref={(node) => {
            if (node && node.complete && node.naturalWidth === 0) setBroken(true);
          }}
          onError={() => setBroken(true)}
        />
      </span>
    );
  }

  return (
    <span className="be-screen" data-mock="">
      <Mock kind={kind} t={t} />
      <span className="be-screen-say mono-label">{label}</span>
    </span>
  );
}

/** Its own component, so the watcher is set up with the element it
    watches: the place only turns into this once the file is found
    missing, which is after the first paint. */
function Mock({ kind, t }: { kind: "table" | "calendar" | "email"; t: T }) {
  const reduce = useReducedMotion() ?? false;
  const [ref, inView] = useInView<HTMLSpanElement>(0.4);
  return (
    <span ref={ref} className="be-mock" data-run={(inView && !reduce) || undefined} data-still={reduce || undefined}>
      {kind === "table" && <MockTable t={t} />}
      {kind === "calendar" && <MockCalendar t={t} />}
      {kind === "email" && <MockEmail t={t} />}
    </span>
  );
}

/** A request landing in a table on its own. */
function MockTable({ t }: { t: T }) {
  const rows = [
    { who: "Ana Reis", what: t("Quote", "Orçamento") },
    { who: "Tiago Melo", what: t("Booking", "Marcação") },
    { who: "Rita Nunes", what: t("Question", "Dúvida") },
  ];
  return (
    <span className="be-ui">
      <span className="be-ui-bar">
        <i /> <i /> <i />
      </span>
      <span className="be-ui-head mono-label">
        <span>{t("Name", "Nome")}</span>
        <span>{t("Wants", "Pretende")}</span>
        <span>{t("When", "Quando")}</span>
      </span>
      {rows.map((r, i) => (
        <span key={r.who} className="be-ui-row" style={{ ["--i" as string]: i }}>
          <span>{r.who}</span>
          <span>{r.what}</span>
          <span className="be-ui-dim">{t("just now", "agora mesmo")}</span>
        </span>
      ))}
    </span>
  );
}

/** A calendar filling itself in. */
function MockCalendar({ t }: { t: T }) {
  const cells = Array.from({ length: 21 }, (_, i) => i);
  const taken = [3, 8, 9, 14, 17];
  return (
    <span className="be-ui">
      <span className="be-ui-bar">
        <i /> <i /> <i />
      </span>
      <span className="be-ui-month mono-label">{t("This week and the next", "Esta semana e a seguinte")}</span>
      <span className="be-cal">
        {cells.map((c) => (
          <span key={c} className="be-cal-cell" data-on={taken.includes(c) || undefined} style={{ ["--i" as string]: taken.indexOf(c) }} />
        ))}
      </span>
    </span>
  );
}

/** An email writing itself, its blanks filled as it goes. */
function MockEmail({ t }: { t: T }) {
  return (
    <span className="be-ui">
      <span className="be-ui-bar">
        <i /> <i /> <i />
      </span>
      <span className="be-mail">
        <span className="be-mail-line">
          {t("Hello", "Olá")} <em style={{ ["--i" as string]: 0 }}>{t("Ana", "Ana")}</em>,
        </span>
        <span className="be-mail-line">
          {t("your booking for", "a sua marcação de")} <em style={{ ["--i" as string]: 1 }}>{t("Thursday, 10h", "quinta-feira, 10h")}</em>{" "}
          {t("is confirmed.", "está confirmada.")}
        </span>
        <span className="be-mail-line be-ui-dim">{t("Sent on its own, 23:41", "Enviado sozinho, 23h41")}</span>
      </span>
    </span>
  );
}

function What({ t }: { t: T }) {
  const pieces = [
    {
      id: "pedidos",
      kind: "table" as const,
      name: t("Databases", "Bases de dados"),
      body: t(
        "Every request and every contact that comes in is written down on its own, in one place, the moment it arrives.",
        "Cada pedido e cada contacto que entra fica escrito sozinho, num só sítio, no momento em que chega.",
      ),
      label: t("Image: the requests database", "Imagem: a base de dados de pedidos"),
    },
    {
      id: "calendario",
      kind: "calendar" as const,
      name: t("Calendars", "Calendários"),
      body: t(
        "The company's activity in one calendar, the services given to clients included, filling itself in as bookings are made.",
        "A atividade da empresa num calendário, incluindo os serviços prestados a clientes, a preencher-se à medida que as marcações entram.",
      ),
      label: t("Image: the calendar", "Imagem: o calendário"),
    },
    {
      id: "emails",
      kind: "email" as const,
      name: t("Email automation", "Automatização de e-mails"),
      body: t(
        "From emails that go out on their own to ones written in advance with blanks to fill in, so an answer takes a minute instead of ten.",
        "Desde e-mails que saem sozinhos a e-mails pré-feitos com espaços a preencher, para uma resposta levar um minuto em vez de dez.",
      ),
      label: t("Image: the email template", "Imagem: o modelo de e-mail"),
    },
  ];

  return (
    <section aria-labelledby="be-what-title" data-tone="light" className="relative">
      <div className="shell ps-sec" data-tone-body>
        <SlideIn ready>
          <p className="mono-label text-ash-2">{t("What they are", "O que são")}</p>
          <h2 id="be-what-title" className="display ps-title">
            <span className="font-light sm:block">{t("Three of them, and then", "Três delas, e depois")}</span>{" "}
            <span className="font-medium sm:block">{t("whatever the business needs.", "o que o negócio precisar.")}</span>
          </h2>
        </SlideIn>

        <SlideIn ready distance={0} delay={0.08}>
          <p className="ps-lede">
            {t(
              "These are the three almost every business ends up with. They are worth watching rather than reading about.",
              "Estas são as três com que quase todos os negócios acabam. Valem mais vistas do que lidas.",
            )}
          </p>
        </SlideIn>

        <div className="be-pieces">
          {pieces.map((p, i) => (
            <SlideIn key={p.id} ready distance={0} delay={0.12 + i * 0.06}>
              <figure className="be-piece">
                <Screen src={`/back-end/${p.id}.webp`} label={p.label} kind={p.kind} t={t} />
                <figcaption>
                  <h3 className="be-piece-name">{p.name}</h3>
                  <p className="be-piece-body">{p.body}</p>
                </figcaption>
              </figure>
            </SlideIn>
          ))}
        </div>

        <SlideIn ready distance={0} delay={0.28}>
          <MonthCards t={t} />
        </SlideIn>

        <SlideIn ready distance={0} delay={0.3}>
          <p className="be-others">
            {t(
              "And others: there is no fixed list. What a business needs written down, reminded or sent is what gets built.",
              "E outras: não há uma lista fechada. O que um negócio precisa de ter escrito, lembrado ou enviado é o que se constrói.",
            )}
          </p>
        </SlideIn>
      </div>
    </section>
  );
}

/* ---- 3. what a company gains ------------------------------------- */

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
      <div className="shell sht-head" data-tone-body>
        <div className="sht-stick">
          <p className="mono-label text-ash-2">{t("What a company gains", "O que a empresa ganha")}</p>
          <h2 id="be-gain-title" className="display sht-title">
            <span className="font-light sm:block">{t("Nine things,", "Nove coisas,")}</span>{" "}
            <span className="font-medium sm:block">{t("and time is only the first.", "e o tempo é só a primeira.")}</span>
          </h2>
          <p className="ps-lede sht-lede">
            {t(
              "None of this is about technology. It is about the end of the day, and what is left of it.",
              "Nada disto é sobre tecnologia. É sobre o fim do dia, e sobre o que sobra dele.",
            )}
          </p>
        </div>

        <dl className="sht-rows">
          {gains(t).map(([name, body]) => (
            <div key={name} className="sht-row">
              <dt className="sht-row-name">{name}</dt>
              <dd className="sht-row-body">{body}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* The first of the nine, drawn: where the week goes by hand,
          where it goes afterwards, and how much of it comes back. */}
      <div className="shell be-figs" data-tone-body>
        <HoursBars t={t} />
        <WeekDonut t={t} />
        <SavedHours t={t} />
      </div>
    </section>
  );
}

/* ---- 4. simple, efficient, made for small businesses ------------- */

function Made({ t }: { t: T }) {
  /* The tools, how they are tied and what the month costs are the
     studio's to give (asked for on 2026-11-16 and 2026-11-17). Until
     they come, they read as everything unfilled on this site does. */
  const tools = [TO_FILL, TO_FILL, TO_FILL];

  return (
    <section aria-labelledby="be-made-title" data-tone="dark" className="relative text-paper">
      <div className="shell ps-sec" data-tone-body>
        <SlideIn ready>
          <p className="mono-label text-paper/55">{t("How it is built", "Como é feito")}</p>
          <h2 id="be-made-title" className="display ps-title">
            <span className="font-light sm:block">{t("Simple, efficient,", "Simples, eficientes,")}</span>{" "}
            <span className="font-medium sm:block">{t("and made for a small company.", "e feitas para uma empresa pequena.")}</span>
          </h2>
        </SlideIn>

        <SlideIn ready distance={0} delay={0.08}>
          <p className="ps-lede ps-lede-dark">
            {t(
              "What we set out to offer is a back end a small or medium company can actually afford, with no excessive costs, that answers more than well to what it needs and to the context it works in.",
              "O objetivo é apresentar às pequenas e médias empresas uma alternativa de back end acessível, sem custos excessivos, que responde mais do que bem às suas necessidades e ao seu contexto.",
            )}
          </p>
        </SlideIn>

        {/* The tools tied to the website and to the client, with the
            data running along the wires (n8n's canvas, in our black and
            white). The names come from above, so they fill themselves
            in when the studio gives them. */}
        <ToolFlow t={t} names={tools} />

        <div className="be-made-rows">
          {[
            { head: t("The tools", "As ferramentas"), body: TO_FILL },
            { head: t("How they are tied together", "Como as interligamos"), body: TO_FILL },
            {
              head: t("The monthly service", "O serviço mensal"),
              body: t(
                `${TO_FILL} a month. It costs little by design: the skeleton we build is thought out so that the upkeep it needs is low.`,
                `${TO_FILL} por mês. O valor é simbólico de propósito: o esqueleto que construímos já é pensado para que a manutenção necessária seja baixa.`,
              ),
            },
          ].map((row) => (
            <SlideIn key={row.head} ready distance={0} delay={0.14}>
              <div className="be-made-row">
                <h3 className="mono-label be-made-head">{row.head}</h3>
                <p className="be-made-body">{row.body}</p>
              </div>
            </SlideIn>
          ))}
        </div>

        <CostBars t={t} />

        <SlideIn ready distance={0} delay={0.22}>
          <div className="be-made-foot">
            <p className="mono-label">
              {t(
                "The tools, how they are tied and the monthly figure are the studio's to set; the form works an estimate out meanwhile.",
                "As ferramentas, a forma de as interligar e o valor mensal são definidos pelo estúdio; entretanto, o formulário calcula uma estimativa.",
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
      <Opening t={t} />
      <Why t={t} />
      <What t={t} />
      <Gains t={t} />
      <Made t={t} />
    </ToneRoom>
  );
}
