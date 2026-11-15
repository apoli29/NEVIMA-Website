"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { SlideIn } from "./enter";
import { FloatingNav } from "./floating-nav";
import { Footer } from "./footer";
import { ProposalHost } from "./proposal-host";
import { WorkTogether } from "./work-together";
import { SbsIncluded, SbsLevels, SbsPersonal } from "./sbs-service";
import { useSeen } from "./use-seen";
import { useT } from "@/lib/use-lang";
import { Funnel_Display, IBM_Plex_Mono, Plus_Jakarta_Sans } from "next/font/google";

/* Pilar's own type, loaded for this page only and chosen from its
   identity, not from any reference: Plus Jakarta Sans is the brand's
   (its guide and signature); Funnel Display, for the display lines, has
   the symbol's flat geometry (near-square counters, terminals cut
   straight); IBM Plex Mono sets the small labels. */
const pilarDisplay = Funnel_Display({ subsets: ["latin"], variable: "--f-pilar-display", display: "swap" });
const pilarSans = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--f-pilar-sans", display: "swap" });
const pilarMono = IBM_Plex_Mono({ subsets: ["latin"], weight: "500", variable: "--f-pilar-mono", display: "swap" });

/* ==================================================================
   Side by side

   The same business, built twice. The comparison on the home page says
   the difference in words; this page shows it. Two websites for one
   invented insurance broker stand on the same black surface: one put together
   from an off-the-shelf template, one of ours. They start in the same
   frame and go down the page at the same moments, so the only thing
   that differs is what each of them does with that time.

   Nothing here is a picture of a website. Both are real pages, laid out
   at 1200px and scaled into their plate, so the type inside is type and
   not a grey bar — which is also the argument.

   The loop is CSS, one length (--sbs-loop) shared by every keyframe on
   both sides, and the two sides are given their classes in the same
   render, so they start in the same frame and never drift apart. It is
   held while it is off the screen (.sbs-run is in offscreen-pause.tsx)
   and never runs at all for anyone who has asked for less motion: there
   both pages are simply shown as they end up, the template's mess
   included.

   What the left side does with its twelve seconds is what a template
   does: a loading bar that will not finish, a header that arrives in
   jolts, a banner image that lands late and shoves the whole page down,
   a cookie wall, a carousel nobody asked for, and a badge for the shop
   it was bought from. The right side arrives once, in one move, and
   then holds still.

   The broker is invented and both pages are demonstrations: it says so
   under them, because this page is an argument about honesty.
   ================================================================== */

/** The plate measured when it changes size, never while the loop runs:
    the scale is written on it as a custom property and the browser is
    left to do the rest. The page's own width is read off the page (a
    narrow desktop, and narrower still on a phone, see globals.css), so
    the width is said in one place only. */
function useFit() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fit = () => {
      const page = el.querySelector<HTMLElement>(".sbs-mini");
      const w = el.clientWidth;
      const own = page?.offsetWidth;
      if (w && own) el.style.setProperty("--sbs-k", String(w / own));
    };
    fit();
    const size = new ResizeObserver(fit);
    size.observe(el);
    window.addEventListener("resize", fit);
    return () => {
      size.disconnect();
      window.removeEventListener("resize", fit);
    };
  }, []);

  return ref;
}

/** One plate: the label over it, the address line a browser would carry,
    and the page itself, which is shown to a screen reader as the one
    sentence it is worth. */
function Plate({
  label,
  quiet,
  address,
  says,
  running,
  children,
}: {
  label: string;
  /** the template's label is held back, so ours reads as the answer */
  quiet?: boolean;
  address: string;
  says: string;
  running: boolean;
  children: React.ReactNode;
}) {
  const screen = useFit();

  return (
    <figure className="sbs-plate">
      <figcaption className="sbs-cap">
        <span className="mono-label" data-quiet={quiet ? "" : undefined}>
          {label}
        </span>
      </figcaption>

      <div className="sbs-sheet">
        <div className="sbs-bar mono-label" aria-hidden="true">
          {address}
        </div>
        <div ref={screen} className="sbs-screen">
          <p className="sr-only">{says}</p>
          <div aria-hidden="true" className={running ? "sbs-run" : undefined}>
            {children}
          </div>
        </div>
      </div>
    </figure>
  );
}

/* ---- the website bought off the shelf ---------------------------- */

function Template({ t }: { t: ReturnType<typeof useT> }) {
  const menu = [
    t("Home", "Início"),
    t("About Us", "Sobre Nós"),
    t("Insurance", "Seguros"),
    t("Simulator", "Simulador"),
    t("Blog", "Blog"),
    t("FAQ", "FAQ"),
    t("Contact", "Contactos"),
  ];
  const cards = [
    t("Car Insurance", "Seguro Automóvel"),
    t("Home Insurance", "Seguro Casa"),
    t("Health Insurance", "Seguro Saúde"),
  ];

  return (
    <>
      {/* The bar that never gets there. */}
      <span className="sbs-load" />

      <div className="sbs-mini sbs-t-page">
        <div className="sbs-t-top">
          <span className="sbs-t-brand">{t("PILAR INSURANCE", "PILAR SEGUROS")}</span>
          <nav className="sbs-t-nav">
            {menu.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </nav>
          <span className="sbs-t-cta">{t("CALL NOW", "LIGUE JÁ")}</span>
        </div>

        {/* The banner that lands late. Everything under it is shoved down
            the moment it does, which is the whole point of it. */}
        <div className="sbs-t-banner">
          {/* The umbrella every insurance template ships with. */}
          <svg viewBox="0 0 190 120" className="sbs-t-stock" fill="none" stroke="currentColor" strokeWidth="5">
            <path d="M35 64a60 52 0 0 1 120 0c-10-8-20-8-30 0-10-8-20-8-30 0-10-8-20-8-30 0-10-8-20-8-30 0Z" />
            <path d="M95 64v34c0 10 14 10 14 0" />
            <path d="M95 12v-4" />
          </svg>
          <span className="sbs-t-dots">
            <i className="on" />
            <i />
            <i />
            <i />
          </span>
        </div>

        <div className="sbs-t-copy">
          <h3>{t("WELCOME TO OUR WEBSITE", "BEM-VINDO AO NOSSO WEBSITE")}</h3>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.</p>
          <span className="sbs-t-b1">{t("LEARN MORE", "SABER MAIS")}</span>
          <span className="sbs-t-b2">{t("CONTACT US", "CONTACTE-NOS")}</span>
        </div>

        <div className="sbs-t-cards">
          {cards.map((head) => (
            <div key={head} className="sbs-t-card">
              <span className="sbs-t-ph" />
              <h4>{head}</h4>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod tempor.</p>
              <span className="sbs-t-more">{t("Read more »", "Ler mais »")}</span>
            </div>
          ))}
        </div>

        <div className="sbs-t-band">
          <h4>{t("MEET OUR TEAM", "CONHEÇA A EQUIPA")}</h4>
          <div className="sbs-t-faces">
            <i />
            <i />
            <i />
            <i />
          </div>
        </div>

        <div className="sbs-t-quotes">
          <h4>{t("WHAT OUR CLIENTS SAY", "O QUE DIZEM OS CLIENTES")}</h4>
          <div className="sbs-t-quoterow">
            {[0, 1, 2].map((i) => (
              <div key={i} className="sbs-t-quote">
                <span className="sbs-t-stars">{"★★★★★"}</span>
                <p>&ldquo;Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.&rdquo;</p>
                <span className="sbs-t-who">{t("Client Name", "Nome do Cliente")}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="sbs-t-gallery">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <span key={i} />
          ))}
        </div>

        <div className="sbs-t-contact">
          <div>
            <h4>{t("CONTACT US TODAY", "CONTACTE-NOS HOJE")}</h4>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod tempor incididunt.</p>
            <span className="sbs-t-b1">{t("SEND MESSAGE", "ENVIAR MENSAGEM")}</span>
          </div>
          <span className="sbs-t-map" />
        </div>

        <div className="sbs-t-foot">
          <span>© 2026 {t("Pilar Insurance", "Pilar Seguros")}. {t("All Rights Reserved.", "Todos os Direitos Reservados.")}</span>
          <span className="sbs-t-badge">Powered by ThemeMarket</span>
        </div>
      </div>

      {/* The wall that comes up over all of it and stays. */}
      <div className="sbs-cookie">
        <span>
          {t(
            "This website uses cookies to improve your experience. By continuing you agree to our cookie policy.",
            "Este website utiliza cookies para melhorar a experiência. Ao continuar, concorda com a política de cookies.",
          )}
        </span>
        <span className="sbs-cookie-ok">{t("ACCEPT ALL", "ACEITAR TUDO")}</span>
        <span className="sbs-cookie-no">{t("Settings", "Definições")}</span>
      </div>
    </>
  );
}

/* ---- the website we would have made ------------------------------ */

/** Pilar's symbol, from its brand guide: the stem, the cut of 8 units
    that is the broker's place between client and insurer, and the empty
    core, which never takes a colour. */
function PilarSymbol({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="currentColor" aria-hidden="true">
      <rect width="30" height="100" rx="8" />
      <path
        fillRule="evenodd"
        d="M44 0H76A24 24 0 0 1 100 24V42A24 24 0 0 1 76 66H44A6 6 0 0 1 38 60V6A6 6 0 0 1 44 0Z M59 23H79V43H59Z"
      />
    </svg>
  );
}

/** The horizontal signature: the name is never translated, only the
    descriptor is ("Pilar Seguros" on the Portuguese page, "Pilar
    Insurance" on the English one), set as the guide sets it. */
function PilarLogo({ t, className }: { t: ReturnType<typeof useT>; className?: string }) {
  return (
    <span className={`sbs-p-logo ${className ?? ""}`}>
      <PilarSymbol />
      <span>{t("Pilar Insurance", "Pilar Seguros")}</span>
    </span>
  );
}

/** The symbol again, drawn on its own construction grid: the guide sets
    it on 100 units, and here every 5 units is one cell, lit where the
    symbol is and marked with a small cross where it is not. The cut and
    the core stay empty, as the guide asks. Worked out once, at load. */
const PIXEL_CELLS = (() => {
  const inside = (x: number, y: number) => {
    if (x >= 0 && x <= 30 && y >= 0 && y <= 100) return true;
    if (x < 38 || x > 100 || y < 0 || y > 66) return false;
    if (x >= 59 && x <= 79 && y >= 23 && y <= 43) return false;
    if (x > 76 && y < 24 && Math.hypot(x - 76, y - 24) > 24) return false;
    if (x > 76 && y > 42 && Math.hypot(x - 76, y - 42) > 24) return false;
    return true;
  };
  const on: string[] = [];
  const off: string[] = [];
  const n = 30;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const x = i * 10;
      const y = j * 10;
      if (inside(-25 + (i + 0.5) * 5, -25 + (j + 0.5) * 5)) on.push(`M${x + 1} ${y + 1}h8v8h-8Z`);
      else off.push(`M${x + 3} ${y + 3}l4 4M${x + 7} ${y + 3}l-4 4`);
    }
  }
  return { on: on.join(""), off: off.join("") };
})();

function PilarPixels() {
  return (
    <svg viewBox="0 0 300 300" preserveAspectRatio="xMidYMid slice" className="sbs-p-pixels" aria-hidden="true">
      <path d={PIXEL_CELLS.off} stroke="#434655" strokeWidth="1" fill="none" />
      <path d={PIXEL_CELLS.on} fill="#a8aabc" />
    </svg>
  );
}

/* Our side, in Pilar's own colours and type (Funnel Display for the
   display lines, Plus Jakarta Sans, the brand's, for the rest, IBM Plex
   Mono for the small labels). The hero and the column of very large
   words follow Wealthsimple's home page; the claims section follows
   Area17's (a statement on white, then a photograph across the width
   with a stacked list on it, the first line lit); the manifesto and the
   close follow the AiiD 2026 case studies (a half-and-half split with a
   pixel figure on the left, then a summary row under a hairline). All
   three references were found through Inspo. */
function Ours({ t }: { t: ReturnType<typeof useT> }) {
  const lines = [
    t("Home", "Casa"),
    t("Car", "Automóvel"),
    t("Health", "Saúde"),
    t("Life", "Vida"),
    t("Business", "Empresas"),
  ];
  const steps = [
    t("Reporting", "Participação"),
    t("Assessment", "Peritagem"),
    t("Repair", "Reparação"),
    t("Payout", "Indemnização"),
  ];

  return (
    <div className={`sbs-mini sbs-p-page ${pilarDisplay.variable} ${pilarSans.variable} ${pilarMono.variable}`}>
      <div className="sbs-p-hero">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/side-by-side/pilar-hero.webp" alt="" draggable={false} className="sbs-p-sky" />

        <div className="sbs-p-bar">
          <PilarLogo t={t} />
          <span className="sbs-p-tools">
            <i className="sbs-p-round">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="7" cy="7" r="4.5" />
                <path d="M10.4 10.4 14 14" />
              </svg>
            </i>
            <span className="sbs-p-pill">{t("Client area", "Área de cliente")}</span>
            <span className="sbs-p-pill sbs-p-solid">{t("Get a quote", "Pedir simulação")}</span>
            <i className="sbs-p-round">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 6h10M3 10h10" />
              </svg>
            </i>
          </span>
        </div>

        <div className="sbs-p-lead">
          <h3>
            <span>{t("Insurance chosen by someone", "Seguros escolhidos por")}</span>{" "}
            <span>{t("who doesn’t sell it.", "quem não os vende.")}</span>
          </h3>
          <p>
            {t(
              "Insurance brokerage. We compare the insurers; you decide with everything in front of you.",
              "Mediação de seguros. Comparamos as seguradoras; o cliente decide com tudo à frente.",
            )}
          </p>
          <span className="sbs-p-pill sbs-p-ghost">{t("Get a quote", "Pedir simulação")}</span>
        </div>
      </div>

      <div className="sbs-p-index">
        {lines.map((line) => (
          <span key={line}>{line}</span>
        ))}
      </div>

      <div className="sbs-p-claims">
        <p className="sbs-p-say">
          {t(
            "When there is a claim, we are the ones who call the insurer. Nobody is left alone on the phone.",
            "Quando há um sinistro, quem liga à seguradora somos nós. Ninguém fica sozinho ao telefone.",
          )}
        </p>
        <div className="sbs-p-band">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/side-by-side/pilar-rain.webp" alt="" draggable={false} />
          <span className="sbs-p-sign">
            <PilarSymbol />
            <b>Pilar</b> {t("Claims", "Sinistros")}
          </span>
          <div className="sbs-p-steps">
            {steps.map((step) => (
              <span key={step}>{step}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="sbs-p-manifest">
        <div className="sbs-p-split">
          <div className="sbs-p-pix">
            <PilarPixels />
          </div>
          <div className="sbs-p-right">
            <div className="sbs-p-head">
              <div>
                <span className="sbs-p-label">{t("Manifesto", "Manifesto")}</span>
                <h4>
                  <span>{t("One broker.", "Um mediador.")}</span> <span>{t("Every insurer.", "Todas as seguradoras.")}</span>
                </h4>
              </div>
              <PilarLogo t={t} className="sbs-p-small" />
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/side-by-side/pilar-detail.webp" alt="" draggable={false} className="sbs-p-detail" />
          </div>
        </div>

        <div className="sbs-p-sum">
          <div>
            <span className="sbs-p-label">{t("Talk to us", "Falar connosco")}</span>
            <h5>{t("Talk to someone who compares.", "Falar com quem compara.")}</h5>
          </div>
          <div>
            <p>
              {t(
                "Pilar works for no insurer. It stands in the space between you and all of them: it compares, explains the small print and, when there is a claim, sees it through from start to finish.",
                "A Pilar não trabalha para nenhuma seguradora. Fica no espaço entre o cliente e todas elas: compara, explica as letras pequenas e, quando há um sinistro, trata dele do princípio ao fim.",
              )}
            </p>
            <span className="sbs-p-go">{t("Get a quote", "Pedir simulação")} →</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */

export function SideBySide() {
  const t = useT();
  const reduce = useReducedMotion() ?? false;
  const stage = useRef<HTMLDivElement>(null);
  const seen = useSeen(stage, { threshold: 0.25 });
  // Both sides are given the class in the same render, so the two loops
  // begin in the same frame and stay in step for as long as the page is
  // open.
  const [running, setRunning] = useState(false);
  useEffect(() => {
    if (seen && !reduce) setRunning(true);
  }, [seen, reduce]);

  return (
    <ProposalHost>
      <FloatingNav />
      <main id="top" className="relative bg-paper">
        <header className="shell pt-[calc(var(--section-gap)+2rem)] pb-[clamp(2.5rem,5vw,4rem)]">
          <SlideIn ready>
            <p className="mono-label text-ash-2">{t("Side by side", "Lado a lado")}</p>
            <h1 className="display mt-7 max-w-[18ch] text-[clamp(2.5rem,6vw,4.75rem)] leading-[0.98]">
              <span className="block font-light">{t("The same business,", "A mesma empresa,")}</span>
              <span className="block font-medium">{t("built twice.", "construída duas vezes.")}</span>
            </h1>
          </SlideIn>
          <SlideIn ready distance={0} delay={0.08}>
            <p className="mt-8 max-w-[46ch] text-[1.0625rem] leading-[1.55] text-ash">
              {t(
                "One website put together from an off-the-shelf template, one of ours. Both start in the same frame and go down the page at the same moments. Everything else is the difference.",
                "Um website montado a partir de um modelo pré-feito, outro nosso. Começam no mesmo instante e descem a página ao mesmo tempo. Tudo o resto é a diferença.",
              )}
            </p>
          </SlideIn>
        </header>

        <section
          ref={stage}
          aria-labelledby="side-by-side-title"
          className="sbs-stage relative isolate pt-[clamp(3rem,6vw,5rem)] pb-(--section-gap) text-paper"
        >
          <h2 id="side-by-side-title" className="sr-only">
            {t("The same insurance broker, as two websites", "A mesma mediadora de seguros, em dois websites")}
          </h2>
          <div aria-hidden="true" className="sbs-ground" />

          <div className="sbs-wide">
            <div className="sbs-pair">
              <Plate
                quiet
                running={running}
                label={t("Off-the-shelf template", "Modelo pré-feito")}
                address={t("pilar-insurance.example/home", "pilar-seguros.example/inicio")}
                says={t(
                  "A website from an off-the-shelf template: a loading bar still running, a seven-item menu, a banner image that lands late and pushes the page down, stock photography, a carousel, three identical cards and a cookie wall over the foot of it.",
                  "Um website feito a partir de um modelo pré-feito: uma barra de carregamento ainda a correr, um menu de sete itens, uma imagem de banner que chega tarde e empurra a página para baixo, fotografia de stock, um carrossel, três cartões iguais e uma parede de cookies por cima do fundo.",
                )}
              >
                <Template t={t} />
              </Plate>

              <Plate
                running={running}
                label="nevima"
                address={t("pilarinsurance.example", "pilarseguros.example")}
                says={t(
                  "The same insurance broker as we would build it: one line over a photograph of a pillar says what the broker does, its five kinds of insurance in very large type, the four steps of a claim it handles on the client's behalf, and a short manifesto beside its symbol drawn on its own grid.",
                  "A mesma mediadora de seguros como a faríamos: uma linha sobre a fotografia de um pilar diz o que a mediadora faz, os cinco tipos de seguro em letra muito grande, as quatro etapas de um sinistro que trata pelo cliente, e um manifesto curto ao lado do símbolo desenhado sobre a sua grelha.",
                )}
              >
                <Ours t={t} />
              </Plate>
            </div>

            <p className="sbs-note mono-label">
              {t(
                "Both pages are demonstrations built for this page, and the insurance broker is invented.",
                "Ambas as páginas são demonstrações feitas para esta página, e a mediadora de seguros é inventada.",
              )}
            </p>
          </div>
        </section>

        <SbsIncluded />
        <SbsLevels />
        <SbsPersonal />
      </main>

      <WorkTogether />
      <Footer />
    </ProposalHost>
  );
}
