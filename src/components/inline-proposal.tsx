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
  mailSubject,
  sendError,
  stepsFor,
  summary,
  toAnswers,
  useEstimate,
  type Draft,
  type Errors,
  type EstimateState,
  type SendState,
  type StepId,
} from "./proposal-steps";
import { useLang, useT } from "@/lib/use-lang";
import { useOriginFade, useProposal, type ProposalController } from "./proposal-flow";
import { useProposalState } from "./proposal-state";

/* The free-proposal form set in Let's work together (work-together.tsx),
   kept in a file of its own so it is fetched only as the section comes
   near, not with the page. */

/** Which error a change to the draft answers (as in the overlay). */
const ERROR_OF: Partial<Record<keyof Draft, string>> = {
  countryOther: "country",
  languagesOther: "languages",
  region: "town",
};

/* --- the form at the foot of a page ----------------------------------------

   On a page that has the proposal overlay, the form here is a preview of
   it (user, 2026-10-31): pressing it anywhere grows the overlay out of its
   own box for the visitor to answer in, and closing the overlay brings the
   answers back here, to be pressed again. On a page with no overlay it is
   the live form below, answered in place. */

export function InlineProposal() {
  const proposal = useProposal();
  return proposal ? <ProposalPreview ctl={proposal} /> : <InlineForm />;
}

/** The screen to show for a step: the estimate has no preview of its own
    (it is worked out by the server, for the overlay), so the screen before
    it stands in; a sent request starts afresh. */
function previewStep(step: StepId, steps: StepId[]): StepId {
  if (step === "sent") return "basics";
  if (step === "estimate") return steps[Math.max(0, steps.indexOf("estimate") - 1)] ?? "basics";
  return step;
}

const NO_ESTIMATE: EstimateState = { status: "loading" };
const NO_SEND: SendState = { status: "idle" };
const NO_ERRORS: Errors = {};
const noop = () => {};

function ProposalPreview({ ctl }: { ctl: ProposalController }) {
  const t = useT();
  const { draft, contact, step } = useProposalState();
  const box = useRef<HTMLDivElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const [launched, setLaunched] = useState(false);
  useEffect(() => {
    if (!ctl.present) setLaunched(false);
  }, [ctl.present]);
  // Let go over the same stretch as the pane comes in, taken back as it
  // goes home, so no frame shows neither (proposal-flow.tsx).
  useOriginFade(box, ctl.progress, launched && ctl.present);

  const steps = stepsFor(draft);
  const shown = previewStep(step, steps);
  const index = Math.max(0, steps.indexOf(shown));
  const progress = steps.length > 1 ? index / (steps.length - 1) : 0;
  const action = actionFor(shown, steps[index + 1], t);

  const open = () => {
    if (!box.current) return;
    setLaunched(true);
    ctl.show(box.current, box.current, false, 0);
  };

  return (
    <div
      ref={box}
      role="button"
      tabIndex={0}
      aria-haspopup="dialog"
      aria-label={t("Open the free proposal form", "Abrir o formulário da proposta gratuita")}
      onClick={open}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          open();
        }
      }}
      className="wt-form wt-preview relative isolate cursor-pointer text-ink"
    >
      <div aria-hidden="true" className="pf-pane" />
      {/* Nothing in it can be reached: a press lands on the preview. */}
      <div inert className="flex min-h-0 flex-1 flex-col">
        <p className="mono-label mb-2.5 flex items-center justify-between text-ash-2">
          <span className="idx-title">{t("Free proposal", "Proposta gratuita")}</span>
        </p>
        <div className="relative min-h-0 flex-1">
          <div aria-hidden="true" className="pf-progress">
            <span className="pf-progress-fill" style={{ transform: `scaleX(${Math.max(progress, 0.04)})` }} />
          </div>
          <div className="pf-scroll">
            <StepScreen
              step={shown}
              draft={draft}
              setDraft={noop}
              contact={contact}
              setContact={noop}
              errors={NO_ERRORS}
              estimate={NO_ESTIMATE}
              retryEstimate={noop}
              send={NO_SEND}
              titleRef={title}
            />
          </div>
        </div>
        <div className="relative z-10">
          <span aria-hidden="true" className="absolute inset-x-0 top-0 z-10 block h-px bg-ink" />
          <div className="idx-link idx-send flex min-w-0 flex-1 text-left">
            <span className="idx-name truncate">{action}</span>
            <span aria-hidden="true" className="idx-arrow">
              <Arrow />
            </span>
          </div>
          <span aria-hidden="true" className="block h-px bg-ink" />
        </div>
      </div>
    </div>
  );
}

/* --- the form, set in place ---------------------------------------------- */

function InlineForm() {
  const reduce = useReducedMotion() ?? false;
  const lang = useLang();
  const t = useT();
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
  const box = useRef<HTMLDivElement>(null);

  // The form has no scroller of its own (it would catch the wheel on the
  // way to the footer): it grows with its screen, and the page brings back
  // whatever has gone out of sight.
  const bringBack = useCallback(
    (el: HTMLElement | null, at: number) => {
      if (!el) return;
      const top = el.getBoundingClientRect().top;
      if (top >= 64 && top <= window.innerHeight * 0.8) return;
      window.scrollTo({
        top: window.scrollY + top - window.innerHeight * at,
        behavior: reduce ? "auto" : "smooth",
      });
    },
    [reduce],
  );
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
    if ((box.current?.getBoundingClientRect().top ?? 0) < 0) bringBack(box.current, 0.08);
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
    if ((box.current?.getBoundingClientRect().top ?? 0) < 0) bringBack(box.current, 0.08);
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
          lang,
          origin: "page",
          nickname: readTrap(),
          elapsedMs: Date.now() - openedAt.current,
        }),
      });
      if (res.ok) {
        setSend({ status: "idle" });
        setStep("sent");
      } else if (res.status === 503) {
        setSend({ status: "offline" });
      } else {
        const why = (await res.json().catch(() => ({}))) as { waitMs?: number };
        setSend({ status: "error", message: sendError(res.status, t, why.waitMs) });
      }
    } catch {
      setSend({ status: "error", message: sendError("network", t) });
    }
  };

  const mailto = `mailto:${STUDIO_EMAIL}?subject=${encodeURIComponent(mailSubject(contact.name, t))}&body=${encodeURIComponent(
    summary(draft, contact, estimate.state.status === "ready" ? estimate.state.estimate : null, lang),
  )}`;

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
    const found = checkStep(step, draft, contact, lang);
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
        bringBack(row ?? null, 1 / 3);
      });
      return;
    }
    if (step === "estimate") {
      if (estimate.state.status === "error") estimate.retry();
      if (estimate.state.status !== "ready") return;
      // Beyond what we take on: the form ends here, and starts again.
      if (!nextStep) {
        reset();
        return;
      }
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
    ? t("Open in your email app", "Abrir na app de email")
    : send.status === "sending"
      ? t("Sending…", "A enviar…")
      : step === "sent"
        ? t("Start a new request", "Fazer um novo pedido")
        : step === "estimate" && !nextStep
          ? t("Start again", "Recomeçar")
          : actionFor(step, nextStep, t);
  const canGoBack = index > 0 && step !== "sent";
  const progress = steps.length > 1 ? index / (steps.length - 1) : 0;

  return (
    <div ref={box} className="wt-form relative isolate text-ink">
      <div aria-hidden="true" className="pf-pane" />
      <form noValidate onSubmit={onSubmit} aria-labelledby="wt-form-title" className="flex h-full min-h-0 flex-col">
        <p className="mono-label mb-2.5 flex items-center justify-between text-ash-2">
          <span id="wt-form-title" className="idx-title">
            {t("Free proposal", "Proposta gratuita")}
          </span>
          {step !== "sent" &&
            (confirming ? (
              <span role="group" aria-label={t("Clear all answers?", "Apagar todas as respostas?")} className="flex items-center gap-2">
                <span className="text-ink">{t("Clear all answers?", "Apagar todas as respostas?")}</span>
                <button type="button" onClick={reset} className="prop-close pf-clear-yes">
                  {t("Yes", "Sim")}
                </button>
                <span aria-hidden="true">/</span>
                <button type="button" onClick={() => setConfirming(false)} className="prop-close">
                  {t("No", "Não")}
                </button>
              </span>
            ) : (
              <button type="button" onClick={() => setConfirming(true)} className="prop-close">
                {t("Clear answers", "Apagar respostas")}
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
          <div ref={scroller} className="pf-scroll">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={offline ? "offline" : step}
                exit={{ opacity: 0, y: -6, transition: { duration: reduce ? 0 : 0.16 } }}
              >
                {offline ? (
                  <>
                    <h3 ref={title} tabIndex={-1} className="pf-title">
                      {t("Send it by email", "Enviar por email")}
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
                <span className="idx-name">{t("Back", "Voltar")}</span>
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
