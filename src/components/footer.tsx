"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SERVICES, servicePath } from "@/lib/services";
import { NAV } from "./floating-nav";
import { LiquidLens } from "./liquid-lens";

/** How far the mark rises into place, as a share of its own height. */
const RISE = 0.22;

const WORDMARK = "/nevima-wordmark-white.svg";
const EMAIL = "ola@nevima.pt";
/** Where a visitor's choice to hold the backdrop still is remembered. */
const STILL_KEY = "nevima:footer-still";

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
   ================================================================== */

export function Footer() {
  const surface = useRef<HTMLElement>(null);
  const mark = useRef<HTMLImageElement>(null);
  const reduce = useReducedMotion() ?? false;
  const { scrollYProgress } = useScroll({ target: surface, offset: ["start end", "end end"] });
  const rise = useTransform(scrollYProgress, [0, 1], [`${RISE * 100}%`, "0%"]);

  // The menu points at sections of the home page, so anywhere else it has
  // to go there first.
  const onHome = usePathname() === "/";
  const section = (href: string) => (onHome ? href : `/${href}`);

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
            <h2 className="ftr-label">Get in touch</h2>
            <div className="mt-4 flex flex-wrap items-baseline gap-x-5 gap-y-2">
              <a href={`mailto:${EMAIL}`} className="ftr-link ftr-mail">
                {EMAIL}
              </a>
              <button
                type="button"
                onClick={copyAddress}
                aria-label="Copy email address"
                className="ftr-link ftr-meta cursor-pointer"
              >
                {copy === "done" ? "Copied" : copy === "failed" ? "Copy failed" : "Copy"}
              </button>
              <span role="status" className="sr-only">
                {copy === "done"
                  ? "Email address copied"
                  : copy === "failed"
                    ? "The address could not be copied"
                    : ""}
              </span>
            </div>
            <p className="mt-6 max-w-[30ch] text-[0.9375rem] leading-relaxed text-paper/60">
              A two person web development studio
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
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Named apart from the Services section, so the two are not
              confused in a list of landmarks. */}
          <nav aria-label="Service pages" data-calm>
            <h2 className="ftr-label">Services</h2>
            <ul className="mt-5 space-y-3">
              {SERVICES.map((service) => (
                <li key={service.slug}>
                  <Link href={servicePath(service.slug)} className="ftr-link ftr-item">
                    {service.title}
                  </Link>
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
          <div data-calm className="flex items-center gap-6">
            {!reduce && (
              <button
                type="button"
                onClick={toggleStill}
                className="ftr-link ftr-meta cursor-pointer"
              >
                {still ? "Resume motion" : "Pause motion"}
              </button>
            )}
            <a href="#top" className="ftr-link ftr-meta">
              Back to top
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
