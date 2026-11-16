"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useFit } from "./sbs-pilar";
import { usePlateScrub } from "./sbs-scrub";
import { holdScroll } from "./smooth-scroll";
import type { T } from "./sbs-shared";

/* ==================================================================
   Going through the plates by hand (user, 2026-11-17): a call to do it
   under the plates, the plate itself taking over at a touch, and a
   larger preview in a window of its own, as the proposal form opens.
   The scroll itself is sbs-scrub.ts.
   ================================================================== */

/** A page in a plate: scaled to it (useFit) and given the loop. */
export function PlateScreen({
  running,
  onLap,
  className,
  children,
}: {
  running: boolean;
  onLap?: () => void;
  className?: string;
  children: React.ReactNode;
}) {
  const screen = useFit();
  return (
    <div ref={screen} className={`sbs-screen ${className ?? ""}`}>
      <div
        className={running ? "sbs-run" : undefined}
        onAnimationIteration={(e) => {
          if (onLap && (e.animationName === "sbs-scroll" || e.animationName === "sbs-a-scroll")) onLap();
        }}
      >
        {children}
      </div>
    </div>
  );
}

/** A tap on a plate (a press let go where it began) is a wish to take
    over: it calls `go`, unless the plate is already by hand. */
export function useTapToTakeOver(manual: boolean, go: () => void) {
  const from = useRef<{ x: number; y: number } | null>(null);
  return {
    onPointerDown: (e: React.PointerEvent) => {
      if (!manual) from.current = { x: e.clientX, y: e.clientY };
    },
    onPointerUp: (e: React.PointerEvent) => {
      const f = from.current;
      from.current = null;
      if (manual || !f) return;
      if (Math.hypot(e.clientX - f.x, e.clientY - f.y) < 6) go();
    },
  };
}

/** Under the plates: go through the page by hand (or let it run again),
    and open it larger. */
export function ExploreBar({
  t,
  manual,
  setManual,
  onOpen,
  dark = true,
}: {
  t: T;
  manual: boolean;
  setManual: (on: boolean) => void;
  onOpen: () => void;
  dark?: boolean;
}) {
  return (
    <div className={`sbx-explore ${dark ? "sbx-explore-dark" : ""}`}>
      <button type="button" className="sbx-explore-go" onClick={() => setManual(!manual)} aria-pressed={manual}>
        <span className="sbx-explore-icon" aria-hidden="true">
          {manual ? (
            <svg viewBox="0 0 16 16" fill="currentColor">
              <path d="M5 3.5v9l7.5-4.5z" />
            </svg>
          ) : (
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
              <rect x="4.5" y="1.5" width="7" height="13" rx="3.5" />
              <path className="sbx-explore-wheel" d="M8 4.5v2.5" strokeLinecap="round" />
            </svg>
          )}
        </span>
        {manual ? t("Play on its own", "Reproduzir sozinho") : t("Scroll through it yourself", "Percorrer à vontade")}
      </button>
      <button type="button" className="sbx-explore-open" onClick={onOpen}>
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true">
          <path d="M9.5 2.5h4v4M13.5 2.5 8.5 7.5M6.5 13.5h-4v-4M2.5 13.5l5-5" />
        </svg>
        {t("Open larger", "Abrir em grande")}
      </button>
      {manual && (
        <span className="sbx-explore-hint mono-label" aria-live="polite">
          {t("Scroll or drag inside the page", "Fazer scroll ou arrastar dentro da página")}
        </span>
      )}
    </div>
  );
}

/** The larger preview: a window over the website with the plates, by
    hand from the start, the page behind held still. */
export function SbsPreview({
  t,
  open,
  onClose,
  label,
  wide,
  children,
}: {
  t: T;
  open: boolean;
  onClose: () => void;
  label: string;
  /** two plates side by side (the comparison) */
  wide?: boolean;
  children: React.ReactNode;
}) {
  const box = useRef<HTMLDivElement>(null);
  const close = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // onClose is read through a ref, so a new function from the parent on
  // each render does not run this again (which moved the focus, and with
  // it the page, on every render)
  const shut = useRef(onClose);
  shut.current = onClose;
  useEffect(() => {
    holdScroll("sbs-preview", open);
    if (!open) return;
    const back = document.activeElement as HTMLElement | null;
    close.current?.focus({ preventScroll: true });
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") shut.current();
    };
    window.addEventListener("keydown", key);
    return () => {
      window.removeEventListener("keydown", key);
      holdScroll("sbs-preview", false);
      back?.focus?.({ preventScroll: true });
    };
  }, [open]);

  usePlateScrub(box, open);

  if (!mounted || !open) return null;
  return createPortal(
    <div className="sbx-prev" role="dialog" aria-modal="true" aria-label={label}>
      <div className="sbx-prev-backdrop" onClick={onClose} />
      <div className="sbx-prev-frame">
        <div className="sbx-prev-head">
          <p className="mono-label">{label}</p>
          <span className="sbx-prev-hint mono-label">{t("Scroll or drag inside the page", "Fazer scroll ou arrastar dentro da página")}</span>
          <button ref={close} type="button" className="sbx-prev-close" onClick={onClose}>
            {t("Close", "Fechar")}
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
              <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" />
            </svg>
          </button>
        </div>
        <div ref={box} className={`sbx-prev-body ${wide ? "sbx-prev-wide" : ""}`}>
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}
