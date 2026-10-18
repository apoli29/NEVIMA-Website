"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { useAnimate, useReducedMotion } from "motion/react";
import type { Lang, Translate } from "@/lib/i18n";
import { useLang, useT } from "@/lib/use-lang";
import { TO_FILL, serviceLabel, type Project } from "@/lib/work";

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
   docs/report-template.md): the overview, then a chapter for each
   service the project took, each with only what that service needs.

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

function Tags({ items, label }: { items: readonly string[]; label: string }) {
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
   lists them, each saying only what makes sense for that service. Set in the site's own language: hairlines, the gallery's
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
  t,
}: {
  name: string;
  main: boolean;
  t: Translate;
  left: ReactNode;
  right: ReactNode;
  children?: ReactNode;
}) {
  return (
    <>
      <div className="rp-svc-head">
        <h3 className="rp-svc-name">{name}</h3>
        <span className={`mono-label ${main ? "rp-tag-main" : "idx-title"}`}>
          {main ? t("Main service", "Serviço principal") : t("Additional service", "Serviço adicional")}
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

/** The brand before and after, in one card (user, 2026-10-13). At rest
    it shows after; the hand going left uncovers before, and leaving the
    card lets after close back over it. A handle on the cut, and a brief
    peek at before the first time the card comes into view, say that it
    can be moved. From the keyboard it is a slider; on a touch screen it
    follows the finger.

    The cut trails the hand on its own clock, eased every frame and set
    straight on the elements, so the card is never drawn again by React
    while the hand moves. The last tenth of the card at either side
    counts as the end, so a sweep always finishes. */
const BA_EDGE = 0.1;
const BA_FOLLOW = 14;
/** How far the first peek uncovers before, and for how long. */
const BA_PEEK = 72;
const BA_PEEK_MS = 700;

function BeforeAfter({ before, after, name }: { before: string | null; after: string | null; name: string }) {
  const reduce = useReducedMotion() ?? false;
  const t = useT();
  const more = { before: t("Showing more of before", "A mostrar mais do antes"), after: t("Showing more of after", "A mostrar mais do depois") };
  const words = useRef(more);
  words.current = more;
  const card = useRef<HTMLDivElement>(null);
  const top = useRef<HTMLDivElement>(null);
  const line = useRef<HTMLSpanElement>(null);
  const handle = useRef<HTMLSpanElement>(null);
  const beforeTag = useRef<HTMLSpanElement>(null);
  const at = useRef(100);
  const aim = useRef(100);
  const frame = useRef(0);
  const last = useRef(0);
  const touched = useRef(false);

  const paint = useCallback((raw: number) => {
    const v = Math.min(100, Math.max(0, raw));
    if (top.current) top.current.style.clipPath = `inset(0 ${100 - v}% 0 0)`;
    if (line.current) line.current.style.transform = `translateX(${v}cqw)`;
    // The handle stays whole inside the card, even at its edges.
    if (handle.current) handle.current.style.transform = `translate(clamp(1.5rem, ${v}cqw, calc(100cqw - 1.5rem)), 0) translate(-50%, -50%)`;
    if (beforeTag.current) beforeTag.current.style.opacity = String(Math.min(1, (100 - v) / 25));
    // At rest on after, the handle pulses to say it can be moved.
    if (card.current) {
      if (v >= 99.5) card.current.setAttribute("data-rest", "");
      else card.current.removeAttribute("data-rest");
    }
    card.current?.setAttribute("aria-valuenow", String(Math.round(v)));
    card.current?.setAttribute("aria-valuetext", v < 50 ? words.current.before : words.current.after);
  }, []);

  const run = useCallback(() => {
    cancelAnimationFrame(frame.current);
    if (reduce) {
      at.current = aim.current;
      paint(at.current);
      return;
    }
    last.current = performance.now();
    const step = (now: number) => {
      const dt = Math.min((now - last.current) / 1000, 0.05);
      last.current = now;
      at.current += (aim.current - at.current) * (1 - Math.exp(-dt * BA_FOLLOW));
      if (Math.abs(aim.current - at.current) < 0.05) at.current = aim.current;
      paint(at.current);
      if (at.current !== aim.current) frame.current = requestAnimationFrame(step);
    };
    frame.current = requestAnimationFrame(step);
  }, [paint, reduce]);

  // The first time the card comes into view, a brief peek at before, so
  // the cut reads as something to move. Once, and not if the hand got
  // there first.
  useEffect(() => {
    const el = card.current;
    if (!el || reduce) return;
    let back = 0;
    const seen = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || touched.current) return;
        seen.disconnect();
        aim.current = BA_PEEK;
        run();
        back = window.setTimeout(() => {
          if (touched.current) return;
          aim.current = 100;
          run();
        }, BA_PEEK_MS);
      },
      { threshold: 0.75 },
    );
    seen.observe(el);
    return () => {
      seen.disconnect();
      window.clearTimeout(back);
      cancelAnimationFrame(frame.current);
    };
  }, [reduce, run]);

  const follow = (clientX: number) => {
    const box = card.current?.getBoundingClientRect();
    if (!box || !box.width) return;
    touched.current = true;
    const f = (clientX - box.left) / box.width;
    aim.current = Math.min(100, Math.max(0, ((f - BA_EDGE) / (1 - 2 * BA_EDGE)) * 100));
    run();
  };

  const face = (src: string | null, dark: boolean) =>
    src ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt="" draggable={false} />
    ) : (
      <span className="rp-ba-empty" data-dark={dark ? "" : undefined}>
        <span className="rp-fill">{TO_FILL}</span>
      </span>
    );

  return (
    <div>
      <div
        ref={card}
        className="rp-ba"
        role="slider"
        tabIndex={0}
        aria-label={t(`${name}: before and after`, `${name}: antes e depois`)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={100}
        aria-valuetext={more.after}
        data-rest=""
        onPointerMove={(e) => follow(e.clientX)}
        onPointerDown={(e) => follow(e.clientX)}
        // At rest it shows after: the hand gone, after closes back over.
        onPointerLeave={(e) => {
          if (e.pointerType !== "mouse") return;
          aim.current = 100;
          run();
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") aim.current = Math.max(0, aim.current - 10);
          else if (e.key === "ArrowRight") aim.current = Math.min(100, aim.current + 10);
          else if (e.key === "Home") aim.current = 0;
          else if (e.key === "End") aim.current = 100;
          else return;
          touched.current = true;
          e.preventDefault();
          run();
        }}
      >
        {/* Before underneath, whole; after over it, cut at the hand: the
            further left the hand, the more of before. */}
        <div className="rp-ba-face">{face(before, false)}</div>
        <div ref={top} className="rp-ba-face" style={{ clipPath: "inset(0 0% 0 0)" }}>
          {face(after, true)}
        </div>
        <span ref={line} className="rp-ba-line" style={{ transform: "translateX(100cqw)" }} aria-hidden="true" />
        <span
          ref={handle}
          className="rp-ba-handle"
          style={{ transform: "translate(calc(100cqw - 1.5rem), 0) translate(-50%, -50%)" }}
          aria-hidden="true"
        >
          <svg viewBox="0 0 24 12" width="22" height="11" fill="none">
            <path d="M5 1 1 6l4 5M19 1l4 5-4 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <span className="mono-label rp-ba-tag rp-ba-tag-after" aria-hidden="true">{t("After", "Depois")}</span>
        <span ref={beforeTag} className="mono-label rp-ba-tag rp-ba-tag-before" style={{ opacity: 0 }} aria-hidden="true">
          {t("Before", "Antes")}
        </span>
      </div>
      <p className="rp-note">{t("Move left to see how it was before.", "Deslizar para a esquerda para ver como era antes.")}</p>
    </div>
  );
}

function chaptersFor(project: Project, t: Translate, lang: Lang): Chapter[] {
  const s = project.study;
  const services = project.services.map((name) => serviceLabel(name, lang));
  const chapters: Chapter[] = [];
  const took = (title: string) => project.services.some((x) => x.toLowerCase() === title.toLowerCase());
  const live = project.status === "live" && project.url;

  chapters.push({
    id: "overview",
    label: t("Overview", "Visão geral"),
    body: (
      <>
        <div className="rp-hero">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={project.photo.src} alt={project.photo.alt} draggable={false} />
        </div>
        <div className="rp-cover">
          {/* Between the photo and the rule: the way to the website, as
              the home page's index asks for a proposal, a black band with
              the green light (user, 2026-10-13). */}
          <div className="rp-cover-cta">
            {live ? (
              <a href={project.url!} target="_blank" rel="noopener" data-away="" className="idx-link idx-ask rp-go">
                <GoInner label={t("Go to website", "Ir para o website")} />
              </a>
            ) : (
              // Nowhere to go yet: at rest.
              <span
                aria-disabled="true"
                title={t("The website is not online yet", "O website ainda não está online")}
                className="idx-link idx-ask rp-go"
                data-rest=""
              >
                <GoInner label={t("Go to website", "Ir para o website")} />
              </span>
            )}
          </div>
          <div className="rp-cover-head">
            <h2 id="rp-title" className="rp-cover-name">
              <span>{project.name}</span>
            </h2>
            <Tags items={services} label={t("Services", "Serviços")} />
          </div>
          <p className="rp-lede rp-justify">{project.summary}</p>
        </div>
      </>
    ),
  });

  chapters.push({
    id: "web-design",
    label: "Web Design",
    body: (
      <ServiceChapter
        name="Web Design"
        t={t}
        main
        left={
          <p className="rp-text rp-justify">
            <Fill value={s.website} />
          </p>
        }
        right={
          <dl className="rp-specs">
            {[
              [t("Design level", "Nível de design"), project.designLevel],
              [t("Pages", "Páginas"), project.pages],
              [t("Languages", "Línguas"), s.languages],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="mono-label text-ash-2">{label}</dt>
                <dd>
                  <Fill value={value} />
                </dd>
              </div>
            ))}
          </dl>
        }
      />
    ),
  });

  if (took("Visual identity")) {
    chapters.push({
      id: "visual-identity",
      label: t("Visual Identity", "Identidade Visual"),
      body: (
        <ServiceChapter
          name={t("Visual Identity", "Identidade Visual")}
          t={t}
          main={false}
          left={<BeforeAfter before={s.identity.before} after={s.identity.after} name={project.name} />}
          right={<Para title={t("The idea", "A ideia")} value={s.identity.idea} />}
        />
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
          t={t}
          main={false}
          left={<Ticks title={t("What we put in place", "O que pusemos em prática")} items={s.seo.work} />}
          right={
            <>
              <div>
                <p className="mono-label text-ash-2">
                  {t("The searches it is set up for", "As pesquisas para que está preparado")}
                </p>
                <div className="rp-gap">
                  {s.seo.searches?.length ? (
                    <Tags items={s.seo.searches} label={t("Searches", "Pesquisas")} />
                  ) : (
                    <p className="rp-fill">{TO_FILL}</p>
                  )}
                </div>
              </div>
              <Readouts
                big
                items={[
                  [t("Before", "Antes"), s.seo.before],
                  [t("After", "Depois"), s.seo.after],
                ]}
              />
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
          t={t}
          main={false}
          left={<Ticks title={t("What we put in place", "O que pusemos em prática")} items={s.geo.work} />}
          right={
            <Para
              title={t("How it shows in AI answers now", "Como aparece agora nas respostas da IA")}
              value={s.geo.presence}
            />
          }
        />
      ),
    });
  }

  if (took("Photo shoot")) {
    chapters.push({
      id: "photo-shoot",
      label: t("Photo Shoot", "Sessão Fotográfica"),
      body: (
        <ServiceChapter
          name={t("Photo Shoot", "Sessão Fotográfica")}
          t={t}
          main={false}
          left={<Para title={t("What we photographed", "O que fotografámos")} value={s.shoot.subject} />}
          right={
            <Readouts
              items={[
                [t("Photos", "Fotografias"), s.shoot.photos],
                [t("Videos", "Vídeos"), s.shoot.videos],
              ]}
            />
          }
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
  const t = useT();
  const lang = useLang();

  const chapters = chaptersFor(project, t, lang);
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
              {t("Close", "Fechar")}
              <span aria-hidden="true">&times;</span>
            </span>
          </button>
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
                  <nav aria-label={t("Report chapters", "Capítulos do relatório")} className="rp-nav">
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
                  <span className="mono-label idx-title rp-head-label">
                    {t("Project report", "Relatório do projeto")}
                  </span>
                </div>
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
                  {t("Back to the top", "Voltar ao topo")}
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

/** "Go to website", set as the index's ask: the light, the words, the arrow. */
function GoInner({ label }: { label: string }) {
  return (
    <>
      <span className="idx-name flex items-center gap-2.5">
        <span aria-hidden="true" className="live-dot live-dot-loud" />
        {label}
      </span>
      <span aria-hidden="true" className="idx-arrow">
        <svg viewBox="0 0 16 16" width="16" height="16" fill="none" className="block">
          <path d="M4 12 12 4M5.5 4H12v6.5" stroke="currentColor" strokeWidth="1.25" />
        </svg>
      </span>
    </>
  );
}
