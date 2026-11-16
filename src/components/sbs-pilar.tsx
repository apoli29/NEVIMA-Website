"use client";

import { useEffect, useRef, useState } from "react";
import { Funnel_Display, IBM_Plex_Mono, Plus_Jakarta_Sans } from "next/font/google";
import { useT } from "@/lib/use-lang";

/* ==================================================================
   Pilar Seguros, the invented insurance broker of the side-by-side
   page, as we would build it: its type, its symbol and signature, and
   the whole Essential+ page (Ours). Shared by the comparison
   (side-by-side.tsx) and the design levels (sbs-service.tsx), where the
   Advanced page (sbs-advanced.tsx) is built from the same pieces.
   ================================================================== */

/* Pilar's own type, loaded for this page only and chosen from its
   identity, not from any reference: Plus Jakarta Sans is the brand's
   (its guide and signature); Funnel Display, for the display lines, has
   the symbol's flat geometry (near-square counters, terminals cut
   straight); IBM Plex Mono sets the small labels. */
export const pilarDisplay = Funnel_Display({ subsets: ["latin"], variable: "--f-pilar-display", display: "swap" });
export const pilarSans = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--f-pilar-sans", display: "swap" });
export const pilarMono = IBM_Plex_Mono({ subsets: ["latin"], weight: "500", variable: "--f-pilar-mono", display: "swap" });

/** The plate measured when it changes size, never while the loop runs:
    the scale is written on it as a custom property and the browser is
    left to do the rest. The page's own width is read off the page (a
    narrow desktop, and narrower still on a phone, see globals.css), so
    the width is said in one place only. */
export function useFit() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fit = () => {
      const page = el.querySelector<HTMLElement>(".sbs-mini");
      const w = el.clientWidth;
      const own = page?.offsetWidth;
      if (!page || !w || !own) return;
      const k = w / own;
      el.style.setProperty("--sbs-k", String(k));
      // A page that marks its sections with data-stop has its stops read
      // off itself (each section's top, never past the page's foot), so
      // a change of copy or of language cannot leave a stop mid-section.
      // A page without marks keeps the stops written in globals.css.
      const marks = page.querySelectorAll<HTMLElement>("[data-stop]");
      const view = el.clientHeight / k;
      const last = page.offsetHeight - view;
      marks.forEach((mark, i) => {
        page.style.setProperty(`--sbs-stop-${i + 1}`, `${-Math.round(Math.min(mark.offsetTop, last))}px`);
      });
    };
    // Measured once more on the next frame, so a page that changes its
    // own width at a breakpoint is read after it has been laid out again.
    let frame = 0;
    const later = () => {
      fit();
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(fit);
    };
    later();
    const size = new ResizeObserver(later);
    size.observe(el);
    const page = el.querySelector<HTMLElement>(".sbs-mini");
    if (page) size.observe(page);
    document.fonts?.ready.then(later);
    window.addEventListener("resize", later);
    return () => {
      cancelAnimationFrame(frame);
      size.disconnect();
      window.removeEventListener("resize", later);
    };
  }, []);

  return ref;
}

/* ---- the website we would have made ------------------------------ */

/** Pilar's symbol, from its brand guide: the stem, the cut of 8 units
    that is the broker's place between client and insurer, and the empty
    core, which never takes a colour. */
export function PilarSymbol({ className }: { className?: string }) {
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
export function PilarLogo({ t, className }: { t: ReturnType<typeof useT>; className?: string }) {
  return (
    <span className={`sbs-p-logo ${className ?? ""}`}>
      <PilarSymbol />
      <span>{t("Pilar Insurance", "Pilar Seguros")}</span>
    </span>
  );
}

/** The reviews across the foot of the hero: one short, transparent strip
    the whole width of the page, sliding very slowly (a lap a minute) and
    held while the pointer is on it. The clients are invented, as Pilar
    is, so they are given initials, a town and a kind of policy, never a
    face. */
export function PilarReviews({ t }: { t: ReturnType<typeof useT> }) {
  const reviews = [
    [
      t("They called the insurer for me the day the flat flooded. All I did was send the photos.", "Ligaram à seguradora por mim no dia da inundação. Só tive de enviar as fotografias."),
      "Marta S.",
      t("Lisbon", "Lisboa"),
      t("Home", "Casa"),
    ],
    [
      t("I was paying €180 a year more for the same cover. The table showed it on one page.", "Pagava mais 180 € por ano pelo mesmo seguro. O quadro mostrou-o numa folha."),
      "Rui C.",
      "Almada",
      t("Car", "Automóvel"),
    ],
    [
      t("They explained the excess before I signed, not after the claim.", "Explicaram-me a franquia antes de assinar, e não depois do sinistro."),
      "Inês M.",
      "Oeiras",
      t("Health", "Saúde"),
    ],
    [
      t("The company’s fleet and liability cover in one place, with one person.", "A frota e a responsabilidade civil da empresa num só sítio, com uma só pessoa."),
      "Paulo F.",
      "Setúbal",
      t("Business", "Empresas"),
    ],
    [
      t("At renewal they called me before I had remembered it.", "Na renovação ligaram-me antes de eu me lembrar dela."),
      "Sofia A.",
      "Sintra",
      t("Life", "Vida"),
    ],
    [
      t("Twenty minutes of conversation and, two days later, three quotes side by side.", "Vinte minutos de conversa e, dois dias depois, três propostas lado a lado."),
      "Tiago R.",
      "Cascais",
      t("Home", "Casa"),
    ],
  ];

  return (
    <div className="sbs-p-reviews">
      {/* Twice over, so the lap closes without a seam. */}
      <div className="sbs-p-track">
        {[...reviews, ...reviews].map(([quote, name, town, kind], i) => (
          <figure key={i} className="sbs-p-rev">
            <blockquote>“{quote}”</blockquote>
            <figcaption>
              <span className="sbs-p-who">
                <i>{name.split(" ").map((w) => w[0]).join("")}</i>
                <span>
                  <b>{name}</b>
                  <small>{town}</small>
                </span>
              </span>
              <span className="sbs-p-kind">{kind}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}

/** The four steps as a stepper: a header with the count, a bar whose
    dark segment sits on the current step with the steps done behind it
    in Névoa, the step names, the step itself, and Back / Continue.
    Inside the plate nobody may be touching it, so while the page holds
    on this section it walks itself from the first step to the last, read
    off the loop's own clock; a click takes over until the page goes back
    to the top. The plate is hidden from assistive technology, so its
    buttons are kept out of the tab order. */
export function PilarSteps({ t, steps }: { t: ReturnType<typeof useT>; steps: string[][] }) {
  const { at, go, box } = useLapStep(steps.length);
  const last = steps.length - 1;

  return (
    <div ref={box} className="sbs-p-stepper">
      <div className="sbs-p-step-top">
        <b>{t("How it works", "Como funciona")}</b>
        <span>{t(`Step ${at + 1} of ${steps.length}`, `Passo ${at + 1} de ${steps.length}`)}</span>
      </div>

      <div className="sbs-p-bar2">
        <span className="sbs-p-done" style={{ width: `${(at * 100) / steps.length}%` }} />
        <span
          className="sbs-p-now"
          style={{ width: `${100 / steps.length}%`, transform: `translateX(${at * 100}%)` }}
        />
      </div>

      <div className="sbs-p-names">
        {steps.map(([name], i) => (
          <button
            key={name}
            type="button"
            tabIndex={-1}
            onClick={() => go(i)}
            aria-current={i === at ? "step" : undefined}
            data-past={i < at ? "" : undefined}
          >
            {i < at && (
              <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2 6.5 5 9.5 10 3" />
              </svg>
            )}
            {name}
          </button>
        ))}
      </div>

      <div className="sbs-p-step-body">
        <div key={at}>
          <h5>{steps[at][0]}</h5>
          <p>{steps[at][1]}</p>
        </div>
      </div>

      <div className="sbs-p-step-nav">
        <button type="button" tabIndex={-1} onClick={() => go(at - 1)} disabled={at === 0}>
          <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M7.5 2.5 4 6l3.5 3.5" />
          </svg>
          {t("Back", "Voltar")}
        </button>
        <button type="button" tabIndex={-1} onClick={() => go(at + 1)} disabled={at === last} data-solid="">
          {t("Continue", "Continuar")}
          <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M4.5 2.5 8 6 4.5 9.5" />
          </svg>
        </button>
      </div>
    </div>
  );
}

/** Which of the steps the page is on, read off the loop's own clock
    (the lap of sbs-scroll on the page that holds `box`); a click (`go`)
    takes over until the page goes back to the top. */
export function useLapStep(count: number) {
  const [at, setAt] = useState(0);
  const held = useRef(false);
  const box = useRef<HTMLDivElement>(null);
  const last = count - 1;

  useEffect(() => {
    // Where the loop is, as a fraction of a lap: this section's stop is
    // held from 47% to 80% (globals.css, sbs-scroll).
    const marks = [0.55, 0.63, 0.71];
    const id = window.setInterval(() => {
      const page = box.current?.closest<HTMLElement>(".sbs-mini");
      const lap = page
        ?.getAnimations()
        .find((a) => (a as CSSAnimation).animationName === "sbs-scroll");
      const p = lap?.effect?.getComputedTiming().progress;
      if (p == null) return;
      if (p < 0.45) {
        held.current = false;
        setAt(0);
        return;
      }
      if (held.current) return;
      setAt(marks.filter((m) => p >= m).length);
    }, 150);
    return () => window.clearInterval(id);
  }, []);

  const go = (i: number) => {
    held.current = true;
    setAt(Math.max(0, Math.min(last, i)));
  };

  return { at, go, box };
}

/* Our side, in Pilar's own colours and type (Funnel Display for the
   display lines, Plus Jakarta Sans, the brand's, for the rest, IBM Plex
   Mono for the small labels). Each section has its own job: the hero
   says what Pilar is, with its clients' reviews sliding slowly across
   its foot, and the index what it insures (both after Wealthsimple's
   home page); the third shows what the client actually
   gets, a table of three quotes with Pilar's pick and why (after Wise,
   which shows its product working beside the title); the fourth says
   how it works and what it costs (a wide-spaced title after Arweave,
   beside the four steps as a stepper the user brought, rebuilt here). All references
   were found through Inspo. */
/** Pilar's five kinds of insurance and its four steps, said once for
    both levels (Ours, and the Advanced page in sbs-advanced.tsx). */
export function pilarCopy(t: ReturnType<typeof useT>) {
  const lines = [
    t("Home", "Casa"),
    t("Car", "Automóvel"),
    t("Health", "Saúde"),
    t("Life", "Vida"),
    t("Business", "Empresas"),
  ];
  const steps = [
    [
      t("Conversation", "Conversa"),
      t("Twenty minutes, by phone or at the office, about what needs protecting.", "Vinte minutos, por telefone ou no escritório, sobre o que há para proteger."),
    ],
    [
      t("Table", "Quadro"),
      t("Within two working days, the quotes side by side and the recommendation.", "Em dois dias úteis, as propostas lado a lado e a recomendação."),
    ],
    [
      t("Signing", "Assinatura"),
      t("Pilar handles the paperwork with the insurer you chose.", "A Pilar trata da papelada com a seguradora escolhida."),
    ],
    [
      t("Every year", "Todos os anos"),
      t("A review before each renewal; when there is a claim, Pilar makes the call.", "Revisão antes de cada renovação; num sinistro, quem liga é a Pilar."),
    ],
  ];

  return { lines, steps };
}

export function Ours({ t }: { t: ReturnType<typeof useT> }) {
  const { lines, steps } = pilarCopy(t);

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
          <span className="sbs-p-pill sbs-p-ghost">{t("Where to find us", "Onde nos encontrar")}</span>
        </div>

        <PilarReviews t={t} />
      </div>

      <div className="sbs-p-index" data-stop>
        {lines.map((line) => (
          <span key={line}>{line}</span>
        ))}
      </div>

      <div className="sbs-p-sheet" data-stop>
        <div className="sbs-p-sheet-copy">
          <h4>
            {t("Three quotes. One page. One recommendation.", "Três propostas. Uma folha. Uma recomendação.")}
          </h4>
          <p>
            {t(
              "For each policy, Pilar asks several insurers for quotes and sends back one table: what each one covers, what it leaves out and what it costs a year. The cheapest is not always the right choice, and the table says why.",
              "Para cada seguro, a Pilar pede propostas a várias seguradoras e devolve um quadro: o que cada uma cobre, o que deixa de fora e quanto custa por ano. A mais barata nem sempre é a escolha certa, e o quadro diz porquê.",
            )}
          </p>
        </div>

        <div className="sbs-p-card">
          <div className="sbs-p-card-top">
            <span>{t("Home insurance · 3-bed flat, Lisbon", "Seguro Casa · T3, Lisboa")}</span>
            <span className="sbs-p-chip">{t("Valid 30 days", "Válido 30 dias")}</span>
          </div>
          <div className="sbs-p-quote">
            <span>{t("Insurer A", "Seguradora A")}</span>
            <b>{t("€286.40", "286,40 €")}</b>
          </div>
          <div className="sbs-p-quote">
            <span>{t("Insurer C", "Seguradora C")}</span>
            <b>{t("€259.00", "259,00 €")}</b>
          </div>
          <div className="sbs-p-pick">
            <span className="sbs-p-label">{t("Pilar’s pick", "A escolha da Pilar")}</span>
            <div>
              <span>{t("Insurer B", "Seguradora B")}</span>
              <b>{t("€312.90", "312,90 €")}</b>
            </div>
            <small>
              {t(
                "€53.90 a year more than C, and the only one of the three that covers earthquakes.",
                "Mais 53,90 € por ano do que a C, e a única das três que cobre fenómenos sísmicos.",
              )}
            </small>
          </div>
          <div className="sbs-p-note">
            <i>!</i>
            <span>{t("Excess: €150 with B, €250 with A, €500 with C.", "Franquia: 150 € na B, 250 € na A, 500 € na C.")}</span>
          </div>
          <div className="sbs-p-note">
            <i>i</i>
            <span>
              {t(
                "Water damage: all three cover it; only B pays to find the leak.",
                "Danos por água: as três cobrem; só a B inclui a pesquisa da avaria.",
              )}
            </span>
          </div>
          <span className="sbs-p-wide">{t("Get my table", "Pedir o meu quadro")}</span>
        </div>
      </div>

      <div className="sbs-p-how" data-stop>
        <div>
          <h4>
            <span>{t("Four steps.", "Quatro passos.")}</span>{" "}
            <span>{t("No cost to you.", "Nenhum custo para o cliente.")}</span>
          </h4>
          <p>
            {t(
              "Pilar is paid by the insurer you choose. It charges you nothing: not for the conversation, not for the table, not for the years after.",
              "A Pilar é paga pela seguradora que o cliente escolher. Ao cliente não cobra nada, nem pela conversa, nem pelo quadro, nem pelos anos seguintes.",
            )}
          </p>
          <span className="sbs-p-go">{t("Book the conversation", "Marcar a conversa")} →</span>
        </div>
        <PilarSteps t={t} steps={steps} />
      </div>

      {/* The foot: Noite with one matte glow of Grafite, the signature line
          and the way in, then the links, then the legal row (a Portuguese
          business shows its complaints book). */}
      <div className="sbs-p-foot" data-stop>
        <div className="sbs-p-foot-top">
          <h4>{t("One broker. Every insurer.", "Um mediador. Todas as seguradoras.")}</h4>
          <span className="sbs-p-foot-cta">{t("Get a quote", "Pedir simulação")}</span>
        </div>
        <div className="sbs-p-foot-cols">
          <div>
            <b>{t("Insurance", "Seguros")}</b>
            {lines.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </div>
          <div>
            <b>Pilar</b>
            <span>{t("How it works", "Como funciona")}</span>
            <span>{t("Claims", "Sinistros")}</span>
            <span>{t("Client area", "Área de cliente")}</span>
          </div>
          <div>
            <b>{t("Office", "Escritório")}</b>
            <span>{t("Lisbon", "Lisboa")}</span>
            <small>{t("Monday to Friday, 9am to 6pm", "Segunda a sexta, 9h–18h")}</small>
          </div>
          <div>
            <b>{t("Contact", "Contacto")}</b>
            <span>{t("hello@pilarinsurance.example", "ola@pilarseguros.example")}</span>
            <small>{t("A reply the same working day.", "Resposta no mesmo dia útil.")}</small>
          </div>
        </div>
        <div className="sbs-p-foot-legal">
          <span>© 2026 {t("Pilar Insurance · Insurance brokerage", "Pilar Seguros · Mediação de seguros")}</span>
          <span>
            <span>{t("Privacy", "Privacidade")}</span>
            <span>{t("Complaints book", "Livro de Reclamações")}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

