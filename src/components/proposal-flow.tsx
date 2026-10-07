"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import {
  AnimatePresence,
  animate,
  cubicBezier,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useTransform,
} from "motion/react";
import type { Contact } from "@/lib/proposal/questions";
import { SECTION_LINKS } from "./index-links";
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
   The free proposal, opened out of the index

   "Get your free proposal" does not open a window over the page: the
   index itself leaves its corner. It is lifted off the second screen
   and carried to the middle, growing as it goes into the form, and the
   page behind it goes under frosted glass and out of reach.

   Read as one object the whole way. The index's label stays at its
   head and turns from "Index" into "Free proposal"; the inked row it
   was pressed on stays at its foot and becomes the button that moves
   the form on; the rows between, the ways elsewhere, are let go first,
   since the form has no use for them. Once it has landed, the first
   questions come in, row by row, as the index's own rows do.

   Like the opening, it runs on one clock (`t`, 0 to 1) that animate()
   owns: everything is read off it, so closing is the same run played
   back, and nothing is ever left between two states. Closing (the
   Close button, Esc, or a click on the glass) runs it back to the
   index's own pixels and hands the page back.

   t        0                                   0.66          1
   flight   |------------- carried and grown ----|
   glass    |--------- in -------|
   rows     |-- out --|
   label         |-- Index → Free proposal --|
   foot                       |--- ask → Continue ---|
   form                                          |--- in ---|
   ================================================================== */

/** How long the whole run takes, in seconds (the user: 1.2 to 1.8). */
const OPEN_S = 1.5;
/** Going back is the same run, a little quicker: nobody waits to leave. */
const CLOSE_S = 1.1;

const FLIGHT: [number, number] = [0, 0.66];
/** Fast out of the corner, slowing into the middle: carried, not slid. */
const FLIGHT_EASE = cubicBezier(0.76, 0, 0.18, 1);
const GLASS: [number, number] = [0, 0.36];
const PANE: [number, number] = [0, 0.18];
const ROWS_OUT: [number, number] = [0, 0.16];
const LABEL_OUT: [number, number] = [0.18, 0.3];
const LABEL_IN: [number, number] = [0.26, 0.4];
const FOOT_OUT: [number, number] = [0.4, 0.52];
const FOOT_IN: [number, number] = [0.5, 0.66];
/** The form is laid out from here, unseen until it fades in. */
const FORM_AT = 0.62;
const FORM_IN: [number, number] = [0.66, 0.78];

/* ------------------------------------------------------------------ */
/* Who may open it                                                     */
/* ------------------------------------------------------------------ */

type Origin = {
  /** The index, measured: where the form leaves from and comes back to. */
  box: HTMLElement;
  /** Given focus again once the index is back. */
  focus: HTMLElement | null;
};

export function useProposalController() {
  /** Asked open (false while it is closing). */
  const [open, setOpen] = useState(false);
  /** On screen at all, opening, open or closing: the page is held. */
  const [present, setPresent] = useState(false);
  const origin = useRef<Origin | null>(null);

  const show = useCallback((box: HTMLElement, focus: HTMLElement | null) => {
    origin.current = { box, focus };
    setPresent(true);
    setOpen(true);
  }, []);
  const hide = useCallback(() => setOpen(false), []);
  const gone = useCallback(() => setPresent(false), []);

  // Focus goes back to the row it was opened from, once that row is
  // seen again (it is hidden while the form is out).
  const wasPresent = useRef(false);
  useEffect(() => {
    if (wasPresent.current && !present) origin.current?.focus?.focus({ preventScroll: true });
    wasPresent.current = present;
  }, [present]);

  return useMemo(() => ({ open, present, origin, show, hide, gone }), [open, present, show, hide, gone]);
}

export type ProposalController = ReturnType<typeof useProposalController>;

const ProposalContext = createContext<ProposalController | null>(null);
export const ProposalProvider = ProposalContext.Provider;
export const useProposal = () => useContext(ProposalContext);

/* ------------------------------------------------------------------ */
/* Where it goes                                                       */
/* ------------------------------------------------------------------ */

type Rect = { x: number; y: number; w: number; h: number };

/** The glass's margin round the words, which is also how far the form's
    pane stands out round the index when it sets off. */
const padFor = (vw: number) => (vw >= 1280 ? 40 : vw >= 768 ? 32 : 20);

/** The middle of the screen, large; on a phone, the whole screen. */
function landing(vw: number, vh: number): Rect {
  if (vw < 768) return { x: 0, y: 0, w: vw, h: vh };
  const margin = vw >= 1280 ? 48 : 32;
  const w = Math.min(880, vw - 2 * margin);
  const h = Math.min(760, vh - 2 * Math.min(margin, 32));
  return { x: (vw - w) / 2, y: (vh - h) / 2, w, h };
}

function measure(box: HTMLElement, pad: number): Rect {
  const r = box.getBoundingClientRect();
  return { x: r.left - pad, y: r.top - pad, w: r.width + 2 * pad, h: r.height + 2 * pad };
}

const useMeasureEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/* ------------------------------------------------------------------ */
/* The overlay                                                         */
/* ------------------------------------------------------------------ */

/** Mounted once, for the life of the page, so what was answered is still
    there if the form is closed and opened again. */
export function ProposalOverlay({ ctl }: { ctl: ProposalController }) {
  const [draft, setDraftState] = useState<Draft>(EMPTY_DRAFT);
  const [contact, setContactState] = useState<Contact>(EMPTY_CONTACT);
  const [step, setStep] = useState<StepId>("basics");
  const [errors, setErrors] = useState<Errors>({});
  const [send, setSend] = useState<SendState>({ status: "idle" });

  // Once sent, the next opening starts afresh.
  const reset = useCallback(() => {
    setDraftState(EMPTY_DRAFT);
    setContactState(EMPTY_CONTACT);
    setStep("basics");
    setErrors({});
    setSend({ status: "idle" });
  }, []);
  useEffect(() => {
    if (!ctl.present && step === "sent") reset();
  }, [ctl.present, step, reset]);

  if (!ctl.present) return null;
  return (
    <Panel
      ctl={ctl}
      draft={draft}
      setDraftState={setDraftState}
      contact={contact}
      setContactState={setContactState}
      step={step}
      setStep={setStep}
      errors={errors}
      setErrors={setErrors}
      send={send}
      setSend={setSend}
      clear={reset}
    />
  );
}

/** Which error a change to the draft answers. */
const ERROR_OF: Partial<Record<keyof Draft, string>> = {
  countryOther: "country",
  languagesOther: "languages",
  region: "town",
};

function Panel({
  ctl,
  draft,
  setDraftState,
  contact,
  setContactState,
  step,
  setStep,
  errors,
  setErrors,
  send,
  setSend,
  clear,
}: {
  ctl: ProposalController;
  draft: Draft;
  setDraftState: (fn: (d: Draft) => Draft) => void;
  contact: Contact;
  setContactState: (fn: (c: Contact) => Contact) => void;
  step: StepId;
  setStep: (s: StepId) => void;
  errors: Errors;
  setErrors: (fn: Errors | ((e: Errors) => Errors)) => void;
  send: SendState;
  setSend: (s: SendState) => void;
  /** Every answer and detail wiped, back to the first screen. */
  clear: () => void;
}) {
  const reduce = useReducedMotion() ?? false;
  const t = useMotionValue(0);

  /* --- the two ends of the run, in real pixels ------------------------ */

  const [view, setView] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }));
  const pad = padFor(view.w);
  const [from, setFrom] = useState<Rect>(() =>
    ctl.origin.current ? measure(ctl.origin.current.box, padFor(window.innerWidth)) : landing(view.w, view.h),
  );
  const to = landing(view.w, view.h);

  useEffect(() => {
    const onResize = () => setView({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const still = (v: number): [number, number] => [v, v];
  const x = useTransform(t, FLIGHT, reduce ? still(to.x) : [from.x, to.x], { ease: FLIGHT_EASE });
  const y = useTransform(t, FLIGHT, reduce ? still(to.y) : [from.y, to.y], { ease: FLIGHT_EASE });
  const width = useTransform(t, FLIGHT, reduce ? still(to.w) : [from.w, to.w], { ease: FLIGHT_EASE });
  const height = useTransform(t, FLIGHT, reduce ? still(to.h) : [from.h, to.h], { ease: FLIGHT_EASE });

  // Reduced motion: no journey, the form simply fades in where it lands.
  const whole = useTransform(t, [0, 1], reduce ? [0, 1] : [1, 1]);
  const glass = useTransform(t, reduce ? [0, 1] : GLASS, [0, 1]);
  const pane = useTransform(t, reduce ? [0, 1] : PANE, [0, 1]);
  const rows = useTransform(t, ROWS_OUT, reduce ? [0, 0] : [1, 0]);
  const rowsX = useTransform(t, ROWS_OUT, [0, -10]);
  const labelOut = useTransform(t, LABEL_OUT, reduce ? [0, 0] : [1, 0]);
  const labelIn = useTransform(t, LABEL_IN, reduce ? [1, 1] : [0, 1]);
  const footOut = useTransform(t, FOOT_OUT, reduce ? [0, 0] : [1, 0]);
  const footIn = useTransform(t, FOOT_IN, reduce ? [1, 1] : [0, 1]);
  const form = useTransform(t, reduce ? [0, 1] : FORM_IN, [0, 1]);

  /* --- the run -------------------------------------------------------- */

  const [formOn, setFormOn] = useState(reduce);
  const [landed, setLanded] = useState(false);
  useMotionValueEvent(t, "change", (v) => {
    setFormOn(reduce || v >= FORM_AT);
    setLanded(v >= 0.999);
  });

  const { open, gone } = ctl;
  useEffect(() => {
    // Going back, the index is measured again: it is where it is now that
    // the form has to land on, to the pixel.
    if (!open && ctl.origin.current) setFrom(measure(ctl.origin.current.box, padFor(window.innerWidth)));
    const target = open ? 1 : 0;
    const full = reduce ? 0.2 : open ? OPEN_S : CLOSE_S;
    // From wherever it has got to: a run reversed halfway takes half as long.
    const controls = animate(t, target, {
      duration: full * Math.abs(target - t.get()),
      ease: "linear",
      onComplete: () => {
        if (!open) gone();
      },
    });
    return () => controls.stop();
  }, [open, reduce, t, gone, ctl.origin]);

  /* --- Esc, and focus --------------------------------------------------- */

  const { hide } = ctl;
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        hide();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, hide]);

  const root = useRef<HTMLDivElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  // Focus is taken into the form the moment it sets off, so it is never
  // left on the page behind, which is out of reach from then on.
  useMeasureEffect(() => {
    root.current?.focus({ preventScroll: true });
  }, []);

  const offline = send.status === "offline";
  // Each screen is announced by its title, once it is in.
  useEffect(() => {
    if (!formOn || !open) return;
    scroller.current?.scrollTo({ top: 0 });
    const id = window.setTimeout(() => title.current?.focus({ preventScroll: true }), reduce ? 0 : 80);
    return () => window.clearTimeout(id);
  }, [formOn, step, offline, open, reduce]);

  /* --- the answers ----------------------------------------------------- */

  const setDraft = useCallback(
    (patch: Partial<Draft>) => {
      setDraftState((d) => ({ ...d, ...patch }));
      setErrors((e) => {
        const next = { ...e };
        for (const key of Object.keys(patch) as (keyof Draft)[]) {
          delete next[ERROR_OF[key] ?? key];
        }
        return next;
      });
    },
    [setDraftState, setErrors],
  );
  const setContact = useCallback(
    (patch: Partial<Contact>) => {
      setContactState((c) => ({ ...c, ...patch }));
      setErrors((e) => {
        const next = { ...e };
        for (const key of Object.keys(patch)) delete next[key];
        return next;
      });
    },
    [setContactState, setErrors],
  );

  const steps = stepsFor(draft);
  const index = Math.max(0, steps.indexOf(step));
  const nextStep = steps[index + 1];

  // The hidden field bots fill in; read when a request goes.
  const trap = useRef<HTMLInputElement>(null);
  const readTrap = useCallback(() => trap.current?.value ?? "", []);
  const openedAt = useRef(Date.now());

  const estimate = useEstimate(step === "estimate" && formOn, draft, readTrap);

  const goTo = (s: StepId) => {
    setErrors({});
    setSend({ status: "idle" });
    setStep(s);
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
    if (!landed) return;
    if (step === "sent") {
      hide();
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
      // To the first answer missing, so it is where the reader is taken.
      requestAnimationFrame(() => {
        const el =
          scroller.current?.querySelector<HTMLElement>(`[data-question="${first}"] input`) ??
          scroller.current?.querySelector<HTMLElement>(`[name="${first}"]`) ??
          scroller.current?.querySelector<HTMLElement>(`[aria-describedby="${first}-error"]`);
        el?.focus({ preventScroll: true });
        el?.closest("[data-question], .prop-row, .pf-consent-row")?.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" });
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

  /* Clearing everything is asked twice, in place: one stray click must not
     lose a whole set of answers. */
  const [confirming, setConfirming] = useState(false);
  useEffect(() => setConfirming(false), [step, offline]);
  const clearAll = () => {
    clear();
    setConfirming(false);
    scroller.current?.scrollTo({ top: 0 });
    // Already on the first screen, nothing else would move focus off the
    // button that has just gone.
    requestAnimationFrame(() => title.current?.focus({ preventScroll: true }));
  };

  const action = offline ? "Open in your email app" : send.status === "sending" ? "Sending…" : actionFor(step, nextStep);
  const canGoBack = landed && index > 0 && step !== "sent";
  const progress = steps.length > 1 ? index / (steps.length - 1) : 0;

  return (
    <>
      {/* The page behind, under frosted glass and out of reach. A click on
          it goes back, as Esc does. */}
      <motion.div
        aria-hidden="true"
        className="pf-glass"
        style={{ opacity: glass }}
        onClick={landed ? hide : undefined}
      />

      <motion.div
        ref={root}
        id="proposal-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="proposal-title"
        tabIndex={-1}
        className="pf-panel"
        style={{ x, y, width, height, padding: pad, opacity: whole, pointerEvents: landed ? "auto" : "none" }}
      >
        <motion.div aria-hidden="true" className="pf-pane" style={{ opacity: pane }} />

        <form noValidate onSubmit={onSubmit} aria-label="Get your free proposal" className="flex h-full min-h-0 flex-col">
          {/* The index's label, which becomes the form's. */}
          <p className="mono-label mb-2.5 flex items-center justify-between text-ash-2">
            <span className="grid">
              <motion.span aria-hidden="true" className="idx-title [grid-area:1/1] justify-self-start" style={{ opacity: labelOut }}>
                Index
              </motion.span>
              <motion.span id="proposal-title" className="idx-title [grid-area:1/1] justify-self-start" style={{ opacity: labelIn }}>
                Free proposal
              </motion.span>
            </span>
            <motion.span className="flex items-center gap-4 md:gap-6" style={{ opacity: form }}>
              {step !== "sent" &&
                (confirming ? (
                  <span role="group" aria-label="Clear all answers?" className="flex items-center gap-2">
                    <span className="text-ink">
                      <span className="max-md:hidden">Clear all answers?</span>
                      <span className="md:hidden">Clear all?</span>
                    </span>
                    <button type="button" onClick={clearAll} className="prop-close pf-clear-yes">
                      Yes
                    </button>
                    <span aria-hidden="true">/</span>
                    <button type="button" onClick={() => setConfirming(false)} className="prop-close">
                      No
                    </button>
                  </span>
                ) : (
                  <button type="button" onClick={() => setConfirming(true)} className="prop-close">
                    <span className="max-md:hidden">Clear answers</span>
                    <span className="md:hidden">Clear</span>
                  </button>
                ))}
              <button type="button" onClick={hide} className="prop-close">
                Close
                <span aria-hidden="true" className="ml-1.5">
                  &times;
                </span>
              </button>
            </motion.span>
          </p>

          <div className="relative min-h-0 flex-1">
            {/* The index's rows, let go as it sets off. */}
            <motion.div aria-hidden="true" className="absolute inset-x-0 top-0" style={{ opacity: rows, x: rowsX }}>
              {SECTION_LINKS.map((row) => (
                <div key={row.label} className="relative">
                  <span className="absolute inset-x-0 top-0 z-10 block h-px bg-ink" />
                  <div className={`idx-link ${row.lead ? "idx-lead" : ""}`}>
                    <span className="idx-name flex items-center gap-2.5">
                      {row.lead && <span className="live-dot" />}
                      {row.label}
                    </span>
                    <span className="idx-arrow">
                      <ArrowIcon />
                    </span>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* How far along: a hairline filled in from the left. */}
            <motion.div aria-hidden="true" className="pf-progress" style={{ opacity: form }}>
              <motion.span
                className="pf-progress-fill"
                initial={false}
                animate={{ scaleX: Math.max(progress, 0.04) }}
                transition={{ duration: reduce ? 0 : 0.6, ease: [0.65, 0, 0.35, 1] }}
              />
            </motion.div>

            {formOn && (
              <motion.div
                ref={scroller}
                data-lenis-prevent
                className="pf-scroll"
                style={{ opacity: form }}
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={offline ? "offline" : step}
                    exit={{ opacity: 0, y: -6, transition: { duration: reduce ? 0 : 0.16 } }}
                  >
                    {offline ? (
                      <>
                        <h2 ref={title} tabIndex={-1} className="pf-title">
                          Send it by email
                        </h2>
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
              </motion.div>
            )}

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

          {/* The row the index was opened from, which moves the form on. */}
          <div className="relative">
            <span aria-hidden="true" className="absolute inset-x-0 top-0 z-10 block h-px bg-ink" />
            <div className="flex">
              <AnimatePresence initial={false}>
                {canGoBack && (
                  <motion.div
                    key="back"
                    className="shrink-0 overflow-hidden"
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: "auto", opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: reduce ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <button type="button" onClick={back} className="idx-link pf-back">
                      <span aria-hidden="true" className="idx-arrow">
                        <ArrowIcon back />
                      </span>
                      <span className="idx-name">Back</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
              <button
                type="submit"
                aria-busy={send.status === "sending" || undefined}
                className="idx-link idx-send min-w-0 flex-1 text-left"
              >
                <span className="grid min-w-0">
                  <motion.span aria-hidden="true" className="idx-name [grid-area:1/1] truncate" style={{ opacity: footOut }}>
                    Get your free proposal
                  </motion.span>
                  <motion.span className="idx-name [grid-area:1/1] truncate" style={{ opacity: footIn }}>
                    {action}
                  </motion.span>
                </span>
                <span aria-hidden="true" className="idx-arrow grid">
                  <motion.span className="[grid-area:1/1]" style={{ opacity: footOut }}>
                    <PlusIcon />
                  </motion.span>
                  <motion.span className="[grid-area:1/1]" style={{ opacity: footIn }}>
                    <ArrowIcon />
                  </motion.span>
                </span>
              </button>
            </div>
            <span aria-hidden="true" className="block h-px bg-ink" />
          </div>
        </form>
      </motion.div>
    </>
  );
}


function ArrowIcon({ back = false }: { back?: boolean }) {
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

function PlusIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" className="block">
      <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="1.25" />
    </svg>
  );
}
