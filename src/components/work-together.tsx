"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useReducedMotion } from "motion/react";
import { useT } from "@/lib/use-lang";

/* The two forms are fetched as the section comes near (within a screen
   and a half), not with the page: with every question and the estimate
   behind them, they were a good part of what every page loaded first
   (user, 2026-10-19). Until then each stands as its empty frame, the
   same height, so nothing moves when it arrives. */
const InlineProposal = dynamic(() => import("./inline-proposal").then((m) => m.InlineProposal), {
  ssr: false,
  loading: () => <FormFrame />,
});
const PartnerForm = dynamic(() => import("./partner-form").then((m) => m.PartnerForm), {
  ssr: false,
  loading: () => <FormFrame />,
});

function FormFrame() {
  return <div aria-hidden="true" className="wt-form" />;
}

/* ==================================================================
   Let's work together

   The last thing on every page before its foot (user, 2026-10-11): a
   short call, large, and the free-proposal form itself, the one and
   only form the site has, set in the section rather than opened over
   it. Its questions, its estimate and its request are the overlay's
   (proposal-steps.tsx); only the frame differs: it stands still on its
   frosted pane, its body scrolling inside a fixed height, so the page
   never jumps as one screen of questions gives way to another.

   Behind it, two black-and-white photographs take turns, held four
   seconds each and crossing slowly, as the about page's opening does:
   still water and wind-cut sand (Linus Belanger and Pavel Trishin, on
   Unsplash; the studio's own picks).
   ================================================================== */

const PHOTOS = [
  { small: "/contact/water-1280.webp", large: "/contact/water-2400.webp" },
  { small: "/contact/sand-1280.webp", large: "/contact/sand-2400.webp" },
];
const HOLD_MS = 4000;


/* The photographs taking turns behind the section. Their own component, so
   each turn redraws the two of them and not the forms beside them. */
function Photos({ reduce }: { reduce: boolean }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (reduce) return;
    const id = window.setInterval(() => setShown((i) => (i + 1) % PHOTOS.length), HOLD_MS);
    return () => window.clearInterval(id);
  }, [reduce]);
  return (
    <>
      {PHOTOS.map((photo, i) => (
        <span
          key={photo.large}
          aria-hidden="true"
          data-shown={i === shown ? "" : undefined}
          className="abt-hero-slide absolute inset-0 -z-20"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photo.large}
            srcSet={`${photo.small} 1280w, ${photo.large} 2400w`}
            sizes="100vw"
            alt=""
            loading="lazy"
            draggable={false}
            className="wt-photo size-full object-cover select-none"
          />
        </span>
      ))}
    </>
  );
}

type Audience = "business" | "partner";
const AUDIENCES: Audience[] = ["business", "partner"];

export function WorkTogether() {
  const reduce = useReducedMotion() ?? false;
  const t = useT();
  /* Two forms, one for each kind of client (user, 2026-10-18): a
     business owner's free proposal, and a development company's
     partnership. Until someone takes part, they take turns every four
     seconds, the question over the title naming whose it is, so it is
     plain there are two. The first press anywhere in a form, or on the
     switch over them, settles it; a hand resting over them only holds
     the turn. Nothing ever changes under someone's answers. */
  const [audience, setAudience] = useState<Audience>("business");
  const [held, setHeld] = useState(false);
  const [resting, setResting] = useState(false);
  const [inView, setInView] = useState(false);
  const [near, setNear] = useState(false);
  const [beat, setBeat] = useState(0);
  const [swapped, setSwapped] = useState(false);
  const section = useRef<HTMLElement>(null);
  const turning = !reduce && !held && !resting && inView;

  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const seen = new IntersectionObserver(([entry]) => setInView(!!entry?.isIntersecting), { threshold: 0.35 });
    seen.observe(el);
    // Within a screen and a half: the forms are fetched (see above), and
    // kept once they are.
    const coming = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setNear(true);
        coming.disconnect();
      },
      { rootMargin: "150% 0px" },
    );
    coming.observe(el);
    return () => {
      seen.disconnect();
      coming.disconnect();
    };
  }, []);
  useEffect(() => {
    if (!turning) return;
    const id = window.setTimeout(() => {
      setAudience((a) => (a === "business" ? "partner" : "business"));
      setBeat((b) => b + 1);
    }, HOLD_MS);
    return () => window.clearTimeout(id);
  }, [turning, beat]);

  const choose = (a: Audience) => {
    setHeld(true);
    if (a !== audience) {
      setAudience(a);
      setSwapped(true);
      window.setTimeout(() => setSwapped(false), 500);
    }
  };

  // "Partner with us" elsewhere on the page (the index, How we work)
  // brings the partners' form, settled.
  useEffect(() => {
    const ask = () => {
      setAudience("partner");
      setHeld(true);
    };
    if (window.location.hash === "#partner") ask();
    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest?.("a[href]");
      if (link instanceof HTMLAnchorElement && new URL(link.href, window.location.href).hash === "#partner") ask();
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  const ASK: Record<Audience, { en: string; pt: string }> = {
    business: { en: "Are you a business owner?", pt: "Um negócio à procura de um website?" },
    partner: { en: "Are you a development company?", pt: "Uma empresa de desenvolvimento?" },
  };
  const TAB: Record<Audience, { en: string; pt: string }> = {
    business: { en: "For businesses", pt: "Para negócios" },
    partner: { en: "For development companies", pt: "Para empresas de desenvolvimento" },
  };

  return (
    <section
      ref={section}
      id="work-together"
      aria-labelledby="work-together-title"
      className="wt relative isolate overflow-clip bg-ink text-paper"
    >
      {/* Where "Partner with us" leads. */}
      <span id="partner" aria-hidden="true" className="absolute top-0" />
      <Photos reduce={reduce} />
      <span aria-hidden="true" className="abt-hero-scrim absolute inset-0 -z-10" />
      <span aria-hidden="true" className="abt-grain absolute inset-0 -z-10" />

      <div className="shell grid grid-cols-1 items-center gap-x-10 gap-y-10 py-24 md:py-32 lg:grid-cols-12">
        {/* Beside the form, in the middle of its height, scrolling with
            the page, as it always sat (user, 2026-10-18). */}
        <div className="lg:col-span-5">
          <h2
            id="work-together-title"
            className="display text-[clamp(2.75rem,6vw,5.75rem)] text-paper"
          >
            {/* Both questions are always laid out, one over the other, so
                the line keeps the height of the longer (two lines where it
                wraps) and the title under it never moves as they change. */}
            <span className="wt-ask">
              {AUDIENCES.map((a) => (
                <span key={a} aria-hidden={a !== audience} data-on={a === audience ? "" : undefined} className="wt-ask-line">
                  {t(ASK[a])}
                </span>
              ))}
            </span>
            <span className="block font-light">{t("Let’s work", "Vamos trabalhar")}</span>
            <span className="block font-medium">{t("together.", "juntos.")}</span>
          </h2>
        </div>
        <div className="lg:col-span-7">
          <div role="tablist" aria-label={t("Who is it for", "Para quem é")} className="wt-tabs">
            {AUDIENCES.map((a) => (
              <button
                key={a}
                type="button"
                role="tab"
                id={`wt-tab-${a}`}
                aria-selected={audience === a}
                aria-controls={`wt-panel-${a}`}
                onClick={() => choose(a)}
                className="wt-tab mono-label"
              >
                {t(TAB[a])}
                {/* The four seconds left before the other form's turn. */}
                {turning && audience === a && <span key={beat} aria-hidden="true" className="wt-tab-timer" />}
              </button>
            ))}
          </div>
          <div
            className="wt-stack"
            data-held={held ? "" : undefined}
            onPointerDownCapture={() => setHeld(true)}
            onFocusCapture={() => setHeld(true)}
            onPointerEnter={(e) => e.pointerType === "mouse" && setResting(true)}
            onPointerLeave={() => setResting(false)}
          >
            {AUDIENCES.map((a) => (
              <div
                key={a}
                id={`wt-panel-${a}`}
                role="tabpanel"
                aria-labelledby={`wt-tab-${a}`}
                data-active={audience === a ? "" : undefined}
                data-swapped={audience === a && swapped ? "" : undefined}
                inert={audience !== a}
                className="wt-panel"
              >
                {!near ? <FormFrame /> : a === "business" ? <InlineProposal /> : <PartnerForm />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
