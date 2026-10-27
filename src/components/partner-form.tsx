"use client";

import { useCallback, useEffect, useId, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { inLang, type Contact } from "@/lib/proposal/questions";
import {
  CREDITS,
  DELIVERIES,
  MODELS,
  NOT_COMPATIBLE,
  PARTNER_INTRO,
  PARTNER_YES_NO,
  PROJECT_TYPES,
  SCREENS,
  STACK_QUESTION,
  STARTS,
  type CreditId,
  type DeliveryId,
  type ModelId,
  type PartnerAnswers,
  type PartnerYesNo,
  type ProjectTypeId,
  type ScreensId,
  type StartId,
} from "@/lib/proposal/partner";
import {
  ContactScreen,
  EMPTY_CONTACT,
  EMPTY_DRAFT,
  Field,
  OfflineNote,
  Question,
  ROW,
  STUDIO_EMAIL,
  Segmented,
  Ticks,
  checkStep,
  sendError,
  type Errors,
  type SendState,
} from "./proposal-steps";
import { labelOf } from "@/lib/proposal/questions";
import { useLang, useT } from "@/lib/use-lang";
import { MAX } from "@/lib/proposal/questions";

/* ==================================================================
   The partners' form

   For development companies that handle the back end and want us on
   the front end (user, 2026-10-18). It sits beside the free-proposal
   form in "Let's work together", in the same frame, and keeps the same
   manner: questions between hairlines, a screen at a time, the button
   at the foot. Two screens, the project and the details, and no
   estimate: we get in touch, then send a fixed quote.

   A partner whose stack does not fit ours cannot send: the form says so
   at once, and its button starts it again.
   ================================================================== */

/** A screen at a time, as the free proposal (user, 2026-10-18: it was
    one long screen): the project, whether we fit and when, how we would
    work, then the details. */
type Step = "project" | "fit" | "terms" | "contact" | "sent";
const STEPS: Step[] = ["project", "fit", "terms", "contact", "sent"];

type PartnerDraft = {
  project: ProjectTypeId | "";
  screens: ScreensId | "";
  screensEstimate: string;
  inspiration: PartnerYesNo | "";
  inspirationLink: string;
  compatible: PartnerYesNo | "";
  start: StartId | "";
  delivery: DeliveryId | "";
  model: ModelId | "";
  credit: CreditId | "";
  nda: boolean;
};

const EMPTY: PartnerDraft = {
  project: "",
  screens: "",
  screensEstimate: "",
  inspiration: "",
  inspirationLink: "",
  compatible: "",
  start: "",
  delivery: "",
  model: "",
  credit: "",
  nda: false,
};

const NDA = [{ id: "nda", label: "We'll need one", pt: "Vamos precisar de um" }] as const;

export function PartnerForm({ onTouch }: { onTouch?: () => void }) {
  const reduce = useReducedMotion() ?? false;
  const lang = useLang();
  const t = useT();
  const uid = useId();
  const [draft, setDraftState] = useState<PartnerDraft>(EMPTY);
  const [contact, setContactState] = useState<Contact>(EMPTY_CONTACT);
  const [step, setStep] = useState<Step>("project");
  const [errors, setErrors] = useState<Errors>({});
  const [send, setSend] = useState<SendState>({ status: "idle" });
  const touched = useRef(false);
  const title = useRef<HTMLHeadingElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const trap = useRef<HTMLInputElement>(null);
  const openedAt = useRef(Date.now());
  const offline = send.status === "offline";
  const list = <T extends { id: string; label: string; pt: string }>(l: readonly T[]) => inLang(l, lang);
  const notFit = draft.compatible === "no";

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
    setDraftState((d) => ({ ...d, ...patch }));
    setErrors((e) => {
      const next = { ...e };
      for (const key of Object.keys(patch)) {
        delete next[key === "inspirationLink" ? "inspiration" : key === "screensEstimate" ? "screens" : key];
      }
      return next;
    });
  };
  const setContact = (patch: Partial<Contact>) => {
    touch();
    setContactState((c) => ({ ...c, ...patch }));
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
    setDraftState(EMPTY);
    setContactState(EMPTY_CONTACT);
    setErrors({});
    setSend({ status: "idle" });
    setStep("project");
    requestAnimationFrame(() => title.current?.focus({ preventScroll: true }));
  };

  const check = (): Errors => {
    const pick = t("Choose one to continue.", "Escolher uma opção para continuar.");
    const e: Errors = {};
    if (step === "project") {
      if (!draft.project) e.project = pick;
      if (!draft.screens) e.screens = pick;
      else if (draft.screens === "20+" && !draft.screensEstimate.trim()) {
        e.screens = t("Tell us roughly how many.", "Falta indicar quantos, aproximadamente.");
      }
      if (!draft.inspiration) e.inspiration = pick;
    }
    if (step === "fit") {
      if (!draft.compatible) e.compatible = pick;
      if (!draft.start) e.start = pick;
      if (!draft.delivery) e.delivery = pick;
    }
    if (step === "terms") {
      if (!draft.model) e.model = pick;
      if (!draft.credit) e.credit = pick;
    }
    if (step === "contact") return checkStep("contact", EMPTY_DRAFT, contact, lang);
    return e;
  };

  const answers = (): PartnerAnswers => ({
    project: draft.project as ProjectTypeId,
    screens: draft.screens as ScreensId,
    ...(draft.screens === "20+" ? { screensEstimate: draft.screensEstimate.trim() } : {}),
    inspiration: draft.inspiration as PartnerYesNo,
    ...(draft.inspiration === "yes" && draft.inspirationLink.trim() ? { inspirationLink: draft.inspirationLink.trim() } : {}),
    compatible: "yes",
    start: draft.start as StartId,
    delivery: draft.delivery as DeliveryId,
    model: draft.model as ModelId,
    credit: draft.credit as CreditId,
    nda: draft.nda,
  });

  const submit = async () => {
    setSend({ status: "sending" });
    try {
      const res = await fetch("/api/partner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: answers(),
          contact,
          lang,
          nickname: trap.current?.value ?? "",
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

  // The email the request falls back to while the site has nowhere to
  // send it, with everything written in.
  const mailto = () => {
    const label = <T extends { id: string; label: string; pt: string }>(l: readonly T[], id: string) => labelOf(l, id, lang);
    const lines = [
      `${t("Name", "Nome")}: ${contact.name}`,
      `Email: ${contact.email}`,
      `${t("Phone", "Telefone")}: ${contact.phone}`,
      `${t("Company", "Empresa")}: ${contact.company}`,
      "",
      `${t("Project", "Projeto")}: ${label(PROJECT_TYPES, draft.project)}`,
      `${t("Screens or pages", "Ecrãs ou páginas")}: ${label(SCREENS, draft.screens)}${draft.screens === "20+" && draft.screensEstimate.trim() ? ` (${draft.screensEstimate.trim()})` : ""}`,
      `${t("Design or brand guidelines", "Design ou guia de marca")}: ${label(PARTNER_YES_NO, draft.inspiration)}${draft.inspirationLink.trim() ? ` (${draft.inspirationLink.trim()})` : ""}`,
      `${t("Stack compatible", "Tecnologia compatível")}: ${label(PARTNER_YES_NO, draft.compatible)}`,
      `${t("Start", "Início")}: ${label(STARTS, draft.start)}`,
      `${t("Delivery", "Entrega")}: ${label(DELIVERIES, draft.delivery)}`,
      `${t("Working model", "Modelo de trabalho")}: ${label(MODELS, draft.model)}`,
      `${t("In our portfolio", "No nosso portefólio")}: ${label(CREDITS, draft.credit)}`,
      `NDA: ${draft.nda ? t("Needed", "Necessário") : t("Not needed", "Não necessário")}`,
    ];
    if (contact.message.trim()) lines.push("", t("Additional notes:", "Notas adicionais:"), contact.message.trim());
    const subject = t(
      `Partnership request from ${contact.company.trim() || contact.name.trim() || "the website"}`,
      `Pedido de parceria de ${contact.company.trim() || contact.name.trim() || "um visitante do website"}`,
    );
    return `mailto:${STUDIO_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n"))}`;
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    touch();
    if (step === "sent" || (step === "fit" && notFit)) {
      reset();
      return;
    }
    if (offline) {
      window.location.href = mailto();
      return;
    }
    const found = check();
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
      setStep(STEPS[STEPS.indexOf(step) + 1]!);
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
    const i = STEPS.indexOf(step);
    if (i > 0) setStep(STEPS[i - 1]!);
  };

  const action = offline
    ? t("Open in your email app", "Abrir na app de email")
    : send.status === "sending"
      ? t("Sending…", "A enviar…")
      : step === "sent"
        ? t("Start a new request", "Fazer um novo pedido")
        : step === "contact"
          ? t("Send request", "Enviar pedido")
          : step === "fit" && notFit
            ? t("Start again", "Recomeçar")
            : t("Continue", "Continuar");
  const progress = Math.max(STEPS.indexOf(step) / (STEPS.length - 1), 0.04);

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
                  <motion.div
                    initial="hidden"
                    animate="shown"
                    variants={{ hidden: {}, shown: { transition: { staggerChildren: reduce ? 0 : 0.05, delayChildren: 0.04 } } }}
                  >
                    <motion.h3 variants={ROW} ref={title} tabIndex={-1} className="pf-title">
                      {step === "project"
                        ? t("Your project", "O projeto")
                        : step === "fit"
                          ? t("Technology and timing", "Tecnologia e prazos")
                          : step === "terms"
                            ? t("How we'd work", "Modelo de colaboração")
                            : step === "contact"
                              ? t("Your details", "Dados de contacto")
                              : t("Request sent", "Pedido enviado")}
                    </motion.h3>

                    {step === "project" && (
                      <>
                        <motion.p variants={ROW} className="pf-lede">
                          {t(PARTNER_INTRO)}
                        </motion.p>
                        <div className="pf-rows">
                          <Question id="project" label={t("What are you building?", "Que tipo de projeto é?")} error={errors.project}>
                            <Segmented
                              name="project"
                              options={list(PROJECT_TYPES)}
                              value={draft.project}
                              onChange={(project) => setDraft({ project })}
                              labelledBy="project-q"
                            />
                          </Question>
                          <Question id="screens" label={t("How many screens or pages?", "Quantos ecrãs ou páginas?")} error={errors.screens}>
                            <Segmented
                              name="screens"
                              options={list(SCREENS)}
                              value={draft.screens}
                              onChange={(screens) => setDraft({ screens })}
                              labelledBy="screens-q"
                            />
                            {draft.screens === "20+" && (
                              <Field
                                id={`${uid}-screens`}
                                label={t("Roughly how many?", "Quantos, aproximadamente?")}
                                placeholder={t("Roughly how many? e.g. 35", "Quantos, aproximadamente? ex.: 35")}
                                value={draft.screensEstimate}
                                onChange={(screensEstimate) => setDraft({ screensEstimate })}
                              />
                            )}
                          </Question>
                          <Question
                            id="inspiration"
                            label={t(
                              "Do you have a design or brand guidelines we should take as inspiration?",
                              "Existe um design ou um guia de marca a usar como inspiração?",
                            )}
                            error={errors.inspiration}
                          >
                            <Segmented
                              name="inspiration"
                              options={list(PARTNER_YES_NO)}
                              value={draft.inspiration}
                              onChange={(inspiration) => setDraft({ inspiration })}
                              labelledBy="inspiration-q"
                            />
                            {draft.inspiration === "yes" && (
                              <Field
                                id={`${uid}-inspiration`}
                                label={t("Link to it (optional)", "Link (opcional)")}
                                placeholder={t("Link to it (optional)", "Link (opcional)")}
                                value={draft.inspirationLink}
                                onChange={(inspirationLink) => setDraft({ inspirationLink })}
                                max={MAX.url}
                                inputMode="url"
                              />
                            )}
                          </Question>
                        </div>
                      </>
                    )}

                    {step === "fit" && (
                      <>
                        <div className="pf-rows">
                          <Question id="compatible" label={t(STACK_QUESTION)} error={errors.compatible}>
                            <Segmented
                              name="compatible"
                              options={list(PARTNER_YES_NO)}
                              value={draft.compatible}
                              onChange={(compatible) => setDraft({ compatible })}
                              labelledBy="compatible-q"
                            />
                            {notFit && (
                              <p role="status" className="pf-out">
                                {t(NOT_COMPATIBLE)}
                              </p>
                            )}
                          </Question>
                          {!notFit && (
                            <>
                              <Question id="start" label={t("When would you like to start?", "Data de início pretendida?")} error={errors.start}>
                                <Segmented
                                  name="start"
                                  options={list(STARTS)}
                                  value={draft.start}
                                  onChange={(start) => setDraft({ start })}
                                  labelledBy="start-q"
                                />
                              </Question>
                              <Question id="delivery" label={t("When do you need it delivered?", "Prazo de entrega pretendido?")} error={errors.delivery}>
                                <Segmented
                                  name="delivery"
                                  options={list(DELIVERIES)}
                                  value={draft.delivery}
                                  onChange={(delivery) => setDraft({ delivery })}
                                  labelledBy="delivery-q"
                                />
                              </Question>
                            </>
                          )}
                        </div>
                      </>
                    )}

                    {step === "terms" && (
                      <>
                        <div className="pf-rows">
                            <>
                              <Question id="model" label={t("How would we work together?", "Que modelo de colaboração?")} error={errors.model}>
                                <Segmented
                                  name="model"
                                  options={list(MODELS)}
                                  value={draft.model}
                                  onChange={(model) => setDraft({ model })}
                                  labelledBy="model-q"
                                />
                              </Question>
                              <Question
                                id="credit"
                                label={t("Can we show this work in our portfolio?", "Podemos mostrar este trabalho no nosso portefólio?")}
                                error={errors.credit}
                              >
                                <Segmented
                                  name="credit"
                                  options={list(CREDITS)}
                                  value={draft.credit}
                                  onChange={(credit) => setDraft({ credit })}
                                  labelledBy="credit-q"
                                />
                              </Question>
                              <Question
                                id="nda"
                                label={t("Confidentiality", "Confidencialidade")}
                                hint={t("We're happy to sign an NDA", "Assinamos um NDA, se necessário")}
                                group={false}
                              >
                                <Ticks
                                  name="nda"
                                  options={list(NDA)}
                                  value={draft.nda ? ["nda"] : []}
                                  onChange={(v) => setDraft({ nda: v.length > 0 })}
                                />
                              </Question>
                            </>
                        </div>
                      </>
                    )}

                    {step === "contact" && (
                      <ContactScreen contact={contact} setContact={setContact} errors={errors} send={send} partner />
                    )}

                    {step === "sent" && (
                      <motion.p variants={ROW} className="pf-lede">
                        {t(
                          `Thank you, ${contact.name.trim().split(" ")[0]}. We'll get in touch within a few hours to talk it through, then send you a fixed quote.`,
                          `Obrigado, ${contact.name.trim().split(" ")[0]}. Entraremos em contacto dentro de poucas horas para conversar sobre o projeto e, depois, enviaremos um orçamento fixo.`,
                        )}
                      </motion.p>
                    )}
                  </motion.div>
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
