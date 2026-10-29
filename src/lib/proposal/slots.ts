import type { Lang } from "../i18n";

/* ==================================================================
   The times offered for the call

   A time is kept as the studio types it, on Lisbon's clock, with no
   offset: "2026-11-06T15:00". That is what the studio means, whatever
   the time of year, and what Notion is given (with its time zone). It
   is turned into an instant only to compare it with now and to write a
   calendar file.

   Shared by the emails, the meeting page and the studio's composer, so
   it carries nothing that only runs on the server.
   ================================================================== */

export const ZONE = "Europe/Lisbon";

/** How long the call is booked for, in minutes (it takes 20 to 30). */
export const CALL_MINUTES = 30;

const LOCAL = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/;

/** True for a time written as the studio types it. */
export const isSlot = (value: unknown): value is string => typeof value === "string" && LOCAL.test(value);

/** The instant a Lisbon time stands for. */
export function slotDate(slot: string): Date {
  const [, y, mo, d, h, mi] = LOCAL.exec(slot)!.map(Number);
  const guess = Date.UTC(y, mo - 1, d, h, mi);
  // What Lisbon's clock reads at that instant tells how far it is from UTC.
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: ZONE,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
      .formatToParts(new Date(guess))
      .map((p) => [p.type, p.value]),
  );
  const read = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute);
  return new Date(guess - (read - guess));
}

const LOCALE: Record<Lang, string> = { en: "en-GB", pt: "pt-PT" };

const clean = (value: string) => value.replace(/\./g, "").trim();

function format(slot: string, lang: Lang, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat(LOCALE[lang], { timeZone: ZONE, ...options }).format(slotDate(slot));
}

/** "QUI · 6 NOV", for the mono label over a time. */
export function slotDay(slot: string, lang: Lang) {
  // Portuguese's short weekday is the whole word ("segunda"): three letters, as English.
  const weekday = clean(format(slot, lang, { weekday: "short" })).slice(0, 3);
  const day = format(slot, lang, { day: "numeric" });
  const month = clean(format(slot, lang, { month: "short" }));
  return `${weekday} · ${day} ${month}`.toUpperCase();
}

/** "15:00". */
export const slotTime = (slot: string, lang: Lang) =>
  format(slot, lang, { hour: "2-digit", minute: "2-digit", hourCycle: "h23" });

/** "quinta-feira, 6 de novembro" / "Thursday 6 November". */
export function slotLong(slot: string, lang: Lang) {
  const words = format(slot, lang, { weekday: "long", day: "numeric", month: "long" });
  return lang === "en" ? words.replace(",", "") : words;
}

/** The whole of it, in a sentence: "quinta-feira, 6 de novembro, às 15:00". */
export const slotSentence = (slot: string, lang: Lang) =>
  lang === "pt" ? `${slotLong(slot, lang)}, às ${slotTime(slot, lang)}` : `${slotLong(slot, lang)} at ${slotTime(slot, lang)}`;

export const lisbonTime = (lang: Lang) => (lang === "pt" ? "Hora de Lisboa" : "Lisbon time");
