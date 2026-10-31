"use client";

import {
  type RefObject,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import dynamic from "next/dynamic";
import { useMotionValue, useMotionValueEvent, type MotionValue } from "motion/react";

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
  /** How far the pane stands out round the box it leaves from; the form at
      the foot of a page leaves from its own edges, with none. */
  pad?: number;
};

export function useProposalController() {
  /** Asked open (false while it is closing). */
  const [open, setOpen] = useState(false);
  /** On screen at all, opening, open or closing: the page is held. */
  const [present, setPresent] = useState(false);
  const origin = useRef<Origin | null>(null);
  /** The run's one clock (0 shut, 1 open), owned by the overlay's animate()
      and shared so the button it grows out of can follow it. */
  const progress = useMotionValue(0);

  const show = useCallback((box: HTMLElement, focus: HTMLElement | null, index = true, pad?: number) => {
    origin.current = { box, focus, index, pad };
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

  return useMemo(
    () => ({ open, present, origin, progress, show, hide, gone }),
    [open, present, progress, show, hide, gone],
  );
}

/** How far into the run the pane has come in: the button the form grows
    out of is let go over the same stretch, and taken back over it on the
    way home, so the two always overlap and no frame shows neither. Kept in
    step with PANE in proposal-overlay.tsx. */
const ORIGIN_OUT = 0.18;

/** The button a form is grown out of, faded off the run's clock while the
    form is out (it was hidden outright, which left a frame with nothing at
    either end). Its place is kept; the page behind is out of reach. */
export function useOriginFade(button: RefObject<HTMLElement | null>, progress: MotionValue<number> | undefined, launched: boolean) {
  const apply = (v: number) => {
    const el = button.current;
    if (!el) return;
    el.style.opacity = launched ? String(Math.max(0, 1 - v / ORIGIN_OUT)) : "";
  };
  const idle = useMotionValue(0);
  useMotionValueEvent(progress ?? idle, "change", apply);
  useEffect(() => apply(progress?.get() ?? 0), [launched]);
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
