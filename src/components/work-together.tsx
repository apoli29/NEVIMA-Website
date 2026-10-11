"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { Contact } from "@/lib/proposal/questions";
import {
  EMPTY_CONTACT,
  EMPTY_DRAFT,
  OfflineNote,
  STUDIO_EMAIL,
  StepScreen,
  actionFor,
  checkStep,
  stepsFor,
  summary,
  toAnswers,
  useEstimate,
  type Draft,
  type Errors,
  type SendState,
  type StepId,
} from "./proposal-steps";

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
  { small: "/contact/water-1280.jpg", large: "/contact/water-2400.jpg" },
  { small: "/contact/sand-1280.jpg", large: "/contact/sand-2400.jpg" },
];
const HOLD_MS = 4000;

/** Which error a change to the draft answers (as in the overlay). */
const ERROR_OF: Partial<Record<keyof Draft, string>> = {
  countryOther: "country",
  languagesOther: "languages",
  region: "town",
};

export function WorkTogether() {
  const reduce = useReducedMotion() ?? false;
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (reduce) return;
    const id = window.setInterval(() => setShown((i) => (i + 1) % PHOTOS.length), HOLD_MS);
    return () => window.clearInterval(id);
  }, [reduce]);

  return (
    <section
      id="work-together"
      aria-labelledby="work-together-title"
      className="wt relative isolate overflow-hidden bg-ink text-paper"
    >
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
      <span aria-hidden="true" className="abt-hero-scrim absolute inset-0 -z-10" />
      <span aria-hidden="true" className="abt-grain absolute inset-0 -z-10" />

      <div className="shell grid grid-cols-1 items-center gap-x-10 gap-y-10 py-24 md:py-32 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <h2
            id="work-together-title"
            className="display text-[clamp(2.75rem,6vw,5.75rem)] text-paper"
          >
            <span className="block font-light">Let&rsquo;s work</span>
            <span className="block font-medium">together.</span>
          </h2>
          <p className="mt-6 max-w-[22rem] text-[1.0625rem] leading-[1.45] text-paper/75 md:mt-8">
            Tell us about your business. Your proposal is free.
          </p>
        </div>
        <div className="lg:col-span-7">
          <InlineProposal />
        </div>
      </div>
    </section>
  );
}

/* --- the form, set in place ---------------------------------------------- */

function InlineProposal() {
  const reduce = useReducedMotion() ?? false;
  const [draft, setDraftState] = useState<Draft>(EMPTY_DRAFT);
  const [contact, setContactState] = useState<Contact>(EMPTY_CONTACT);
  const [step, setStep] = useState<StepId>("basics");
  const [errors, setErrors] = useState<Errors>({});
  const [send, setSend] = useState<SendState>({ status: "idle" });
  const [confirming, setConfirming] = useState(false);
  // Nothing takes focus or moves the page until someone has answered.
  const touched = useRef(false);

  const title = useRef<HTMLHeadingElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const trap = useRef<HTMLInputElement>(null);
  const readTrap = useCallback(() => trap.current?.value ?? "", []);
  const openedAt = useRef(Date.now());

  const setDraft = useCallback((patch: Partial<Draft>) => {
    touched.current = true;
    setDraftState((d) => ({ ...d, ...patch }));
    setErrors((e) => {
      const next = { ...e };
      for (const key of Object.keys(patch) as (keyof Draft)[]) delete next[ERROR_OF[key] ?? key];
      return next;
    });
  }, []);
  const setContact = useCallback((patch: Partial<Contact>) => {
    touched.current = true;
    setContactState((c) => ({ ...c, ...patch }));
    setErrors((e) => {
      const next = { ...e };
      for (const key of Object.keys(patch)) delete next[key];
      return next;
    });
  }, []);

  const steps = stepsFor(draft);
  const index = Math.max(0, steps.indexOf(step));
  const nextStep = steps[index + 1];
  const offline = send.status === "offline";
  const estimate = useEstimate(step === "estimate", draft, readTrap);

  // Each new screen starts at its top, announced by its title.
  useEffect(() => {
    setConfirming(false);
    if (!touched.current) return;
    scroller.current?.scrollTo({ top: 0 });
    title.current?.focus({ preventScroll: true });
  }, [step, offline]);

  const goTo = (s: StepId) => {
    touched.current = true;
    setErrors({});
    setSend({ status: "idle" });
    setStep(s);
  };

  const reset = () => {
    touched.current = true;
    setDraftState(EMPTY_DRAFT);
    setContactState(EMPTY_CONTACT);
    setErrors({});
    setSend({ status: "idle" });
    setStep("basics");
    setConfirming(false);
    scroller.current?.scrollTo({ top: 0 });
    requestAnimationFrame(() => title.current?.focus({ preventScroll: true }));
  };

  const submit = async () => {
    setSend({ status: "sending" });
    try {
      const res = await fetch("/api/proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: toAnswers(draft),
          contact,
          nickname: readTrap(),
          elapsedMs: Date.now() - openedAt.current,
        }),
      });
      if (res.ok) {
        setSend({ status: "idle" });
        setStep("sent");
      } else if (res.status === 503) {
        setSend({ status: "offline" });
      } else if (res.status === 429) {
        setSend({ status: "error", message: "Too many requests from this connection. Try again in a few minutes." });
      } else if (res.status === 422) {
        setSend({ status: "error", message: "Some details weren't accepted. Check them and send again." });
      } else {
        setSend({ status: "error", message: `Your request didn't go through. Try again, or write to ${STUDIO_EMAIL}.` });
      }
    } catch {
      setSend({ status: "error", message: "We couldn't reach the server. Check your connection and try again." });
    }
  };

  const mailto = `mailto:${STUDIO_EMAIL}?subject=${encodeURIComponent(
    `Final proposal request from ${contact.name.trim() || "the website"}`,
  )}&body=${encodeURIComponent(summary(draft, contact, estimate.state.status === "ready" ? estimate.state.estimate : null))}`;

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    touched.current = true;
    if (step === "sent") {
      reset();
      return;
    }
    if (offline) {
      window.location.href = mailto;
      return;
    }
    const found = checkStep(step, draft, contact);
    const first = Object.keys(found)[0];
    if (first) {
      setErrors(found);
      requestAnimationFrame(() => {
        const el =
          scroller.current?.querySelector<HTMLElement>(`[data-question="${first}"] input`) ??
          scroller.current?.querySelector<HTMLElement>(`[name="${first}"]`) ??
          scroller.current?.querySelector<HTMLElement>(`[aria-describedby="${first}-error"]`);
        el?.focus({ preventScroll: true });
        const row = el?.closest<HTMLElement>("[data-question], .prop-row, .pf-consent-row");
        if (row && scroller.current) {
          scroller.current.scrollTo({
            top: row.offsetTop - scroller.current.clientHeight / 3,
            behavior: reduce ? "auto" : "smooth",
          });
        }
      });
      return;
    }
    if (step === "estimate") {
      if (estimate.state.status === "error") estimate.retry();
      if (estimate.state.status !== "ready") return;
    }
    if (step === "contact") {
      if (send.status !== "sending") void submit();
      return;
    }
    if (nextStep) goTo(nextStep);
  };

  const back = () => {
    if (offline) {
      setSend({ status: "idle" });
      return;
    }
    const prev = steps[index - 1];
    if (prev) goTo(prev);
  };

  const action = offline
    ? "Open in your email app"
    : send.status === "sending"
      ? "Sending…"
      : step === "sent"
        ? "Start a new request"
        : actionFor(step, nextStep);
  const canGoBack = index > 0 && step !== "sent";
  const progress = steps.length > 1 ? index / (steps.length - 1) : 0;

  return (
    <div className="wt-form relative isolate text-ink">
      <div aria-hidden="true" className="pf-pane" />
      <form noValidate onSubmit={onSubmit} aria-labelledby="wt-form-title" className="flex h-full min-h-0 flex-col">
        <p className="mono-label mb-2.5 flex items-center justify-between text-ash-2">
          <span id="wt-form-title" className="idx-title">
            Free proposal
          </span>
          {step !== "sent" &&
            (confirming ? (
              <span role="group" aria-label="Clear all answers?" className="flex items-center gap-2">
                <span className="text-ink">Clear all answers?</span>
                <button type="button" onClick={reset} className="prop-close pf-clear-yes">
                  Yes
                </button>
                <span aria-hidden="true">/</span>
                <button type="button" onClick={() => setConfirming(false)} className="prop-close">
                  No
                </button>
              </span>
            ) : (
              <button type="button" onClick={() => setConfirming(true)} className="prop-close">
                Clear answers
              </button>
            ))}
        </p>

        <div className="relative min-h-0 flex-1">
          <div aria-hidden="true" className="pf-progress">
            <motion.span
              className="pf-progress-fill"
              initial={false}
              animate={{ scaleX: Math.max(progress, 0.04) }}
              transition={{ duration: reduce ? 0 : 0.6, ease: [0.65, 0, 0.35, 1] }}
            />
          </div>
          <div ref={scroller} data-lenis-prevent className="pf-scroll">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={offline ? "offline" : step}
                exit={{ opacity: 0, y: -6, transition: { duration: reduce ? 0 : 0.16 } }}
              >
                {offline ? (
                  <>
                    <h3 ref={title} tabIndex={-1} className="pf-title">
                      Send it by email
                    </h3>
                    <OfflineNote />
                  </>
                ) : (
                  <StepScreen
                    step={step}
                    draft={draft}
                    setDraft={setDraft}
                    contact={contact}
                    setContact={setContact}
                    errors={errors}
                    estimate={estimate.state}
                    retryEstimate={estimate.retry}
                    send={send}
                    titleRef={title}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
          {/* For bots only: out of sight, out of the tab order. */}
          <input
            ref={trap}
            name="nickname"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="pf-trap"
            defaultValue=""
          />
        </div>

        <div className="relative z-10">
          <span aria-hidden="true" className="absolute inset-x-0 top-0 z-10 block h-px bg-ink" />
          <div className="flex">
            {canGoBack && (
              <button type="button" onClick={back} className="idx-link pf-back shrink-0">
                <span aria-hidden="true" className="idx-arrow">
                  <Arrow back />
                </span>
                <span className="idx-name">Back</span>
              </button>
            )}
            <button
              type="submit"
              aria-busy={send.status === "sending" || undefined}
              className="idx-link idx-send min-w-0 flex-1 text-left"
            >
              <span className="idx-name truncate">{action}</span>
              <span aria-hidden="true" className="idx-arrow">
                <Arrow />
              </span>
            </button>
          </div>
          <span aria-hidden="true" className="block h-px bg-ink" />
        </div>
      </form>
    </div>
  );
}

function Arrow({ back = false }: { back?: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      width="16"
      height="16"
      fill="none"
      className="block"
      style={back ? { transform: "scaleX(-1)" } : undefined}
    >
      <path d="M2 8h11M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.25" />
    </svg>
  );
}
