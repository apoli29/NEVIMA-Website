"use client";

import { useState } from "react";
import { localize, type Lang } from "@/lib/i18n";
import { PHONES, STUDIO_EMAIL } from "@/lib/proposal/mail";
import { Wordmark } from "./wordmark";

/* ==================================================================
   The answer about the call midway through the project

   Where the final proposal's two buttons lead (src/lib/proposal/
   offer.ts). The call is optional, so the client says whether they want
   it. As on the meeting page, the click in the email only opens this
   page and one more click records the answer, so a link opened by a mail
   app's scanner records nothing; the other answer is one link away.

   A single screen in the meeting page's look, reached only from the
   email. As everywhere on the site, the Portuguese never addresses the
   reader.
   ================================================================== */

type Answer = "yes" | "no";
type State = "idle" | "sending" | "saved" | "failed";

const copy = {
  en: {
    tag: "Mid-project call",
    chosen: "Your answer",
    yes: "With a call midway through the project.",
    no: "Without a call midway through the project.",
    confirm: "Confirm this answer",
    sending: "Saving…",
    saved: "Answer saved.",
    savedYes: "We will soon email you to set a date.",
    savedNo: "There is nothing else to do.",
    other: "Change of mind?",
    pickOther: "Choose the other answer",
    failed: "The answer could not be saved just now. Please try again, or call us.",
    invalid: "This link is not valid.",
    help: "Any questions:",
  },
  pt: {
    tag: "Reunião a meio do projeto",
    chosen: "Resposta escolhida",
    yes: "Com reunião a meio do projeto.",
    no: "Sem reunião a meio do projeto.",
    confirm: "Confirmar esta resposta",
    sending: "A guardar…",
    saved: "Resposta guardada.",
    savedYes: "Em breve segue um e-mail para marcar a data.",
    savedNo: "Não é preciso fazer mais nada.",
    other: "Outra decisão?",
    pickOther: "Escolher a outra resposta",
    failed: "Não foi possível guardar agora. Tentar de novo, ou ligar-nos.",
    invalid: "Este link não é válido.",
    help: "Para qualquer dúvida:",
  },
} as const;

export function MidCall({ lang, token, answer }: { lang: Lang; token: string | null; answer: Answer }) {
  const t = copy[lang];
  const [state, setState] = useState<State>("idle");

  async function save() {
    setState("sending");
    try {
      const res = await fetch("/api/mid-call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ t: token, a: answer }),
      });
      setState(res.ok ? "saved" : "failed");
    } catch {
      setState("failed");
    }
  }

  const otherAnswer: Answer = answer === "yes" ? "no" : "yes";

  return (
    <main className="flex min-h-[var(--screen)] flex-col bg-paper text-ink">
      <div className="shell flex items-center justify-between gap-4 pt-7">
        <a href={localize("/", lang)} aria-label="nevima" className="block w-[5.5rem] shrink-0">
          <Wordmark className="block h-auto w-full" />
        </a>
        <span className="mono-label border border-hair-strong px-2.5 py-1.5">{t.tag}</span>
      </div>

      <section className="shell flex flex-1 flex-col justify-center py-16">
        {token ? (
          <>
            <p className="mono-label text-ash">{t.chosen}</p>
            <h1 className="h1 mt-4 font-title font-medium leading-[1.02]">{t[answer]}</h1>

            <div className="mt-10 flex min-h-[2.75rem] flex-wrap items-center gap-x-6 gap-y-3" aria-live="polite">
              {state === "saved" ? (
                <span className="flex items-center gap-3 text-[1.0625rem] font-medium">
                  <span className="live-dot" aria-hidden="true" />
                  {t.saved}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={save}
                  disabled={state === "sending"}
                  className="cta-crate inline-flex items-center whitespace-nowrap text-[0.9375rem] leading-none disabled:opacity-60"
                >
                  {state === "sending" ? t.sending : t.confirm}
                  <span aria-hidden="true" className="cta-crate-key">
                    &rarr;
                  </span>
                </button>
              )}
            </div>
            {state === "saved" && <p className="mt-4 text-ash">{answer === "yes" ? t.savedYes : t.savedNo}</p>}
            {state === "failed" && <p className="mt-4 text-ash">{t.failed}</p>}
            <p className="mt-8 max-w-[34rem] text-ash">
              {t.other}{" "}
              <a href={`${localize("/mid-call", lang)}?t=${token}&a=${otherAnswer}`} className="text-ink underline underline-offset-4">
                {t.pickOther}
              </a>
            </p>
          </>
        ) : (
          <h1 className="h1 font-title font-medium leading-[1.02]">{t.invalid}</h1>
        )}

        <div className="mt-12 border-t border-hair pt-6">
          <p className="mono-label text-ash">{t.help}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {PHONES.map((phone) => (
              <a key={phone.tel} href={`tel:${phone.tel}`} className="mono-label border border-ink px-3 py-2 text-[0.8125rem]">
                {phone.label}
              </a>
            ))}
            <a href={`mailto:${STUDIO_EMAIL}`} className="mono-label border border-ink px-3 py-2 text-[0.8125rem] normal-case">
              {STUDIO_EMAIL}
            </a>
          </div>
        </div>
      </section>

      <footer className="bg-ink pb-6 pt-10 text-paper">
        <div className="shell">
          <Wordmark className="block h-auto w-full" />
        </div>
      </footer>
    </main>
  );
}
