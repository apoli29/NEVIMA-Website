"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { SlideIn } from "./enter";
import { FloatingNav } from "./floating-nav";
import { Footer } from "./footer";
import { ProposalHost } from "./proposal-host";
import { WorkTogether } from "./work-together";
import { useSeen } from "./use-seen";
import { useT } from "@/lib/use-lang";

/* ==================================================================
   Side by side

   The same business, built twice. The comparison on the home page says
   the difference in words; this page shows it. Two websites for one
   invented clinic stand on the same black surface: one put together
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

   The clinic is invented and both pages are demonstrations: it says so
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
    t("Services", "Serviços"),
    t("Our Team", "A Equipa"),
    t("Blog", "Blog"),
    t("FAQ", "FAQ"),
    t("Contact", "Contactos"),
  ];
  const cards = [
    t("Our Services", "Os Nossos Serviços"),
    t("Why Choose Us", "Porquê Escolher-nos"),
    t("Book Online", "Marcação Online"),
  ];

  return (
    <>
      {/* The bar that never gets there. */}
      <span className="sbs-load" />

      <div className="sbs-mini sbs-t-page">
        <div className="sbs-t-top">
          <span className="sbs-t-brand">VERDELA CLINIC</span>
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
          <svg viewBox="0 0 190 120" className="sbs-t-stock" fill="none" stroke="currentColor" strokeWidth="5">
            <path d="M20 72c18-18 34-6 44 2l20 16c8 6 18 4 24-4" />
            <path d="M170 68c-16-16-32-8-44 0l-18 12c-8 6-18 6-26 0" />
            <circle cx="95" cy="36" r="16" />
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
          <span>© 2026 Verdela Clinic. {t("All Rights Reserved.", "Todos os Direitos Reservados.")}</span>
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

function Ours({ t }: { t: ReturnType<typeof useT> }) {
  const treatments = [
    [t("Consultation", "Consulta"), t("45 minutes. The skin read before anything is proposed.", "45 minutos. A pele lida antes de se propor seja o que for.")],
    [t("Deep cleanse", "Limpeza profunda"), t("Once a season, and no sooner.", "Uma vez por estação, e não antes.")],
    [t("Peeling", "Peeling"), t("Three strengths. The gentlest that works.", "Três intensidades. A mais suave que resulte.")],
    [t("Follow-up", "Acompanhamento"), t("Six weeks later, included.", "Seis semanas depois, incluído.")],
  ];

  return (
    <div className="sbs-mini sbs-n-page">
      <div className="sbs-n-top">
        <span className="sbs-n-brand">verdela</span>
        <nav className="sbs-n-nav">
          <span>{t("Treatments", "Tratamentos")}</span>
          <span>{t("The clinic", "A clínica")}</span>
          <span>{t("Book", "Marcações")}</span>
        </nav>
      </div>

      <div className="sbs-n-hero">
        <div>
          <h3>
            <span>{t("Skin read", "Pele tratada")}</span>
            <strong>{t("before it is treated.", "com tempo a sério.")}</strong>
          </h3>
          <p>
            {t(
              "A small clinic in Porto. One room, two hands, and the time each face needs.",
              "Uma clínica pequena no Porto. Uma sala, duas mãos, e o tempo que cada rosto precisa.",
            )}
          </p>
          <span className="sbs-n-act">{t("Book a consultation", "Marcar consulta")}</span>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/contact/water-1280.webp" alt="" draggable={false} className="sbs-n-shot" />
      </div>

      <div className="sbs-n-rule" />

      <div className="sbs-n-next">
        <span className="sbs-n-lab">{t("What is done here", "O que se faz aqui")}</span>
        <div>
          <h4>
            {t(
              "Four treatments, done properly, instead of twenty on a list.",
              "Quatro tratamentos, bem feitos, em vez de vinte numa lista.",
            )}
          </h4>
          <dl className="sbs-n-list">
            {treatments.map(([name, note]) => (
              <div key={name}>
                <dt>{name}</dt>
                <dd>{note}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className="sbs-n-room">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/about/folds-1280.webp" alt="" draggable={false} />
        <p>
          {t(
            "One room, on the first floor, with the window open.",
            "Uma sala, no primeiro andar, com a janela aberta.",
          )}
        </p>
      </div>

      <div className="sbs-n-rule" />

      <div className="sbs-n-end">
        <span className="sbs-n-lab">{t("Where", "Onde")}</span>
        <div>
          <p>Rua da Alegria 112, Porto</p>
          <p className="sbs-n-quiet">{t("Tuesday to Saturday, 10h–19h", "De terça a sábado, 10h–19h")}</p>
        </div>
        <span className="sbs-n-act">{t("Book a consultation", "Marcar consulta")}</span>
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
            {t("The same clinic, as two websites", "A mesma clínica, em dois websites")}
          </h2>
          <div aria-hidden="true" className="sbs-ground" />

          <div className="sbs-wide">
            <div className="sbs-pair">
              <Plate
                quiet
                running={running}
                label={t("Off-the-shelf template", "Modelo pré-feito")}
                address="verdela-clinic.example/home"
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
                address="verdela.example"
                says={t(
                  "The same clinic as we would build it: the page arrives in one move, one line of type says what the clinic is, one photograph, four treatments written out, and the address.",
                  "A mesma clínica como a faríamos: a página chega num só movimento, uma linha de texto diz o que a clínica é, uma fotografia, quatro tratamentos escritos por extenso, e a morada.",
                )}
              >
                <Ours t={t} />
              </Plate>
            </div>

            <p className="sbs-note mono-label">
              {t(
                "Both pages are demonstrations built for this page, and the clinic is invented.",
                "Ambas as páginas são demonstrações feitas para esta página, e a clínica é inventada.",
              )}
            </p>
          </div>
        </section>
      </main>

      <WorkTogether />
      <Footer />
    </ProposalHost>
  );
}
