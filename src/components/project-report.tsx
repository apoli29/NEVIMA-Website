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
   down inside it as the visitor scrolls, set in the site's own language.
   Its header stays at the top of the sheet with the chapters to jump to
   and a line showing how far through it the reader is. Close, Esc or a click
   on the dark sends it back into the photo.

   Every report has the same structure, organised by service (see
   docs/report-template.md): the overview, a chapter for each service the
   project took, and the outcome.

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

function Tags({ items, label = "Services" }: { items: readonly string[]; label?: string }) {
  return (
    <ul className="fo-tags rp-tags" aria-label={label}>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

/* --- the chapters ----------------------------------------------------------
   Organised by service (user, 2026-10-12): the overview, then one chapter
   for each service the project took, in the order the services section
   lists them, each saying only what makes sense for that service, then
   the outcome. Set in the site's own language: hairlines, the gallery's
   mono labels, names in light Satoshi, black boxes for what kind of
   service it is, the services' ticked lists. */

type Chapter = { id: string; label: string; body: ReactNode };

/** A ticked list, as the services' "Also included". */
function Ticks({ title, items }: { title: string; items: readonly string[] | null | undefined }) {
  return (
    <div>
      <p className="mono-label text-ash-2">{title}</p>
      {items?.length ? (
        <ul className="rp-ticks">
          {items.map((item) => (
            <li key={item}>
              <svg viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <path
                  d="M3.4 9.7 7.1 13.3C9.4 9.5 11.8 6.7 15 4.3"
                  stroke="currentColor"
                  strokeWidth={1.35}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rp-fill rp-gap">{TO_FILL}</p>
      )}
    </div>
  );
}

/** A label over a short paragraph. */
function Para({ title, value }: { title: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="mono-label text-ash-2">{title}</p>
      <p className="rp-text rp-justify rp-gap">
        <Fill value={value} />
      </p>
    </div>
  );
}

/** A row of readouts over a hairline, as the second screen's. */
function Readouts({ items, big = false }: { items: [string, string | null | undefined][]; big?: boolean }) {
  return (
    <dl className="rp-readouts" data-big={big ? "" : undefined} style={{ ["--n" as string]: items.length }}>
      {items.map(([label, value]) => (
        <div key={label}>
          <dt className="mono-label text-ash-2">{label}</dt>
          <dd>
            <Fill value={value} />
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** A service's chapter: its name, what kind of service it is, then two
    columns (what was asked and done on the left, the specifics on the
    right) and whatever else that service needs below. */
function ServiceChapter({
  name,
  main,
  left,
  right,
  children,
}: {
  name: string;
  main: boolean;
  left: ReactNode;
  right: ReactNode;
  children?: ReactNode;
}) {
  return (
    <>
      <div className="rp-svc-head">
        <h3 className="rp-svc-name">{name}</h3>
        <span className={`mono-label ${main ? "rp-tag-main" : "idx-title"}`}>
          {main ? "Main service" : "Additional service"}
        </span>
      </div>
      <div className="rp-cols">
        <div className="rp-stack">{left}</div>
        <div className="rp-stack">{right}</div>
      </div>
      {children}
    </>
  );
}

function chaptersFor(project: Project): Chapter[] {
  const s = project.study;
  const chapters: Chapter[] = [];
  const took = (title: string) => project.services.some((x) => x.toLowerCase() === title.toLowerCase());

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
            <span className="rp-state mono-label">
              <span
                aria-hidden="true"
                className={project.status === "live" ? "live-dot" : "rp-dot-idle"}
              />
              {STATUS_LABEL[project.status]}
            </span>
          </div>
          <p className="rp-lede rp-justify">{project.summary}</p>
          <Readouts
            items={[
              ["Sector", project.sector],
              ["Region", s.region],
              ["Delivered", s.delivered],
              ["Start to launch", s.duration],
            ]}
          />
          <div className="rp-services">
            <p className="mono-label text-ash-2">Services</p>
            <Tags items={project.services} />
          </div>
        </div>
      </>
    ),
  });

  const web = SERVICES.find((x) => x.slug === "web-design");
  chapters.push({
    id: "web-design",
    label: "Web Design",
    body: (
      <ServiceChapter
        name="Web Design"
        main
        left={
          <>
            <Para title="The brief" value={s.startingPoint} />
            <Para title="What we built" value={s.approach} />
          </>
        }
        right={
          <>
            <dl className="rp-specs">
              {[
                ["Website type", project.websiteType],
                ["Pages", project.pages],
                ["Design level", project.designLevel],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="mono-label text-ash-2">{label}</dt>
                  <dd>
                    <Fill value={value} />
                  </dd>
                </div>
              ))}
            </dl>
            <div>
              <p className="mono-label text-ash-2">Its pages</p>
              <div className="rp-gap">
                {s.sitemap?.length ? <Tags items={s.sitemap} label="Pages" /> : <p className="rp-fill">{TO_FILL}</p>}
              </div>
            </div>
          </>
        }
      >
        <div className="rp-three">
          <Ticks title="Goals" items={s.goals} />
          <Ticks title="What it does" items={s.features} />
          <Ticks title={web?.included?.title ?? "Also included"} items={web?.included?.items} />
        </div>
        <div className="rp-pair">
          <div>
            <p className="rp-sub">How it ran</p>
            <Readouts items={PHASES.map((phase, i) => [phase, s.phases?.[i]])} />
          </div>
          <div>
            <p className="rp-sub">Measured on the live website</p>
            <Readouts
              big
              items={[
                ["Performance", s.scores.performance],
                ["Accessibility", s.scores.accessibility],
                ["Best practices", s.scores.bestPractices],
                ["SEO", s.scores.seo],
              ]}
            />
            <p className="rp-note">
              Lighthouse, on a phone, out of 100. Load time: <Fill value={s.scores.loadTime} />
            </p>
          </div>
        </div>
      </ServiceChapter>
    ),
  });

  if (took("Visual identity")) {
    const id = s.identity;
    chapters.push({
      id: "visual-identity",
      label: "Visual Identity",
      body: (
        <ServiceChapter
          name="Visual Identity"
          main={false}
          left={<Para title="The idea" value={id.idea} />}
          right={
            <dl className="rp-specs">
              <div>
                <dt className="mono-label text-ash-2">Typefaces</dt>
                <dd>
                  <Fill value={id.typefaces?.map((f) => `${f.name} (${f.role.toLowerCase()})`).join(", ")} />
                </dd>
              </div>
              <div>
                <dt className="mono-label text-ash-2">Where it is used</dt>
                <dd>
                  <Fill value={id.applications?.join(", ")} />
                </dd>
              </div>
            </dl>
          }
        >
          <div className="rp-logos">
            {[
              { src: id.logo, alt: `${project.name} logo`, caption: "Logo, on white", dark: false },
              { src: id.logo, alt: "", caption: "Logo, on black", dark: true },
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
                <figcaption className="mono-label text-ash-2">{logo.caption}</figcaption>
              </figure>
            ))}
          </div>
          <div className="rp-block">
            <p className="mono-label text-ash-2">Colours</p>
            <ul className="rp-swatches">
              {(id.palette ?? Array.from({ length: 5 }, () => null)).map((colour, i) =>
                colour ? (
                  <li key={colour.hex}>
                    <span className="rp-swatch" style={{ background: colour.hex }} />
                    <span>{colour.name}</span>
                    <span className="mono-label text-ash-2">{colour.hex}</span>
                  </li>
                ) : (
                  <li key={i}>
                    <span className="rp-swatch rp-swatch-empty" />
                    <span className="rp-fill">{TO_FILL}</span>
                  </li>
                ),
              )}
            </ul>
          </div>
        </ServiceChapter>
      ),
    });
  }

  if (took("SEO")) {
    chapters.push({
      id: "seo",
      label: "SEO",
      body: (
        <ServiceChapter
          name="SEO"
          main={false}
          left={<Ticks title="What we put in place" items={s.seo.work} />}
          right={
            <>
              <div>
                <p className="mono-label text-ash-2">The searches it is set up for</p>
                <div className="rp-gap">
                  {s.seo.searches?.length ? (
                    <Tags items={s.seo.searches} label="Searches" />
                  ) : (
                    <p className="rp-fill">{TO_FILL}</p>
                  )}
                </div>
              </div>
              <Readouts big items={[["Before", s.seo.before], ["After", s.seo.after]]} />
            </>
          }
        />
      ),
    });
  }

  if (took("GEO")) {
    chapters.push({
      id: "geo",
      label: "GEO",
      body: (
        <ServiceChapter
          name="GEO"
          main={false}
          left={<Ticks title="What we put in place" items={s.geo.work} />}
          right={<Para title="How it shows in AI answers now" value={s.geo.presence} />}
        />
      ),
    });
  }

  const shoot = took("Photo shoot");
  if (shoot) {
    chapters.push({
      id: "photo-shoot",
      label: "Photo Shoot",
      body: (
        <ServiceChapter
          name="Photo Shoot"
          main={false}
          left={<Para title="What we photographed" value={s.shoot.subject} />}
          right={<Readouts items={[["Photos", s.shoot.photos], ["Videos", s.shoot.videos]]} />}
        >
          <div className="rp-gallery" aria-hidden="true">
            {Array.from({ length: 6 }, (_, i) => (
              <span key={i} />
            ))}
          </div>
        </ServiceChapter>
      ),
    });
  }

  chapters.push({
    id: "outcome",
    label: "Outcome",
    body: (
      <>
        <div className="rp-svc-head">
          <h3 className="rp-svc-name">The outcome</h3>
        </div>
        <div className="rp-cols">
          <Para title="What changed" value={s.outcome} />
          <figure className="rp-quote">
            <blockquote>
              <Fill value={s.quote?.text} />
            </blockquote>
            <figcaption className="mono-label">
              <Fill value={s.quote?.by} />
            </figcaption>
          </figure>
        </div>
        <Readouts
          items={[
            ["Strategy, design and build", "nevima"],
            ...(took("Visual identity") ? ([["Visual identity", "nevima"]] as [string, string][]) : []),
            ["Photography", shoot ? "nevima" : `${project.photo.credit}, a stand-in`],
          ]}
        />
        <p className="rp-privacy">
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
                  <span className="mono-label idx-title">Project report</span>
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
