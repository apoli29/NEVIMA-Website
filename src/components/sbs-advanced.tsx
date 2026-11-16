"use client";

import { useEffect, useRef, useState } from "react";
import { PilarLogo, PilarReviews, pilarCopy, pilarDisplay, pilarMono, pilarSans, useLapStep } from "./sbs-pilar";
import SlidingEaseVerticalBars from "./ui/sliding-ease";
import { PilarMetal } from "./pilar-metal";
import { useT } from "@/lib/use-lang";

/* ==================================================================
   Pilar Seguros at the Advanced level (design levels, sbs-service.tsx).

   The same page as the Essential+ one (Ours, sbs-pilar.tsx): the same
   five sections in the same order, the same words, Pilar's own type and
   colours, with one colour added for this level only: a deep violet,
   the opening's ground and the slats that pass between sections (user,
   2026-11-17, "a cor mais roxa").

   Second round (user, 2026-11-17):
   - The opening: on the violet, Pilar's symbol in depth turns to face
     the visitor and the view flies through the square of the P; the
     website is then revealed under a fade. It replaces the slats that
     opened the photograph.
   - The five kinds of insurance, after Palais de Tokyo (Inspo): the list
     on the right, each with a line of its own, and the symbol in depth
     on the left travelling to the one being read, which lights up.
   - The table of quotes is kept as it was until a new reference is
     agreed for it.
   - The four steps as a carousel, one card at a time with the next one
     showing, over the user's sliding-ease bars in Pilar's colours.
   - Between sections, violet slats wipe each one in as it arrives.

   Every effect runs on this page's own loop (sbs-a-scroll, --sbs-loop
   26s; globals.css), longer than the comparison's so the opening has
   room: the opening 0-14%, the hero held to 22%, the five kinds 26-46%,
   the table 50-60%, the steps 64-86%, the foot 89-96%, back to the top
   by 100%, everything set back from 97%. Without the loop (less motion)
   every section is simply shown finished.
   ================================================================== */

type T = ReturnType<typeof useT>;

/** The loop's own name and its holds, as globals.css sets them. */
const LAP = "sbs-a-scroll";

/** Pilar's symbol in depth: a stack of the same shape behind a face of
    slats, which close into a solid face as --slat grows. */
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

/** Contour lines, after Lithic: arcs of one family, drawn one after another. */
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
        <ellipse key={i} cx={cx} cy={cy} rx={r0 + i * step} ry={(r0 + i * step) * 0.82} pathLength={1} style={{ ["--i" as string]: i }} />
      ))}
    </svg>
  );
}

export function Advanced({ t }: { t: T }) {
  const { lines, steps } = pilarCopy(t);
  const kinds = useLapStep(lines.length, { name: LAP, from: 0.27, to: 0.46, reset: 0.2 });

  /* The symbol beside the kinds sits level with the top of the one being
     read: its place is read off the rows themselves (their tops, all
     closed but the one read, which opens below its own top), so it starts
     level with the first and goes down with the list. */
  const rowsRef = useRef<HTMLDivElement>(null);
  const [rowTops, setRowTops] = useState<number[]>([]);
  useEffect(() => {
    const box = rowsRef.current;
    if (!box) return;
    const read = () => {
      const rows = [...box.querySelectorAll<HTMLElement>(".sbs-a-kind")];
      if (!rows.length) return;
      // a closed row's height, from any row not open
      const closed = rows.find((r) => !r.hasAttribute("data-on")) ?? rows[0];
      const h = closed.offsetHeight;
      setRowTops(rows.map((_, i) => rows[0].offsetTop + i * h));
    };
    read();
    document.fonts?.ready.then(read);
    const size = new ResizeObserver(read);
    size.observe(box);
    return () => size.disconnect();
  }, []);

  const about = [
    t("Contents, building and liability, for owners and tenants.", "Recheio, edifício e responsabilidade civil, para proprietários e inquilinos."),
    t("From compulsory third-party cover to own damage.", "Da responsabilidade civil obrigatória aos danos próprios."),
    t("Individual and family plans, each insurer’s network side by side.", "Planos individuais e de família, com a rede de cada seguradora lado a lado."),
    t("Linked to a mortgage, or on its own.", "Associado ao crédito à habitação, ou independente."),
    t("Fleet, property and workers’ compensation, in one place.", "Frota, multirriscos e acidentes de trabalho, num só sítio."),
  ];

  const rows = [
    [t("Price a year", "Preço por ano"), t("€286.40", "286,40 €"), t("€312.90", "312,90 €"), t("€259.00", "259,00 €")],
    [t("Excess", "Franquia"), t("€250", "250 €"), t("€150", "150 €"), t("€500", "500 €")],
    [t("Earthquakes", "Fenómenos sísmicos"), t("Not covered", "Não cobre"), t("Covered", "Cobre"), t("Not covered", "Não cobre")],
    [t("Water damage", "Danos por água"), t("Covered", "Cobre"), t("Covered, leak found", "Cobre, com pesquisa da avaria"), t("Covered", "Cobre")],
  ];

  return (
    <div className={`sbs-mini sbs-p-page sbs-a-page ${pilarDisplay.variable} ${pilarSans.variable} ${pilarMono.variable}`}>
      {/* 1 · The hero, behind the opening: the photograph, contour lines
          rising from the pillar, the line rising into place. */}
      <div className="sbs-p-hero sbs-a-hero">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/side-by-side/pilar-hero.webp" alt="" draggable={false} className="sbs-p-sky" />
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
          <span className="sbs-p-pill sbs-p-ghost">{t("Where to find us", "Onde nos encontrar")}</span>
        </div>

        <PilarReviews t={t} />

        {/* The opening, over the hero: the symbol on the violet, turning
            to face the visitor, then the view through the square of the P. */}
        <div className="sbs-a-intro" aria-hidden="true">
          <PilarMetal className="sbs-a-metal" />
        </div>
      </div>

      {/* 2 · The five kinds of insurance, after Palais de Tokyo: the list
          on the right, the symbol in depth travelling to the one read. */}
      <div
        ref={kinds.box}
        className="sbs-a-index sbs-a-wipe"
        data-stop
        style={{ ["--at" as string]: kinds.at, ["--y" as string]: `${rowTops[kinds.at] ?? 0}px` }}
      >
        <Rings className="sbs-a-contour" count={16} cx={900} cy={0} r0={120} step={26} w={900} h={560} />
        <div className="sbs-a-kinds-mark">
          <Solid className="sbs-a-kinds-solid" style={{ ["--ry" as string]: `${-38 + kinds.at * 14}deg` }} />
        </div>
        <div ref={rowsRef} className="sbs-a-kinds">
          <p className="sbs-a-kicker">{t("Insurance", "Seguros")}</p>
          {lines.map((line, i) => (
            <div key={line} className="sbs-a-kind" data-on={i === kinds.at || undefined} style={{ ["--i" as string]: i }}>
              <span className="sbs-a-num">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <b>
                  <span>{line}</span>
                </b>
                <div className="sbs-a-about">
                  <p>{about[i]}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3 · The three quotes as a comparison table (kept as it was until
          a new reference is agreed). */}
      <div className="sbs-a-sheet sbs-a-wipe" data-stop>
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

      {/* 4 · The four steps: a carousel as the reviews in the hero are (a
          strip sliding on its own, held under the pointer), on a band of
          the user's sliding-ease bars in Pilar's colours; the rest of the
          section on the page's white. */}
      <div className="sbs-a-how sbs-a-wipe" data-stop>
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

        <div className="sbs-a-carousel">
          <SlidingEaseVerticalBars
            className="sbs-a-bars"
            backgroundColor="#111525"
            lineColor="#262a3b"
            barColor="#434655"
            animationSpeed={0.004}
          />
          <div className="sbs-a-strip">
            {/* Twice over, so the lap closes without a seam. */}
            <div className="sbs-a-belt">
              {[...steps, ...steps].map(([name, text], i) => (
                <div key={i} className="sbs-a-card">
                  <span className="sbs-a-card-num">
                    {String((i % steps.length) + 1).padStart(2, "0")} <i>/ {String(steps.length).padStart(2, "0")}</i>
                  </span>
                  <b>{name}</b>
                  <span className="sbs-a-card-text">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 5 · The foot, as the Essential+ page has it (Noite, one matte
          glow of Grafite, the signature line and the way in, the links,
          the legal row; user, 2026-11-17), set in motion: the glow drifts,
          the rules draw across, the line rises and the columns follow. */}
      <div className="sbs-p-foot sbs-a-foot sbs-a-wipe" data-stop>
        <div className="sbs-p-foot-top">
          <h4>
            <span className="sbs-a-line">
              <span>{t("One broker. Every insurer.", "Um mediador. Todas as seguradoras.")}</span>
            </span>
          </h4>
          <span className="sbs-p-foot-cta">{t("Get a quote", "Pedir simulação")}</span>
        </div>
        <div className="sbs-p-foot-cols">
          <div style={{ ["--i" as string]: 0 }}>
            <b>{t("Insurance", "Seguros")}</b>
            {lines.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </div>
          <div style={{ ["--i" as string]: 1 }}>
            <b>Pilar</b>
            <span>{t("How it works", "Como funciona")}</span>
            <span>{t("Claims", "Sinistros")}</span>
            <span>{t("Client area", "Área de cliente")}</span>
          </div>
          <div style={{ ["--i" as string]: 2 }}>
            <b>{t("Office", "Escritório")}</b>
            <span>{t("Lisbon", "Lisboa")}</span>
            <small>{t("Monday to Friday, 9am to 6pm", "Segunda a sexta, 9h–18h")}</small>
          </div>
          <div style={{ ["--i" as string]: 3 }}>
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
