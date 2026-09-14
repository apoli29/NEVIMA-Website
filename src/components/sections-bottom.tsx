"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { BoomerangMark } from "./boomerang";
import { Button, Reveal, SectionLabel, colPad } from "./primitives";

/* ================================================================== */
/* METHOD — four steps and a return                                    */
/* ================================================================== */

const STEPS = [
  {
    n: "01",
    title: "conversa",
    time: "45 min",
    copy:
      "Uma chamada, sem apresentação comercial. Percebemos o negócio, o que já existe e o que precisa mesmo de acontecer.",
  },
  {
    n: "02",
    title: "direção",
    time: "semana 1",
    copy:
      "Proposta de direção visual e estrutura. Uma direção, argumentada — não três opções para escolher às cegas.",
  },
  {
    n: "03",
    title: "construção",
    time: "semanas 2–4",
    copy:
      "Desenho e código em paralelo, com um link sempre atualizado. Vê o progresso todos os dias, não numa apresentação no fim.",
  },
  {
    n: "04",
    title: "lançamento",
    time: "semana 4–5",
    copy:
      "Domínio, medição, formação e entrega. Fica com tudo — ficheiros, acessos e um site que sabe gerir.",
  },
];

export function Method() {
  const reduce = useReducedMotion();

  return (
    <section id="metodo" className="relative z-10 py-24 md:py-36">
      <div className="shell">
        <Reveal>
          <SectionLabel index="03">como trabalhamos</SectionLabel>
        </Reveal>
        <div className="mt-7 grid gap-8 md:grid-cols-[1.2fr_1fr] md:items-end md:gap-16">
          <Reveal delay={0.06}>
            <h2 className="display h2 max-w-[16ch] text-chalk">
              um processo curto, <span className="em-thin">de propósito.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="lede text-ash">
              Quatro etapas. Sem fases intermédias inventadas para justificar tempo, e sem
              reuniões que podiam ter sido uma mensagem.
            </p>
          </Reveal>
        </div>

        <div className="relative mt-16 md:mt-24">
          <div className="grid border-t border-hair md:grid-cols-4">
            {STEPS.map((s, i) => (
              <Reveal
                key={s.n}
                delay={i * 0.07}
                className={[
                  "border-b border-hair py-9 md:border-b-0 md:py-12",
                  i < 3 ? "md:border-r" : "",
                ].join(" ")}
              >
                <div className={colPad(i, STEPS.length)}>
                  <div className="flex items-baseline justify-between gap-4">
                    <p className="mono text-chalk/45">{s.n}</p>
                    <p className="mono text-ash-2">{s.time}</p>
                  </div>
                  <h3 className="display mt-6 text-[1.75rem] leading-none text-chalk">
                    {s.title}
                  </h3>
                  <p className="body mt-4 max-w-[34ch] text-ash">{s.copy}</p>
                </div>
              </Reveal>
            ))}
          </div>

          {/* the return: 04 arcs back under the row to 01, and the mark rides it */}
          <div className="relative hidden h-24 md:block" aria-hidden="true">
            {/* wiped right-to-left rather than drawn by pathLength: the viewBox is
                deliberately non-uniform, which makes dash-based drawing fragment */}
            <motion.div
              className="h-full w-full"
              initial={reduce ? false : { clipPath: "inset(0 0 0 87%)", opacity: 0 }}
              whileInView={{ clipPath: "inset(0 0 0 0%)", opacity: 0.75 }}
              viewport={{ once: true, margin: "-15%" }}
              transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <svg
                className="h-full w-full"
                viewBox="0 0 100 24"
                preserveAspectRatio="none"
              >
                <path
                  d="M 87.5 0 C 87.5 20, 60 22, 50 22 C 40 22, 12.5 20, 12.5 0"
                  fill="none"
                  stroke="var(--color-chalk)"
                  strokeWidth="1.25"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            </motion.div>
            <motion.span
              className="absolute top-0 left-[12.5%] -translate-x-1/2 -translate-y-1/2"
              initial={reduce ? false : { opacity: 0, rotate: 40 }}
              whileInView={{ opacity: 1, rotate: -34 }}
              viewport={{ once: true, margin: "-15%" }}
              transition={{ duration: 0.8, delay: 1.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <BoomerangMark width={30} className="text-chalk/45" />
            </motion.span>
          </div>

          <Reveal>
            <div className="flex flex-wrap items-center gap-3 border-t border-hair pt-8 max-md:mt-10">
              <BoomerangMark width={22} className="rotate-[128deg] text-chalk/45 md:hidden" />
              <p className="mono text-ash">
                e voltamos. quatro semanas depois do lançamento, com números.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/* WORK — light break in the page                                      */
/* ================================================================== */

const WORK = [
  {
    n: "01",
    client: "clínica vega",
    sector: "saúde & estética",
    scope: "identidade visual + website",
    year: "2025",
    note: "Marcação online, três especialidades, tempo de carregamento abaixo de um segundo.",
  },
  {
    n: "02",
    client: "atlante",
    sector: "imobiliário",
    scope: "website + sistema de listagens",
    year: "2025",
    note: "Catálogo de imóveis gerido pelo próprio cliente, sem depender de ninguém para publicar.",
  },
  {
    n: "03",
    client: "casa nove",
    sector: "arquitetura de interiores",
    scope: "identidade visual",
    year: "2024",
    note: "Sistema tipográfico e regras de aplicação para impressão, sinalética e digital.",
  },
];

function WorkTile({ index }: { index: number }) {
  // Abstract, generated compositions — no invented screenshots.
  const patterns = [
    <g key="a">
      <circle cx="50" cy="50" r="27" fill="none" stroke="currentColor" strokeWidth="0.6" />
      <circle cx="50" cy="50" r="16" fill="currentColor" opacity="0.9" />
      <path d="M8 78 H92" stroke="currentColor" strokeWidth="0.6" />
    </g>,
    <g key="b">
      {Array.from({ length: 7 }).map((_, i) => (
        <rect
          key={i}
          x={12 + i * 11}
          y={70 - i * 7}
          width="7"
          height={i * 7 + 12}
          fill="currentColor"
          opacity={0.25 + i * 0.11}
        />
      ))}
    </g>,
    <g key="c">
      <path d="M18 82 L50 18 L82 82" fill="none" stroke="currentColor" strokeWidth="0.6" />
      <path d="M32 82 L50 46 L68 82 Z" fill="currentColor" opacity="0.9" />
    </g>,
  ];
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full text-ink" aria-hidden="true">
      {patterns[index % patterns.length]}
    </svg>
  );
}

export function Work() {
  return (
    <section id="trabalho" className="relative z-10 bg-paper py-24 text-ink md:py-36">
      <div className="shell">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Reveal>
              <SectionLabel index="04" tone="light">
                trabalho
              </SectionLabel>
            </Reveal>
            <Reveal delay={0.06}>
              <h2 className="display h2 mt-7 max-w-[16ch] text-ink">
                poucos projetos. <span className="em-thin text-graphite">todos inteiros.</span>
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.12}>
            <p className="body max-w-[30ch] text-graphite">
              Aceitamos dois a três projetos por trimestre. É o que cabe sem baixar a
              qualidade.
            </p>
          </Reveal>
        </div>

        <div className="mt-16 grid border-t border-ink/15 md:mt-24 md:grid-cols-3">
          {WORK.map((w, i) => (
            <Reveal
              key={w.client}
              delay={i * 0.08}
              className={[
                "group border-b border-ink/15 py-10",
                i < 2 ? "md:border-r md:border-ink/15" : "",
              ].join(" ")}
            >
              <div className={colPad(i, WORK.length)}>
                <div className="mb-8 h-[14rem] overflow-hidden bg-paper-2 p-10 md:h-[16rem] transition-colors duration-500 group-hover:bg-ink group-hover:text-paper">
                  <div className="h-full w-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06] group-hover:text-paper">
                    <WorkTile index={i} />
                  </div>
                </div>
                <div className="flex items-baseline justify-between gap-4">
                  <p className="mono text-graphite">{w.n}</p>
                  <p className="mono text-graphite">{w.year}</p>
                </div>
                <h3 className="display mt-4 text-[1.75rem] leading-none text-ink">
                  {w.client}
                </h3>
                <p className="mono mt-3 text-ink/55">{w.scope}</p>
                <p className="body mt-4 max-w-[32ch] text-graphite">{w.note}</p>
                <p className="mono mt-5 text-graphite/70">{w.sector}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <p className="mono mt-10 text-graphite/70">
            <span className="text-ink/40">*</span> casos ilustrativos &mdash; a substituir
            por trabalho real
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ================================================================== */
/* PRICING                                                             */
/* ================================================================== */

const PLANS = [
  {
    tag: "essencial",
    price: "desde 1.900 €",
    copy:
      "Uma página, feita para converter. Ideal para quem precisa de estar online bem, e depressa.",
    items: ["landing page à medida", "copy da página", "medição e formulários", "2 semanas"],
    variant: "dark" as const,
  },
  {
    tag: "completo / mais escolhido",
    price: "desde 3.900 €",
    copy:
      "Site institucional completo mais a base da identidade visual. O pacote que resolve a marca e a presença de uma vez.",
    items: [
      "5 a 8 páginas",
      "identidade base",
      "cms para editar sozinho",
      "seo técnico",
      "4 a 5 semanas",
    ],
    variant: "light" as const,
  },
  {
    tag: "marca completa",
    price: "sob proposta",
    copy:
      "Identidade, website, conteúdo e continuidade. Para quem está a construir a marca do zero ou a reposicionar-se.",
    items: [
      "identidade completa + manual",
      "website sem limite de páginas",
      "conteúdo e direção de imagem",
      "acompanhamento trimestral",
    ],
    variant: "dark" as const,
  },
];

export function Pricing() {
  return (
    <section id="investimento" className="relative z-10 py-24 md:py-36">
      <div className="shell">
        <Reveal>
          <SectionLabel index="05">investimento</SectionLabel>
        </Reveal>
        <div className="mt-7 grid gap-8 md:grid-cols-[1.2fr_1fr] md:items-end md:gap-16">
          <Reveal delay={0.06}>
            <h2 className="display h2 max-w-[15ch] text-chalk">
              preço fechado. <span className="em-thin">antes de começar.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="lede text-ash">
              Sabe o valor final antes da primeira linha de código. Sem horas extra no fim,
              sem surpresas na fatura.
            </p>
          </Reveal>
        </div>

        <div className="mt-16 grid gap-px bg-hair md:mt-24 md:grid-cols-3">
          {PLANS.map((p, i) => (
            <Reveal key={p.tag} delay={i * 0.08}>
              <div
                className={[
                  "flex h-full flex-col p-8 md:p-10",
                  p.variant === "light" ? "bg-paper text-ink" : "bg-ink-1 text-chalk",
                ].join(" ")}
              >
                <p
                  className={
                    p.variant === "light" ? "mono text-graphite" : "mono text-ash-2"
                  }
                >
                  {p.tag}
                </p>
                <p className="display mt-6 text-[2rem] leading-none md:text-[2.4rem]">
                  {p.price}
                </p>
                <p
                  className={[
                    "body mt-5 max-w-[34ch]",
                    p.variant === "light" ? "text-graphite" : "text-ash",
                  ].join(" ")}
                >
                  {p.copy}
                </p>
                <ul className="mt-8 space-y-3">
                  {p.items.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <BoomerangMark
                        width={12}
                        className={[
                          "mt-[0.3rem] shrink-0 -rotate-90",
                          p.variant === "light" ? "text-ink/45" : "text-chalk/45",
                        ].join(" ")}
                      />
                      <span
                        className={[
                          "body",
                          p.variant === "light" ? "text-ink" : "text-chalk",
                        ].join(" ")}
                      >
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-10">
                  <Button variant={p.variant === "light" ? "invert" : "ghost"}>
                    {p.variant === "light" ? "começar por aqui" : "pedir proposta"}
                  </Button>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <p className="mono mt-10 text-ash-2">
            <span className="text-chalk/45">*</span> valores indicativos, a confirmar &mdash;
            iva não incluído
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ================================================================== */
/* STUDIO                                                              */
/* ================================================================== */

const FIGURES = [
  { fig: "2", label: "pessoas", note: "e nunca mais do que isso num projeto" },
  { fig: "24h", label: "resposta", note: "em dias úteis, sempre por quem trabalha consigo" },
  { fig: "100%", label: "à medida", note: "zero templates comprados, zero atalhos" },
];

export function Studio() {
  return (
    <section id="estudio" className="relative z-10 bg-ink-1/40 py-24 md:py-36">
      <div className="shell">
        <Reveal>
          <SectionLabel index="06">estúdio</SectionLabel>
        </Reveal>

        <div className="mt-7 grid gap-10 md:grid-cols-[1.1fr_1fr] md:gap-20">
          <Reveal delay={0.06}>
            <h2 className="display h2 max-w-[14ch] text-chalk">
              pequenos por <span className="hollow">decisão.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <div className="space-y-6">
              <p className="lede text-ash">
                A nevima é um estúdio de duas pessoas: uma que desenha, uma que constrói, e
                as duas que pensam a marca. Não temos departamento comercial nem gestores
                de conta, porque não precisamos de intermediários entre si e o trabalho.
              </p>
              <p className="lede text-ash">
                Trabalhamos sobretudo com clínicas, consultórios e agentes imobiliários —
                negócios com padrões exigentes e sem equipa técnica interna. Somos essa
                equipa, sem passar a fazer parte da folha de salários.
              </p>
            </div>
          </Reveal>
        </div>

        <div className="mt-16 grid border-t border-hair md:mt-24 md:grid-cols-3">
          {FIGURES.map((f, i) => (
            <Reveal
              key={f.label}
              delay={i * 0.08}
              className={[
                "border-b border-hair py-10 md:border-b-0 md:py-14",
                i < 2 ? "md:border-r" : "",
              ].join(" ")}
            >
              <div className={colPad(i, FIGURES.length)}>
                <p className="display text-[3.25rem] leading-none text-chalk md:text-[4rem]">
                  {f.fig}
                </p>
                <p className="mono mt-5 text-chalk">{f.label}</p>
                <p className="body mt-3 max-w-[28ch] text-ash-2">{f.note}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/* FAQ                                                                 */
/* ================================================================== */

const FAQ = [
  {
    q: "duas pessoas chegam mesmo para o meu projeto?",
    a: "Para um site institucional, uma landing page ou uma identidade completa, chegam e sobram. O que fazemos é recusar projetos que não caibam bem — preferimos dizer que não do que entregar a meio gás. Se o projeto exigir mais braços, trazemos especialistas de confiança e continuamos a ser o seu único ponto de contacto.",
  },
  {
    q: "quanto tempo demora?",
    a: "Entre três e cinco semanas para a maioria dos projetos, contadas a partir do momento em que temos conteúdos e uma direção aprovada. A data de lançamento é fixada na proposta, não estimada por alto.",
  },
  {
    q: "usam templates ou ferramentas de ia?",
    a: "Templates, não. Ferramentas modernas — incluindo IA — sim, e sem pudor: é parte do que nos permite entregar em três semanas o que noutro sítio demora três meses. O desenho, as decisões e o código final são nossos e passam por revisão humana.",
  },
  {
    q: "depois do lançamento fico sozinho?",
    a: "Não. Fica com acesso a tudo (domínio, código, ficheiros) e com formação para editar o que precisar. Voltamos quatro semanas depois com os primeiros números e, se quiser, ficamos em acompanhamento contínuo.",
  },
  {
    q: "já tenho site. vale a pena refazer?",
    a: "Depende. Na primeira conversa dizemos-lhe honestamente se o problema é o site, o conteúdo ou o posicionamento — e se a resposta for que não vale a pena mexer, dizemo-lo na mesma. Não vendemos trabalho que não vá dar retorno.",
  },
  {
    q: "trabalham fora de portugal?",
    a: "Sim. Trabalhamos remotamente e já é assim que funcionamos com clientes noutras cidades. Em português, inglês ou espanhol.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="perguntas" className="relative z-10 py-24 md:py-36">
      <div className="shell">
        <Reveal>
          <SectionLabel index="08">perguntas</SectionLabel>
        </Reveal>
        <Reveal delay={0.06}>
          <h2 className="display h2 mt-7 max-w-[18ch] text-chalk">
            o que costumam <span className="em-thin">perguntar-nos.</span>
          </h2>
        </Reveal>

        <div className="mt-14 border-t border-hair md:mt-20">
          {FAQ.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={item.q} className="border-b border-hair">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="group flex w-full items-start gap-6 py-7 text-left"
                >
                  <span className="mono pt-2 text-ash-2">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={[
                      "display flex-1 text-[1.25rem] leading-tight transition-colors duration-300 md:text-[1.6rem]",
                      isOpen ? "text-chalk" : "text-ash group-hover:text-chalk",
                    ].join(" ")}
                  >
                    {item.q}
                  </span>
                  <BoomerangMark
                    width={20}
                    className={[
                      "mt-2 shrink-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                      isOpen ? "rotate-0 text-chalk/45" : "rotate-180 text-ash-2",
                    ].join(" ")}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="body"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="body max-w-[62ch] pb-9 pl-[calc(1.5rem+2.4ch)] text-ash">
                        {item.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/* CONTACT                                                             */
/* ================================================================== */

export function Contact() {
  return (
    <section
      id="contacto"
      className="relative z-10 overflow-hidden border-t border-hair py-24 md:py-36"
    >
      <div className="shell relative">
        <Reveal>
          <div className="flex items-center gap-3">
            <BoomerangMark width={24} className="spin-slow text-chalk/45" />
            <p className="mono text-ash">próximo passo</p>
          </div>
        </Reveal>

        <Reveal delay={0.06}>
          <h2 className="display mt-8 max-w-[13ch] text-[clamp(2.6rem,8vw,7rem)] text-chalk">
            conte-nos o que <span className="hollow [--stroke:2px]">precisa.</span>
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-10 border-t border-hair pt-10 md:grid-cols-[1fr_auto] md:items-end md:gap-16">
          <Reveal delay={0.1}>
            <p className="lede max-w-[46ch] text-ash">
              Uma chamada de 45 minutos, sem compromisso e sem apresentação comercial. Se
              não formos a escolha certa, dizemos-lho na mesma chamada.
            </p>
          </Reveal>
          <Reveal delay={0.16}>
            <div className="flex flex-wrap gap-3">
              <Button href="mailto:ola@nevima.pt">ola@nevima.pt</Button>
              <Button href="#servicos" variant="ghost">
                ver serviços
              </Button>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.2}>
          <ul className="mt-12 flex flex-wrap gap-x-8 gap-y-3">
            {["resposta em 24h úteis", "orçamento fixo", "sem intermediários"].map((t) => (
              <li key={t} className="mono flex items-center gap-2 text-ash-2">
                <span className="text-chalk/45">/</span>
                {t}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
