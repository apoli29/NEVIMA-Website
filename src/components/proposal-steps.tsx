"use client";

import { useEffect, useId, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  AUDIENCES,
  AUDIENCE_NOTE,
  COMPLEX,
  COUNTRIES,
  COUNTS,
  DESIGN,
  FEATURES,
  OUT_OF_SCOPE,
  LANGUAGES,
  MAX,
  PAGES,
  PERSONAL_ABROAD,
  PERSONAL_FEATURE_NOTES,
  PHOTO_PLANS,
  REACH,
  REGIONS,
  SEARCH_PLANS,
  SECTORS,
  SERVICES,
  TEXTS,
  TRANSLATION_NOTE,
  YES_NO,
  groupsFor,
  inLang,
  labelOf,
  type Answers,
  type AudienceId,
  type Contact,
  type CountryId,
  type DesignId,
  type Estimate,
  type CountId,
  type FeatureId,
  type LanguageId,
  type PagesId,
  type PhotoPlanId,
  type Range,
  type ReachId,
  type RegionId,
  type SearchPlanId,
  type SectorId,
  type ServiceId,
  type TextsId,
  type YesNo,
} from "@/lib/proposal/questions";
import { translator, type Copy, type Lang, type Translate } from "@/lib/i18n";
import { useLang, useT } from "@/lib/use-lang";

/* ==================================================================
   The free proposal's questions, a screen at a time

   Grouped by subject (the user's pick): the business first, then one
   screen for each service chosen, then the estimate, then the request.
   Every question is a row between black hairlines, as the index's rows
   are, with its answers beside it: joined keys where one is picked,
   separate keys with a tick box where any number are. Nothing here
   knows a price: the estimate comes from /api/estimate.
   ================================================================== */

export const STUDIO_EMAIL = "ola@nevima.studio";

export type Draft = {
  services: ServiceId[];
  /** A business, or personal use (a consumer, in Portugal only). */
  audience: AudienceId | "";
  sector: SectorId | "";
  sectorOther: string;
  country: CountryId | "";
  countryOther: string;
  design: DesignId | "";
  pages: PagesId | "";
  languages: LanguageId[];
  languagesOther: string;
  /** The second level of what the website does (see FEATURES). */
  features: FeatureId[];
  forms: CountId | "";
  emails: CountId | "";
  /** The third level: a project we do not take on for now. */
  complex: boolean;
  texts: TextsId | "";
  reference1: string;
  reference2: string;
  noReferences: boolean;
  domain: YesNo | "";
  urgent: YesNo | "";
  plan: PhotoPlanId | "";
  region: RegionId | "";
  town: string;
  site: string;
  searchPages: PagesId | "";
  reach: ReachId | "";
  seoPlan: SearchPlanId | "";
  geoPlan: SearchPlanId | "";
};

export const EMPTY_DRAFT: Draft = {
  // Web design is always part of a project: the other services are only
  // offered together with a website (the user's rule, 2026-10-07).
  services: ["web"],
  audience: "",
  sector: "",
  sectorOther: "",
  country: "",
  countryOther: "",
  design: "",
  pages: "",
  languages: [],
  languagesOther: "",
  features: [],
  forms: "",
  emails: "",
  complex: false,
  texts: "",
  reference1: "",
  reference2: "",
  noReferences: false,
  domain: "",
  urgent: "",
  plan: "",
  region: "",
  town: "",
  site: "",
  searchPages: "",
  reach: "",
  seoPlan: "",
  geoPlan: "",
};

export const EMPTY_CONTACT: Contact = {
  name: "",
  email: "",
  phone: "",
  company: "",
  message: "",
  consent: false,
};

export type StepId = "basics" | "web" | "photo" | "search" | "estimate" | "contact" | "sent";

/** The screens this draft goes through, in order. */
export function stepsFor(draft: Draft): StepId[] {
  const groups = groupsFor(draft.services);
  // Needing the third level ends the form at the estimate's place, which
  // says the project is beyond what we take on now.
  if (groups.web && draft.complex) return ["basics", "web", "estimate"];
  return [
    "basics",
    ...(groups.web ? (["web"] as const) : []),
    ...(groups.photo ? (["photo"] as const) : []),
    ...(groups.search ? (["search"] as const) : []),
    "estimate",
    "contact",
    "sent",
  ];
}

/** What the button at the foot says on each screen. */
export function actionFor(step: StepId, next: StepId | undefined, t: Translate) {
  if (step === "estimate") return next ? t("Request final proposal", "Pedir proposta final") : t("Close", "Fechar");
  if (step === "contact") return t("Send request", "Enviar pedido");
  if (step === "sent") return t("Close", "Fechar");
  // The first screen always leads to a service's questions.
  return next === "estimate" && step !== "basics"
    ? t("See my estimate", "Ver a minha estimativa")
    : t("Continue", "Continuar");
}

function titleFor(step: StepId, draft: Draft, t: Translate) {
  switch (step) {
    case "basics":
      return draft.audience === "personal" ? t("Your project", "O projeto") : t("Your business", "O negócio");
    case "web":
      return "Web design";
    case "photo":
      return t("Photo shoot", "Sessão fotográfica");
    case "search": {
      const seo = draft.services.includes("seo");
      const geo = draft.services.includes("geo");
      return seo && geo ? t("SEO & GEO", "SEO e GEO") : seo ? "SEO" : "GEO";
    }
    case "estimate":
      return t("Your estimate", "Estimativa");
    case "contact":
      return t("Your final proposal", "Proposta final");
    case "sent":
      return t("Request sent", "Pedido enviado");
  }
}

/* --- checking a screen before moving on ----------------------------- */

export type Errors = Partial<Record<string, string>>;

/* Small print under the questions that change the price (user). */
const PHOTO_NOTE: Copy = {
  en: "The photo shoot is only available in Portugal. Travel beyond 30 km of Arcozelo is added to the price of the service.",
  pt: "A sessão fotográfica só está disponível em Portugal. A deslocação para lá dos 30 km de Arcozelo acresce ao preço do serviço.",
};
const DOMAIN_NOTE: Copy = {
  en: "If you don't have a domain yet, you register it in your business's name and pay for it directly, and we guide you through every step. If you already have one, there's nothing to add.",
  pt: "Sem domínio, o registo é feito em nome do negócio e pago diretamente, com o nosso acompanhamento em todos os passos. Com um domínio já existente, não há nada a acrescentar.",
};

/** The same, for personal use. */
const DOMAIN_NOTE_PERSONAL: Copy = {
  en: "If you don't have a domain yet, you register it in your own name and pay for it directly, and we guide you through every step. If you already have one, there's nothing to add.",
  pt: "Sem domínio, o registo é feito em nome próprio e pago diretamente, com o nosso acompanhamento em todos os passos. Com um domínio já existente, não há nada a acrescentar.",
};
const PAGES_NOTE: Copy = {
  en: "Not sure? We estimate for 3 to 8 pages, so the range of your final estimate can be a little wider than with a set number.",
  pt: "Sem um número definido, estimamos para 3 a 8 páginas, por isso o intervalo da estimativa final pode ser um pouco mais largo.",
};
const TEXTS_NOTE: Copy = {
  en: "If you don't, writing them is added to the price, as a range set by your website's size.",
  pt: "Caso não existam, a escrita dos textos acresce ao preço, num intervalo definido pelo tamanho do website.",
};
const URGENT_NOTE: Copy = {
  en: "An urgent deadline raises the price by 40%.",
  pt: "Um prazo urgente aumenta o preço em 40%.",
};

const NO_REFERENCES: Copy<readonly { id: "none"; label: string }[]> = {
  en: [{ id: "none", label: "I don't have any" }],
  pt: [{ id: "none", label: "Não tenho" }],
};

/** Personal use outside Portugal: not taken on for now. */
export const personalAbroad = (draft: Draft) =>
  draft.audience === "personal" && draft.country !== "" && draft.country !== "PT";

export function checkStep(step: StepId, draft: Draft, contact: Contact, lang: Lang): Errors {
  const t = translator(lang);
  const PICK_ONE = t("Choose one to continue.", "Escolher uma opção para continuar.");
  const PICK_ANY = t("Choose at least one to continue.", "Escolher pelo menos uma opção para continuar.");
  const e: Errors = {};
  const web = draft.services.includes("web");
  if (step === "basics") {
    if (!draft.services.length) e.services = PICK_ANY;
    if (!draft.audience) e.audience = PICK_ONE;
    if (draft.audience !== "personal") {
      if (!draft.sector) e.sector = PICK_ONE;
      else if (draft.sector === "other" && !draft.sectorOther.trim()) {
        e.sector = t("Tell us what your business does.", "Falta indicar a área do negócio.");
      }
    }
    if (!draft.country) e.country = PICK_ONE;
    else if (draft.country === "other" && !draft.countryOther.trim()) e.country = t("Tell us which country.", "Falta indicar o país.");
    // Personal use outside Portugal goes no further (shown as it is picked).
    if (personalAbroad(draft)) e.country = t(PERSONAL_ABROAD);
  }
  if (step === "web") {
    // A project beyond what we take on needs nothing more answered.
    if (draft.complex) return e;
    if (draft.features.includes("forms") && !draft.forms) e.forms = PICK_ONE;
    if (draft.features.includes("emails") && !draft.emails) e.emails = PICK_ONE;
    if (!draft.design) e.design = PICK_ONE;
    if (!draft.pages) e.pages = PICK_ONE;
    if (!draft.languages.length) e.languages = PICK_ANY;
    else if (draft.languages.includes("other") && !draft.languagesOther.trim()) {
      e.languages = t("Tell us which languages.", "Falta indicar as línguas.");
    }
    if (!draft.texts) e.texts = PICK_ONE;
    if (!draft.noReferences && !draft.reference1.trim() && !draft.reference2.trim()) {
      e.references = t("Add a website, or tick that you don't have any.", "Falta indicar um website, ou assinalar que não há nenhum.");
    }
    if (!draft.domain) e.domain = PICK_ONE;
    if (!draft.urgent) e.urgent = PICK_ONE;
  }
  if (step === "photo") {
    if (!draft.plan) e.plan = PICK_ONE;
    if (draft.country === "PT" && !draft.region) e.town = t("Choose where in Portugal.", "Falta escolher a zona de Portugal.");
    else if (!draft.town.trim()) e.town = t("Tell us the town or city.", "Falta indicar a localidade.");
  }
  if (step === "search") {
    if (!web && !draft.searchPages) e.searchPages = PICK_ONE;
    if (!draft.reach) e.reach = PICK_ONE;
    if (draft.services.includes("seo") && !draft.seoPlan) e.seoPlan = PICK_ONE;
    if (draft.services.includes("geo") && !draft.geoPlan) e.geoPlan = PICK_ONE;
  }
  if (step === "contact") {
    if (!contact.name.trim()) e.name = t("Enter your name.", "Falta indicar o nome.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(contact.email.trim())) {
      e.email = t("Enter an email address we can reply to.", "Falta um email válido para a resposta.");
    }
    if (!/^[+()\d][\d\s().-]{5,24}$/.test(contact.phone.trim())) e.phone = t("Enter a phone number.", "Falta um número de telefone válido.");
    // A client for personal use has no business name to give.
    if (draft.audience !== "personal" && !contact.company.trim()) {
      e.company = draft.audience === "business"
        ? t("Enter your business's name.", "Falta indicar o nome do negócio.")
        : t("Enter your company's name.", "Falta indicar o nome da empresa.");
    }
    if (!contact.consent) e.consent = t("Tick the box so we can use your details.", "É necessário assinalar a caixa para podermos usar os dados.");
  }
  return e;
}

/** The draft as the server reads it: only the groups that were asked. */
export function toAnswers(draft: Draft): Answers {
  const groups = groupsFor(draft.services);
  const answers: Answers = {
    services: draft.services,
    audience: draft.audience as AudienceId,
    country: draft.country as CountryId,
  };
  if (draft.audience === "business") {
    answers.sector = draft.sector as SectorId;
    if (draft.sector === "other") answers.sectorOther = draft.sectorOther.trim();
  }
  if (draft.country === "other") answers.countryOther = draft.countryOther.trim();
  if (groups.web) {
    const references = draft.noReferences
      ? []
      : [draft.reference1.trim(), draft.reference2.trim()].filter(Boolean);
    answers.web = {
      design: draft.design as DesignId,
      pages: draft.pages as PagesId,
      languages: draft.languages,
      features: draft.features,
      texts: draft.texts as TextsId,
      references,
      domain: draft.domain as YesNo,
      urgent: draft.urgent as YesNo,
    };
    if (draft.languages.includes("other")) answers.web.languagesOther = draft.languagesOther.trim();
    if (draft.features.includes("forms") && draft.forms) answers.web.forms = draft.forms;
    if (draft.features.includes("emails") && draft.emails) answers.web.emails = draft.emails;
    if (draft.complex) answers.web.complex = true;
    if (!references.length) answers.web.noReferences = true;
  }
  if (groups.photo) {
    answers.photo = { plan: draft.plan as PhotoPlanId, town: draft.town.trim() };
    if (draft.country === "PT") answers.photo.region = draft.region as RegionId;
  }
  if (groups.search) {
    answers.search = { reach: draft.reach as ReachId };
    if (draft.services.includes("seo")) answers.search.seoPlan = draft.seoPlan as SearchPlanId;
    if (draft.services.includes("geo")) answers.search.geoPlan = draft.geoPlan as SearchPlanId;
    if (!groups.web) {
      answers.search.pages = draft.searchPages as PagesId;
      if (draft.site.trim()) answers.search.site = draft.site.trim();
    }
  }
  return answers;
}

/** Everything written, as plain text, for the email fallback, in the
    language the form was filled in. */
export function summary(draft: Draft, contact: Contact, estimate: Estimate | null, lang: Lang) {
  const t = translator(lang);
  const a = toAnswers(draft);
  const label = <T extends Parameters<typeof labelOf>[0]>(list: T, id: string) => labelOf(list, id, lang);
  const yes = (v: YesNo) => label(YES_NO, v);
  const lines = [
    `${t("Name", "Nome")}: ${contact.name}`,
    `Email: ${contact.email}`,
    `${t("Phone", "Telefone")}: ${contact.phone}`,
    ...(a.audience === "business" ? [`${t("Business name", "Nome do negócio")}: ${contact.company}`] : []),
    "",
    // Which Proposal to send: a business's, or a consumer's with the annex.
    `${t("Client", "Cliente")}: ${label(AUDIENCES, a.audience)}`,
    `${t("Services", "Serviços")}: ${a.services.map((s) => label(SERVICES, s)).join(", ")}`,
    ...(a.sector ? [`${t("Business", "Negócio")}: ${a.sectorOther ?? label(SECTORS, a.sector)}`] : []),
    `${t("Country", "País")}: ${a.countryOther ?? label(COUNTRIES, a.country)}`,
  ];
  if (a.web) {
    lines.push(
      `${t("Design level", "Nível de design")}: ${label(DESIGN, a.web.design)}`,
      `${t("Pages", "Páginas")}: ${label(PAGES, a.web.pages)}`,
      `${t("Languages", "Línguas")}: ${a.web.languages.map((l) => (l === "other" ? a.web?.languagesOther : label(LANGUAGES, l))).join(", ")}`,
      `${t("What it does", "O que faz")}: ${[
        t("presents the business", "apresenta o negócio"),
        ...a.web.features.map((f) => {
          const name = label(FEATURES, f).toLowerCase();
          const count = f === "forms" ? a.web?.forms : f === "emails" ? a.web?.emails : undefined;
          return count ? `${name} (${label(COUNTS, count)})` : name;
        }),
        ...(a.web.complex ? [t("complex systems (beyond what we take on now)", "sistemas complexos (fora do que fazemos agora)")] : []),
      ].join(", ")}`,
      `${t("Texts ready", "Textos prontos")}: ${label(TEXTS, a.web.texts)}`,
      `${t("Reference websites", "Websites de referência")}: ${a.web.references.length ? a.web.references.join(", ") : t("None", "Nenhum")}`,
      `${t("Has a domain", "Já tem domínio")}: ${yes(a.web.domain)}`,
      `${t("Urgent deadline", "Prazo urgente")}: ${yes(a.web.urgent)}`,
    );
  }
  if (a.photo) {
    lines.push(
      `${t("Photo plan", "Plano de fotografia")}: ${label(PHOTO_PLANS, a.photo.plan)}`,
      `${t("Location", "Localização")}: ${[a.photo.town, a.photo.region && label(REGIONS, a.photo.region)].filter(Boolean).join(", ")}`,
    );
  }
  if (a.search) {
    if (a.search.site) lines.push(`Website: ${a.search.site}`);
    if (a.search.pages) lines.push(`${t("Site pages", "Páginas do site")}: ${label(PAGES, a.search.pages)}`);
    lines.push(`${t("Reach", "Alcance")}: ${label(REACH, a.search.reach)}`);
    if (a.search.seoPlan) lines.push(`SEO: ${label(SEARCH_PLANS, a.search.seoPlan)}`);
    if (a.search.geoPlan) lines.push(`GEO: ${label(SEARCH_PLANS, a.search.geoPlan)}`);
  }
  if (estimate) {
    const money = moneyIn(lang);
    const span = spanIn(lang);
    lines.push("", t("Estimate shown:", "Estimativa apresentada:"));
    for (const l of estimate.lines) {
      const then = l.monthly !== undefined ? t(`, then ${money(l.monthly)}/month`, `, depois ${money(l.monthly)}/mês`) : "";
      lines.push(`${l.label}: ${span(l.amount)}${then}`);
    }
    for (const r of estimate.onRequest) lines.push(`${r.label}: ${t("on request", "sob consulta")} (${r.reason})`);
    if (estimate.total !== null) lines.push(`Total: ${span(estimate.total)}`);
    if (estimate.monthly !== null) lines.push(`${t("Then monthly", "Depois, por mês")}: ${money(estimate.monthly)}`);
  }
  if (contact.message.trim()) lines.push("", t("Tell us more:", "Informações adicionais:"), contact.message.trim());
  return lines.join("\n");
}

/** Euros as each language writes them: "€650" in English, "650 €" in
    Portuguese. */
const EUR: Record<Lang, Intl.NumberFormat> = {
  en: new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }),
  pt: new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }),
};
const moneyIn = (lang: Lang) => (n: number) => EUR[lang].format(n);
/** A range as "€650 – €780", or one figure when it is fixed. */
const spanIn = (lang: Lang) => (r: Range) => {
  const money = moneyIn(lang);
  return r.min === r.max ? money(r.min) : `${money(r.min)} – ${money(r.max)}`;
};

/* --- the controls ---------------------------------------------------- */

/** One question: the question on the left, its answers on the right
    (stacked on a phone), between hairlines. */
export function Question({
  id,
  label,
  hint,
  error,
  children,
  footnote,
  group = true,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  /** A sentence of small print under the answers. */
  footnote?: string;
  /** A set of keys, read as one control; false for a single text field. */
  group?: boolean;
}) {
  return (
    <motion.div variants={ROW} className="pf-row" data-invalid={error ? "" : undefined} data-question={id}>
      <div className="pf-q">
        <span id={`${id}-q`}>{label}</span>
        {hint && <span className="mono-label pf-hint">{hint}</span>}
      </div>
      <div
        className="pf-a"
        role={group ? "group" : undefined}
        aria-labelledby={group ? `${id}-q` : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
      >
        {children}
        {footnote && <p className="pf-footnote">{footnote}</p>}
        {error && (
          <p id={`${id}-error`} className="mono-label pf-error" role="alert">
            {error}
          </p>
        )}
      </div>
    </motion.div>
  );
}

/** One pick from a few: joined keys, the chosen one inked. */
export function Segmented<T extends string>({
  name,
  options,
  value,
  onChange,
  labelledBy,
}: {
  name: string;
  options: readonly { id: T; label: string; note?: string }[];
  value: T | "";
  onChange: (v: T) => void;
  labelledBy: string;
}) {
  return (
    <div className="pf-seg" role="radiogroup" aria-labelledby={labelledBy}>
      {options.map((o) => (
        <label key={o.id} className={`pf-key ${o.note ? "pf-key-tall" : ""}`}>
          <input
            type="radio"
            name={name}
            value={o.id}
            checked={value === o.id}
            onChange={() => onChange(o.id)}
            className="sr-only"
          />
          <span className="mono-label">{o.label}</span>
          {o.note && <span className="pf-note">{o.note}</span>}
        </label>
      ))}
    </div>
  );
}

/** Any number from a few: separate keys, each with a tick box. A locked
    key is always ticked and cannot be unticked. */
function Multi<T extends string>({
  name,
  options,
  value,
  onChange,
  locked = [],
}: {
  name: string;
  options: readonly { id: T; label: string }[];
  value: T[];
  onChange: (v: T[]) => void;
  locked?: readonly T[];
}) {
  return (
    <div className="pf-multi">
      {options.map((o) => (
        <label key={o.id} className={`pf-key pf-chip ${locked.includes(o.id) ? "cursor-default hover:bg-ink" : ""}`}>
          <input
            type="checkbox"
            name={name}
            value={o.id}
            checked={value.includes(o.id) || locked.includes(o.id)}
            disabled={locked.includes(o.id)}
            onChange={(e) =>
              onChange(
                e.target.checked
                  ? options.map((x) => x.id).filter((id) => id === o.id || value.includes(id))
                  : value.filter((v) => v !== o.id),
              )
            }
            className="sr-only"
          />
          <span aria-hidden="true" className="pf-tick" />
          <span className="mono-label">{o.label}</span>
        </label>
      ))}
    </div>
  );
}

/** Any number from a few, each key with a line of its own under its
    name, saying what it does. A key in `off` cannot be ticked yet. */
export function Ticks<T extends string>({
  name,
  options,
  value,
  onChange,
  off = [],
}: {
  name: string;
  options: readonly { id: T; label: string; note?: string }[];
  value: T[];
  onChange: (v: T[]) => void;
  off?: readonly T[];
}) {
  return (
    <div className="pf-ticks">
      {options.map((o) => (
        <label key={o.id} className="pf-key pf-key-tall pf-tick-key" data-off={off.includes(o.id) ? "" : undefined}>
          <input
            type="checkbox"
            name={name}
            value={o.id}
            checked={value.includes(o.id)}
            disabled={off.includes(o.id)}
            onChange={(e) =>
              onChange(
                e.target.checked
                  ? options.map((x) => x.id).filter((id) => id === o.id || value.includes(id))
                  : value.filter((v) => v !== o.id),
              )
            }
            className="sr-only"
          />
          {/* A tick with no name carries its note beside it instead. */}
          <span className={`flex gap-2.5 ${o.label ? "items-center" : "items-start"}`}>
            <span aria-hidden="true" className={`pf-tick ${o.label ? "" : "mt-[0.3rem] shrink-0"}`} />
            {o.label ? <span className="mono-label">{o.label}</span> : <span className="pf-note mt-0">{o.note}</span>}
          </span>
          {o.label && o.note && <span className="pf-note">{o.note}</span>}
        </label>
      ))}
    </div>
  );
}

export function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
  max = MAX.short,
  ...rest
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  max?: number;
  type?: string;
  inputMode?: "url" | "text";
  autoComplete?: string;
}) {
  return (
    <input
      id={id}
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      maxLength={max}
      className="pf-field"
      {...rest}
    />
  );
}

/* --- the rows' entrance ------------------------------------------------
   Each screen's rows come in top to bottom, as the index's do. */

export const ROW = {
  hidden: { opacity: 0, y: 10 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const } },
};

/* --- the screens -------------------------------------------------------- */

export type EstimateState =
  | { status: "loading" }
  | { status: "ready"; estimate: Estimate }
  | { status: "error"; message: string };

export type SendState =
  | { status: "idle" }
  | { status: "sending" }
  | { status: "error"; message: string }
  /** The site has nowhere to send it yet: offer the visitor's email app. */
  | { status: "offline" };

export function StepScreen({
  step,
  draft,
  setDraft,
  contact,
  setContact,
  errors,
  estimate,
  retryEstimate,
  send,
  titleRef,
}: {
  step: StepId;
  draft: Draft;
  setDraft: (patch: Partial<Draft>) => void;
  contact: Contact;
  setContact: (patch: Partial<Contact>) => void;
  errors: Errors;
  estimate: EstimateState;
  retryEstimate: () => void;
  send: SendState;
  titleRef: React.Ref<HTMLHeadingElement>;
}) {
  const reduce = useReducedMotion() ?? false;
  const uid = useId();
  const web = draft.services.includes("web");
  const lang = useLang();
  const t = useT();
  const list = <T extends Parameters<typeof inLang>[0][number]>(l: readonly T[]) => inLang(l, lang);
  // Personal use: a project and its visitors, not a business and its
  // clients (user, 2026-10-19).
  const personal = draft.audience === "personal";

  return (
    <motion.div
      initial="hidden"
      animate="shown"
      variants={{ hidden: {}, shown: { transition: { staggerChildren: reduce ? 0 : 0.05, delayChildren: 0.04 } } }}
    >
      <motion.h2 variants={ROW} ref={titleRef} tabIndex={-1} className="pf-title">
        {titleFor(step, draft, t)}
      </motion.h2>

      {step === "basics" && (
        <div className="pf-rows">
          <Question
            id="services"
            label={t("Which of our services are you interested in?", "Quais os serviços pretendidos?")}
            hint={t("Web design is always included", "O web design está sempre incluído")}
            error={errors.services}
            footnote={`*${t(PHOTO_NOTE)}`}
          >
            <Multi
              name="services"
              options={list(SERVICES).map((o) => (o.id === "photo" ? { ...o, label: `${o.label}*` } : o))}
              value={draft.services}
              locked={["web"]}
              onChange={(services) =>
                setDraft({ services: services.includes("web") ? services : ["web", ...services] })
              }
            />
          </Question>
          {/* Business or personal use (user, 2026-10-19): it decides
              which Proposal is sent, and personal use is taken on in
              Portugal only. */}
          <Question
            id="audience"
            label={t("Who is the website for?", "O website é para…")}
            error={errors.audience}
            footnote={t(AUDIENCE_NOTE)}
          >
            <Segmented
              name="audience"
              options={list(AUDIENCES)}
              value={draft.audience}
              onChange={(audience) => setDraft({ audience })}
              labelledBy="audience-q"
            />
          </Question>
          {draft.audience !== "personal" && (
          <Question id="sector" label={t("What does your business do?", "Qual é a área do negócio?")} error={errors.sector}>
            <Segmented
              name="sector"
              options={list(SECTORS)}
              value={draft.sector}
              onChange={(sector) => setDraft({ sector })}
              labelledBy="sector-q"
            />
            {draft.sector === "other" && (
              <Field
                id={`${uid}-sector`}
                label={t("What does your business do?", "Qual é a área do negócio?")}
                placeholder={t("e.g. Architecture studio", "ex.: Atelier de arquitetura")}
                value={draft.sectorOther}
                onChange={(sectorOther) => setDraft({ sectorOther })}
              />
            )}
          </Question>
          )}
          <Question
            id="country"
            label={
              draft.audience === "personal"
                ? t("Which country are you in?", "Em que país?")
                : t("Where is your business based?", "Onde está sediado o negócio?")
            }
            // The note below says it as soon as it applies.
            error={personalAbroad(draft) ? undefined : errors.country}
          >
            <Segmented
              name="country"
              options={list(COUNTRIES)}
              value={draft.country}
              onChange={(country) => setDraft({ country })}
              labelledBy="country-q"
            />
            {draft.country === "other" && (
              <Field
                id={`${uid}-country`}
                label={t("Which country?", "Que país?")}
                placeholder={t("Which country?", "Que país?")}
                value={draft.countryOther}
                onChange={(countryOther) => setDraft({ countryOther })}
                autoComplete="country-name"
              />
            )}
            {personalAbroad(draft) && (
              <p role="status" className="pf-out">
                {t(PERSONAL_ABROAD)}
              </p>
            )}
          </Question>
        </div>
      )}

      {step === "web" && (
        <div className="pf-rows">
          {/* What the website has to do, in three levels, each adding to
              the one before (user, 2026-10-18). Asked first: a project
              that needs the third needs nothing else answered. */}
          <Question
            id="features"
            label={t("What is your website's core goal?", "Qual o objetivo central do website?")}
            hint={t("Each level adds to the one before", "Cada nível soma-se ao anterior")}
            group={false}
          >
            <div className="pf-levels">
              <div className="pf-level">
                <p className="pf-level-name">
                  {personal ? t("Present your project", "Apresentar o projeto") : t("Present your business", "Apresentar o negócio")}
                </p>
                <p className="pf-footnote">
                  {personal
                    ? t(
                        "Who you are, what you want to show and how to reach you.",
                        "Quem está por trás do projeto, o que se quer mostrar e os contactos.",
                      )
                    : t(
                        "The story behind it, the details that set you apart, the products or services you offer and how to reach you.",
                        "A história por trás do negócio, os pormenores que o distinguem, os produtos ou serviços que oferece e os contactos.",
                      )}
                </p>
                <span className="mono-label pf-level-tag">{t("Always included", "Sempre incluído")}</span>
              </div>
              <div className="pf-level" role="group" aria-labelledby={`${uid}-level2`}>
                <p id={`${uid}-level2`} className="pf-level-name">
                  {personal
                    ? t("+ Receive information from visitors", "+ Receber informação dos visitantes")
                    : t("+ Receive information from your clients", "+ Receber informação dos clientes")}
                </p>
                <Ticks
                  name="features"
                  options={list(FEATURES).map((o) => (personal ? { ...o, note: t(PERSONAL_FEATURE_NOTES[o.id]) } : o))}
                  value={draft.features}
                  // Automatic emails are what the forms and the newsletter
                  // send: without either, there is nothing to send them.
                  off={draft.features.includes("forms") || draft.features.includes("newsletter") ? [] : ["emails"]}
                  onChange={(features) => {
                    const withEmails = features.includes("forms") || features.includes("newsletter");
                    setDraft({ features: withEmails ? features : features.filter((f) => f !== "emails") });
                  }}
                />
                {/* The platforms behind these, said plainly (user,
                    2026-10-19): the client's own free account, set up
                    together. */}
                <p className="pf-footnote">
                  {personal
                    ? t(
                        "For these, we help you open a free account on an email or booking platform, in your own name, and assist you all the way.",
                        "Para isto, criamos em conjunto uma conta gratuita numa plataforma de email ou de marcações, em nome próprio, com acompanhamento total.",
                      )
                    : t(
                        "For these, we help you open a free account on an email or booking platform, in your business's name, and assist you all the way.",
                        "Para isto, criamos em conjunto uma conta gratuita numa plataforma de email ou de marcações, em nome do negócio, com acompanhamento total.",
                      )}
                </p>
              </div>
              <div className="pf-level" role="group" aria-labelledby={`${uid}-level3`}>
                <p id={`${uid}-level3`} className="pf-level-name">
                  {t("+ Complex systems behind the website", "+ Sistemas complexos por trás do website")}
                </p>
                <Ticks
                  name="complex"
                  options={list(COMPLEX)}
                  value={draft.complex ? ["complex"] : []}
                  onChange={(v) => setDraft({ complex: v.length > 0 })}
                />
                {draft.complex && (
                  <p role="status" className="pf-out">
                    {t(OUT_OF_SCOPE)}
                  </p>
                )}
              </div>
            </div>
          </Question>
          {!draft.complex && draft.features.includes("forms") && (
            <Question id="forms" label={t("How many forms?", "Quantos formulários?")} error={errors.forms}>
              <Segmented
                name="forms"
                options={list(COUNTS)}
                value={draft.forms}
                onChange={(forms) => setDraft({ forms })}
                labelledBy="forms-q"
              />
            </Question>
          )}
          {!draft.complex && draft.features.includes("emails") && (
            <Question
              id="emails"
              label={t("How many different automatic emails?", "Quantos emails automáticos diferentes?")}
              hint={t("One for each form or sign-up that sends one", "Um por cada formulário ou inscrição que envie um")}
              error={errors.emails}
            >
              <Segmented
                name="emails"
                options={list(COUNTS)}
                value={draft.emails}
                onChange={(emails) => setDraft({ emails })}
                labelledBy="emails-q"
              />
            </Question>
          )}
          {!draft.complex && (
          <>
          <Question id="design" label={t("Design level", "Nível de design")} error={errors.design}>
            <Segmented
              name="design"
              options={list(DESIGN)}
              value={draft.design}
              onChange={(design) => setDraft({ design })}
              labelledBy="design-q"
            />
          </Question>
          <Question id="pages" label={t("How many pages?", "Quantas páginas?")} error={errors.pages} footnote={t(PAGES_NOTE)}>
            <Segmented
              name="pages"
              options={list(PAGES)}
              value={draft.pages}
              onChange={(pages) => setDraft({ pages })}
              labelledBy="pages-q"
            />
          </Question>
          <Question
            id="languages"
            label={t("In which languages?", "Em que línguas?")}
            hint={t("Choose any", "Uma ou mais")}
            error={errors.languages}
            footnote={`*${t(TRANSLATION_NOTE)}`}
          >
            <Multi
              name="languages"
              options={list(LANGUAGES).map((l) => (l.id === "other" ? { ...l, label: `${l.label}*` } : l))}
              value={draft.languages}
              onChange={(languages) => setDraft({ languages })}
            />
            {draft.languages.includes("other") && (
              <Field
                id={`${uid}-languages`}
                label={t("Which languages?", "Que línguas?")}
                placeholder={t("Which? e.g. French, German", "Quais? ex.: francês, alemão")}
                value={draft.languagesOther}
                onChange={(languagesOther) => setDraft({ languagesOther })}
              />
            )}
          </Question>
          <Question
            id="texts"
            label={t("Are there texts ready to be used?*", "Já existem textos prontos a ser usados?*")}
            error={errors.texts}
            footnote={`*${t(TEXTS_NOTE)}`}
          >
            <Segmented
              name="texts"
              options={list(TEXTS)}
              value={draft.texts}
              onChange={(texts) => setDraft({ texts })}
              labelledBy="texts-q"
            />
          </Question>
          <Question
            id="references"
            label={t("Websites whose look you like", "Websites com um visual de referência")}
            hint={t("Up to two", "Até dois")}
            error={errors.references}
          >
            {!draft.noReferences && (
              <>
                <Field
                  id={`${uid}-ref1`}
                  label={t("First website you like", "Primeiro website de referência")}
                  placeholder="website.com"
                  value={draft.reference1}
                  onChange={(reference1) => setDraft({ reference1 })}
                  max={MAX.url}
                  inputMode="url"
                />
                <Field
                  id={`${uid}-ref2`}
                  label={t("Second website you like", "Segundo website de referência")}
                  placeholder="website.com"
                  value={draft.reference2}
                  onChange={(reference2) => setDraft({ reference2 })}
                  max={MAX.url}
                  inputMode="url"
                />
              </>
            )}
            <Multi
              name="noReferences"
              options={t(NO_REFERENCES)}
              value={draft.noReferences ? ["none"] : []}
              onChange={(v) => setDraft({ noReferences: v.length > 0 })}
            />
          </Question>
          <Question
            id="domain"
            label={personal ? t("Do you already have a domain?*", "Já existe um domínio?*") : t("Do you already have a domain?*", "O negócio já possui domínio?*")}
            error={errors.domain}
            footnote={`*${t(personal ? DOMAIN_NOTE_PERSONAL : DOMAIN_NOTE)}`}
          >
            <Segmented
              name="domain"
              options={list(YES_NO)}
              value={draft.domain}
              onChange={(domain) => setDraft({ domain })}
              labelledBy="domain-q"
            />
          </Question>
          <Question
            id="urgent"
            label={t("Is the deadline urgent?*", "O prazo é urgente?*")}
            error={errors.urgent}
            footnote={`*${t(URGENT_NOTE)}`}
          >
            <Segmented
              name="urgent"
              options={list(YES_NO)}
              value={draft.urgent}
              onChange={(urgent) => setDraft({ urgent })}
              labelledBy="urgent-q"
            />
          </Question>
          </>
          )}
        </div>
      )}

      {step === "photo" && (
        <div className="pf-rows">
          <Question id="plan" label={t("Which plan would you like?", "Qual é o plano pretendido?")} error={errors.plan}>
            <Segmented
              name="plan"
              options={list(PHOTO_PLANS)}
              value={draft.plan}
              onChange={(plan) => setDraft({ plan })}
              labelledBy="plan-q"
            />
          </Question>
          <Question
            id="town"
            label={personal ? t("Where will the shoot be?", "Onde vai decorrer a sessão?") : t("Where is your business located?", "Onde fica o negócio?")}
            hint={
              draft.country === "PT"
                ? undefined
                : t("Outside Portugal, the shoot is quoted on request", "Fora de Portugal, a sessão é orçamentada sob consulta")
            }
            footnote={
              draft.country === "PT"
                ? t(
                    personal
                      ? "In some parts of the Porto area and in the rest of the country, travel costs are covered by you."
                      : "In some parts of the Porto area and in the rest of the country, travel costs are covered by your business.",
                    "Em algumas zonas da área do Porto e no resto do país, as despesas de deslocação ficam a cargo do cliente.",
                  )
                : undefined
            }
            error={errors.town}
          >
            {draft.country === "PT" && (
              <Segmented
                name="region"
                options={list(REGIONS)}
                value={draft.region}
                onChange={(region) => setDraft({ region })}
                labelledBy="town-q"
              />
            )}
            <Field
              id={`${uid}-town`}
              label={t("Town or city", "Localidade")}
              placeholder={t("Town or city", "Localidade")}
              value={draft.town}
              onChange={(town) => setDraft({ town })}
              autoComplete="address-level2"
            />
          </Question>
        </div>
      )}

      {step === "search" && (
        <div className="pf-rows">
          {!web && (
            <Question
              id="site"
              label={t("What's your website address?", "Qual é o endereço do website?")}
              hint={t("Optional", "Opcional")}
              group={false}
            >
              <Field
                id="site-field"
                label={t("What's your website address?", "Qual é o endereço do website?")}
                placeholder={t("yourbusiness.com", "empresa.pt")}
                value={draft.site}
                onChange={(site) => setDraft({ site })}
                max={MAX.url}
                inputMode="url"
                autoComplete="url"
              />
            </Question>
          )}
          {!web && (
            <Question
              id="searchPages"
              label={t("How many pages does the site have?", "Quantas páginas tem o site?")}
              error={errors.searchPages}
            >
              <Segmented
                name="searchPages"
                options={list(PAGES)}
                value={draft.searchPages}
                onChange={(searchPages) => setDraft({ searchPages })}
                labelledBy="searchPages-q"
              />
            </Question>
          )}
          <Question
            id="reach"
            label={personal ? t("How far should the website reach?", "Qual é o alcance pretendido?") : t("How far does your business reach?", "Qual é o alcance do negócio?")}
            error={errors.reach}
          >
            <Segmented
              name="reach"
              options={list(REACH)}
              value={draft.reach}
              onChange={(reach) => setDraft({ reach })}
              labelledBy="reach-q"
            />
          </Question>
          {draft.services.includes("seo") && (
            <Question id="seoPlan" label={t("How would you like your SEO?", "Que modalidade de SEO?")} error={errors.seoPlan}>
              <Segmented
                name="seoPlan"
                options={list(SEARCH_PLANS)}
                value={draft.seoPlan}
                onChange={(seoPlan) => setDraft({ seoPlan })}
                labelledBy="seoPlan-q"
              />
            </Question>
          )}
          {draft.services.includes("geo") && (
            <Question id="geoPlan" label={t("How would you like your GEO?", "Que modalidade de GEO?")} error={errors.geoPlan}>
              <Segmented
                name="geoPlan"
                options={list(SEARCH_PLANS)}
                value={draft.geoPlan}
                onChange={(geoPlan) => setDraft({ geoPlan })}
                labelledBy="geoPlan-q"
              />
            </Question>
          )}
        </div>
      )}

      {step === "estimate" && <EstimateScreen state={estimate} retry={retryEstimate} web={web} personal={personal} />}

      {step === "contact" && (
        <ContactScreen
          contact={contact}
          setContact={setContact}
          errors={errors}
          send={send}
          audience={draft.audience}
        />
      )}

      {step === "sent" && (
        <motion.p variants={ROW} className="pf-lede">
          {t(
            <>
              Thank you, {contact.name.trim().split(" ")[0]}. We&rsquo;ll send your final proposal to{" "}
              <span className="whitespace-nowrap">{contact.email.trim()}</span>.
            </>,
            <>
              Obrigado, {contact.name.trim().split(" ")[0]}. A proposta final vai ser enviada para{" "}
              <span className="whitespace-nowrap">{contact.email.trim()}</span>.
            </>,
          )}
        </motion.p>
      )}
    </motion.div>
  );
}

/** Opened with ?revisao, the estimate underlines in orange the figures
    that rest on prices the studio has not confirmed (user, 2026-10-17).
    Visitors never see it. */
function useReview() {
  const [review, setReview] = useState(false);
  useEffect(() => {
    setReview(new URLSearchParams(window.location.search).has("revisao"));
  }, []);
  return review;
}

function EstimateScreen({
  state,
  retry,
  web,
  personal = false,
}: {
  state: EstimateState;
  retry: () => void;
  web: boolean;
  personal?: boolean;
}) {
  const review = useReview();
  const lang = useLang();
  const t = useT();
  const money = moneyIn(lang);
  const span = spanIn(lang);
  if (state.status === "loading") {
    return (
      <motion.div variants={ROW} className="pf-rows" aria-busy="true">
        <p className="pf-line pf-loading">
          <span className="mono-label text-ash-2">{t("Working out your estimate", "A calcular a estimativa")}</span>
          <span aria-hidden="true" className="pf-loading-bar" />
        </p>
      </motion.div>
    );
  }
  if (state.status === "error") {
    return (
      <motion.div variants={ROW} className="pf-rows">
        <div className="pf-line">
          <p className="pf-line-name">{state.message}</p>
          <button type="button" onClick={retry} className="prop-close">
            {t("Try again", "Tentar de novo")}
          </button>
        </div>
      </motion.div>
    );
  }

  const { estimate } = state;
  // The third level: no figures, only the honest answer.
  if (estimate.outOfScope) {
    return (
      <motion.div variants={ROW} aria-live="polite">
        <p className="pf-lede">{t(OUT_OF_SCOPE)}</p>
        <p className="pf-footnote mt-4">
          {t(
            "Ticked by mistake? Go back and untick it to see your estimate.",
            "Foi assinalado por engano? Basta voltar atrás e retirar a opção para ver a estimativa.",
          )}
        </p>
      </motion.div>
    );
  }
  const someOnRequest = estimate.onRequest.length > 0;
  return (
    <div aria-live="polite">
    <div className="pf-rows">
      {estimate.lines.map((line) => (
        <motion.div key={line.id} variants={ROW} className="pf-line">
          <span>
            <span className="pf-line-name block">{line.label}</span>
            {line.notes.map((note) => (
              <span key={note} className="pf-footnote mt-1.5 block max-w-[38em]">
                {note}
              </span>
            ))}
          </span>
          <span className="text-right">
            <span
              className={`pf-line-value block ${review && line.provisional ? "pf-provisional" : ""}`}
              title={review && line.provisional ? t("Provisional prices", "Preços provisórios") : undefined}
            >
              {span(line.amount)}
            </span>
            {line.monthly !== undefined && (
              <span className="mono-label mt-1 block text-ash-2">
                {t(`One-time, then ${money(line.monthly)}/mo`, `Pontual, depois ${money(line.monthly)}/mês`)}
              </span>
            )}
          </span>
        </motion.div>
      ))}
      {estimate.onRequest.map((item) => (
        <motion.div key={item.id} variants={ROW} className="pf-line">
          <span>
            <span className="pf-line-name block">{item.label}</span>
            <span className="mono-label mt-1 block text-ash-2">{item.reason}</span>
          </span>
          <span className="pf-line-value pf-line-quiet">{t("On request", "Sob consulta")}</span>
        </motion.div>
      ))}
      <motion.div variants={ROW} className="pf-line pf-total">
        <span>
          <span className="pf-line-name block">Total</span>
          {someOnRequest && estimate.total !== null && (
            <span className="mono-label mt-1 block text-white/70">
              {t("Plus the items on request", "Mais os itens sob consulta")}
            </span>
          )}
        </span>
        <span className="text-right">
          <span className="pf-line-value block">
            {estimate.total === null ? t("On request", "Sob consulta") : span(estimate.total)}
          </span>
          {estimate.monthly !== null && (
            <span className="mono-label mt-1 block text-white/70">
              {t(`Then ${money(estimate.monthly)}/mo`, `Depois ${money(estimate.monthly)}/mês`)}
            </span>
          )}
        </span>
      </motion.div>
      {web && (
        <motion.div variants={ROW} className="pf-line">
          <span>
            <span className="pf-line-name block">{t("Website ready in", "Website pronto em")}</span>
            <span className="mono-label mt-1 block text-ash-2">
              {t("An estimate, confirmed in your proposal", "Uma estimativa, confirmada na proposta")}
            </span>
          </span>
          <span className={`pf-line-value ${estimate.timeline?.kind === "days" ? "" : "pf-line-quiet"}`}>
            {estimate.timeline?.kind === "days"
              ? t(
                  `${estimate.timeline.min}–${estimate.timeline.max} working days`,
                  `${estimate.timeline.min}–${estimate.timeline.max} dias úteis`,
                )
              : estimate.timeline?.kind === "agreed"
                ? t("Agreed between us", "Combinado entre nós")
                : t("Set in your proposal", "Definido na proposta")}
          </span>
        </motion.div>
      )}
    </div>
      <motion.p variants={ROW} className="mono-label pf-foot-note">
        {t("An estimate from your answers", "Uma estimativa a partir das respostas")}
      </motion.p>
      {/* What the ranges promise (user, 2026-10-17). */}
      <motion.p variants={ROW} className="pf-footnote mt-2 max-w-[38em]">
        {t(
          `It assumes a project exactly as your answers describe it. After looking at your ${personal ? "project" : "business"}, we may suggest some changes we think would be best for your project; in that case, the price may end up outside these ranges, lower or higher. Either way, we always also send you an offer based on your own choices, priced within these ranges.`,
          `Parte de um projeto exatamente como as respostas o descrevem. Depois de ${personal ? "analisarmos o projeto" : "conhecermos o negócio"}, podemos sugerir algumas alterações que consideramos melhores para o projeto; nesse caso, o preço pode ficar fora destes intervalos, para baixo ou para cima. Seja como for, enviamos sempre também uma proposta com base nas escolhas feitas, com o preço dentro destes intervalos.`,
        )}
      </motion.p>
    </div>
  );
}

export function ContactScreen({
  contact,
  setContact,
  errors,
  send,
  partner = false,
  audience = "",
}: {
  contact: Contact;
  setContact: (patch: Partial<Contact>) => void;
  errors: Errors;
  send: SendState;
  /** The partners' form (development companies): no estimate, and we
      get in touch rather than send a proposal. */
  partner?: boolean;
  /** Who the website is for: personal use has no business name to ask. */
  audience?: AudienceId | "";
}) {
  const t = useT();
  const all = [
    { key: "name", label: t("Name", "Nome"), type: "text", autoComplete: "name", placeholder: t("Your name", "Nome") },
    {
      key: "email",
      label: "Email",
      type: "email",
      autoComplete: "email",
      placeholder: t("you@business.com", "nome@empresa.pt"),
    },
    { key: "phone", label: t("Phone", "Telefone"), type: "tel", autoComplete: "tel", placeholder: "+351 900 000 000" },
    {
      key: "company",
      // The partners are companies; a client's may be a sole trader.
      label: partner ? t("Company", "Empresa") : t("Business name", "Nome do negócio"),
      type: "text",
      autoComplete: "organization",
      placeholder: partner ? t("Your business", "Nome da empresa") : t("Your business", "Nome do negócio"),
    },
  ] as const;
  const rows = audience === "personal" ? all.filter((row) => row.key !== "company") : all;

  return (
    <>
      <motion.p variants={ROW} className="pf-lede">
        {partner
          ? t(
              "Leave your details and we’ll get in touch within a few hours to talk it through, then send you a fixed quote.",
              "Com estes dados, entramos em contacto dentro de poucas horas para conversar sobre o projeto e, depois, enviamos um orçamento fixo.",
            )
          : t(
              "Leave your details and we’ll reply with a final proposal built on your answers.",
              "Com estes dados, respondemos com uma proposta final feita a partir das respostas dadas.",
            )}
      </motion.p>
      <div className="pf-contact">
        {rows.map((row) => (
          <motion.div key={row.key} variants={ROW}>
            <label className="prop-row" data-invalid={errors[row.key] ? "" : undefined}>
              <span className="mono-label prop-label">{row.label}</span>
              <input
                name={row.key}
                type={row.type}
                autoComplete={row.autoComplete}
                placeholder={row.placeholder}
                value={contact[row.key]}
                onChange={(e) => setContact({ [row.key]: e.target.value })}
                maxLength={row.key === "phone" ? 30 : MAX.short}
                aria-invalid={errors[row.key] ? true : undefined}
                aria-describedby={errors[row.key] ? `${row.key}-error` : undefined}
                className="prop-input"
              />
            </label>
            {errors[row.key] && (
              <p id={`${row.key}-error`} className="mono-label pf-error pf-error-row" role="alert">
                {errors[row.key]}
              </p>
            )}
          </motion.div>
        ))}
        {/* Room for what the questions did not ask (user, 2026-10-17). It
            never changes the estimate: it is read with the request. */}
        <motion.div variants={ROW}>
          <label className="prop-row">
            <span className="mono-label prop-label">
              {partner ? t("Additional notes", "Notas adicionais") : t("Tell us more", "Mais detalhes")}
            </span>
            <textarea
              name="message"
              rows={4}
              placeholder={
                partner
                  ? t(
                      "For example, specific start or delivery dates, or anything else important (optional)",
                      "Por exemplo, datas específicas de início ou de entrega, ou outras informações importantes (opcional)",
                    )
                  : audience === "personal"
                    ? t("Anything else we should know about your project (optional)", "Qualquer outra informação útil sobre o projeto (opcional)")
                    : t(
                        "Anything else we should know about your business or your project (optional)",
                        "Qualquer outra informação útil sobre o negócio ou o projeto (opcional)",
                      )
              }
              value={contact.message}
              onChange={(e) => setContact({ message: e.target.value })}
              maxLength={MAX.message}
              aria-describedby={partner ? undefined : "message-note"}
              className="prop-input prop-text"
            />
          </label>
          {!partner && (
            <p id="message-note" className="pf-footnote pf-row-note">
              {t(
                "What you write here isn’t counted in your estimate: we only read it once you’ve sent your request.",
                "O que for escrito aqui não entra na estimativa: só o lemos depois de o pedido ser enviado.",
              )}
            </p>
          )}
        </motion.div>
        <motion.div variants={ROW} className="pf-consent-row">
          <label className="pf-consent">
            <input
              type="checkbox"
              checked={contact.consent}
              onChange={(e) => setContact({ consent: e.target.checked })}
              aria-invalid={errors.consent ? true : undefined}
              aria-describedby={errors.consent ? "consent-error" : undefined}
              className="sr-only"
            />
            <span aria-hidden="true" className="pf-tick" />
            <span>
              {partner
                ? t(
                    "I agree to Nevima using these details to get in touch about this project, as set out in the ",
                    "Aceito que a Nevima use estes dados para entrar em contacto sobre este projeto, como indicado na ",
                  )
                : t(
                    "I agree to Nevima using these details to prepare and send my proposal, as set out in the ",
                    "Aceito que a Nevima use estes dados para preparar e enviar a minha proposta, como indicado na ",
                  )}
              {/* A placeholder until the privacy policy page exists. */}
              <a href="#privacy-policy" className="underline underline-offset-2">
                {t("privacy policy", "política de privacidade")}
              </a>
              .
            </span>
          </label>
          {errors.consent && (
            <p id="consent-error" className="mono-label pf-error" role="alert">
              {errors.consent}
            </p>
          )}
        </motion.div>
      </div>
      {send.status === "error" && (
        <p className="mono-label pf-error pf-send-error" role="alert">
          {send.message}
        </p>
      )}
    </>
  );
}

/** Shown in place of the request when the site has nowhere to send it:
    the visitor's own email app, with everything already written in (the
    button at the foot opens it). */
export function OfflineNote() {
  const t = useT();
  return (
    <div role="status">
      <p className="pf-lede">
        {t(
          "Requests can’t be sent from the site yet. Send yours by email instead: it opens with your answers and details already written in.",
          "Ainda não é possível enviar pedidos a partir do site. O pedido pode seguir por email: a mensagem abre já com as respostas e os dados preenchidos.",
        )}
      </p>
      <p className="mono-label pf-foot-note">
        {t("Or write to us at", "Ou por email para")}{" "}
        <a href={`mailto:${STUDIO_EMAIL}`} className="underline underline-offset-2">
          {STUDIO_EMAIL}
        </a>
      </p>
    </div>
  );
}

/** What a request that did not go through tells the visitor: by the
    server's answer, or "network" when the server was never reached. */
export function sendError(status: number | "network", t: Translate) {
  if (status === 429) {
    return t(
      "Too many requests from this connection. Try again in a few minutes.",
      "Demasiados pedidos a partir desta ligação. É possível tentar de novo daqui a uns minutos.",
    );
  }
  if (status === 422) {
    return t(
      "Some details weren't accepted. Check them and send again.",
      "Alguns dados não foram aceites. É necessário revê-los e enviar de novo.",
    );
  }
  if (status === "network") {
    return t(
      "We couldn't reach the server. Check your connection and try again.",
      "Não foi possível chegar ao servidor. Convém verificar a ligação e tentar de novo.",
    );
  }
  return t(
    `Your request didn't go through. Try again, or write to ${STUDIO_EMAIL}.`,
    `O pedido não seguiu. É possível tentar de novo, ou escrever-nos para ${STUDIO_EMAIL}.`,
  );
}

/** The subject of the email a request falls back to. */
export function mailSubject(name: string, t: Translate) {
  return t(
    `Final proposal request from ${name.trim() || "the website"}`,
    `Pedido de proposta final de ${name.trim() || "um visitante do website"}`,
  );
}

/** The estimate for this draft, fetched when the estimate screen opens. */
export function useEstimate(active: boolean, draft: Draft, trap: () => string) {
  const lang = useLang();
  const t = translator(lang);
  const [state, setState] = useState<EstimateState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);
  const key = JSON.stringify(toAnswers(draft));

  const out = draft.services.includes("web") && draft.complex;
  useEffect(() => {
    if (!active) return;
    // Beyond what we take on: nothing to price, and the rest of the web
    // questions were never asked, so the server is not asked either.
    if (out) {
      setState({
        status: "ready",
        estimate: { currency: "EUR", lines: [], onRequest: [], total: null, monthly: null, timeline: null, outOfScope: true },
      });
      return;
    }
    let cancelled = false;
    setState({ status: "loading" });
    fetch("/api/estimate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers: JSON.parse(key), lang, nickname: trap() }),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => null);
        if (cancelled) return;
        if (res.ok && data?.estimate) setState({ status: "ready", estimate: data.estimate });
        else if (res.status === 429) {
          setState({
            status: "error",
            message: t(
              "Too many estimates from this connection. Try again in a few minutes.",
              "Demasiadas estimativas a partir desta ligação. É possível tentar de novo daqui a uns minutos.",
            ),
          });
        } else {
          setState({
            status: "error",
            message: t("We couldn't work out your estimate.", "Não foi possível calcular a estimativa."),
          });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setState({
            status: "error",
            message: t(
              "We couldn't reach the server. Check your connection.",
              "Não foi possível chegar ao servidor. Convém verificar a ligação.",
            ),
          });
        }
      });
    return () => {
      cancelled = true;
    };
    // The trap is read when the request goes, not watched.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, key, attempt, lang, out]);

  return { state, retry: () => setAttempt((n) => n + 1) };
}
