"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { motion, useReducedMotion } from "motion/react";

/* ==================================================================
   The free-proposal form

   What the second screen's index turns into when its last row is
   pressed. It is made of the index's own parts, so it reads as the same
   object turned to another use: the white-on-black label at its head,
   rows between black hairlines at the index's height and in its type,
   and a row inked black to press. A row being written in is inked over
   the way an index row is when pointed at, so the reader always sees
   where they are.

   Four things are asked, the least that makes a useful first reply:
   who, where to answer, what for (the four services, any of them), and
   a few words. There is nothing behind it yet (the user asked to see
   the form first): sending opens the visitor's own email, addressed to
   the studio, with everything they wrote already in it, and says so,
   so nobody is left thinking a message went that did not.

   It is always there, unseen, in the same box as the index (see
   SectionIndex): the box is as tall as the form from the first paint,
   so the water's drops are laid out clear of it once and never have to
   move when it opens. Opening it only shows it.

   A drop is perched in the room above the index, where the form opens,
   so the form is hung on a pane of frosted glass, like a work behind
   museum glass: near opaque, the drop behind it only a soft shadow, the
   words always on a calm ground.
   ================================================================== */

const EMAIL = "ola@nevima.pt";
const NEEDS = ["Web Design", "Visual Identity", "SEO", "GEO"] as const;

const ROW = {
  hidden: { opacity: 0, y: 10 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const } },
};

/** The pane comes up first, as the first of the staggered rows, and
    quicker than they do, so no row is ever seen on the bare water. */
const PANE = {
  hidden: { opacity: 0 },
  shown: { opacity: 1, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const } },
};

export function ProposalForm({
  open,
  onClose,
}: {
  /** Shown, in place of the index. */
  open: boolean;
  /** Back to the index. */
  onClose: () => void;
}) {
  const reduce = useReducedMotion() ?? false;
  const [needs, setNeeds] = useState<string[]>([]);
  const [sent, setSent] = useState(false);
  const first = useRef<HTMLInputElement>(null);

  // Escape is the way back, as it is everywhere else something opens.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Closed, it starts afresh next time.
  useEffect(() => {
    if (!open) setSent(false);
  }, [open]);

  const toggle = (need: string) =>
    setNeeds((was) => (was.includes(need) ? was.filter((n) => n !== need) : [...was, need]));

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();
    const body = [
      `Name: ${name}`,
      `Email: ${email}`,
      `I need: ${needs.length ? needs.join(", ") : "Not sure yet"}`,
      "",
      message,
    ].join("\n");
    const subject = `Free proposal request from ${name}`;
    window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };

  return (
    <motion.div
      initial={false}
      animate={open ? "shown" : "hidden"}
      // Wholly unseen while closed, its own rules included (the form's
      // foot rule once showed under the index on arrival).
      variants={{
        hidden: { opacity: 0, transition: { duration: 0.2 } },
        shown: {
          opacity: 1,
          transition: { duration: 0.01, staggerChildren: reduce ? 0 : 0.06, delayChildren: 0.18 },
        },
      }}
      // Unseen and out of reach while the index is up; still laid out, so
      // the box keeps its height.
      inert={!open}
      aria-hidden={!open}
      className={`relative isolate ${open ? "" : "pointer-events-none"}`}
      onAnimationComplete={(def) => {
        if (def === "shown") first.current?.focus({ preventScroll: true });
      }}
    >
      <motion.div variants={PANE} aria-hidden="true" className="prop-pane" />
      <motion.p variants={ROW} className="mono-label mb-2.5 flex items-center justify-between text-ash-2">
        <span className="idx-title">Free proposal</span>
        <button type="button" onClick={onClose} className="prop-close">
          Close
          <span aria-hidden="true" className="ml-1.5">
            &times;
          </span>
        </button>
      </motion.p>

      {sent ? (
        <motion.div variants={ROW} className="border-y border-ink px-3 py-4">
          <p className="prop-done">
            Your email app should be opening with everything filled in. If it
            doesn&rsquo;t, write to us at{" "}
            <a href={`mailto:${EMAIL}`} className="underline underline-offset-2">
              {EMAIL}
            </a>
            .
          </p>
          <button type="button" onClick={onClose} className="prop-close mt-4">
            Back to the index
          </button>
        </motion.div>
      ) : (
        <form id="proposal-form" onSubmit={submit} aria-label="Get your free proposal" className="border-b border-ink">
          <motion.label variants={ROW} className="prop-row">
            <span className="mono-label prop-label">Name</span>
            <input
              ref={first}
              name="name"
              required
              autoComplete="name"
              placeholder="Your name"
              className="prop-input"
            />
          </motion.label>

          <motion.label variants={ROW} className="prop-row">
            <span className="mono-label prop-label">Email</span>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@business.com"
              className="prop-input"
            />
          </motion.label>

          <motion.fieldset variants={ROW} className="prop-row prop-row-plain">
            <legend className="sr-only">What you need</legend>
            <span aria-hidden="true" className="mono-label prop-label">
              I need
            </span>
            <span className="flex flex-wrap gap-1">
              {NEEDS.map((need) => (
                <button
                  key={need}
                  type="button"
                  aria-pressed={needs.includes(need)}
                  onClick={() => toggle(need)}
                  className="prop-chip mono-label"
                >
                  {need}
                </button>
              ))}
            </span>
          </motion.fieldset>

          <motion.label variants={ROW} className="prop-row">
            <span className="mono-label prop-label">About</span>
            <textarea
              name="message"
              rows={2}
              placeholder="Your business, and what the website should do"
              className="prop-input prop-text"
            />
          </motion.label>

          <motion.div variants={ROW}>
            <button type="submit" className="idx-link idx-send w-full text-left">
              <span className="idx-name">Send request</span>
              <span aria-hidden="true" className="idx-arrow">
                <svg viewBox="0 0 16 16" width="16" height="16" fill="none" className="block">
                  <path d="M2 8h11M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.25" />
                </svg>
              </span>
            </button>
          </motion.div>
        </form>
      )}

      {!sent && (
        <motion.p variants={ROW} className="mono-label mt-2.5 text-ash-2">
          Opens your email app, filled in
        </motion.p>
      )}
    </motion.div>
  );
}
