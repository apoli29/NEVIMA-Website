"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { usePathname } from "next/navigation";
import { basePath, LANG_NAME, HTML_LANG, switchPath, type Lang } from "@/lib/i18n";
import { keepLangSpot } from "@/lib/return-spot";
import { servicesIn } from "@/lib/services";
import { useHref, useLang, useT } from "@/lib/use-lang";
import { NAV, homeSection } from "./floating-nav";
import { LiquidLens } from "./liquid-lens";

/** How far the mark rises into place, as a share of its own height. */
const RISE = 0.22;

const WORDMARK = "/nevima-wordmark-white.svg";
const EMAIL = "ola@nevima.pt";
/** Where a visitor's choice to hold the backdrop still is remembered. */
export const STILL_KEY = "nevima:footer-still";

/* ==================================================================
   Footer

   The page opens on black and closes on it: the foot is plain black,
   with nothing on it but the words and the mark.

   It is also the only place on the site that answers the pointer for
   its own sake. Everything else that moves here is doing a job; the
   whole foot is seen through a drop of water that follows the hand, and
   that is worth running a hand through and nothing more (see
   liquid-lens.tsx). The drop turns the mark on itself but only
   magnifies the words, so whatever it passes over still reads.

   The light drifting behind it never stops on its own, so the foot
   offers to hold it still, and remembers that it was asked to.

   The mark is set the full width of the shell and rises a little into
   place as the foot of the page comes up, so the last thing on the page
   arrives rather than sits.

   The way to the other language is down here, with the foot's other
   small controls (user, 2026-10-18: the bar or the foot, our choice).
   The bar's contents are fixed (its three links and its one button),
   and the foot is where a visitor looks for a site's housekeeping.
   ================================================================== */

export function Footer() {
  const surface = useRef<HTMLElement>(null);
  const mark = useRef<HTMLImageElement>(null);
  const reduce = useReducedMotion() ?? false;
  const { scrollYProgress } = useScroll({ target: surface, offset: ["start end", "end end"] });
  const rise = useTransform(scrollYProgress, [0, 1], [`${RISE * 100}%`, "0%"]);

  // The menu points at sections of the home page, so anywhere else it has
  // to go there first.
  const path = usePathname();
  const onHome = basePath(path) === "/";
  const href = useHref();
  const lang = useLang();
  const t = useT();
  const section = (link: string) => href(homeSection(link, onHome));

  const [still, setStill] = useState(false);
  useEffect(() => {
    try {
      if (localStorage.getItem(STILL_KEY)) setStill(true);
    } catch {}
  }, []);
  const toggleStill = () => {
    const next = !still;
    setStill(next);
    try {
      if (next) localStorage.setItem(STILL_KEY, "1");
      else localStorage.removeItem(STILL_KEY);
    } catch {}
  };

  // Not everyone has a mail client behind a mailto link, so the address
  // can also be taken away as text.
  const [copy, setCopy] = useState<"idle" | "done" | "failed">("idle");
  useEffect(() => {
    if (copy === "idle") return;
    const reset = setTimeout(() => setCopy("idle"), 2400);
    return () => clearTimeout(reset);
  }, [copy]);
  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopy("done");
    } catch {
      setCopy("failed");
    }
  };

  return (
    <footer
      ref={surface}
      id="contact"
      className="ftr relative isolate z-10 overflow-hidden text-paper"
    >
      <LiquidLens host={surface} mark={mark} src={WORDMARK} still={still} />

      <div className="shell relative py-20 md:py-28">
        {/* data-calm marks what the backdrop's light keeps away from, so
            the words always stand on black. */}
        <div className="relative z-10 grid gap-12 md:grid-cols-[1.5fr_1fr_1fr] md:gap-10">
          <div data-calm>
            <h2 className="ftr-label">{t("Get in touch", "Fala connosco")}</h2>
            <div className="mt-4 flex flex-wrap items-baseline gap-x-5 gap-y-2">
              <a href={`mailto:${EMAIL}`} className="ftr-link ftr-mail">
                {EMAIL}
              </a>
              <button
                type="button"
                onClick={copyAddress}
                aria-label={t("Copy email address", "Copiar o endereço de email")}
                className="ftr-link ftr-meta cursor-pointer"
              >
                {copy === "done"
                  ? t("Copied", "Copiado")
                  : copy === "failed"
                    ? t("Copy failed", "Não foi possível copiar")
                    : t("Copy", "Copiar")}
              </button>
              <span role="status" className="sr-only">
                {copy === "done"
                  ? t("Email address copied", "Endereço de email copiado")
                  : copy === "failed"
                    ? t("The address could not be copied", "Não foi possível copiar o endereço")
                    : ""}
              </span>
            </div>
            <p className="mt-6 max-w-[30ch] text-[0.9375rem] leading-relaxed text-paper/60">
              {t("A two person web development studio", "Um estúdio de web development a dois")}
            </p>
          </div>

          <nav aria-labelledby="ftr-menu" data-calm>
            <h2 id="ftr-menu" className="ftr-label">
              Menu
            </h2>
            <ul className="mt-5 space-y-3">
              {NAV.map((item) => (
                <li key={item.href}>
                  <a href={section(item.href)} className="ftr-link ftr-item">
                    {t(item.label)}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Named apart from the Services section, so the two are not
              confused in a list of landmarks. */}
          <nav aria-label={t("Service pages", "Páginas dos serviços")} data-calm>
            <h2 className="ftr-label">{t("Services", "Serviços")}</h2>
            <ul className="mt-5 space-y-3">
              {servicesIn(lang).map((service) => (
                <li key={service.slug}>
                  {/* Each to its row in the services on the home page, opened
                      (user, 2026-10-12): the list there is the services'
                      one home. */}
                  <a href={href(`/#open-${service.slug}`)} className="ftr-link ftr-item">
                    {service.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* The signature, in the flow so it takes its own room. */}
        <motion.div className="relative z-0 mt-16 md:mt-24" style={reduce ? undefined : { y: rise }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={mark}
            src={WORDMARK}
            alt=""
            aria-hidden="true"
            draggable={false}
            className="block w-full select-none"
          />
        </motion.div>

        <div className="relative z-10 mt-8 flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          {/* The year is read on the client; a cached page can be a year behind. */}
          <p data-calm className="ftr-meta" suppressHydrationWarning>
            &copy; {new Date().getFullYear()} nevima
          </p>
          <div data-calm className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <LanguageSwitch path={path} lang={lang} label={t("Language", "Idioma")} />
            {!reduce && (
              <button
                type="button"
                onClick={toggleStill}
                className="ftr-link ftr-meta cursor-pointer"
              >
                {still ? t("Resume motion", "Retomar movimento") : t("Pause motion", "Parar movimento")}
              </button>
            )}
            <a href="#top" className="ftr-link ftr-meta">
              {t("Back to top", "Voltar ao topo")}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* The two languages, each named in itself, the one on screen inked and
   not a link. Followed, the other one opens the same page in it, with the
   foot where it was, so the visitor carries on from the same place
   rather than from the top (see keepLangSpot). */
const LANGS: Lang[] = ["en", "pt"];

function LanguageSwitch({ path, lang, label }: { path: string; lang: Lang; label: string }) {
  return (
    <nav aria-label={label} className="flex items-center gap-2 ftr-meta">
      {LANGS.map((other, i) => (
        <span key={other} className="flex items-center gap-2">
          {i > 0 && <span aria-hidden="true">/</span>}
          {other === lang ? (
            <span lang={HTML_LANG[other]} aria-current="true" className="text-paper">
              {LANG_NAME[other]}
            </span>
          ) : (
            <a
              href={switchPath(path, other)}
              hrefLang={HTML_LANG[other]}
              lang={HTML_LANG[other]}
              onClick={() => keepLangSpot(switchPath(path, other))}
              className="ftr-link ftr-meta"
            >
              {LANG_NAME[other]}
            </a>
          )}
        </span>
      ))}
    </nav>
  );
}
