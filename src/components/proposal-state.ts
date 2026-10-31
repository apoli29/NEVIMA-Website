"use client";

import { useSyncExternalStore } from "react";
import { EMPTY_CONTACT, EMPTY_DRAFT, type Draft, type StepId } from "./proposal-steps";
import type { Contact } from "@/lib/proposal/questions";

/* ==================================================================
   What has been answered in the free proposal

   Kept outside the overlay, so the form set at the foot of a page (a
   preview that grows into the overlay when it is pressed, user,
   2026-10-31) shows the same answers, on the same screen, as the overlay
   it opens, and takes them back when the overlay is closed. It lives as
   long as the page does; a reload starts afresh.
   ================================================================== */

type State = { draft: Draft; contact: Contact; step: StepId };

let state: State = { draft: EMPTY_DRAFT, contact: EMPTY_CONTACT, step: "basics" };
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};

export const setDraftState = (fn: (d: Draft) => Draft) => {
  state = { ...state, draft: fn(state.draft) };
  emit();
};
export const setContactState = (fn: (c: Contact) => Contact) => {
  state = { ...state, contact: fn(state.contact) };
  emit();
};
export const setStepState = (step: StepId) => {
  state = { ...state, step };
  emit();
};
/** Every answer wiped, back to the first screen. */
export const resetProposalState = () => {
  state = { draft: EMPTY_DRAFT, contact: EMPTY_CONTACT, step: "basics" };
  emit();
};

export const useProposalState = () =>
  useSyncExternalStore(
    subscribe,
    () => state,
    () => state,
  );
