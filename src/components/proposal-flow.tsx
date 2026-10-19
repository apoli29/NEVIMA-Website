"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import dynamic from "next/dynamic";

/* ==================================================================
   The free proposal, opened out of the index: who may open it, and the
   overlay that does (proposal-overlay.tsx, where the run is described).

   The overlay, with every question and the estimate behind it, is not
   part of the page's first load (user, 2026-10-19, the PageSpeed
   report): it is fetched once the page is idle, or at the latest when
   it is first asked for, and from then on stays mounted, as it always
   did, so answers survive closing it.
   ================================================================== */

const fetchOverlay = () => import("./proposal-overlay");
const Overlay = dynamic(() => fetchOverlay().then((m) => m.ProposalOverlayPanel), { ssr: false });

/* ------------------------------------------------------------------ */
/* Who may open it                                                     */
/* ------------------------------------------------------------------ */


type Origin = {
  /** The index, measured: where the form leaves from and comes back to. */
  box: HTMLElement;
  /** Given focus again once the index is back. */
  focus: HTMLElement | null;
  /** Opened from the index itself. A call to action elsewhere on the page
      grows the form out of its own button instead: there is no index to
      turn into the form, so its label and its other rows never show. */
  index: boolean;
};

export function useProposalController() {
  /** Asked open (false while it is closing). */
  const [open, setOpen] = useState(false);
  /** On screen at all, opening, open or closing: the page is held. */
  const [present, setPresent] = useState(false);
  const origin = useRef<Origin | null>(null);

  const show = useCallback((box: HTMLElement, focus: HTMLElement | null, index = true) => {
    origin.current = { box, focus, index };
    setPresent(true);
    setOpen(true);
  }, []);
  const hide = useCallback(() => setOpen(false), []);
  const gone = useCallback(() => setPresent(false), []);

  // Focus goes back to the row it was opened from, once that row is
  // seen again (it is hidden while the form is out).
  const wasPresent = useRef(false);
  useEffect(() => {
    if (wasPresent.current && !present) origin.current?.focus?.focus({ preventScroll: true });
    wasPresent.current = present;
  }, [present]);

  return useMemo(() => ({ open, present, origin, show, hide, gone }), [open, present, show, hide, gone]);
}

export type ProposalController = ReturnType<typeof useProposalController>;

const ProposalContext = createContext<ProposalController | null>(null);
export const ProposalProvider = ProposalContext.Provider;
export const useProposal = () => useContext(ProposalContext);

/** The overlay, for a page with a form to open: nothing until the page is
    idle or the form is first asked for, then the overlay itself. */
export function ProposalOverlay({ ctl }: { ctl: ProposalController }) {
  const [wanted, setWanted] = useState(false);
  useEffect(() => {
    if (ctl.present) setWanted(true);
  }, [ctl.present]);
  // Fetched ahead, so a press finds it there and the form opens at once.
  useEffect(() => {
    const idle = window.requestIdleCallback ?? ((go: () => void) => window.setTimeout(go, 2000));
    const id = idle(() => void fetchOverlay(), { timeout: 5000 });
    return () => (window.cancelIdleCallback ?? window.clearTimeout)(id);
  }, []);
  return wanted ? <Overlay ctl={ctl} /> : null;
}
