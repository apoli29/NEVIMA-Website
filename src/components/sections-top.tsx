"use client";

import { motion, useReducedMotion } from "motion/react";
import { HeroThrow, ScrollBoomerang, BoomerangMark } from "./boomerang";
import { Button, Marquee, Reveal, SectionLabel, colPad } from "./primitives";

/* ================================================================== */
/* HERO                                                                */
/* ================================================================== */

export function Hero() {
  const reduce = useReducedMotion();
  const rise = (i: number) => ({
    initial: reduce ? false : { y: "108%" },
    animate: { y: "0%" },
    transition: {
      duration: 1.05,
      delay: 0.12 + i * 0.09,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  });

  return (
    <section id="top" className="relative isolate overflow-hidden">
      {/* the throw happens across the whole hero, behind the type */}
      <HeroThrow className="pointer-events-none absolute inset-0 z-0" />

      <div className="shell relative z-10 flex min-h-[100svh] flex-col justify-end pt-32 pb-14 md:pb-20">
        <motion.p
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, delay: 0.05 }}
          className="mono mb-10 flex items-center gap-3 text-ash md:mb-14"
        >
          <BoomerangMark width={20} className="text-chalk/45" />
          duas pessoas <span className="text-chalk/45">/</span> alcance de agência
        </motion.p>

        <h1 className="display h1 max-w-[15ch] text-chalk">
          <span className="block overflow-hidden">
            <motion.span className="block" {...rise(0)}>
              menos estrutura.
            </motion.span>
          </span>
          <span className="block overflow-hidden">
            <motion.span className="block" {...rise(1)}>
              mais <span className="hollow [--stroke:2px]">alcance.</span>
            </motion.span>
          </span>
        </h1>

        <div className="mt-12 grid gap-10 border-t border-hair pt-10 md:mt-16 md:grid-cols-[1fr_auto] md:items-end md:gap-16">
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.55 }}
            className="lede max-w-[52ch] text-ash"
          >
            Somos duas pessoas. Com as ferramentas e a experiência certas, entregamos
            websites e identidades visuais ao nível de agências muito maiores &mdash; sem
            as camadas, a burocracia e a lentidão que costumam vir com esse tamanho.
          </motion.p>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.68 }}
            className="flex flex-wrap gap-3"
          >
            <Button href="#contacto">falar connosco</Button>
            <Button href="#metodo" variant="ghost">
              ver o método
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/* RIBBON + PROOF                                                      */
/* ================================================================== */

const DISCIPLINES = [
  "websites",
  "identidade visual",
  "design de marca",
  "art direction",
  "sistemas de design",
  "copy & conteúdo",
  "performance",
];

const PROOF = [
  { figure: "2", label: "pessoas no projeto", note: "do primeiro email ao lançamento" },
  { figure: "0", label: "intermediários", note: "fala sempre com quem constrói" },
  { figure: "3–5", label: "semanas", note: "do arranque ao site no ar" },
  { figure: "1", label: "orçamento fixo", note: "sem horas a somar no fim" },
];

export function Ribbon() {
  return (
    <div className="relative z-10">
      <Marquee items={DISCIPLINES} />
    </div>
  );
}

export function Proof() {
  return (
    <section className="relative z-10">
      <div className="shell">
        <div className="grid grid-cols-2 md:grid-cols-4">
          {PROOF.map((item, i) => (
            <Reveal
              key={item.label}
              delay={i * 0.07}
              className={[
                "border-b border-hair py-10 md:py-14",
                i % 2 === 0 ? "border-r pr-5 md:pr-0" : "pl-5 md:pl-0",
                i < 3 ? "md:border-r" : "md:border-r-0",
              ].join(" ")}
            >
              <div className={colPad(i, PROOF.length)}>
                <p className="display text-[2.75rem] leading-none text-chalk md:text-[3.5rem]">
                  {item.figure}
                </p>
                <p className="mono mt-4 text-chalk">{item.label}</p>
                <p className="body mt-2 text-ash-2">{item.note}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/* SERVICES                                                            */
/* ================================================================== */

const SERVICES = [
  {
    n: "01",
    title: "websites",
    copy:
      "Sites institucionais, landing pages e páginas de conversão. Desenhados de raiz e construídos à medida — sem templates comprados, sem construtores genéricos.",
    tags: ["next.js", "design à medida", "seo técnico", "cms"],
  },
  {
    n: "02",
    title: "identidade visual",
    copy:
      "Logótipo, sistema tipográfico, paleta e regras de aplicação. Uma identidade que se comporta igualmente bem no ecrã, no papel e num anúncio de quatro segundos.",
    tags: ["logótipo", "sistema", "manual", "aplicações"],
  },
  {
    n: "03",
    title: "marca & conteúdo",
    copy:
      "Posicionamento, tom de voz, copy das páginas e direção de imagem. A marca escrita, não só desenhada — porque metade da confiança vive nas palavras.",
    tags: ["posicionamento", "copy", "direção de arte"],
  },
  {
    n: "04",
    title: "continuidade",
    copy:
      "Depois do lançamento: medição, iteração e manutenção. Um site não é um projeto que fecha, é um ativo que devia melhorar de trimestre para trimestre.",
    tags: ["analytics", "iteração", "suporte"],
  },
];

export function Services() {
  return (
    <section id="servicos" className="relative z-10 py-24 md:py-36">
      <div className="shell">
        <Reveal>
          <SectionLabel index="01">o que fazemos</SectionLabel>
        </Reveal>
        <Reveal delay={0.06}>
          <h2 className="display h2 mt-7 max-w-[18ch] text-chalk">
            duas disciplinas. feitas <span className="em-thin">inteiras.</span>
          </h2>
        </Reveal>
        <Reveal delay={0.12}>
          <p className="lede mt-7 max-w-[54ch] text-ash">
            Não fazemos tudo. Fazemos poucas coisas de ponta a ponta — e é exatamente
            isso que nos deixa fazê-las bem.
          </p>
        </Reveal>

        <div className="mt-16 border-t border-hair md:mt-24">
          {SERVICES.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.05}>
              <div className="group relative overflow-hidden border-b border-hair">
                <span className="absolute inset-0 z-0 origin-bottom scale-y-0 bg-paper transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-y-100" />
                <div className="relative z-10 grid gap-6 px-1 py-10 md:grid-cols-[6rem_1fr_1.1fr] md:items-start md:gap-10 md:py-14 md:px-7">
                  <p className="mono pt-2 text-ash-2 transition-colors duration-500 group-hover:text-graphite">
                    {s.n}
                  </p>
                  <h3 className="display text-[2rem] leading-[0.95] text-chalk transition-colors duration-500 group-hover:text-ink md:text-[2.75rem]">
                    {s.title}
                  </h3>
                  <div>
                    <p className="body max-w-[46ch] text-ash transition-colors duration-500 group-hover:text-graphite">
                      {s.copy}
                    </p>
                    <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
                      {s.tags.map((t) => (
                        <li
                          key={t}
                          className="mono text-ash-2 transition-colors duration-500 group-hover:text-graphite"
                        >
                          {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/* LEVERAGE — the boomerang argument                                   */
/* ================================================================== */

const COMPARISON = [
  { row: "o briefing passa por", them: "4 a 6 pessoas", us: "2" },
  { row: "quem responde ao email", them: "um gestor de conta", us: "quem está a construir" },
  { row: "mudar de direção", them: "três reuniões, duas semanas", us: "a mesma tarde" },
  { row: "o que está a pagar", them: "equipa, escritório, estrutura", us: "o trabalho" },
  { row: "um ajuste a meio", them: "pedido formal de alteração", us: "uma mensagem" },
];

export function Leverage() {
  return (
    <section id="leverage" className="relative z-10 overflow-hidden py-24 md:py-36">
      <div className="shell relative z-10">
        <div className="grid items-center gap-12 md:grid-cols-[1fr_0.85fr] md:gap-16">
          <div>
            <Reveal>
              <SectionLabel index="02">porquê duas pessoas</SectionLabel>
            </Reveal>

            <Reveal delay={0.06}>
              <h2 className="display h2 mt-7 max-w-[16ch] text-chalk">
                atira-se pouco.{" "}
                <span className="hollow">volta muito.</span>
              </h2>
            </Reveal>

            <Reveal delay={0.12}>
              <p className="lede mt-8 max-w-[46ch] text-ash">
                Chamamos-lhe alavancagem. Uma equipa pequena com as ferramentas certas
                cobre o mesmo terreno que uma grande — só que sem gastar metade da energia
                a coordenar-se a si própria.
              </p>
            </Reveal>
          </div>

          {/* the mark gets its own room here instead of floating over the copy */}
          <Reveal delay={0.18} className="relative">
            <ScrollBoomerang className="mx-auto w-[78%] max-w-[26rem] md:w-full" />
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <p className="lede mt-14 max-w-[62ch] text-ash md:mt-20">
            &laquo;Less is more&raquo; não é desculpa para entregar menos. É uma decisão
            estrutural: menos gente entre a ideia e a execução significa menos atrito,
            menos ruído e menos tempo perdido pelo caminho.
          </p>
        </Reveal>

        {/* comparison table */}
        <div className="mt-16 border-t border-hair md:mt-24">
          <div className="grid grid-cols-2 gap-4 border-b border-hair py-5 md:grid-cols-[1.1fr_1fr_1fr]">
            <p className="mono hidden text-ash-2 md:block">critério</p>
            <p className="mono text-ash-2">agência de 30 pessoas</p>
            <p className="mono text-chalk">nevima</p>
          </div>

          {COMPARISON.map((c, i) => (
            <Reveal key={c.row} delay={i * 0.04}>
              <div className="grid grid-cols-2 gap-4 border-b border-hair py-6 md:grid-cols-[1.1fr_1fr_1fr] md:items-baseline">
                <p className="body col-span-2 text-ash md:col-span-1">{c.row}</p>
                <p className="body text-ash-2 line-through decoration-ash-2">
                  {c.them}
                </p>
                <p className="body text-chalk">{c.us}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1}>
          <p className="mono mt-10 text-ash">
            <span className="text-chalk/45">*</span> menos gente não é menos capacidade. é
            menos atrito.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
