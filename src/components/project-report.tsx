"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { useAnimate, useReducedMotion } from "motion/react";
import { SERVICES } from "@/lib/services";
import { PHASES, STATUS_LABEL, TO_FILL, type Project } from "@/lib/work";

/* ==================================================================
   The project report

   Pressed in the portfolio, a photo grows into the report (user,
   2026-10-12): one sheet in the middle of the darkened room, a little
   wider than an A4 page and as tall as the screen, and the report runs
   down inside it as the visitor scrolls. It reads as a report (a cover,
   chapters, figures, a closing note) but behaves as a website: its
   header stays at the top of the sheet with the chapters to jump to and
   a line showing how far through it the reader is. Close, Esc or a click
   on the dark sends it back into the photo.

   Every report has the same structure (see docs/report-template.md):

   - the cover: the project, what was made, its photo and its facts;
   - the project: where the client stood, the goals, our approach and
     how long each phase of How we work took;
   - the website: its pages, what it does, what comes with it, and how
     it measures, live;
   - a chapter for each further service the project took: the visual
     identity; search and AI answers (SEO and GEO share one); the photo
     shoot;
   - the outcome: what changed, the client's words, credits, and the
     note on what the report leaves out.

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
function Lines({ items }: { items: readonly string[] | null | undefined }) {
  if (!items?.length) return <p className="rp-fill">{TO_FILL}</p>;
  return (
    <ul className="rp-lines">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function Tags({ items, label = "Services" }: { items: readonly string[]; label?: string }) {
  return (
    <ul className="fo-tags rp-tags" aria-label={label}>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

/** A score out of 100 as a ring that fills to it; empty until measured. */
function Gauge({ name, value }: { name: string; value: string | null }) {
  const n = value ? Number.parseFloat(value) : NaN;
  const known = Number.isFinite(n);
  const r = 26;
  const c = 2 * Math.PI * r;
  return (
    <div className="rp-gauge">
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="32" cy="32" r={r} className="rp-gauge-track" />
        {known && (
          <circle
            cx="32"
            cy="32"
            r={r}
            className="rp-gauge-fill"
            strokeDasharray={c}
            strokeDashoffset={c * (1 - Math.min(Math.max(n, 0), 100) / 100)}
          />
        )}
      </svg>
      <span className="rp-gauge-value">{known ? Math.round(n) : "–"}</span>
      <span className="rp-gauge-name">
        {name}
        {!known && <span className="rp-fill rp-gauge-fill-note"> {TO_FILL}</span>}
      </span>
    </div>
  );
}

/* --- the chapters ---------------------------------------------------------- */

type Chapter = { id: string; label: string; body: ReactNode };

function chaptersFor(project: Project): Chapter[] {
  const s = project.study;
  const chapters: Chapter[] = [];

  chapters.push({
    id: "overview",
    label: "Overview",
    body: (
      <>
        <div className="rp-hero">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={project.photo.src} alt={project.photo.alt} draggable={false} />
        </div>
        <div className="rp-cover">
          <div className="rp-cover-head">
            <h2 id="rp-title" className="rp-cover-name">
              <span>{project.name}</span>
            </h2>
            <span className="rp-state" data-live={project.status === "live" ? "" : undefined}>
              <span aria-hidden="true" className="rp-state-dot" />
              {STATUS_LABEL[project.status]}
            </span>
          </div>
          <p className="rp-lede rp-justify">{project.summary}</p>
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
        </div>
      </>
    ),
  });

  chapters.push({
    id: "project",
    label: "The project",
    body: (
      <>
        <h3 className="rp-h">The project</h3>
        <div className="rp-split">
          <section className="rp-card">
            <h4 className="rp-sub">Where it started</h4>
            <p className="rp-text rp-justify">
              <Fill value={s.startingPoint} />
            </p>
          </section>
          <section className="rp-card">
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
          <ol className="rp-steps">
            {PHASES.map((phase, i) => (
              <li key={phase}>
                <span className="rp-step-dot" aria-hidden="true" />
                <span className="rp-step-name">{phase}</span>
                <Fill value={s.phases?.[i]} className="rp-step-time" />
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
  chapters.push({
    id: "website",
    label: "The website",
    body: (
      <>
        <h3 className="rp-h">The website</h3>
        <section className="rp-block rp-block-first">
          <h4 className="rp-sub">Its pages</h4>
          {s.sitemap?.length ? (
            <Tags items={s.sitemap} label="Pages" />
          ) : (
            <p className="rp-fill">{TO_FILL}</p>
          )}
        </section>
        <div className="rp-split rp-block">
          <section className="rp-card">
            <h4 className="rp-sub">What it does</h4>
            <Lines items={s.features} />
          </section>
          <section className="rp-card">
            <h4 className="rp-sub">Included with it</h4>
            <Lines items={included} />
          </section>
        </div>
        <section className="rp-block">
          <h4 className="rp-sub">Measured on the live website</h4>
          <div className="rp-gauges">
            <Gauge name="Performance" value={s.scores.performance} />
            <Gauge name="Accessibility" value={s.scores.accessibility} />
            <Gauge name="Best practices" value={s.scores.bestPractices} />
            <Gauge name="SEO" value={s.scores.seo} />
          </div>
          <p className="rp-note">
            Lighthouse, on a phone, out of 100. Load time: <Fill value={s.scores.loadTime} />
          </p>
        </section>
      </>
    ),
  });

  if (has(project, "Visual identity")) {
    const id = s.identity;
    chapters.push({
      id: "identity",
      label: "Identity",
      body: (
        <>
          <h3 className="rp-h">Visual identity</h3>
          <p className="rp-text rp-justify rp-block-first">
            <Fill value={id.idea} />
          </p>
          <section className="rp-block">
            <h4 className="rp-sub">The logo</h4>
            <div className="rp-logos">
              {[
                { src: id.logo, alt: `${project.name} logo`, caption: "On white", dark: false },
                { src: id.logo, alt: "", caption: "On black", dark: true },
                { src: id.symbol, alt: `${project.name} symbol`, caption: "Symbol, if there is one", dark: false },
              ].map((logo) => (
                <figure key={logo.caption} className="rp-logo" data-dark={logo.dark ? "" : undefined}>
                  <span className="rp-logo-box">
                    {logo.src ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={logo.src} alt={logo.alt} />
                    ) : (
                      <span className="rp-fill">{TO_FILL}</span>
                    )}
                  </span>
                  <figcaption>{logo.caption}</figcaption>
                </figure>
              ))}
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
            <section className="rp-card">
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
            <section className="rp-card">
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
    chapters.push({
      id: "visibility",
      label: seo && geo ? "Search & AI" : seo ? "Search" : "AI answers",
      body: (
        <>
          <h3 className="rp-h">{title}</h3>
          {seo && (
            <section className="rp-card rp-block-first">
              <h4 className="rp-sub">Search (SEO)</h4>
              <p className="rp-key">The searches it is set up for</p>
              {s.seo.searches?.length ? (
                <Tags items={s.seo.searches} label="Searches" />
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
            <section className={`rp-card ${seo ? "rp-block-tight" : "rp-block-first"}`}>
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

  const shoot = has(project, "Photo shoot");
  if (shoot) {
    chapters.push({
      id: "shoot",
      label: "Photo shoot",
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

  chapters.push({
    id: "outcome",
    label: "Outcome",
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
          <dl className="rp-facts rp-credits">
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
          <svg aria-hidden="true" viewBox="0 0 16 16" width="14" height="14" fill="none">
            <rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
            <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" stroke="currentColor" strokeWidth="1.2" />
          </svg>
          This report leaves out the client&rsquo;s personal and commercial information. Results
          are shown rounded or as a change, and the client&rsquo;s words appear only with their
          consent.
        </p>
      </>
    ),
  });

  return chapters;
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
  const sheet = useRef<HTMLElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const progress = useRef<HTMLSpanElement>(null);
  const close = useRef<HTMLButtonElement>(null);
  const flight = useRef<{ x: number; y: number; sx: number; sy: number } | null>(null);
  const leaving = useRef(false);
  const [ready, setReady] = useState(false);
  const [current, setCurrent] = useState("overview");

  const chapters = chaptersFor(project);
  const live = project.status === "live" && project.url;

  // The tile and the sheet, measured before the first paint, so the sheet
  // is drawn over the tile from its very first frame.
  useLayoutEffect(() => {
    const el = sheet.current;
    if (!el) return;
    const a = from.getBoundingClientRect();
    const b = el.getBoundingClientRect();
    flight.current = {
      x: a.left - b.left,
      y: a.top - b.top,
      sx: a.width / b.width,
      sy: a.height / b.height,
    };
    setReady(true);
  }, [from]);

  // In: the photo's tile grows into the sheet, then the report comes up
  // on it.
  useEffect(() => {
    if (!ready || !shade.current || !sheet.current || !content.current) return;
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
        await animate(
          sheet.current!,
          { x: [f.x, 0], y: [f.y, 0], scaleX: [f.sx, 1], scaleY: [f.sy, 1] },
          { duration: 0.65, ease: IN },
        );
        await animate(content.current!, { opacity: [0, 1], y: [10, 0] }, { duration: 0.35, ease: IN });
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
    if (!shade.current || !sheet.current || !content.current) return onGone();
    if (reduce || !f) {
      await Promise.all([
        animate(scope.current, { opacity: 0 }, { duration: 0.15 }),
        animate(shade.current, { opacity: 0 }, { duration: 0.15 }),
      ]);
      return onGone();
    }
    animate(".rp-bar", { opacity: 0 }, { duration: 0.15 });
    await animate(content.current, { opacity: 0 }, { duration: 0.14 });
    animate(shade.current, { opacity: 0 }, { duration: 0.4 });
    await animate(
      sheet.current,
      { x: f.x, y: f.y, scaleX: f.sx, scaleY: f.sy },
      { duration: 0.45, ease: OUT },
    );
    onGone();
  }, [animate, onGone, reduce, scope]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") shut();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [shut]);

  // How far through it the reader is, and which chapter they are in.
  useEffect(() => {
    const root = scroller.current;
    if (!root) return;
    const read = () => {
      const max = root.scrollHeight - root.clientHeight;
      if (progress.current) progress.current.style.transform = `scaleX(${max > 0 ? root.scrollTop / max : 0})`;
      const line = root.getBoundingClientRect().top + root.clientHeight * 0.3;
      let now = chapters[0]?.id ?? "overview";
      for (const chapter of chapters) {
        const el = root.querySelector(`#rp-${chapter.id}`);
        if (el && el.getBoundingClientRect().top <= line) now = chapter.id;
      }
      // The last chapter counts as read once the end is in view.
      if (max > 0 && root.scrollTop >= max - 4) now = chapters[chapters.length - 1].id;
      setCurrent(now);
    };
    read();
    root.addEventListener("scroll", read, { passive: true });
    return () => root.removeEventListener("scroll", read);
    // The chapters only change with the project, which keys this component.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const go = (id: string) => {
    const root = scroller.current;
    const el = root?.querySelector<HTMLElement>(`#rp-${id}`);
    if (!root || !el) return;
    const head = root.querySelector<HTMLElement>(".rp-head")?.offsetHeight ?? 0;
    root.scrollTo({
      top: id === chapters[0].id ? 0 : el.offsetTop - head - 8,
      behavior: reduce ? "auto" : "smooth",
    });
  };

  const flying = !reduce && flight.current;

  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-labelledby="rp-title">
      <div ref={shade} className="rp-shade" style={{ opacity: 0 }} />
      <div
        ref={scope}
        className="rp-scope"
        style={reduce ? { opacity: 0 } : undefined}
        // A click on the dark round the sheet closes it.
        onClick={(e) => {
          if (e.target === e.currentTarget) shut();
        }}
      >
        <div className="rp-bar" style={flying ? { opacity: 0 } : undefined}>
          <button ref={close} type="button" onClick={shut} className="cta-drop cta-drop-light rp-bar-button">
            <span className="btn-neu-face">
              Close
              <span aria-hidden="true">&times;</span>
            </span>
          </button>
          {live && (
            <a href={project.url!} target="_blank" rel="noopener" className="cta-drop fo-exit rp-bar-button">
              <span className="btn-neu-face">
                Go to the website
                <span aria-hidden="true">&#8599;</span>
              </span>
            </a>
          )}
        </div>

        <article
          ref={sheet}
          className="rp-sheet"
          // Drawn first over the tile, so it is never seen anywhere else.
          style={
            flying
              ? {
                  transform: `translateX(${flying.x}px) translateY(${flying.y}px) scaleX(${flying.sx}) scaleY(${flying.sy})`,
                }
              : undefined
          }
        >
          <div ref={scroller} className="rp-scroll" data-lenis-prevent>
            <div ref={content} style={flying ? { opacity: 0 } : undefined}>
              <header className="rp-head">
                <div className="rp-head-row">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/nevima-wordmark.svg" alt="nevima" className="rp-mark" />
                  <span className="rp-head-title">
                    Project report <span aria-hidden="true">/</span> {project.name}
                  </span>
                </div>
                <nav aria-label="Report chapters" className="rp-nav">
                  {chapters.map((chapter) => (
                    <button
                      key={chapter.id}
                      type="button"
                      aria-current={current === chapter.id ? "true" : undefined}
                      onClick={() => go(chapter.id)}
                    >
                      {chapter.label}
                    </button>
                  ))}
                </nav>
                <span className="rp-progress" aria-hidden="true">
                  <span ref={progress} />
                </span>
              </header>

              {chapters.map((chapter) => (
                <section
                  key={chapter.id}
                  id={`rp-${chapter.id}`}
                  className="rp-chapter"
                  data-cover={chapter.id === "overview" ? "" : undefined}
                >
                  {chapter.body}
                </section>
              ))}

              <footer className="rp-end">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/nevima-wordmark.svg" alt="" className="rp-mark" />
                <button type="button" onClick={() => go(chapters[0].id)} className="rp-top-link">
                  Back to the top
                </button>
              </footer>
            </div>
          </div>
        </article>
      </div>
      {!ready && <style>{`.rp-scope { visibility: hidden; }`}</style>}
    </div>
  );
}
