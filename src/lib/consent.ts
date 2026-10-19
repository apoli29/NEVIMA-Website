/* ==================================================================
   Cookie consent

   Lei n.º 41/2004, art. 5.º: nothing that is not strictly needed for
   what the visitor asked may be stored on or read from their device
   before they agree to it. Today the site stores nothing of the kind,
   so no banner is shown (an empty one would only get in the way). The
   moment a non-essential service is added, it is listed in SERVICES
   below and wrapped in <Consented> (cookie-consent.tsx): the banner then
   asks first, with refusing as easy as accepting, and the choice can be
   changed at any time from "Cookie preferences" in the foot.

   The choice itself is kept in the browser; that is strictly needed to
   remember it, so it needs no consent of its own.
   ================================================================== */

import type { Copy } from "./i18n";

export type ConsentCategory = "analytics" | "marketing";

/** A non-essential service the site loads only with consent. */
export type ConsentService = {
  id: string;
  category: ConsentCategory;
  name: string;
  purpose: Copy;
  /** How long what it stores is kept. */
  duration: Copy;
};

/** Every non-essential service on the site. Empty today: nothing waits
    for consent, so the banner stays away. */
export const SERVICES: readonly ConsentService[] = [];

export const CATEGORIES: Record<ConsentCategory, { name: Copy; text: Copy }> = {
  analytics: {
    name: { en: "Analytics", pt: "Análise" },
    text: {
      en: "Counting visits and how the site is used, to improve it.",
      pt: "Contar as visitas e perceber como o website é usado, para o melhorar.",
    },
  },
  marketing: {
    name: { en: "Marketing", pt: "Marketing" },
    text: {
      en: "Measuring advertising and showing relevant ads.",
      pt: "Medir a publicidade e mostrar anúncios relevantes.",
    },
  },
};

export type ConsentChoice = Record<ConsentCategory, boolean> & { at: string; version: number };

/** Raised when the set of services changes in a way that needs asking
    again: a stored choice of an older version is ignored. */
export const CONSENT_VERSION = 1;
const KEY = "nevima:consent";
const EVENT = "nevima:consent";
const OPEN_EVENT = "nevima:consent-open";

/** The categories in use, in a fixed order. */
export const categoriesInUse = (): ConsentCategory[] =>
  (["analytics", "marketing"] as const).filter((c) => SERVICES.some((s) => s.category === c));

export function readConsent(): ConsentChoice | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const choice = JSON.parse(raw) as ConsentChoice;
    return choice.version === CONSENT_VERSION ? choice : null;
  } catch {
    return null;
  }
}

export function saveConsent(choice: Record<ConsentCategory, boolean>) {
  const full: ConsentChoice = { ...choice, at: new Date().toISOString(), version: CONSENT_VERSION };
  try {
    localStorage.setItem(KEY, JSON.stringify(full));
  } catch {}
  window.dispatchEvent(new CustomEvent(EVENT, { detail: full }));
}

export function onConsent(listener: (choice: ConsentChoice | null) => void) {
  const handler = () => listener(readConsent());
  window.addEventListener(EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

/** Opens the preferences from anywhere (the foot's button). */
export const openConsent = () => window.dispatchEvent(new Event(OPEN_EVENT));
export function onOpenConsent(listener: () => void) {
  window.addEventListener(OPEN_EVENT, listener);
  return () => window.removeEventListener(OPEN_EVENT, listener);
}
