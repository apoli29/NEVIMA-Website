"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

/* ---------------------------------------------------------------- */
/* Reveal — one restrained entrance, reused everywhere.               */
/* ---------------------------------------------------------------- */

export function Reveal({
  children,
  delay = 0,
  y = 22,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-12% 0px -12% 0px" }}
      transition={{ duration: 0.85, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ---------------------------------------------------------------- */
/* Section head — the numbered mono label the whole page hangs on.    */
/* ---------------------------------------------------------------- */

export function SectionLabel({
  index,
  children,
  tone = "dark",
}: {
  index: string;
  children: ReactNode;
  tone?: "dark" | "light";
}) {
  return (
    <p
      className={`mono flex items-center gap-2 ${
        tone === "dark" ? "text-ash" : "text-graphite"
      }`}
    >
      <span className={tone === "dark" ? "text-chalk" : "text-ink"}>{index}</span>
      <span className={tone === "dark" ? "text-chalk/45" : "text-ink/40"}>/</span>
      <span>{children}</span>
    </p>
  );
}

/* ---------------------------------------------------------------- */
/* Buttons — square, no radius, weight carried by contrast.           */
/* ---------------------------------------------------------------- */

type BtnProps = {
  children: ReactNode;
  href?: string;
  variant?: "solid" | "ghost" | "invert";
  className?: string;
};

export function Button({ children, href = "#contacto", variant = "solid", className = "" }: BtnProps) {
  const styles = {
    solid:
      "bg-paper text-ink hover:bg-chalk hover:text-ink",
    ghost:
      "border border-hair-strong text-chalk hover:border-chalk hover:bg-chalk hover:text-ink",
    invert:
      "bg-ink text-paper hover:bg-chalk hover:text-ink",
  }[variant];

  return (
    <a
      href={href}
      className={`group inline-flex items-center gap-3 px-6 py-4 text-[0.9375rem] leading-none font-medium tracking-[-0.01em] lowercase transition-colors duration-300 ${styles} ${className}`}
    >
      {children}
      <span
        aria-hidden
        className="translate-x-0 transition-transform duration-300 group-hover:translate-x-1"
      >
        &rarr;
      </span>
    </a>
  );
}

/* ---------------------------------------------------------------- */
/* Marquee — a single seamless brand ribbon.                          */
/* ---------------------------------------------------------------- */

export function Marquee({ items }: { items: string[] }) {
  const run = [...items, ...items];
  return (
    // masked rather than covered by gradients, so the sky stays visible behind
    <div className="fade-x relative flex overflow-hidden border-y border-hair py-5 select-none">
      <div className="marquee-track flex shrink-0">
        {run.map((item, i) => (
          <span key={i} className="mono flex shrink-0 items-center text-ash">
            <span className="px-7">{item}</span>
            <span className="text-chalk/40">&#8226;</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Rails — fixed vertical hairlines. The page reads as a drawing.     */
/* ---------------------------------------------------------------- */

export function Rails() {
  return (
    // Difference blending keeps the hairlines legible over both the black
    // sections and the single light one, without ever going fully opaque.
    <div className="pointer-events-none fixed inset-0 z-30 flex justify-center" aria-hidden="true">
      <div className="shell relative h-full">
        <div className="absolute inset-y-0 left-[var(--gutter)] w-px bg-white/9 mix-blend-difference" />
        <div className="absolute inset-y-0 right-[var(--gutter)] w-px bg-white/9 mix-blend-difference" />
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Column padding — keeps content off the hairline it sits against.   */
/* ---------------------------------------------------------------- */

export function colPad(i: number, total: number) {
  if (i === 0) return "md:pr-7";
  if (i === total - 1) return "md:pl-7";
  return "md:px-7";
}
