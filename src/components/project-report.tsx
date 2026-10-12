"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useAnimate, useReducedMotion } from "motion/react";
import { SERVICES } from "@/lib/services";
import { PHASES, STATUS_LABEL, TO_FILL, type Project } from "@/lib/work";

/* ==================================================================
   The project report

   Pressed in the portfolio, a photo becomes the first page of a report
   (user, 2026-10-12): it grows into an A4 sheet in the middle of the
   room, the room darkens behind it, and the rest of the report follows
   under it, sheet after sheet, read by scrolling as a document is
   previewed. Close, Esc or a click on the dark sends it back.

   Every report has the same structure (see docs/report-template.md):

   - the cover: the project, what was made, its photo and its facts;
   - the project: where the client stood, the goals, our approach and
     how long each phase of How we work took;
   - the website: its pages, what it does, what comes with it, and how
     it measures, live;
   - one page for each further service the project took: the visual
     identity; search and AI visibility (SEO and GEO share one); the
     photo shoot;
   - the outcome: what changed, the client's words, credits, and the
     note on what the report leaves out.

   The sheets are laid out against their own width (container units), so
   a sheet is the same document at any size, as a PDF is; on a phone,
   where that would leave the text too small to read, the words keep a
   floor and the sheet grows as long as it needs.

   Nothing about a client is made up: every field the studio has not
   given reads as TO_FILL.
   ================================================================== */

const IN = [0.22, 1, 0.36, 1] as const;
const OUT = [0.4, 0, 0.2, 1] as const;

const has = (project: Project, service: string) => project.services.includes(service);

/** A field's value, or the mark for one still to come. */
function Fill({ value, className }: { value: string | null | undefined; className?: string }) {
  if (value) return <span className={className}>{value}</span>;
  return <span className={`rp-fill ${className ?? ""}`}>{TO_FILL}</span>;
}

/** A list, or the mark for one still to come. */
function Lines({ items }: { items: string[] | null | undefined }) {
  if (!items?.length) return <p className="rp-fill">{TO_FILL}</p>;
  return (
    <ul className="rp-lines">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function Tags({ items }: { items: string[] }) {
  return (
    <ul className="fo-tags rp-tags" aria-label="Services">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

/* --- the sheets ----------------------------------------------------------- */

type Sheet = { key: string; title: string; body: ReactNode };

function sheetsFor(project: Project): Sheet[] {
  const s = project.study;
  const sheets: Sheet[] = [];

  sheets.push({
    key: "cover",
    title: "Cover",
    body: (
      <>
        <div className="rp-cover-head">
          <h2 id="rp-title" className="rp-cover-name">
            {project.name}
          </h2>
          <span className="rp-state">{STATUS_LABEL[project.status]}</span>
        </div>
        <p className="rp-lede rp-justify">{project.summary}</p>
        <div className="rp-photo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={project.photo.src} alt={project.photo.alt} draggable={false} />
        </div>
        <dl className="rp-facts">
          {[
            ["Sector", project.sector],
            ["Region", s.region],
            ["Website type", project.websiteType],
            ["Pages", project.pages],
            ["Design level", project.designLevel],
            ["Delivered", s.delivered],
          ].map(([name, value]) => (
            <div key={name}>
              <dt>{name}</dt>
              <dd>
                <Fill value={value} />
              </dd>
            </div>
          ))}
        </dl>
        <div className="rp-services">
          <p className="rp-key">Services</p>
          <Tags items={project.services} />
        </div>
      </>
    ),
  });

  sheets.push({
    key: "project",
    title: "The project",
    body: (
      <>
        <h3 className="rp-h">The project</h3>
        <div className="rp-split">
          <section>
            <h4 className="rp-sub">Where it started</h4>
            <p className="rp-text rp-justify">
              <Fill value={s.startingPoint} />
            </p>
          </section>
          <section>
            <h4 className="rp-sub">Goals</h4>
            <Lines items={s.goals} />
          </section>
        </div>
        <section className="rp-block">
          <h4 className="rp-sub">Our approach</h4>
          <p className="rp-text rp-justify">
            <Fill value={s.approach} />
          </p>
        </section>
        <section className="rp-block">
          <h4 className="rp-sub">How it ran</h4>
          <ol className="rp-phases">
            {PHASES.map((phase, i) => (
              <li key={phase}>
                <span className="rp-phase-dot" aria-hidden="true" />
                <span className="rp-phase-name">{phase}</span>
                <Fill value={s.phases?.[i]} className="rp-phase-time" />
              </li>
            ))}
          </ol>
          <p className="rp-note">
            Start to launch: <Fill value={s.duration} />
          </p>
        </section>
      </>
    ),
  });

  const included = SERVICES.find((x) => x.slug === "web-design")?.included?.items ?? [];
  sheets.push({
    key: "website",
    title: "The website",
    body: (
      <>
        <h3 className="rp-h">The website</h3>
        <section className="rp-block rp-block-first">
          <h4 className="rp-sub">Its pages</h4>
          {s.sitemap?.length ? (
            <ul className="rp-map">
              {s.sitemap.map((page) => (
                <li key={page}>{page}</li>
              ))}
            </ul>
          ) : (
            <p className="rp-fill">{TO_FILL}</p>
          )}
        </section>
        <div className="rp-split rp-block">
          <section>
            <h4 className="rp-sub">What it does</h4>
            <Lines items={s.features} />
          </section>
          <section>
            <h4 className="rp-sub">Included with it</h4>
            <Lines items={[...included]} />
          </section>
        </div>
        <section className="rp-block">
          <h4 className="rp-sub">Measured on the live website</h4>
          <dl className="rp-scores">
            {[
              ["Performance", s.scores.performance],
              ["Accessibility", s.scores.accessibility],
              ["Best practices", s.scores.bestPractices],
              ["SEO", s.scores.seo],
            ].map(([name, value]) => (
              <div key={name}>
                <dd>
                  <Fill value={value} />
                </dd>
                <dt>{name}</dt>
              </div>
            ))}
          </dl>
          <p className="rp-note">
            Lighthouse, on a phone, out of 100. Load time: <Fill value={s.scores.loadTime} />
          </p>
        </section>
      </>
    ),
  });

  if (has(project, "Visual identity")) {
    const id = s.identity;
    sheets.push({
      key: "identity",
      title: "Visual identity",
      body: (
        <>
          <h3 className="rp-h">Visual identity</h3>
          <p className="rp-text rp-justify rp-block-first">
            <Fill value={id.idea} />
          </p>
          <section className="rp-block">
            <h4 className="rp-sub">The logo</h4>
            <div className="rp-logos">
              <figure className="rp-logo">
                {id.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={id.logo} alt={`${project.name} logo`} />
                ) : (
                  <span className="rp-fill">{TO_FILL}</span>
                )}
                <figcaption>On white</figcaption>
              </figure>
              <figure className="rp-logo rp-logo-dark">
                {id.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={id.logo} alt="" />
                ) : (
                  <span className="rp-fill">{TO_FILL}</span>
                )}
                <figcaption>On black</figcaption>
              </figure>
              <figure className="rp-logo">
                {id.symbol ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={id.symbol} alt={`${project.name} symbol`} />
                ) : (
                  <span className="rp-fill">{TO_FILL}</span>
                )}
                <figcaption>Symbol, if there is one</figcaption>
              </figure>
            </div>
          </section>
          <section className="rp-block">
            <h4 className="rp-sub">Colours</h4>
            <ul className="rp-swatches">
              {(id.palette ?? Array.from({ length: 5 }, () => null)).map((colour, i) =>
                colour ? (
                  <li key={colour.hex}>
                    <span className="rp-swatch" style={{ background: colour.hex }} />
                    <span className="rp-swatch-name">{colour.name}</span>
                    <span className="rp-swatch-hex">{colour.hex}</span>
                  </li>
                ) : (
                  <li key={i}>
                    <span className="rp-swatch rp-swatch-empty" />
                    <span className="rp-fill">{TO_FILL}</span>
                  </li>
                ),
              )}
            </ul>
          </section>
          <div className="rp-split rp-block">
            <section>
              <h4 className="rp-sub">Typefaces</h4>
              {id.typefaces?.length ? (
                <ul className="rp-faces">
                  {id.typefaces.map((face) => (
                    <li key={face.role}>
                      <span className="rp-face-sample" style={{ fontFamily: face.name }}>
                        Aa
                      </span>
                      <span>
                        <span className="rp-face-name">{face.name}</span>
                        <span className="rp-key">{face.role}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="rp-fill">{TO_FILL}</p>
              )}
            </section>
            <section>
              <h4 className="rp-sub">Where it is used</h4>
              <Lines items={id.applications} />
            </section>
          </div>
        </>
      ),
    });
  }

  const seo = has(project, "SEO");
  const geo = has(project, "GEO");
  if (seo || geo) {
    const title =
      seo && geo ? "Found on search and in AI answers" : seo ? "Found on search" : "Found in AI answers";
    sheets.push({
      key: "visibility",
      title,
      body: (
        <>
          <h3 className="rp-h">{title}</h3>
          {seo && (
            <section className="rp-block rp-block-first">
              <h4 className="rp-sub">Search (SEO)</h4>
              <p className="rp-key">The searches it is set up for</p>
              {s.seo.searches?.length ? (
                <Tags items={s.seo.searches} />
              ) : (
                <p className="rp-fill">{TO_FILL}</p>
              )}
              <div className="rp-split rp-block-tight">
                <div>
                  <p className="rp-key">What we put in place</p>
                  <Lines items={s.seo.work} />
                </div>
                <div className="rp-shift">
                  <div>
                    <p className="rp-key">Before</p>
                    <Fill value={s.seo.before} className="rp-shift-value" />
                  </div>
                  <span aria-hidden="true" className="rp-shift-arrow">
                    &rarr;
                  </span>
                  <div>
                    <p className="rp-key">After</p>
                    <Fill value={s.seo.after} className="rp-shift-value" />
                  </div>
                </div>
              </div>
            </section>
          )}
          {geo && (
            <section className={`rp-block ${seo ? "" : "rp-block-first"}`}>
              <h4 className="rp-sub">AI answers (GEO)</h4>
              <div className="rp-split">
                <div>
                  <p className="rp-key">What we put in place</p>
                  <Lines items={s.geo.work} />
                </div>
                <div>
                  <p className="rp-key">How it shows now</p>
                  <p className="rp-text">
                    <Fill value={s.geo.presence} />
                  </p>
                </div>
              </div>
            </section>
          )}
        </>
      ),
    });
  }

  if (has(project, "Photo shoot")) {
    sheets.push({
      key: "shoot",
      title: "Photo shoot",
      body: (
        <>
          <h3 className="rp-h">Photo shoot</h3>
          <p className="rp-text rp-justify rp-block-first">
            <Fill value={s.shoot.subject} />
          </p>
          <dl className="rp-facts rp-block">
            <div>
              <dt>Photos</dt>
              <dd>
                <Fill value={s.shoot.photos} />
              </dd>
            </div>
            <div>
              <dt>Videos</dt>
              <dd>
                <Fill value={s.shoot.videos} />
              </dd>
            </div>
          </dl>
          <div className="rp-gallery rp-block" aria-hidden="true">
            {Array.from({ length: 6 }, (_, i) => (
              <span key={i} />
            ))}
          </div>
        </>
      ),
    });
  }

  const shoot = has(project, "Photo shoot");
  sheets.push({
    key: "outcome",
    title: "The outcome",
    body: (
      <>
        <h3 className="rp-h">The outcome</h3>
        <p className="rp-text rp-justify rp-block-first">
          <Fill value={s.outcome} />
        </p>
        <figure className="rp-quote rp-block">
          <blockquote>
            <Fill value={s.quote?.text} />
          </blockquote>
          <figcaption>
            <Fill value={s.quote?.by} />
          </figcaption>
        </figure>
        <section className="rp-block">
          <h4 className="rp-sub">Credits</h4>
          <dl className="rp-credits">
            <div>
              <dt>Strategy, design and build</dt>
              <dd>nevima</dd>
            </div>
            {has(project, "Visual identity") && (
              <div>
                <dt>Visual identity</dt>
                <dd>nevima</dd>
              </div>
            )}
            <div>
              <dt>Photography</dt>
              <dd>{shoot ? "nevima" : `${project.photo.credit}, a stand-in`}</dd>
            </div>
          </dl>
        </section>
        <p className="rp-privacy">
          This report leaves out the client&rsquo;s personal and commercial information. Results
          are shown rounded or as a change, and the client&rsquo;s words appear only with their
          consent.
        </p>
      </>
    ),
  });

  return sheets;
}

function Page({
  project,
  n,
  total,
  children,
  pageRef,
  style,
}: {
  project: Project;
  n: number;
  total: number;
  children: ReactNode;
  pageRef?: (el: HTMLElement | null) => void;
  style?: CSSProperties;
}) {
  return (
    <article ref={pageRef} className="rp-page" style={style} aria-label={`Page ${n} of ${total}`}>
      <div className="rp-inner">
        <header className="rp-top">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/nevima-wordmark.svg" alt="nevima" className="rp-mark" />
          <span>Project report</span>
        </header>
        <div className="rp-content">{children}</div>
        <footer className="rp-foot">
          <span>{project.name}</span>
          <span>
            {n} / {total}
          </span>
        </footer>
      </div>
    </article>
  );
}

/* --- the preview ---------------------------------------------------------- */

export function ProjectReport({
  project,
  from,
  onGone,
}: {
  project: Project;
  from: HTMLElement;
  onGone: () => void;
}) {
  const reduce = useReducedMotion() ?? false;
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const shade = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const first = useRef<HTMLElement | null>(null);
  const close = useRef<HTMLButtonElement>(null);
  const flight = useRef<{ x: number; y: number; sx: number; sy: number } | null>(null);
  const leaving = useRef(false);
  const [ready, setReady] = useState(false);

  const sheets = sheetsFor(project);
  const live = project.status === "live" && project.url;

  // The tile and the first page, measured before the first paint, so the
  // page is drawn over the tile from its very first frame.
  useLayoutEffect(() => {
    const page = first.current;
    if (!page) return;
    const a = from.getBoundingClientRect();
    const b = page.getBoundingClientRect();
    flight.current = {
      x: a.left - b.left,
      y: a.top - b.top,
      sx: a.width / b.width,
      sy: a.height / b.height,
    };
    setReady(true);
  }, [from]);

  // In.
  useEffect(() => {
    if (!ready || !shade.current || !first.current) return;
    const f = flight.current;
    const run = async () => {
      if (reduce || !f) {
        await Promise.all([
          animate(shade.current!, { opacity: [0, 1] }, { duration: 0.2 }),
          animate(scope.current, { opacity: [0, 1] }, { duration: 0.2 }),
        ]);
      } else {
        animate(shade.current!, { opacity: [0, 1] }, { duration: 0.4 });
        animate(".rp-bar", { opacity: [0, 1], y: [-6, 0] }, { duration: 0.4, delay: 0.35, ease: IN });
        // The photo's tile grows into the first sheet...
        await animate(
          first.current!,
          { x: [f.x, 0], y: [f.y, 0], scaleX: [f.sx, 1], scaleY: [f.sy, 1] },
          { duration: 0.65, ease: IN },
        );
        // ...its words come up on it, and the rest of the report follows.
        animate(first.current!.querySelector(".rp-inner")!, { opacity: [0, 1] }, { duration: 0.3 });
        animate(
          ".rp-page:not(:first-child)",
          { opacity: [0, 1], y: [24, 0] },
          { duration: 0.45, ease: IN },
        );
      }
      close.current?.focus({ preventScroll: true });
    };
    run();
    // Once, as it comes in; leaving is shut() below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  const shut = useCallback(async () => {
    if (leaving.current) return;
    leaving.current = true;
    const f = flight.current;
    const page = first.current;
    if (!shade.current || !page) return onGone();
    const atTop = (scroller.current?.scrollTop ?? 0) < 24;
    if (reduce || !f || !atTop) {
      await Promise.all([
        animate(scope.current, { opacity: 0 }, { duration: reduce ? 0.15 : 0.25 }),
        animate(shade.current, { opacity: 0 }, { duration: reduce ? 0.15 : 0.3 }),
      ]);
      return onGone();
    }
    animate(".rp-bar", { opacity: 0 }, { duration: 0.15 });
    animate(".rp-page:not(:first-child)", { opacity: 0 }, { duration: 0.15 });
    await animate(page.querySelector(".rp-inner")!, { opacity: 0 }, { duration: 0.12 });
    animate(shade.current, { opacity: 0 }, { duration: 0.4 });
    await animate(page, { x: f.x, y: f.y, scaleX: f.sx, scaleY: f.sy }, { duration: 0.45, ease: OUT });
    onGone();
  }, [animate, onGone, reduce, scope]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") shut();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [shut]);

  const flying = !reduce && flight.current;

  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-labelledby="rp-title">
      <div ref={shade} className="rp-shade" style={{ opacity: 0 }} />
      <div ref={scope} className="rp-scope" style={reduce ? { opacity: 0 } : undefined}>
        <div className="rp-bar" style={flying ? { opacity: 0 } : undefined}>
          <button ref={close} type="button" onClick={shut} className="cta-drop cta-drop-light rp-bar-button">
            <span className="btn-neu-face">
              Close
              <span aria-hidden="true" className="ml-1.5">
                &times;
              </span>
            </span>
          </button>
          {live && (
            <a
              href={project.url!}
              target="_blank"
              rel="noopener"
              className="cta-drop fo-exit rp-bar-button"
            >
              <span className="btn-neu-face">
                Go to the website
                <span aria-hidden="true">&#8599;</span>
              </span>
            </a>
          )}
        </div>
        {/* A click on the dark round the sheets closes it, as on the shade. */}
        <div
          ref={scroller}
          className="rp-scroll"
          data-lenis-prevent
          onClick={(e) => {
            if (e.target === e.currentTarget || (e.target as Element).classList.contains("rp-stack")) shut();
          }}
        >
          <div className="rp-stack">
            {sheets.map((sheet, i) => (
              <Page
                key={sheet.key}
                project={project}
                n={i + 1}
                total={sheets.length}
                pageRef={
                  i === 0
                    ? (el) => {
                        first.current = el;
                      }
                    : undefined
                }
                // Drawn first over the tile, so it is never seen anywhere else.
                style={
                  i === 0 && flying
                    ? {
                        transform: `translateX(${flying.x}px) translateY(${flying.y}px) scaleX(${flying.sx}) scaleY(${flying.sy})`,
                      }
                    : undefined
                }
              >
                {sheet.body}
              </Page>
            ))}
          </div>
        </div>
      </div>
      {/* Until measured, and while it flies, the first page's words and
          the pages after it wait. */}
      {flying && (
        <style>{`.rp-page:first-child .rp-inner, .rp-page:not(:first-child) { opacity: 0; }`}</style>
      )}
      {!ready && <style>{`.rp-scope { visibility: hidden; }`}</style>}
    </div>
  );
}
