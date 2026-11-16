"use client";

import { PilarLogo, PilarReviews, pilarCopy, pilarDisplay, pilarMono, pilarSans, useLapStep } from "./sbs-pilar";
import { useT } from "@/lib/use-lang";

/* ==================================================================
   Pilar Seguros at the Advanced level (design levels, sbs-service.tsx).

   The same page as the Essential+ one (Ours, sbs-pilar.tsx): the same
   five sections in the same order, the same words, Pilar's own four
   colours and type. What it adds is the finish (user, 2026-11-17: keep
   the identity, make the website more refined; "sobriedade e
   maturidade"), after two references the user approved:

   - Lithic (lithic.com): fine contour lines and a matte object in
     depth, a card in perspective that settles flat.
   - Evolve Private Wealth (Awwwards honorable mention): the mark built
     from horizontal slats, the ground changing colour between sections,
     a hairline grid with numbers, a comparison table with its own column
     lit, the steps held on screen one at a time, a large mark in the
     footer.

   Every effect is a CSS animation on the plate's own loop (--sbs-loop,
   the same keyframe percentages as sbs-scroll), so each plays as its
   section arrives and is set back while it is off the plate. Without
   the loop (less motion) every section is simply shown finished.
   ================================================================== */

type T = ReturnType<typeof useT>;

/** Pilar's symbol in depth: a stack of the same shape, Grafite going to
    Noite behind, and a face in front built of horizontal slats, which
    close into the solid face as --slat grows. --ry and --rx turn it. */
function Solid({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`sbs-a-solid ${className ?? ""}`} style={style} aria-hidden="true">
      <div className="sbs-a-turn">
        {Array.from({ length: 14 }, (_, i) => (
          <i key={i} style={{ ["--z" as string]: i + 1 }} />
        ))}
        <b />
      </div>
    </div>
  );
}

/** Contour lines, after Lithic: arcs of one family, each a little wider
    than the last, drawn in one after another. */
function Rings({ className, count, cx, cy, r0, step, w, h }: {
  className: string;
  count: number;
  cx: number;
  cy: number;
  r0: number;
  step: number;
  w: number;
  h: number;
}) {
  return (
    <svg className={className} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <ellipse
          key={i}
          cx={cx}
          cy={cy}
          rx={r0 + i * step}
          ry={(r0 + i * step) * 0.82}
          pathLength={1}
          style={{ ["--i" as string]: i }}
        />
      ))}
    </svg>
  );
}

export function Advanced({ t }: { t: T }) {
  const { lines, steps } = pilarCopy(t);
  const { at, go, box } = useLapStep(steps.length);

  const rows = [
    [t("Price a year", "Preço por ano"), t("€286.40", "286,40 €"), t("€312.90", "312,90 €"), t("€259.00", "259,00 €")],
    [t("Excess", "Franquia"), t("€250", "250 €"), t("€150", "150 €"), t("€500", "500 €")],
    [t("Earthquakes", "Fenómenos sísmicos"), t("Not covered", "Não cobre"), t("Covered", "Cobre"), t("Not covered", "Não cobre")],
    [
      t("Water damage", "Danos por água"),
      t("Covered", "Cobre"),
      t("Covered, leak found", "Cobre, com pesquisa da avaria"),
      t("Covered", "Cobre"),
    ],
  ];

  return (
    <div className={`sbs-mini sbs-p-page sbs-a-page ${pilarDisplay.variable} ${pilarSans.variable} ${pilarMono.variable}`}>
      {/* 1 · The hero: the photograph opens through slats (Evolve), contour
          lines rise from the pillar (Lithic), the line rises into place. */}
      <div className="sbs-p-hero sbs-a-hero">
        <div className="sbs-a-blinds">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/side-by-side/pilar-hero.webp" alt="" draggable={false} className="sbs-p-sky" />
        </div>
        <Rings className="sbs-a-rings" count={11} cx={450} cy={980} r0={300} step={44} w={900} h={700} />

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

        <div className="sbs-p-lead sbs-a-lead">
          <h3>
            <span className="sbs-a-line">
              <span>{t("Insurance chosen by someone", "Seguros escolhidos por")}</span>
            </span>{" "}
            <span className="sbs-a-line">
              <span>{t("who doesn’t sell it.", "quem não os vende.")}</span>
            </span>
          </h3>
          <p>
            {t(
              "Insurance brokerage. We compare the insurers; you decide with everything in front of you.",
              "Mediação de seguros. Comparamos as seguradoras; o cliente decide com tudo à frente.",
            )}
          </p>
          <span className="sbs-p-pill sbs-p-ghost">{t("Get a quote", "Pedir simulação")}</span>
        </div>

        <PilarReviews t={t} />
      </div>

      {/* 2 · The five kinds of insurance: the ground turns to Noite as the
          section arrives (Evolve), each word numbered on a hairline and
          rising into place, contour lines in a corner (Lithic). */}
      <div className="sbs-a-index" data-stop>
        <Rings className="sbs-a-contour" count={16} cx={900} cy={0} r0={120} step={26} w={900} h={560} />
        <p className="sbs-a-kicker">{t("Insurance", "Seguros")}</p>
        {lines.map((line, i) => (
          <div key={line} className="sbs-a-row" style={{ ["--i" as string]: i }}>
            <span>{String(i + 1).padStart(2, "0")}</span>
            <b>
              <span>{line}</span>
            </b>
          </div>
        ))}
      </div>

      {/* 3 · The three quotes as a comparison table, Pilar's pick its lit
          column (Evolve); the table comes in tilted in depth and settles
          flat (Lithic), then its column lifts. */}
      <div className="sbs-a-sheet" data-stop>
        <div className="sbs-a-sheet-head">
          <h4>{t("Three quotes. One page. One recommendation.", "Três propostas. Uma folha. Uma recomendação.")}</h4>
          <p>
            {t(
              "For each policy, Pilar asks several insurers for quotes and sends back one table: what each one covers, what it leaves out and what it costs a year. The cheapest is not always the right choice, and the table says why.",
              "Para cada seguro, a Pilar pede propostas a várias seguradoras e devolve um quadro: o que cada uma cobre, o que deixa de fora e quanto custa por ano. A mais barata nem sempre é a escolha certa, e o quadro diz porquê.",
            )}
          </p>
        </div>

        <div className="sbs-a-stage">
          <div className="sbs-a-table">
            <span className="sbs-a-col" />
            <div className="sbs-a-cell sbs-a-cap">
              <b>{t("Home insurance · 3-bed flat, Lisbon", "Seguro Casa · T3, Lisboa")}</b>
              <span>{t("Valid 30 days", "Válido 30 dias")}</span>
            </div>
            <div className="sbs-a-cell sbs-a-who">{t("Insurer A", "Seguradora A")}</div>
            <div className="sbs-a-cell sbs-a-who" data-pick="">
              <span className="sbs-a-tag">{t("Pilar’s pick", "A escolha da Pilar")}</span>
              {t("Insurer B", "Seguradora B")}
            </div>
            <div className="sbs-a-cell sbs-a-who">{t("Insurer C", "Seguradora C")}</div>
            {rows.map(([name, a, b, c], r) => (
              <div key={name} className="sbs-a-tr" data-first={r === 0 || undefined}>
                <div className="sbs-a-cell sbs-a-th">{name}</div>
                <div className="sbs-a-cell">{a}</div>
                <div className="sbs-a-cell" data-pick="">
                  {b}
                </div>
                <div className="sbs-a-cell">{c}</div>
              </div>
            ))}
            <div className="sbs-a-cell sbs-a-foot-cell">
              <span className="sbs-p-wide">{t("Get my table", "Pedir o meu quadro")}</span>
            </div>
            <div className="sbs-a-cell sbs-a-why" data-pick="">
              {t(
                "€53.90 a year more than C, and the only one of the three that covers earthquakes.",
                "Mais 53,90 € por ano do que a C, e a única das três que cobre fenómenos sísmicos.",
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4 · The four steps, held on screen one at a time (Evolve): the
          symbol in depth turns a little further and its slats close a
          little more at each, the step itself large beside it. */}
      <div ref={box} className="sbs-a-how" data-stop>
        <div className="sbs-a-how-head">
          <h4>
            <span>{t("Four steps.", "Quatro passos.")}</span>{" "}
            <span>{t("No cost to you.", "Nenhum custo para o cliente.")}</span>
          </h4>
          <div>
            <p>
              {t(
                "Pilar is paid by the insurer you choose. It charges you nothing: not for the conversation, not for the table, not for the years after.",
                "A Pilar é paga pela seguradora que o cliente escolher. Ao cliente não cobra nada, nem pela conversa, nem pelo quadro, nem pelos anos seguintes.",
              )}
            </p>
            <span className="sbs-p-go">{t("Book the conversation", "Marcar a conversa")} →</span>
          </div>
        </div>

        <div className="sbs-a-how-stage">
          <div className="sbs-a-how-mark">
            <Solid
              className="sbs-a-how-solid"
              style={{
                ["--ry" as string]: `${-34 + at * 16}deg`,
                ["--slat-to" as string]: `${4 + at * 3}px`,
              }}
            />
            <span className="sbs-a-count">
              {String(at + 1).padStart(2, "0")} / {String(steps.length).padStart(2, "0")}
            </span>
          </div>

          <div className="sbs-a-how-text">
            <div key={at} className="sbs-a-step">
              <span className="sbs-a-kicker">{t("How it works", "Como funciona")}</span>
              <h5>{steps[at][0]}</h5>
              <p>{steps[at][1]}</p>
            </div>
            <ol className="sbs-a-names">
              {steps.map(([name], i) => (
                <li key={name}>
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => go(i)}
                    aria-current={i === at ? "step" : undefined}
                    data-past={i < at ? "" : undefined}
                  >
                    <span>{String(i + 1).padStart(2, "0")}</span>
                    {name}
                  </button>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      {/* 5 · The foot: the closing line on contour rings opening slowly
          (Lithic), then Pilar's symbol large and in depth beside the
          links set large (Evolve), and the legal row. */}
      <div className="sbs-p-foot sbs-a-foot" data-stop>
        <div className="sbs-a-band">
          <Rings className="sbs-a-band-rings" count={12} cx={700} cy={110} r0={40} step={30} w={900} h={220} />
          <h4>{t("One broker. Every insurer.", "Um mediador. Todas as seguradoras.")}</h4>
          <span className="sbs-p-foot-cta">{t("Get a quote", "Pedir simulação")}</span>
        </div>

        <div className="sbs-a-foot-main">
          <Solid className="sbs-a-foot-solid" />
          <div className="sbs-a-foot-links">
            <span>{t("How it works", "Como funciona")}</span>
            <span>{t("Claims", "Sinistros")}</span>
            <span>{t("Client area", "Área de cliente")}</span>
            <span>{t("Contact", "Contacto")}</span>
          </div>
          <div className="sbs-a-foot-small">
            <div>
              <b>{t("Insurance", "Seguros")}</b>
              <span>{lines.join(" · ")}</span>
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
