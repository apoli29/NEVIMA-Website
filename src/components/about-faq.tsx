"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useHref, useLang, useT } from "@/lib/use-lang";
import { SlideIn } from "./enter";
import { PassLink } from "./floating-nav";
import { useProposal } from "./proposal-flow";
import { Chevron, Illuminated, LIGHT_DELAY_MS, Stressed } from "./services";
import { useSeen } from "./use-seen";
import { Glass } from "./cta-glass";

/* ==================================================================
   FAQ

   The questions a clinic, an agency or an independent professional
   asks before hiring a studio of two: is it enough, how long, how much,
   whose is it, and what the services the home page lists actually
   cover. Answered short and straight, in the voice of the comparison.

   The heading and a way to write in stand on the left, held there while
   the list goes by; the questions hang on the right between hairlines,
   as the services do, with the same "n" toggle that spins a full turn
   on every press. One open at a time, and its answer is lit as the
   service copy is, grey to black.

   The questions are the studio's own list (user, 2026-10-16), the
   answers the studio's where it gave them and otherwise taken from what
   the site says elsewhere (the process, the proposal form, the services).
   No prices: those only ever come from the estimate. Some answers carry
   more than words: a run of steps with arrows, points, or a way on (the
   proposal form, or How we work on the home page, where the step that
   answers the question blinks).
   ================================================================== */

const EMAIL = "ola@nevima.studio";

type Question = {
  id: string;
  q: string;
  /** The answer's words, lit as the service copy is. */
  a?: string;
  /** A short run of steps, set with arrows between them. */
  flow?: readonly string[];
  /** Points, each with an optional lead in bold. */
  list?: readonly { lead?: string; text: string }[];
  /** Words after the steps or the points, in the same type. */
  after?: string;
  /** One word of the answer underlined (see Stressed). */
  stress?: string;
  /** Where to go next: a page, a place on the home page, or the
      free-proposal form, opened here out of the button. */
  link?: { label: string; href: string } | { label: string; proposal: true };
};

const QUESTIONS: readonly Question[] = [
  {
    id: "process",
    q: "How do all your services work together, from start to finish?",
    a: "When a client comes to us, we bring total rigor and organization, to guarantee a top-tier service that is never held back by setbacks that cause extremely long waits. Here’s the process, in short:",
    flow: [
      "Form and estimate",
      "Exact price",
      "Contract",
      "Your materials",
      "Production",
      "Feedback call",
      "Final approval",
      "Launch",
    ],
    link: { label: "See each step in How we work", href: "/#process" },
  },
  {
    id: "why",
    q: "Why should I choose Nevima?",
    list: [
      { lead: "Closeness and personalization:", text: "working with Nevima, you deal directly with the two people providing your service(s). That means much closer, more personal follow-up, where you are listened to and the focus is on delivering a tailor-made result, to your taste." },
      { lead: "Transparency:", text: "web design services can often be needlessly opaque. We want to be a solution to that problem, which is why we show our work process openly and, through a short form, give an estimate for every project that breaks down the specific cost of each service." },
      { lead: "We don’t profit from extra costs:", text: "we include free hosting and SEO practices in our service. Many companies charge exorbitant prices for them, which can exceed €100 a year." },
      { lead: "Speed:", text: "websites delivered on short timelines, without compromising quality." },
      { lead: "Cutting-edge:", text: "we use the most modern tools and know-how, which make us more efficient. The result? Higher-quality websites at lower prices." },
      { lead: "Peace of mind:", text: "we handle all the hosting logistics, put your legal pages on the website and assist you in setting up your domain and registering your trademark." },
    ],
  },
  {
    id: "cost",
    q: "How much does a website cost?",
    a: "It depends on the project: its size, its languages, the number of forms, the additional services chosen and several other factors. Our form calculates an accurate estimate for your project, and we always reply to every form sent within a few hours, with the exact price.",
    link: { label: "Get your free proposal", proposal: true },
  },
  {
    id: "reply",
    q: "How soon will you reply after I fill in the form?",
    a: "Within a few hours. We go through your answers and send you the exact price for your project, along with the reasoning behind it.",
  },
  {
    id: "time",
    q: "How long does a website take?",
    a: "It depends on each project, which is why, once the form is filled in, we always give you a personalized timeline. A large web design project (with every kind of extra included) usually takes no more than 18 to 22 working days. It can take longer with other services included.",
  },
  {
    id: "start",
    q: "When does the service start, and when does it end?",
    a: "We start the moment we have the signed contract and all your materials in hand. The project is complete once you approve the final website in our last call, after which it goes live. Even so, our support doesn\u2019t end there: we stay on hand for whatever you need.",
  },
  {
    id: "logistics",
    q: "What do I need to handle logistically, and what does Nevima do for me?",
    list: [
      {
        lead: "You:",
        text: "your materials (the photos you already have of your business, your logo and symbol) and the content of your legal pages, which is your business\u2019s own responsibility.",
      },
      {
        lead: "Us:",
        text: "we guide you through registering your domain (or connect the one you already have), host your website and put the legal pages on it. If applicable, we also guide you through registering your trademark, which is filed in your business\u2019s own name.",
      },
    ],
  },
  {
    id: "hosting",
    q: "Is hosting really free?",
    a: "Yes. We don\u2019t charge for hosting: it\u2019s free.",
  },
  {
    id: "monthly",
    q: "Will I pay a monthly fee?",
    a: "Not for your website: hosting is free and basic SEO is already included. The only services paid monthly are SEO and GEO, because they are ongoing work, and only if you choose them.",
  },
  {
    id: "domain",
    q: "Do I need my own domain?",
    a: "Yes, every website needs one. If your business doesn\u2019t have one yet, it is registered in your business\u2019s own name and paid for directly, usually €10 to €30 a year: we guide you through it step by step and connect it to your website. If you already have one, we connect it at no extra cost.",
  },
  {
    id: "changes",
    q: "What if I want changes to my website?",
    list: [
      { text: "Your first four small changes, of up to 15 minutes each, are free." },
    ],
    after: "Even so, our process is already designed to avoid them: once part of your website is built, we book a free call to show you the direction it\u2019s taking, and we adjust whatever your feedback calls for. The result? A website made to your taste, which will hardly need any changes.",
    link: { label: "See it in How we work", href: "/#process-strategy" },
  },
  {
    id: "ai",
    q: "Do you use AI?",
    a: "Yes, we use AI in our process. As the technology has advanced, it has become an essential, indispensable tool in our field, boosting both the speed of the process and its value for money.",
  },
  {
    id: "ai-quality",
    q: "If you use AI, doesn\u2019t that lower the quality of your service?",
    a: "No. AI eases design and programming processes that are, at times, very repetitive. Regardless, we go over every AI intervention ourselves, carefully and more than once.",
    stress: "every",
  },
  {
    id: "seo-geo",
    q: "What are SEO and GEO?",
    a: "SEO (Search Engine Optimization) is a set of practices that put a website in the best possible positions in the searches made by its target audiences. With poorly worked SEO, a website is lost in the last pages of results; with personalized SEO, it has a much better chance of reaching the first pages.",
    after: "GEO (Generative Engine Optimization) is a different set of practices with a similar purpose, aimed at Artificial Intelligence instead. More and more of us turn to Artificial Intelligence for suggestions and recommendations, and these practices raise the chances of AI tools recommending a business to their users.",
  },
  {
    id: "extras",
    q: "Do you offer the additional services separately?",
    a: "As a rule, no: like all our additional services, they are offered together with a website we design. Still, if you have a specific need, get in touch and tell us about it.",
  },
  {
    id: "countries",
    q: "Which countries do you work with?",
    a: "At the moment, our priorities are Portugal, Spain, Italy and the USA. If your business is in another country and you\u2019re interested in working with us, get in touch.",
  },
  {
    id: "languages",
    q: "Which languages can my website be in?",
    a: "Portuguese and English are always included. Each other language costs €35 and is translated by an AI specialized in translation. In those cases, if changes are needed, we provide a simply structured document where you give us the translations of the sentences that need fine-tuning.",
  },
];

/* The same questions in Portuguese, by id. Links keep the English
   record's places; only their words change. */
type Words = Omit<Question, "id" | "link"> & { link?: string };

const PT_QUESTIONS: Record<string, Words> = {
  process: {
    q: "Como funciona o processo de todos os vossos serviços juntos, do início ao fim?",
    a: "Quando um cliente recorre aos nossos serviços, apresentamos um nível total de rigor e organização, de forma a garantir um serviço de topo, que não é prejudicado por inconvenientes que provoquem tempos de espera altíssimos. Eis o processo, de forma resumida:",
    flow: [
      "Formulário e estimativa",
      "Preço exato",
      "Contrato",
      "Os materiais",
      "Produção",
      "Chamada de acompanhamento",
      "Aprovação final",
      "Lançamento",
    ],
    link: "Ver cada passo em Como trabalhamos",
  },
  why: {
    q: "Porque é que devo escolher a Nevima?",
    list: [
      { lead: "Proximidade e personalização:", text: "ao trabalhar com a Nevima, o contacto acontece diretamente com os dois responsáveis pela prestação do(s) serviço(s). Isto permite um acompanhamento muito mais próximo e personalizado, onde o cliente é ouvido e o foco é apresentar um resultado feito à medida, ao seu gosto." },
      { lead: "Transparência:", text: "muitas vezes, os serviços de web design podem ser desnecessariamente pouco transparentes. Queremos ser uma solução para esse problema, e é por isso que mostramos abertamente o nosso processo de trabalho e, através de um breve formulário, apresentamos uma estimativa de orçamento para cada projeto, que discrimina os custos específicos de cada serviço." },
      { lead: "Não lucramos com custos extra:", text: "incluímos alojamento gratuito e práticas de SEO no nosso serviço. Grande parte das empresas cobra preços exorbitantes por isso, que podem ultrapassar os 100 euros anuais." },
      { lead: "Rapidez:", text: "websites entregues em prazos curtos, sem comprometer a qualidade." },
      { lead: "Vanguarda:", text: "usamos as ferramentas e o know-how mais modernos, que nos permitem maior eficiência. O resultado? Websites com maior qualidade e preços mais reduzidos." },
      { lead: "Tranquilidade:", text: "tratamos de toda a logística de alojamento, colocamos no website as páginas legais e assistimos na criação do domínio e no registo da marca." },
    ],
  },
  cost: {
    q: "Quanto custa um website?",
    a: "Depende do projeto: do tamanho, dos idiomas, do número de formulários, dos serviços adicionais escolhidos e de vários outros fatores. Temos um formulário que calcula uma estimativa precisa para o projeto do cliente, e respondemos sempre aos formulários submetidos em poucas horas, com o preço exato.",
    link: "Pedir proposta gratuita",
  },
  reply: {
    q: "Quanto tempo demoram a responder depois de preencher o formulário?",
    a: "Poucas horas. Analisamos as respostas e enviamos o preço exato do projeto, com a respetiva justificação.",
  },
  time: {
    q: "Quanto tempo demora um website?",
    a: "Depende de cada projeto, e é por isso que, depois de preenchido o formulário, indicamos sempre um prazo personalizado. Um grande projeto de web design (com todo o tipo de extras incluídos) por norma não passa dos 18 a 22 dias úteis. Pode demorar mais com outros serviços incluídos.",
  },
  start: {
    q: "Quando começa o serviço, e quando termina?",
    a: "Começamos assim que tivermos o contrato assinado e todos os materiais necessários. O projeto fica concluído quando o website final é aprovado na nossa última chamada, sendo posteriormente colocado no ar. Ainda assim, o nosso apoio não acaba aí: continuamos disponíveis para o que for necessário.",
  },
  logistics: {
    q: "De que é que tenho de tratar a nível logístico, e o que faz a Nevima por mim?",
    list: [
      {
        lead: "Cliente:",
        text: "os materiais (as fotografias já existentes do negócio, o logótipo e o símbolo) e o conteúdo das páginas legais, que é da responsabilidade do próprio negócio.",
      },
      {
        lead: "Nevima:",
        text: "acompanhamos o registo do domínio (ou ligamos um já existente), alojamos o website e colocamos nele as páginas legais. Se se aplicar, acompanhamos ainda o cliente no registo da marca, que é feito em nome do próprio negócio.",
      },
    ],
  },
  hosting: {
    q: "O alojamento é mesmo gratuito?",
    a: "Sim. Não cobramos o alojamento: é gratuito.",
  },
  monthly: {
    q: "Vou pagar uma mensalidade?",
    a: "Pelo website, não: o alojamento é gratuito e o SEO básico já está incluído. Os únicos serviços pagos ao mês são o SEO e o GEO, porque são trabalho contínuo, e só se forem escolhidos.",
  },
  domain: {
    q: "Preciso de ter um domínio próprio?",
    a: "Sim, todos os websites precisam de um. Se o negócio ainda não tem, o domínio é registado em nome do próprio negócio e pago diretamente, normalmente entre 10 e 30 € por ano: acompanhamos todo o processo, passo a passo, e ligamo-lo ao website. Se já existe, ligamo-lo sem custos adicionais.",
  },
  changes: {
    q: "E se eu desejar alterações no website?",
    list: [
      { text: "As primeiras quatro alterações pequenas, de até 15 minutos cada, não são cobradas." },
    ],
    after: "No entanto, o nosso processo já foi pensado para as evitar: quando parte do website estiver construída, marcamos uma chamada gratuita para mostrar a direção que está a tomar, e ajustamos o que for necessário com base no feedback. O resultado? Um website feito à medida do gosto do cliente, que dificilmente vai precisar de alterações.",
    link: "Ver como funciona em Como trabalhamos",
  },
  ai: {
    q: "Usam IA?",
    a: "Sim, usamos IA no nosso processo. Com a evolução da tecnologia, tornou-se uma ferramenta essencial e indispensável na nossa área, que aumenta tanto a rapidez do processo como a sua relação qualidade-preço.",
  },
  "ai-quality": {
    q: "Se usam IA, isso não baixa a qualidade do vosso serviço?",
    a: "Não. A IA facilita processos de design e de programação que são, por vezes, muito repetitivos. Independentemente disso, todas as intervenções de IA são vistas e revistas a dedo por nós.",
    stress: "todas",
  },
  "seo-geo": {
    q: "O que são o SEO e o GEO?",
    a: "O SEO (Search Engine Optimization) consiste num conjunto de práticas que colocam um website nas melhores posições possíveis das pesquisas efetuadas pelos públicos-alvo. Com um SEO mal trabalhado, um website fica perdido nas últimas páginas de resultados; com um SEO personalizado, tem muito mais hipóteses de alcançar as primeiras páginas.",
    after: "O GEO (Generative Engine Optimization) consiste num conjunto de práticas diferentes, com um propósito semelhante, mas direcionado para a Inteligência Artificial. Todos nós usamos cada vez mais a Inteligência Artificial para obter sugestões e recomendações, e estas práticas aumentam a probabilidade de as ferramentas de Inteligência Artificial recomendarem um negócio aos seus utilizadores.",
  },
  extras: {
    q: "Oferecem os serviços adicionais em separado?",
    a: "Por norma, não: como todos os nossos serviços adicionais, são oferecidos em conjunto com um website feito por nós. Ainda assim, perante uma necessidade específica, estamos disponíveis para conversar.",
  },
  countries: {
    q: "Com que países trabalham?",
    a: "Neste momento, as nossas prioridades são Portugal, Espanha, Itália e os EUA. Para negócios noutros países com interesse em trabalhar connosco, estamos disponíveis para conversar.",
  },
  languages: {
    q: "Em que línguas pode estar o meu website?",
    a: "Incluímos sempre o português e o inglês. Cada uma das outras línguas custa 35 € e é traduzida por uma IA especializada em tradução. Nestes casos, se forem necessárias mudanças, fornecemos um documento com uma estrutura simples, onde o cliente disponibiliza as traduções das frases que precisem de ser afinadas.",
  },
};

/** The questions in a language. */
function questionsIn(lang: "en" | "pt"): readonly Question[] {
  if (lang === "en") return QUESTIONS;
  return QUESTIONS.map((item) => {
    const pt = PT_QUESTIONS[item.id];
    if (!pt) return item;
    const { link: label, ...words } = pt;
    return { ...item, ...words, link: item.link && label ? { ...item.link, label } : item.link };
  });
}

export function AboutFaq() {
  const reduce = useReducedMotion() ?? false;
  const t = useT();
  const questions = questionsIn(useLang());
  const [open, setOpen] = useState<string | null>(null);
  const list = useRef<HTMLUListElement>(null);
  const seen = useSeen(list, { threshold: 0.1 });

  return (
    <section
      id="faq"
      aria-labelledby="faq-title"
      className="relative bg-paper pt-(--section-gap) pb-28 md:pb-40"
    >
      <div className="shell grid grid-cols-1 gap-y-12 lg:grid-cols-12 lg:gap-x-4">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-32">
            <SlideIn ready>
              <h2
                id="faq-title"
                // A size down from the other titles: it has a third of the
                // shell, and "Straight answers." has to hold on one line.
                className="display text-[clamp(2.25rem,3.4vw,3.5rem)] text-ink"
              >
                <span className="block font-light">{t("Questions.", "Perguntas.")}</span>
                <span className="block font-medium">{t("Straight answers.", "Respostas diretas.")}</span>
              </h2>
            </SlideIn>
            <SlideIn ready delay={0.12} distance={0}>
              <p className="mt-5 max-w-[20rem] text-[0.9375rem] leading-[1.45] text-balance text-ash md:mt-6">
                {t(
                  "Can’t find yours? Write to us and one of the two of us will answer, usually the same day.",
                  "Outra pergunta? Basta escrever-nos: um de nós os dois responde, normalmente no próprio dia.",
                )}
              </p>
              <div className="mt-7 md:mt-8">
                <PassLink
                  href={`mailto:${EMAIL}`}
                  label={
                    <>
                      {t("Ask us", "Perguntar")}
                      <span aria-hidden="true" className="ml-2.5 inline-block">
                        &rarr;
                      </span>
                    </>
                  }
                  className="cta-drop inline-flex text-[1rem] leading-none"
                />
              </div>
            </SlideIn>
          </div>
        </div>

        <ul
          ref={list}
          data-open={open ? "" : undefined}
          className="xs-list border-t border-ink lg:col-span-8 lg:col-start-5"
        >
          {questions.map((item, i) => (
            <Question
              key={item.id}
              item={item}
              index={i}
              open={open === item.id}
              seen={seen}
              reduce={reduce}
              onToggle={() => setOpen((was) => (was === item.id ? null : item.id))}
            />
          ))}
        </ul>
      </div>
    </section>
  );
}

function Question({
  item,
  index,
  open,
  seen,
  reduce,
  onToggle,
}: {
  item: Question;
  index: number;
  open: boolean;
  seen: boolean;
  reduce: boolean;
  onToggle: () => void;
}) {
  const headId = `faq-${item.id}-q`;
  const bodyId = `faq-${item.id}`;
  const [turns, setTurns] = useState(0);
  const [opened, setOpened] = useState(0);
  const on = seen || reduce;
  const href = useHref();

  return (
    <motion.li
      data-open={open ? "" : undefined}
      className="xs-row border-b border-ink/25"
      initial={false}
      animate={{ opacity: on ? 1 : 0, y: on ? 0 : 12 }}
      transition={{ duration: reduce ? 0 : 0.6, delay: 0.05 + index * 0.05, ease: [0.22, 1, 0.36, 1] }}
    >
      <h3>
        <button
          type="button"
          id={headId}
          aria-expanded={open}
          aria-controls={bodyId}
          onClick={() => {
            setTurns((n) => n + 1);
            if (!open) setOpened((n) => n + 1);
            onToggle();
          }}
          className="xs-head grid w-full grid-cols-[1fr_auto] items-center gap-x-6 py-5 text-left md:py-6"
        >
          <span className="xs-name display block text-[clamp(1.25rem,1.75vw,1.625rem)] leading-[1.15] font-normal tracking-[-0.02em] text-ink">
            {item.q}
          </span>
          <Chevron open={open} turns={turns} reduce={reduce} />
        </button>
      </h3>
      <div
        id={bodyId}
        role="region"
        aria-labelledby={headId}
        data-open={open}
        inert={!open}
        className="xs-panel"
      >
        <div>
          <div className="pr-0 pb-8 md:pr-[4.5rem] md:pb-9">
            {item.a &&
              (open && !reduce ? (
                <Illuminated
                  // Its own key, apart from the lines under it: sharing one
                  // with them, old copies of the answer were left standing
                  // (user, 2026-10-18).
                  key={`answer-${opened}`}
                  text={item.a}
                  stress={item.stress}
                  delayMs={LIGHT_DELAY_MS * 0.6}
                  reduce={reduce}
                  className="svc-copy std-ink abt-ragged abt-answer"
                />
              ) : (
                <p data-lit="true" className="svc-copy std-ink abt-ragged abt-answer">
                  <Stressed text={item.a} word={item.stress} />
                </p>
              ))}
            {(item.flow || item.list || item.after || item.link) && (
              // Comes in once the words are lit, each time it is opened.
              <div key={`more-${opened}`} className={`faq-more ${item.a ? "mt-5" : ""}`}>
                {item.flow && (
                  <ol className="faq-flow abt-answer">
                    {item.flow.map((step) => (
                      <li key={step}>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                )}
                {item.list && (
                  <ul className="faq-list abt-answer">
                    {item.list.map((point) => (
                      <li key={point.text}>
                        {point.lead && <strong className="font-medium">{point.lead} </strong>}
                        {point.text}
                      </li>
                    ))}
                  </ul>
                )}
                {item.after && (
                  <p data-lit="true" className={`svc-copy std-ink abt-ragged abt-answer ${item.flow || item.list ? "mt-5" : ""}`}>
                    {item.after}
                  </p>
                )}
                {item.link && (
                  <div className={item.flow || item.list || item.after ? "mt-7" : ""}>
                    {"proposal" in item.link ? (
                      <ProposalAsk label={item.link.label} />
                    ) : (
                      <PassLink
                        href={href(item.link.href)}
                        label={<Arrowed>{item.link.label}</Arrowed>}
                        className="cta-drop inline-flex text-[0.9375rem] leading-none"
                      />
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.li>
  );
}

function Arrowed({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <span aria-hidden="true" className="ml-2.5 inline-block">
        &rarr;
      </span>
    </>
  );
}

/* "Get your free proposal": the form opens on this page, grown out of
   this button, which keeps its place unseen while the form is out. With
   no form on the page, it goes to the home page's. */
function ProposalAsk({ label }: { label: string }) {
  const proposal = useProposal();
  const button = useRef<HTMLButtonElement>(null);
  const [launched, setLaunched] = useState(false);
  const present = proposal?.present ?? false;
  const href = useHref();
  useEffect(() => {
    if (!present) setLaunched(false);
  }, [present]);
  const look = "cta-drop relative isolate inline-flex items-center justify-center text-[0.9375rem] leading-none whitespace-nowrap";
  if (!proposal) {
    return (
      <a href={href("/#proposal")} className={look}>
        <Glass />
        <span className="btn-neu-face">
          <Arrowed>{label}</Arrowed>
        </span>
      </a>
    );
  }
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
      className={look}
      style={{ visibility: launched && present ? "hidden" : undefined }}
    >
      <Glass />
      <span className="btn-neu-face">
        <Arrowed>{label}</Arrowed>
      </span>
    </button>
  );
}
