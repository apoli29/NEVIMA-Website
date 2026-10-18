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
  type SendState,
  type StepId,
} from "./proposal-steps";
import { useLang, useT } from "@/lib/use-lang";
import { PartnerForm } from "./partner-form";

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

/** Which error a change to the draft answers (as in the overlay). */
const ERROR_OF: Partial<Record<keyof Draft, string>> = {
  countryOther: "country",
  languagesOther: "languages",
  region: "town",
};

type Audience = "business" | "partner";
const AUDIENCES: Audience[] = ["business", "partner"];

export function WorkTogether() {
  const reduce = useReducedMotion() ?? false;
  const t = useT();
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (reduce) return;
    const id = window.setInterval(() => setShown((i) => (i + 1) % PHOTOS.length), HOLD_MS);
    return () => window.clearInterval(id);
  }, [reduce]);

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
  const [beat, setBeat] = useState(0);
  const [swapped, setSwapped] = useState(false);
  const section = useRef<HTMLElement>(null);
  const turning = !reduce && !held && !resting && inView;

  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const seen = new IntersectionObserver(([entry]) => setInView(!!entry?.isIntersecting), { threshold: 0.35 });
    seen.observe(el);
    return () => seen.disconnect();
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
                {a === "business" ? <InlineProposal /> : <PartnerForm />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* --- the form, set in place ---------------------------------------------- */

function InlineProposal() {
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
        setSend({ status: "error", message: sendError(res.status, t) });
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
