"use client";

import { useSyncExternalStore } from "react";

/* ==================================================================
   Which of the two forms the overlay is showing

   Every "Get your free proposal" button opens the one overlay, on the
   free proposal. Choosing "A development company" on its first screen
   turns it into the partners' form (user, 2026-11-09), and its Back on
   the partners' first screen turns it back. Kept here, with nothing
   imported, so "Let's work together" (on every page's first load) can
   follow it and show the partners' form too, without fetching either
   form's questions.
   ================================================================== */

export type FormKind = "proposal" | "partner";

let kind: FormKind = "proposal";
const listeners = new Set<() => void>();

/** Told every time the partners' form is chosen, even when it already
    was, so "Let's work together" turns to it each time. */
export const PARTNER_CHOSEN = "nevima:partner-chosen";

export const setFormKind = (next: FormKind) => {
  if (next === "partner") window.dispatchEvent(new Event(PARTNER_CHOSEN));
  if (next === kind) return;
  kind = next;
  listeners.forEach((l) => l());
};

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};

export const useFormKind = () =>
  useSyncExternalStore(
    subscribe,
    () => kind,
    () => "proposal" as FormKind,
  );
