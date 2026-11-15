"use client";

import { useEffect, useRef, useState } from "react";
import type { useT } from "@/lib/use-lang";

/* What the side-by-side page's service sections (sbs-included.tsx,
   sbs-service.tsx, sbs-personal.tsx) share. */

export type T = ReturnType<typeof useT>;

/** On screen now (not latched, unlike useSeen): the loops here run only
    while they can be seen. */
export function useInView<E extends Element>(threshold = 0.35) {
  const ref = useRef<E>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const watch = new IntersectionObserver(([entry]) => setInView(!!entry?.isIntersecting), { threshold });
    watch.observe(el);
    return () => watch.disconnect();
  }, [threshold]);
  return [ref, inView] as const;
}

const GLYPHS = "abcdefghijklmnopqrstuvwxyz0123456789*#%&+";

/** A line that scrambles into place when it changes (Linear's security
    card): every letter runs through glyphs and settles left to right, in
    under half a second. Spaces and punctuation stay put, so the line
    keeps its shape while it settles. Timed by the clock, not by frames,
    so a throttled tab still settles on time. */
export function useScramble(text: string, still: boolean, live = true) {
  const [shown, setShown] = useState(text);
  const first = useRef(true);
  useEffect(() => {
    if (first.current || still || !live) {
      first.current = false;
      setShown(text);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const length = 420;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / length);
      const settled = Math.floor(p * text.length);
      let out = "";
      for (let i = 0; i < text.length; i++) {
        const c = text[i]!;
        out += i < settled || !/[\p{L}\p{N}]/u.test(c) ? c : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      }
      setShown(p < 1 ? out : text);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text, still, live]);
  return shown;
}

/** Two choices as the bar's links are set: square cells ruled by
    hairlines, each with its mono number, and a block of ink that slides
    under the chosen one. */
export function Switch({
  options,
  value,
  onChange,
  label,
  dark = false,
}: {
  options: { id: string; label: string }[];
  value: string;
  onChange: (id: string) => void;
  label: string;
  dark?: boolean;
}) {
  const at = Math.max(0, options.findIndex((o) => o.id === value));
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={`sbx-switch ${dark ? "sbx-switch-dark" : ""}`}
      style={{ ["--at" as string]: at, ["--n" as string]: options.length }}
    >
      <span aria-hidden="true" className="sbx-switch-thumb" />
      {options.map((o, i) => (
        <button key={o.id} type="button" role="radio" aria-checked={o.id === value} className="sbx-switch-opt" onClick={() => onChange(o.id)}>
          <span aria-hidden="true" className="sbx-switch-n">
            {String(i + 1).padStart(2, "0")}
          </span>
          {o.label}
        </button>
      ))}
    </div>
  );
}
