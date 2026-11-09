"use client";

import { useId } from "react";
import { motion, useReducedMotion } from "motion/react";
import { inLang, labelOf, MAX, type Contact } from "@/lib/proposal/questions";
import {
  CREDITS,
  DELIVERIES,
  MODELS,
  NOT_COMPATIBLE,
  PARTNER_INTRO,
  PARTNER_YES_NO,
  PROJECT_TYPES,
  STACK_QUESTION,
  STARTS,
  type CreditId,
  type DeliveryId,
  type ModelId,
  type PartnerAnswers,
  type PartnerYesNo,
  type ProjectTypeId,
  type StartId,
} from "@/lib/proposal/partner";
import type { Lang } from "@/lib/i18n";
import {
  ContactScreen,
  EMPTY_DRAFT,
  Field,
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
import { useLang, useT } from "@/lib/use-lang";

/* ==================================================================
   The partners' questions, screen by screen

   For development companies that handle the back end and want us on
   the front end (user, 2026-10-18). Shared by the two frames that ask
   them: the form in "Let's work together" (partner-form.tsx) and the
   overlay every "Get your free proposal" button opens, where choosing
   "A development company" on its first screen brings them in (user,
   2026-11-09). What is answered is kept in partner-state.ts, so both
   frames show the same answers.

   No estimate: we get in touch, then send a fixed quote. A partner
   whose stack does not fit ours cannot send: the form says so at once,
   and its button starts it again.
   ================================================================== */

type Translate = ReturnType<typeof useT>;

/** A screen at a time, as the free proposal: the project, whether we fit
    and when, how we would work, then the details. */
export type PartnerStep = "project" | "fit" | "terms" | "contact" | "sent";
export const PARTNER_STEPS: PartnerStep[] = ["project", "fit", "terms", "contact", "sent"];

/** How many screens or pages is no longer asked (user, 2026-11-09), as the
    free proposal no longer asks how many pages. */
export type PartnerDraft = {
  project: ProjectTypeId | "";
  inspiration: PartnerYesNo | "";
  inspirationLink: string;
  compatible: PartnerYesNo | "";
  start: StartId | "";
  delivery: DeliveryId | "";
  model: ModelId | "";
  credit: CreditId | "";
  nda: boolean;
};

export const EMPTY_PARTNER: PartnerDraft = {
  project: "",
  inspiration: "",
  inspirationLink: "",
  compatible: "",
  start: "",
  delivery: "",
  model: "",
  credit: "",
  nda: false,
};

/** Which error a change to the draft answers. */
export const partnerErrorOf = (key: string) => (key === "inspirationLink" ? "inspiration" : key);

/** The stack does not fit: the form ends on its second screen. */
export const partnerNotFit = (draft: PartnerDraft) => draft.compatible === "no";

export function checkPartner(step: PartnerStep, draft: PartnerDraft, contact: Contact, lang: Lang, t: Translate): Errors {
  const pick = t("Choose one to continue.", "Escolher uma opção para continuar.");
  const e: Errors = {};
  if (step === "project") {
    if (!draft.project) e.project = pick;
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
}

export function partnerAnswers(draft: PartnerDraft): PartnerAnswers {
  return {
    project: draft.project as ProjectTypeId,
    inspiration: draft.inspiration as PartnerYesNo,
    ...(draft.inspiration === "yes" && draft.inspirationLink.trim() ? { inspirationLink: draft.inspirationLink.trim() } : {}),
    compatible: "yes",
    start: draft.start as StartId,
    delivery: draft.delivery as DeliveryId,
    model: draft.model as ModelId,
    credit: draft.credit as CreditId,
    nda: draft.nda,
  };
}

/** Sends the request. "sent" once it has gone; otherwise what the form
    should say. */
export async function postPartner(body: {
  draft: PartnerDraft;
  contact: Contact;
  lang: Lang;
  nickname: string;
  elapsedMs: number;
  t: Translate;
}): Promise<"sent" | SendState> {
  try {
    const res = await fetch("/api/partner", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        answers: partnerAnswers(body.draft),
        contact: body.contact,
        lang: body.lang,
        nickname: body.nickname,
        elapsedMs: body.elapsedMs,
      }),
    });
    if (res.ok) return "sent";
    if (res.status === 503) return { status: "offline" };
    const why = (await res.json().catch(() => ({}))) as { waitMs?: number };
    return { status: "error", message: sendError(res.status, body.t, why.waitMs) };
  } catch {
    return { status: "error", message: sendError("network", body.t) };
  }
}

/** The email the request falls back to while the site has nowhere to
    send it, with everything written in. */
export function partnerMailto(draft: PartnerDraft, contact: Contact, lang: Lang, t: Translate) {
  const label = <T extends { id: string; label: string; pt: string }>(l: readonly T[], id: string) => labelOf(l, id, lang);
  const lines = [
    `${t("Name", "Nome")}: ${contact.name}`,
    `Email: ${contact.email}`,
    `${t("Phone", "Telefone")}: ${contact.phone}`,
    `${t("Company", "Empresa")}: ${contact.company}`,
    "",
    `${t("Project", "Projeto")}: ${label(PROJECT_TYPES, draft.project)}`,
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
}

/** What the button at the foot says on each screen; `sentLabel` is what
    it says once the request has gone (a new request in the page's form,
    Close in the overlay). */
export function partnerAction(step: PartnerStep, draft: PartnerDraft, t: Translate, sentLabel: string) {
  if (step === "sent") return sentLabel;
  if (step === "contact") return t("Send request", "Enviar pedido");
  if (step === "fit" && partnerNotFit(draft)) return t("Start again", "Recomeçar");
  return t("Continue", "Continuar");
}

const NDA = [{ id: "nda", label: "We'll need one", pt: "Vamos precisar de um" }] as const;

function titleOf(step: PartnerStep, t: Translate) {
  return step === "project"
    ? t("Your project", "O projeto")
    : step === "fit"
      ? t("Technology and timing", "Tecnologia e prazos")
      : step === "terms"
        ? t("How we'd work", "Modelo de colaboração")
        : step === "contact"
          ? t("Your details", "Dados de contacto")
          : t("Request sent", "Pedido enviado");
}

/** One screen of the partners' questions, its title first. */
export function PartnerScreen({
  step,
  draft,
  setDraft,
  contact,
  setContact,
  errors,
  send,
  titleRef,
  heading = "h2",
}: {
  step: PartnerStep;
  draft: PartnerDraft;
  setDraft: (patch: Partial<PartnerDraft>) => void;
  contact: Contact;
  setContact: (patch: Partial<Contact>) => void;
  errors: Errors;
  send: SendState;
  titleRef: React.Ref<HTMLHeadingElement>;
  /** The title's level: h3 under the section's own title on the page. */
  heading?: "h2" | "h3";
}) {
  const reduce = useReducedMotion() ?? false;
  const lang = useLang();
  const t = useT();
  const uid = useId();
  const list = <T extends { id: string; label: string; pt: string }>(l: readonly T[]) => inLang(l, lang);
  const notFit = partnerNotFit(draft);
  const Title = heading === "h3" ? motion.h3 : motion.h2;

  return (
    <motion.div
      initial="hidden"
      animate="shown"
      variants={{ hidden: {}, shown: { transition: { staggerChildren: reduce ? 0 : 0.05, delayChildren: 0.04 } } }}
    >
      <Title variants={ROW} ref={titleRef} tabIndex={-1} className="pf-title">
        {titleOf(step, t)}
      </Title>

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
      )}

      {step === "terms" && (
        <div className="pf-rows">
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
        </div>
      )}

      {step === "contact" && <ContactScreen contact={contact} setContact={setContact} errors={errors} send={send} partner />}

      {step === "sent" && (
        <motion.p variants={ROW} className="pf-lede">
          {t(
            `Thank you, ${contact.name.trim().split(" ")[0]}. We'll get in touch within a few hours to talk it through, then send you a fixed quote.`,
            `Obrigado, ${contact.name.trim().split(" ")[0]}. Entraremos em contacto dentro de poucas horas para conversar sobre o projeto e, depois, enviaremos um orçamento fixo.`,
          )}
        </motion.p>
      )}
    </motion.div>
  );
}
