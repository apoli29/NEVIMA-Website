"use client";

import { useSyncExternalStore } from "react";
import { EMPTY_CONTACT } from "./proposal-steps";
import { EMPTY_PARTNER, type PartnerDraft, type PartnerStep } from "./partner-steps";
import type { Contact } from "@/lib/proposal/questions";

/* ==================================================================
   What has been answered in the partners' form

   Kept outside both frames that ask it (the overlay and the form in
   "Let's work together"), as the free proposal's is (proposal-state.ts):
   the same answers, on the same screen, in either, and still there when
   the overlay is closed and opened again. A reload starts afresh.
   ================================================================== */

type State = { draft: PartnerDraft; contact: Contact; step: PartnerStep };

const FRESH: State = { draft: EMPTY_PARTNER, contact: EMPTY_CONTACT, step: "project" };
let state: State = FRESH;
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};

export const setPartnerDraft = (fn: (d: PartnerDraft) => PartnerDraft) => {
  state = { ...state, draft: fn(state.draft) };
  emit();
};
export const setPartnerContact = (fn: (c: Contact) => Contact) => {
  state = { ...state, contact: fn(state.contact) };
  emit();
};
export const setPartnerStep = (step: PartnerStep) => {
  state = { ...state, step };
  emit();
};
/** Every answer wiped, back to the first screen. */
export const resetPartnerState = () => {
  state = FRESH;
  emit();
};

export const usePartnerState = () =>
  useSyncExternalStore(
    subscribe,
    () => state,
    () => FRESH,
  );
