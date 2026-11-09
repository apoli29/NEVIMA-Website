"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { Contact } from "@/lib/proposal/questions";
import { OfflineNote, type Errors, type SendState } from "./proposal-steps";
import {
  PARTNER_STEPS,
  PartnerScreen,
  checkPartner,
  partnerAction,
  partnerErrorOf,
  partnerMailto,
  partnerNotFit,
  postPartner,
  type PartnerDraft,
} from "./partner-steps";
import {
  resetPartnerState,
  setPartnerContact,
  setPartnerDraft,
  setPartnerStep,
  usePartnerState,
} from "./partner-state";
import { useLang, useT } from "@/lib/use-lang";

/* ==================================================================
   The partners' form, set in "Let's work together"

   For development companies that handle the back end and want us on
   the front end (user, 2026-10-18). It sits beside the free-proposal
   form, in the same frame, and keeps the same manner: questions between
   hairlines, a screen at a time, the button at the foot. Its questions
   are partner-steps.tsx's, and its answers partner-state.ts's, shared
   with the overlay, where the same questions are asked when "A
   development company" is chosen (user, 2026-11-09).
   ================================================================== */

export function PartnerForm({ onTouch }: { onTouch?: () => void }) {
  const reduce = useReducedMotion() ?? false;
  const lang = useLang();
  const t = useT();
  const { draft, contact, step } = usePartnerState();
  const [errors, setErrors] = useState<Errors>({});
  const [send, setSend] = useState<SendState>({ status: "idle" });
  const touched = useRef(false);
  const title = useRef<HTMLHeadingElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const trap = useRef<HTMLInputElement>(null);
  const openedAt = useRef(Date.now());
  const offline = send.status === "offline";
  const notFit = partnerNotFit(draft);

  const touch = useCallback(() => {
    touched.current = true;
    onTouch?.();
  }, [onTouch]);

  const bringBack = useCallback(
    (el: HTMLElement | null, at: number) => {
      if (!el) return;
      const top = el.getBoundingClientRect().top;
      if (top >= 64 && top <= window.innerHeight * 0.8) return;
      window.scrollTo({ top: window.scrollY + top - window.innerHeight * at, behavior: reduce ? "auto" : "smooth" });
    },
    [reduce],
  );

  const setDraft = (patch: Partial<PartnerDraft>) => {
    touch();
    setPartnerDraft((d) => ({ ...d, ...patch }));
    setErrors((e) => {
      const next = { ...e };
      for (const key of Object.keys(patch)) delete next[partnerErrorOf(key)];
      return next;
    });
  };
  const setContact = (patch: Partial<Contact>) => {
    touch();
    setPartnerContact((c) => ({ ...c, ...patch }));
    setErrors((e) => {
      const next = { ...e };
      for (const key of Object.keys(patch)) delete next[key];
      return next;
    });
  };

  // Each new screen starts at its top, announced by its title.
  useEffect(() => {
    if (!touched.current) return;
    if ((box.current?.getBoundingClientRect().top ?? 0) < 0) bringBack(box.current, 0.08);
    title.current?.focus({ preventScroll: true });
  }, [step, offline, bringBack]);

  const reset = () => {
    touch();
    resetPartnerState();
    setErrors({});
    setSend({ status: "idle" });
    requestAnimationFrame(() => title.current?.focus({ preventScroll: true }));
  };

  const submit = async () => {
    setSend({ status: "sending" });
    const result = await postPartner({
      draft,
      contact,
      lang,
      nickname: trap.current?.value ?? "",
      elapsedMs: Date.now() - openedAt.current,
      t,
    });
    if (result === "sent") {
      setSend({ status: "idle" });
      setPartnerStep("sent");
    } else setSend(result);
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    touch();
    if (step === "sent" || (step === "fit" && notFit)) {
      reset();
      return;
    }
    if (offline) {
      window.location.href = partnerMailto(draft, contact, lang, t);
      return;
    }
    const found = checkPartner(step, draft, contact, lang, t);
    const first = Object.keys(found)[0];
    if (first) {
      setErrors(found);
      requestAnimationFrame(() => {
        const el =
          scroller.current?.querySelector<HTMLElement>(`[data-question="${first}"] input`) ??
          scroller.current?.querySelector<HTMLElement>(`[name="${first}"]`) ??
          scroller.current?.querySelector<HTMLElement>(`[aria-describedby="${first}-error"]`);
        el?.focus({ preventScroll: true });
        bringBack(el?.closest<HTMLElement>("[data-question], .prop-row, .pf-consent-row") ?? null, 1 / 3);
      });
      return;
    }
    if (step !== "contact") {
      setErrors({});
      setPartnerStep(PARTNER_STEPS[PARTNER_STEPS.indexOf(step) + 1]!);
      return;
    }
    if (send.status !== "sending") void submit();
  };

  const back = () => {
    if (offline) {
      setSend({ status: "idle" });
      return;
    }
    setErrors({});
    const i = PARTNER_STEPS.indexOf(step);
    if (i > 0) setPartnerStep(PARTNER_STEPS[i - 1]!);
  };

  const action = offline
    ? t("Open in your email app", "Abrir na app de email")
    : send.status === "sending"
      ? t("Sending…", "A enviar…")
      : partnerAction(step, draft, t, t("Start a new request", "Fazer um novo pedido"));
  const progress = Math.max(PARTNER_STEPS.indexOf(step) / (PARTNER_STEPS.length - 1), 0.04);

  return (
    <div ref={box} className="wt-form relative isolate text-ink">
      <div aria-hidden="true" className="pf-pane" />
      <form noValidate onSubmit={onSubmit} aria-labelledby="partner-form-title" className="flex h-full min-h-0 flex-col">
        <p className="mono-label mb-2.5 flex items-center justify-between text-ash-2">
          <span id="partner-form-title" className="idx-title">
            {t("Partnership", "Parceria")}
          </span>
        </p>

        <div className="relative min-h-0 flex-1">
          <div aria-hidden="true" className="pf-progress">
            <motion.span
              className="pf-progress-fill"
              initial={false}
              animate={{ scaleX: progress }}
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
                  <PartnerScreen
                    step={step}
                    draft={draft}
                    setDraft={setDraft}
                    contact={contact}
                    setContact={setContact}
                    errors={errors}
                    send={send}
                    titleRef={title}
                    heading="h3"
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
          {/* For bots only: out of sight, out of the tab order. */}
          <input ref={trap} name="nickname" tabIndex={-1} autoComplete="off" aria-hidden="true" className="pf-trap" defaultValue="" />
        </div>

        <div className="relative z-10">
          <span aria-hidden="true" className="absolute inset-x-0 top-0 z-10 block h-px bg-ink" />
          <div className="flex">
            {step !== "project" && step !== "sent" && (
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
