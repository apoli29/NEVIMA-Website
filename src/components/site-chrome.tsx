"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { Wordmark } from "./wordmark";
import { BoomerangMark } from "./boomerang";

const NAV = [
  { label: "serviços", href: "#servicos" },
  { label: "porquê dois", href: "#leverage" },
  { label: "método", href: "#metodo" },
  { label: "trabalho", href: "#trabalho" },
  { label: "estúdio", href: "#estudio" },
];

export function Nav() {
  const [stuck, setStuck] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (v) => setStuck(v > 24));

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
          stuck ? "border-b border-hair bg-ink/80 backdrop-blur-xl" : "border-b border-transparent"
        }`}
      >
        <div className="shell flex items-center justify-between py-5">
          <a href="#top" className="flex items-center gap-3" aria-label="nevima, início">
            <Wordmark className="h-[1.2rem] w-auto text-chalk md:h-[1.38rem]" />
          </a>

          {/* Navigation speaks in the display face; the mono is kept for
              numbering and metadata, so the chrome reads studio, not dashboard. */}
          <nav className="hidden items-center gap-8 md:flex" aria-label="principal">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-[0.9375rem] lowercase tracking-[-0.01em] text-ash transition-colors duration-300 hover:text-chalk"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <a
              href="#contacto"
              className="hidden border border-hair-strong px-5 py-3 text-[0.9375rem] leading-none lowercase tracking-[-0.01em] text-chalk transition-colors duration-300 hover:border-chalk hover:bg-chalk hover:text-ink sm:block"
            >
              falar connosco
            </a>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="text-[0.9375rem] lowercase tracking-[-0.01em] text-chalk md:hidden"
              aria-expanded={open}
              aria-label={open ? "fechar menu" : "abrir menu"}
            >
              {open ? "fechar" : "menu"}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="fixed inset-0 z-40 bg-ink md:hidden"
          >
            <div className="shell flex h-full flex-col justify-center gap-2">
              {NAV.map((item, i) => (
                <motion.a
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.06 * i + 0.1, duration: 0.5 }}
                  className="display h3 border-b border-hair py-5 text-chalk"
                >
                  {item.label}
                </motion.a>
              ))}
              <motion.a
                href="#contacto"
                onClick={() => setOpen(false)}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="mt-8 inline-flex items-center justify-between bg-paper px-6 py-5 text-ink"
              >
                <span className="text-lg lowercase">falar connosco</span>
                <BoomerangMark width={28} />
              </motion.a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-hair bg-ink/55 backdrop-blur-sm">
      <div className="shell py-16 md:py-20">
        <div className="grid gap-12 md:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <Wordmark className="h-[1.8rem] w-auto text-chalk" />
            <p className="body mt-6 max-w-xs text-ash">
              Estúdio de websites e identidade visual. Duas pessoas, alcance de agência.
            </p>
          </div>

          <div>
            <p className="mono text-ash-2">navegação</p>
            <ul className="mt-5 space-y-3">
              {NAV.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="body text-ash transition-colors hover:text-chalk"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mono text-ash-2">contacto</p>
            <ul className="mt-5 space-y-3">
              <li>
                <a href="mailto:ola@nevima.pt" className="body text-chalk hover:text-chalk/45">
                  ola@nevima.pt
                </a>
              </li>
              <li className="body text-ash">Portugal &mdash; remoto</li>
              <li className="body text-ash">resposta em 24h úteis</li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-hair pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="mono text-ash-2">&copy; {new Date().getFullYear()} nevima</p>
          <p className="mono text-ash-2">
            menos estrutura <span className="text-chalk/45">/</span> mais alcance
          </p>
        </div>
      </div>
    </footer>
  );
}
