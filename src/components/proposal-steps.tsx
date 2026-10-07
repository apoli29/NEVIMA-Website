"use client";

import { useEffect, useId, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  COUNTRIES,
  FORMS,
  LANGUAGES,
  MAX,
  PAGES,
  PHOTO_PLANS,
  REACH,
  REGIONS,
  SERVICES,
  TRANSLATION_NOTE,
  YES_NO,
  groupsFor,
  labelOf,
  type Answers,
  type Contact,
  type CountryId,
  type Estimate,
  type FormsId,
  type LanguageId,
  type PagesId,
  type PhotoPlanId,
  type ReachId,
  type RegionId,
  type ServiceId,
  type YesNo,
} from "@/lib/proposal/questions";

/* ==================================================================
   The free proposal's questions, a screen at a time

   Grouped by subject (the user's pick): the business first, then one
   screen for each service chosen, then the estimate, then the request.
   Every question is a row between black hairlines, as the index's rows
   are, with its answers beside it: joined keys where one is picked,
   separate keys with a tick box where any number are. Nothing here
   knows a price: the estimate comes from /api/estimate.
   ================================================================== */

export const STUDIO_EMAIL = "ola@nevima.pt";

export type Draft = {
  services: ServiceId[];
  country: CountryId | "";
  countryOther: string;
  identity: YesNo | "";
  pages: PagesId | "";
  languages: LanguageId[];
  languagesOther: string;
  forms: FormsId | "";
  domain: YesNo | "";
  urgent: YesNo | "";
  plan: PhotoPlanId | "";
  region: RegionId | "";
  town: string;
  site: string;
  searchPages: PagesId | "";
  reach: ReachId | "";
};

export const EMPTY_DRAFT: Draft = {
  services: [],
  country: "",
  countryOther: "",
  identity: "",
  pages: "",
  languages: [],
  languagesOther: "",
  forms: "",
  domain: "",
  urgent: "",
  plan: "",
  region: "",
  town: "",
  site: "",
  searchPages: "",
  reach: "",
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
export function actionFor(step: StepId, next: StepId | undefined) {
  if (step === "estimate") return "Request final proposal";
  if (step === "contact") return "Send request";
  if (step === "sent") return "Close";
  // The first screen always leads to a service's questions.
  return next === "estimate" && step !== "basics" ? "See my estimate" : "Continue";
}

function titleFor(step: StepId, draft: Draft) {
  switch (step) {
    case "basics":
      return "Your business";
    case "web":
      return "Web design";
    case "photo":
      return "Photo & video";
    case "search": {
      const seo = draft.services.includes("seo");
      const geo = draft.services.includes("geo");
      return seo && geo ? "SEO & GEO" : seo ? "SEO" : "GEO";
    }
    case "estimate":
      return "Your estimate";
    case "contact":
      return "Your final proposal";
    case "sent":
      return "Request sent";
  }
}

/* --- checking a screen before moving on ----------------------------- */

export type Errors = Partial<Record<string, string>>;

const PICK_ONE = "Choose one to continue.";
const PICK_ANY = "Choose at least one to continue.";

export function checkStep(step: StepId, draft: Draft, contact: Contact): Errors {
  const e: Errors = {};
  const web = draft.services.includes("web");
  if (step === "basics") {
    if (!draft.services.length) e.services = PICK_ANY;
    if (!draft.country) e.country = PICK_ONE;
    else if (draft.country === "other" && !draft.countryOther.trim()) e.country = "Tell us which country.";
  }
  if (step === "web") {
    if (!draft.identity) e.identity = PICK_ONE;
    if (!draft.pages) e.pages = PICK_ONE;
    if (!draft.languages.length) e.languages = PICK_ANY;
    else if (draft.languages.includes("other") && !draft.languagesOther.trim()) {
      e.languages = "Tell us which languages.";
    }
    if (!draft.forms) e.forms = PICK_ONE;
    if (!draft.domain) e.domain = PICK_ONE;
    if (!draft.urgent) e.urgent = PICK_ONE;
  }
  if (step === "photo") {
    if (!draft.plan) e.plan = PICK_ONE;
    if (draft.country === "PT" && !draft.region) e.town = "Choose where in Portugal.";
    else if (!draft.town.trim()) e.town = "Tell us the town or city.";
  }
  if (step === "search") {
    if (!web && !draft.searchPages) e.searchPages = PICK_ONE;
    if (!draft.reach) e.reach = PICK_ONE;
  }
  if (step === "contact") {
    if (!contact.name.trim()) e.name = "Enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(contact.email.trim())) e.email = "Enter an email address we can reply to.";
    if (!/^[+()\d][\d\s().-]{5,24}$/.test(contact.phone.trim())) e.phone = "Enter a phone number.";
    if (!contact.company.trim()) e.company = "Enter your company's name.";
    if (!contact.consent) e.consent = "Tick the box so we can use your details.";
  }
  return e;
}

/** The draft as the server reads it: only the groups that were asked. */
export function toAnswers(draft: Draft): Answers {
  const groups = groupsFor(draft.services);
  const answers: Answers = { services: draft.services, country: draft.country as CountryId };
  if (draft.country === "other") answers.countryOther = draft.countryOther.trim();
  if (groups.web) {
    answers.web = {
      identity: draft.identity as YesNo,
      pages: draft.pages as PagesId,
      languages: draft.languages,
      forms: draft.forms as FormsId,
      domain: draft.domain as YesNo,
      urgent: draft.urgent as YesNo,
    };
    if (draft.languages.includes("other")) answers.web.languagesOther = draft.languagesOther.trim();
  }
  if (groups.photo) {
    answers.photo = { plan: draft.plan as PhotoPlanId, town: draft.town.trim() };
    if (draft.country === "PT") answers.photo.region = draft.region as RegionId;
  }
  if (groups.search) {
    answers.search = { reach: draft.reach as ReachId };
    if (!groups.web) {
      answers.search.pages = draft.searchPages as PagesId;
      if (draft.site.trim()) answers.search.site = draft.site.trim();
    }
  }
  return answers;
}

/** Everything written, as plain text, for the email fallback. */
export function summary(draft: Draft, contact: Contact, estimate: Estimate | null) {
  const a = toAnswers(draft);
  const lines = [
    `Name: ${contact.name}`,
    `Email: ${contact.email}`,
    `Phone: ${contact.phone}`,
    `Company: ${contact.company}`,
    "",
    `Services: ${a.services.map((s) => labelOf(SERVICES, s)).join(", ")}`,
    `Country: ${a.countryOther ?? labelOf(COUNTRIES, a.country)}`,
  ];
  if (a.web) {
    lines.push(
      `Visual identity redesign: ${labelOf(YES_NO, a.web.identity)}`,
      `Pages: ${labelOf(PAGES, a.web.pages)}`,
      `Languages: ${a.web.languages.map((l) => (l === "other" ? a.web?.languagesOther : labelOf(LANGUAGES, l))).join(", ")}`,
      `Forms: ${labelOf(FORMS, a.web.forms)}`,
      `Has a domain: ${labelOf(YES_NO, a.web.domain)}`,
      `Urgent deadline: ${labelOf(YES_NO, a.web.urgent)}`,
    );
  }
  if (a.photo) {
    lines.push(
      `Photo plan: ${labelOf(PHOTO_PLANS, a.photo.plan)}`,
      `Location: ${[a.photo.town, a.photo.region && labelOf(REGIONS, a.photo.region)].filter(Boolean).join(", ")}`,
    );
  }
  if (a.search) {
    if (a.search.site) lines.push(`Website: ${a.search.site}`);
    if (a.search.pages) lines.push(`Site pages: ${labelOf(PAGES, a.search.pages)}`);
    lines.push(`Reach: ${labelOf(REACH, a.search.reach)}`);
  }
  if (estimate) {
    lines.push("", "Estimate shown:");
    for (const l of estimate.lines) {
      lines.push(`${l.label}: ${money(l.amount)}${l.monthly !== undefined ? `, then ${money(l.monthly)}/month` : ""}`);
    }
    for (const r of estimate.onRequest) lines.push(`${r.label}: on request (${r.reason})`);
    if (estimate.total !== null) lines.push(`Total: ${money(estimate.total)}`);
    if (estimate.monthly !== null) lines.push(`Then monthly: ${money(estimate.monthly)}`);
  }
  if (contact.message.trim()) lines.push("", contact.message.trim());
  return lines.join("\n");
}

const EUR = new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
const money = (n: number) => EUR.format(n);

/* --- the controls ---------------------------------------------------- */

/** One question: the question on the left, its answers on the right
    (stacked on a phone), between hairlines. */
function Question({
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
function Segmented<T extends string>({
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

/** Any number from a few: separate keys, each with a tick box. */
function Multi<T extends string>({
  name,
  options,
  value,
  onChange,
}: {
  name: string;
  options: readonly { id: T; label: string }[];
  value: T[];
  onChange: (v: T[]) => void;
}) {
  return (
    <div className="pf-multi">
      {options.map((o) => (
        <label key={o.id} className="pf-key pf-chip">
          <input
            type="checkbox"
            name={name}
            value={o.id}
            checked={value.includes(o.id)}
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

function Field({
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

const ROW = {
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

  return (
    <motion.div
      initial="hidden"
      animate="shown"
      variants={{ hidden: {}, shown: { transition: { staggerChildren: reduce ? 0 : 0.05, delayChildren: 0.04 } } }}
    >
      <motion.h2 variants={ROW} ref={titleRef} tabIndex={-1} className="pf-title">
        {titleFor(step, draft)}
      </motion.h2>

      {step === "basics" && (
        <div className="pf-rows">
          <Question
            id="services"
            label="Which of our services are you interested in?"
            hint="Choose any"
            error={errors.services}
          >
            <Multi
              name="services"
              options={SERVICES}
              value={draft.services}
              onChange={(services) => setDraft({ services })}
            />
          </Question>
          <Question id="country" label="Where is your business based?" error={errors.country}>
            <Segmented
              name="country"
              options={COUNTRIES}
              value={draft.country}
              onChange={(country) => setDraft({ country })}
              labelledBy="country-q"
            />
            {draft.country === "other" && (
              <Field
                id={`${uid}-country`}
                label="Which country?"
                placeholder="Which country?"
                value={draft.countryOther}
                onChange={(countryOther) => setDraft({ countryOther })}
                autoComplete="country-name"
              />
            )}
          </Question>
        </div>
      )}

      {step === "web" && (
        <div className="pf-rows">
          <Question
            id="identity"
            label="Would you also like a visual identity redesign (logo and symbol)?"
            error={errors.identity}
          >
            <Segmented
              name="identity"
              options={YES_NO}
              value={draft.identity}
              onChange={(identity) => setDraft({ identity })}
              labelledBy="identity-q"
            />
          </Question>
          <Question id="pages" label="How many pages?" error={errors.pages}>
            <Segmented
              name="pages"
              options={PAGES}
              value={draft.pages}
              onChange={(pages) => setDraft({ pages })}
              labelledBy="pages-q"
            />
          </Question>
          <Question
            id="languages"
            label="In which languages?"
            hint="Choose any"
            error={errors.languages}
            footnote={`*${TRANSLATION_NOTE}`}
          >
            <Multi
              name="languages"
              options={LANGUAGES.map((l) => (l.id === "other" ? { ...l, label: "Other*" } : l))}
              value={draft.languages}
              onChange={(languages) => setDraft({ languages })}
            />
            {draft.languages.includes("other") && (
              <Field
                id={`${uid}-languages`}
                label="Which languages?"
                placeholder="Which? e.g. French, German"
                value={draft.languagesOther}
                onChange={(languagesOther) => setDraft({ languagesOther })}
              />
            )}
          </Question>
          <Question id="forms" label="How many forms?" hint="Contact, booking, quote" error={errors.forms}>
            <Segmented
              name="forms"
              options={FORMS}
              value={draft.forms}
              onChange={(forms) => setDraft({ forms })}
              labelledBy="forms-q"
            />
          </Question>
          <Question id="domain" label="Do you already have a domain?" error={errors.domain}>
            <Segmented
              name="domain"
              options={YES_NO}
              value={draft.domain}
              onChange={(domain) => setDraft({ domain })}
              labelledBy="domain-q"
            />
          </Question>
          <Question id="urgent" label="Is the deadline urgent?" error={errors.urgent}>
            <Segmented
              name="urgent"
              options={YES_NO}
              value={draft.urgent}
              onChange={(urgent) => setDraft({ urgent })}
              labelledBy="urgent-q"
            />
          </Question>
        </div>
      )}

      {step === "photo" && (
        <div className="pf-rows">
          <Question id="plan" label="Which plan would you like?" error={errors.plan}>
            <Segmented
              name="plan"
              options={PHOTO_PLANS}
              value={draft.plan}
              onChange={(plan) => setDraft({ plan })}
              labelledBy="plan-q"
            />
          </Question>
          <Question
            id="town"
            label="Where is your business located?"
            hint={draft.country === "PT" ? undefined : "Outside Portugal, the shoot is quoted on request"}
            footnote={
              draft.country === "PT"
                ? "In some parts of the Porto area and in the rest of the country, travel costs are covered by your business."
                : undefined
            }
            error={errors.town}
          >
            {draft.country === "PT" && (
              <Segmented
                name="region"
                options={REGIONS}
                value={draft.region}
                onChange={(region) => setDraft({ region })}
                labelledBy="town-q"
              />
            )}
            <Field
              id={`${uid}-town`}
              label="Town or city"
              placeholder="Town or city"
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
            <Question id="site" label="What's your website address?" hint="Optional" group={false}>
              <Field
                id="site-field"
                label="What's your website address?"
                placeholder="yourbusiness.com"
                value={draft.site}
                onChange={(site) => setDraft({ site })}
                max={MAX.url}
                inputMode="url"
                autoComplete="url"
              />
            </Question>
          )}
          {!web && (
            <Question id="searchPages" label="How many pages does the site have?" error={errors.searchPages}>
              <Segmented
                name="searchPages"
                options={PAGES}
                value={draft.searchPages}
                onChange={(searchPages) => setDraft({ searchPages })}
                labelledBy="searchPages-q"
              />
            </Question>
          )}
          <Question id="reach" label="How far does your business reach?" error={errors.reach}>
            <Segmented
              name="reach"
              options={REACH}
              value={draft.reach}
              onChange={(reach) => setDraft({ reach })}
              labelledBy="reach-q"
            />
          </Question>
        </div>
      )}

      {step === "estimate" && <EstimateScreen state={estimate} retry={retryEstimate} web={web} />}

      {step === "contact" && (
        <ContactScreen contact={contact} setContact={setContact} errors={errors} send={send} />
      )}

      {step === "sent" && (
        <motion.p variants={ROW} className="pf-lede">
          Thank you, {contact.name.trim().split(" ")[0]}. We&rsquo;ll send your final proposal to{" "}
          <span className="whitespace-nowrap">{contact.email.trim()}</span>.
        </motion.p>
      )}
    </motion.div>
  );
}

function EstimateScreen({ state, retry, web }: { state: EstimateState; retry: () => void; web: boolean }) {
  if (state.status === "loading") {
    return (
      <motion.div variants={ROW} className="pf-rows" aria-busy="true">
        <p className="pf-line pf-loading">
          <span className="mono-label text-ash-2">Working out your estimate</span>
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
            Try again
          </button>
        </div>
      </motion.div>
    );
  }

  const { estimate } = state;
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
            <span className="pf-line-value block">
              {money(line.amount)}
            </span>
            {line.monthly !== undefined && (
              <span className="mono-label mt-1 block text-ash-2">
                First month, then {money(line.monthly)}/mo
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
          <span className="pf-line-value pf-line-quiet">On request</span>
        </motion.div>
      ))}
      <motion.div variants={ROW} className="pf-line pf-total">
        <span>
          <span className="pf-line-name block">Total</span>
          {someOnRequest && estimate.total !== null && (
            <span className="mono-label mt-1 block text-white/70">Plus the items on request</span>
          )}
        </span>
        <span className="text-right">
          <span className="pf-line-value block">{estimate.total === null ? "On request" : money(estimate.total)}</span>
          {estimate.monthly !== null && (
            <span className="mono-label mt-1 block text-white/70">Then {money(estimate.monthly)}/mo</span>
          )}
        </span>
      </motion.div>
      {web && (
        <motion.div variants={ROW} className="pf-line">
          <span className="pf-line-name">Website ready in</span>
          <span className={`pf-line-value ${estimate.timeline?.kind === "days" ? "" : "pf-line-quiet"}`}>
            {estimate.timeline?.kind === "days"
              ? `${estimate.timeline.min}–${estimate.timeline.max} working days`
              : estimate.timeline?.kind === "agreed"
                ? "Agreed between us"
                : "Set in your proposal"}
          </span>
        </motion.div>
      )}
    </div>
      <motion.p variants={ROW} className="mono-label pf-foot-note">
        An estimate from your answers. Your final proposal confirms every figure.
      </motion.p>
    </div>
  );
}

function ContactScreen({
  contact,
  setContact,
  errors,
  send,
}: {
  contact: Contact;
  setContact: (patch: Partial<Contact>) => void;
  errors: Errors;
  send: SendState;
}) {
  const rows = [
    { key: "name", label: "Name", type: "text", autoComplete: "name", placeholder: "Your name" },
    { key: "email", label: "Email", type: "email", autoComplete: "email", placeholder: "you@business.com" },
    { key: "phone", label: "Phone", type: "tel", autoComplete: "tel", placeholder: "+351 900 000 000" },
    { key: "company", label: "Company", type: "text", autoComplete: "organization", placeholder: "Your business" },
  ] as const;

  return (
    <>
      <motion.p variants={ROW} className="pf-lede">
        Leave your details and we&rsquo;ll reply with a final proposal built on your answers.
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
        <motion.div variants={ROW}>
          <label className="prop-row">
            <span className="mono-label prop-label">Message</span>
            <textarea
              name="message"
              rows={3}
              placeholder="Anything else we should know (optional)"
              value={contact.message}
              onChange={(e) => setContact({ message: e.target.value })}
              maxLength={MAX.message}
              className="prop-input prop-text"
            />
          </label>
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
              I agree to Nevima using these details to prepare and send my proposal, as set out in the{" "}
              {/* A placeholder until the privacy policy page exists. */}
              <a href="#privacy-policy" className="underline underline-offset-2">
                privacy policy
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
  return (
    <div role="status">
      <p className="pf-lede">
        Requests can&rsquo;t be sent from the site yet. Send yours by email instead: it opens with your answers
        and details already written in.
      </p>
      <p className="mono-label pf-foot-note">
        Or write to us at{" "}
        <a href={`mailto:${STUDIO_EMAIL}`} className="underline underline-offset-2">
          {STUDIO_EMAIL}
        </a>
      </p>
    </div>
  );
}

/** The estimate for this draft, fetched when the estimate screen opens. */
export function useEstimate(active: boolean, draft: Draft, trap: () => string) {
  const [state, setState] = useState<EstimateState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);
  const key = JSON.stringify(toAnswers(draft));

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    setState({ status: "loading" });
    fetch("/api/estimate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers: JSON.parse(key), nickname: trap() }),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => null);
        if (cancelled) return;
        if (res.ok && data?.estimate) setState({ status: "ready", estimate: data.estimate });
        else if (res.status === 429) {
          setState({ status: "error", message: "Too many estimates from this connection. Try again in a few minutes." });
        } else setState({ status: "error", message: "We couldn't work out your estimate." });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "error", message: "We couldn't reach the server. Check your connection." });
      });
    return () => {
      cancelled = true;
    };
    // The trap is read when the request goes, not watched.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, key, attempt]);

  return { state, retry: () => setAttempt((n) => n + 1) };
}
