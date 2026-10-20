"use client";

import { Fragment, type ReactNode } from "react";
import type { LegalBlock, LegalRecord } from "@/lib/legal/types";
import { useHref, useLang, useT } from "@/lib/use-lang";
import { FloatingNav } from "./floating-nav";
import { Footer } from "./footer";
import { ProposalOverlay, ProposalProvider, useProposalController } from "./proposal-flow";
import { useSmoothScroll } from "./smooth-scroll";
import { WorkTogether } from "./work-together";

/* ==================================================================
   A legal page (privacy, legal notice and the ones to come)

   Read, not browsed: the title and what the page is for, the version
   and its dates, the plain-language summary in a black-ruled box when
   the document has one, then the sections in a measure short enough to
   read, with their list held at the left on a wide screen so any part
   is one click away. Ends like every page, on "Let's work together" and
   the foot. The words live in src/lib/legal/, both languages side by
   side.
   ================================================================== */

export function LegalPage({ record }: { record: LegalRecord }) {
  const proposal = useProposalController();
  useSmoothScroll(proposal.present);
  const lang = useLang();
  const t = useT();
  const doc = record.doc[lang];
  const date = (iso: string) =>
    new Intl.DateTimeFormat(lang === "pt" ? "pt-PT" : "en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(new Date(`${iso}T00:00:00Z`));

  return (
    <ProposalProvider value={proposal}>
      <div inert={proposal.present}>
        <FloatingNav />
        <main id="top" className="relative bg-paper">
          <article className="shell lg-page">
            <header className="lg-head">
              <h1 className="display lg-title">{doc.title}</h1>
              <p className="lg-lede">{doc.lede}</p>
              <dl className="lg-meta mono-label">
                <div>
                  <dt>{t("Version", "Versão")}</dt>
                  <dd>{record.version}</dd>
                </div>
                <div>
                  <dt>{t("In force since", "Em vigor desde")}</dt>
                  <dd>{date(record.effective)}</dd>
                </div>
                <div>
                  <dt>{t("Last updated", "Última atualização")}</dt>
                  <dd>{date(record.updated)}</dd>
                </div>
              </dl>
            </header>

            {doc.summary && (
              <section aria-labelledby="lg-summary" className="lg-summary">
                <h2 id="lg-summary" className="lg-summary-title">
                  {t("In plain words", "Em linguagem simples")}
                </h2>
                <ul>
                  {doc.summary.map((line) => (
                    <li key={line}>
                      <Inline text={line} />
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <div className="lg-body">
              <nav aria-label={t("On this page", "Nesta página")} className="lg-index">
                <ol>
                  {doc.sections.map((section) => (
                    <li key={section.id}>
                      <a href={`#${section.id}`}>{section.title}</a>
                    </li>
                  ))}
                </ol>
              </nav>
              <div className="lg-text">
                {doc.sections.map((section) => (
                  <section key={section.id} id={section.id} aria-labelledby={`${section.id}-t`} className="lg-section">
                    <h2 id={`${section.id}-t`} className="lg-h2">
                      {section.title}
                    </h2>
                    {section.blocks.map((block, i) => (
                      <Block key={i} block={block} />
                    ))}
                  </section>
                ))}

                <section aria-labelledby="lg-history" className="lg-section">
                  <h2 id="lg-history" className="lg-h2">
                    {t("Version history", "Histórico de versões")}
                  </h2>
                  <div className="lg-table-wrap">
                    <table className="lg-table">
                      <thead>
                        <tr>
                          <th scope="col">{t("Version", "Versão")}</th>
                          <th scope="col">{t("Date", "Data")}</th>
                          <th scope="col">{t("What changed", "O que mudou")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {record.history.map((entry) => (
                          <tr key={entry.version}>
                            <td>{entry.version}</td>
                            <td>{date(entry.date)}</td>
                            <td>{t(entry.change)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>
            </div>
          </article>
        </main>
        <WorkTogether />
        <Footer />
      </div>
      <ProposalOverlay ctl={proposal} />
    </ProposalProvider>
  );
}

function Block({ block }: { block: LegalBlock }) {
  if ("p" in block) {
    return (
      <p className="lg-p">
        <Inline text={block.p} />
      </p>
    );
  }
  if ("list" in block) {
    return (
      <ul className="lg-list">
        {block.list.map((item) => (
          <li key={item}>
            <Inline text={item} />
          </li>
        ))}
      </ul>
    );
  }
  // Wide tables scroll inside their own frame on a phone, never the page.
  return (
    <div className="lg-table-wrap" tabIndex={0}>
      <table className="lg-table">
        <thead>
          <tr>
            {block.table.head.map((cell) => (
              <th key={cell} scope="col">
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {block.table.rows.map((row) => (
            <tr key={row[0]}>
              {row.map((cell, i) =>
                i === 0 ? (
                  <th key={i} scope="row">
                    <Inline text={cell} />
                  </th>
                ) : (
                  <td key={i}>
                    <Inline text={cell} />
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* The three marks the documents use: a link, bold, and a blank still to
   be filled in (see src/lib/legal/types.ts). */
const MARKS = /\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*|\[([A-Z_]+)\]/g;

function Inline({ text }: { text: string }) {
  const href = useHref();
  const parts: ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(MARKS)) {
    const at = m.index ?? 0;
    if (at > last) parts.push(text.slice(last, at));
    if (m[1] !== undefined) {
      const to = m[2];
      const outside = /^https?:/.test(to);
      parts.push(
        <a
          key={at}
          href={to.startsWith("/") ? href(to) : to}
          className="lg-link"
          {...(outside ? { target: "_blank", rel: "noopener" } : {})}
        >
          {m[1]}
        </a>,
      );
    } else if (m[3] !== undefined) {
      parts.push(<strong key={at}>{m[3]}</strong>);
    } else {
      parts.push(
        <mark key={at} className="lg-blank">
          [{m[4]}]
        </mark>,
      );
    }
    last = at + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <Fragment>{parts}</Fragment>;
}
