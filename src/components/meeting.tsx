"use client";

import { useState } from "react";
import { localize, type Lang } from "@/lib/i18n";
import { PHONES, STUDIO_EMAIL } from "@/lib/proposal/mail";
import { lisbonTime, slotLong, slotSentence, slotTime } from "@/lib/proposal/slots";
import { Wordmark } from "./wordmark";

/* ==================================================================
   The meeting page

   Where a time on the invitation's buttons leads (src/lib/proposal/
   invite.ts). It shows the time chosen and asks for one more click to
   book it, so a link opened by a mail app's scanner, or by mistake,
   books nothing. The other time offered is one link away.

   A single screen, like the portfolio: it is reached only from the
   studio's email, so it has no bar, no "Let's work together" and no
   footer. White paper with the time set as the headline (a light line
   and a medium one), the bar's crate as the button, and a black foot
   with the wordmark across it, as every page of the site closes.

   As everywhere on the site, the Portuguese never addresses the reader:
   buttons in the infinitive, the rest impersonal.
   ================================================================== */

export type MeetingView =
  | { kind: "invalid" }
  | { kind: "ready"; token: string; slots: [string, string]; choice: 0 | 1; past: [boolean, boolean] };

type State = "idle" | "sending" | "booked" | "failed" | "past";

const copy = {
  en: {
    tag: "Call · 20–30 min",
    chosen: "The time chosen",
    confirm: "Confirm this time",
    sending: "Booking…",
    booked: "Call booked.",
    bookedNote: "We will send the link to the call by email.",
    calendar: "Add to calendar",
    other: (when: string) => `Also offered: ${when}.`,
    pickOther: "Choose that one",
    failed: "The time could not be booked just now. Please try again, or call us.",
    past: "This time has already passed.",
    invalid: "This link is not valid.",
    elsewhere: "For another time:",
    book: "To book the call:",
  },
  pt: {
    tag: "Chamada · 20–30 min",
    chosen: "Horário escolhido",
    confirm: "Confirmar este horário",
    sending: "A marcar…",
    booked: "Chamada marcada.",
    bookedNote: "O link da chamada segue por e-mail.",
    calendar: "Adicionar ao calendário",
    other: (when: string) => `Também foi proposto: ${when}.`,
    pickOther: "Escolher esse",
    failed: "Não foi possível marcar agora. Tentar de novo, ou ligar-nos.",
    past: "Este horário já passou.",
    invalid: "Este link não é válido.",
    elsewhere: "Para marcar outra altura:",
    book: "Para marcar a chamada:",
  },
} as const;

export function Meeting({ lang, view }: { lang: Lang; view: MeetingView }) {
  const t = copy[lang];
  const ready = view.kind === "ready" ? view : null;
  const [state, setState] = useState<State>(ready && ready.past[ready.choice] ? "past" : "idle");

  async function book() {
    if (!ready) return;
    setState("sending");
    try {
      const res = await fetch("/api/meeting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ t: ready.token, h: ready.choice }),
      });
      setState(res.ok ? "booked" : res.status === 410 ? "past" : "failed");
    } catch {
      setState("failed");
    }
  }

  const slot = ready?.slots[ready.choice];
  const otherChoice = ready ? ((1 - ready.choice) as 0 | 1) : 0;
  const other = ready && !ready.past[otherChoice] && state !== "booked" ? ready.slots[otherChoice] : null;
  const here = (choice: 0 | 1) => `${localize("/meeting", lang)}?t=${ready?.token}&h=${choice}`;

  return (
    <main className="flex min-h-[var(--screen)] flex-col bg-paper text-ink">
      <div className="shell flex items-center justify-between pt-7">
        <a href={localize("/", lang)} aria-label="nevima" className="block w-[5.5rem]">
          <Wordmark className="block h-auto w-full" />
        </a>
        <span className="mono-label border border-hair-strong px-2.5 py-1.5">{t.tag}</span>
      </div>

      <section className="shell flex flex-1 flex-col justify-center py-16">
        {slot ? (
          <>
            <p className="mono-label text-ash">{t.chosen}</p>
            <h1 className="h1 mt-4 font-title leading-[1.02]">
              <span className="block font-light first-letter:uppercase">{slotLong(slot, lang)}</span>
              <span className="block font-medium">{slotTime(slot, lang)}</span>
            </h1>
            <p className="mono-label mt-4 text-ash">{lisbonTime(lang)}</p>

            <div className="mt-10 flex min-h-[2.75rem] flex-wrap items-center gap-x-6 gap-y-3" aria-live="polite">
              {state === "booked" ? (
                <>
                  <span className="flex items-center gap-3 text-[1.0625rem] font-medium">
                    <span className="live-dot" aria-hidden="true" />
                    {t.booked}
                  </span>
                  <a
                    href={`/api/meeting/ics?t=${ready.token}&h=${ready.choice}`}
                    className="cta-crate inline-flex items-center whitespace-nowrap text-[0.9375rem] leading-none"
                  >
                    {t.calendar}
                    <span aria-hidden="true" className="cta-crate-key">
                      &darr;
                    </span>
                  </a>
                </>
              ) : state === "past" ? (
                <p className="text-[1.0625rem]">{t.past}</p>
              ) : (
                <button
                  type="button"
                  onClick={book}
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
            {state === "booked" && <p className="mt-4 text-ash">{t.bookedNote}</p>}
            {state === "failed" && <p className="mt-4 text-ash">{t.failed}</p>}
            {other && (
              <p className="mt-8 max-w-[34rem] text-ash">
                {t.other(slotSentence(other, lang))}{" "}
                <a href={here(otherChoice)} className="text-ink underline underline-offset-4">
                  {t.pickOther}
                </a>
              </p>
            )}
          </>
        ) : (
          <h1 className="h1 font-title font-medium leading-[1.02]">{t.invalid}</h1>
        )}

        <div className="mt-12 border-t border-hair pt-6">
          <p className="mono-label text-ash">{slot ? t.elsewhere : t.book}</p>
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
