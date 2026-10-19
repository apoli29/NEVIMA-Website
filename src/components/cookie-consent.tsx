"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  CATEGORIES,
  categoriesInUse,
  onConsent,
  onOpenConsent,
  readConsent,
  saveConsent,
  type ConsentCategory,
  type ConsentChoice,
} from "@/lib/consent";
import { useHref, useT } from "@/lib/use-lang";

/* ==================================================================
   Cookie banner and preferences (see src/lib/consent.ts)

   Mounted once, in the layout. The banner only appears when the site
   has a non-essential service and the visitor has not chosen yet: today
   it never does. The preferences open from the foot's "Cookie
   preferences" at any time; with nothing to choose, they say so.
   Refusing is one press, the same as accepting, and nothing is ticked
   in advance.
   ================================================================== */

export function CookieConsent() {
  const t = useT();
  const href = useHref();
  const [choice, setChoice] = useState<ConsentChoice | null>(null);
  const [ready, setReady] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const inUse = categoriesInUse();
  const [draft, setDraft] = useState<Record<ConsentCategory, boolean>>({ analytics: false, marketing: false });

  useEffect(() => {
    setChoice(readConsent());
    setReady(true);
    const offConsent = onConsent(setChoice);
    const offOpen = onOpenConsent(() => {
      const now = readConsent();
      setDraft({ analytics: now?.analytics ?? false, marketing: now?.marketing ?? false });
      dialog.current?.showModal();
    });
    return () => {
      offConsent();
      offOpen();
    };
  }, []);

  const decide = (value: Record<ConsentCategory, boolean>) => {
    saveConsent(value);
    dialog.current?.close();
  };
  const all = (on: boolean) => ({ analytics: on && inUse.includes("analytics"), marketing: on && inUse.includes("marketing") });

  const showBanner = ready && inUse.length > 0 && !choice;

  return (
    <>
      {showBanner && (
        <section role="region" aria-label={t("Cookies", "Cookies")} className="ck-banner">
          <p className="ck-text">
            {t(
              "We'd like to use cookies to understand how the site is used. Nothing is stored until you choose. ",
              "Gostaríamos de usar cookies para perceber como o website é usado. Nada é guardado antes de uma escolha. ",
            )}
            <a href={href("/cookies")} className="underline underline-offset-2">
              {t("Cookie Policy", "Política de Cookies")}
            </a>
          </p>
          <div className="ck-actions">
            <button type="button" className="ck-btn" onClick={() => decide(all(false))}>
              {t("Refuse", "Recusar")}
            </button>
            <button type="button" className="ck-btn" onClick={() => decide(all(true))}>
              {t("Accept", "Aceitar")}
            </button>
            <button
              type="button"
              className="ck-link"
              onClick={() => {
                setDraft(all(false));
                dialog.current?.showModal();
              }}
            >
              {t("Choose", "Escolher")}
            </button>
          </div>
        </section>
      )}

      <dialog ref={dialog} aria-labelledby="ck-title" className="ck-dialog">
        <h2 id="ck-title" className="ck-title">
          {t("Cookie preferences", "Preferências de cookies")}
        </h2>
        {inUse.length === 0 ? (
          <p className="ck-text">
            {t(
              "This website uses no cookies and nothing else that needs your permission. It only keeps in your browser what is needed for things you ask it to do. ",
              "De momento, este website não usa cookies nem nada que precise de autorização. Guarda no navegador apenas o necessário para funções pedidas por quem o visita. ",
            )}
            <a href={href("/cookies")} className="underline underline-offset-2">
              {t("Cookie Policy", "Política de Cookies")}
            </a>
          </p>
        ) : (
          <ul className="ck-list">
            <li className="ck-row">
              <span>
                <strong>{t("Strictly necessary", "Estritamente necessários")}</strong>
                <span className="ck-note">{t("Always on: the site needs them to work.", "Sempre ativos: o website precisa deles para funcionar.")}</span>
              </span>
              <input type="checkbox" checked disabled aria-label={t("Strictly necessary", "Estritamente necessários")} />
            </li>
            {inUse.map((c) => (
              <li key={c} className="ck-row">
                <label htmlFor={`ck-${c}`}>
                  <strong>{t(CATEGORIES[c].name)}</strong>
                  <span className="ck-note">{t(CATEGORIES[c].text)}</span>
                </label>
                <input
                  id={`ck-${c}`}
                  type="checkbox"
                  checked={draft[c]}
                  onChange={(e) => setDraft({ ...draft, [c]: e.target.checked })}
                />
              </li>
            ))}
          </ul>
        )}
        <div className="ck-actions">
          {inUse.length > 0 && (
            <>
              <button type="button" className="ck-btn" onClick={() => decide(all(false))}>
                {t("Refuse all", "Recusar tudo")}
              </button>
              <button type="button" className="ck-btn" onClick={() => decide(draft)}>
                {t("Save choices", "Guardar escolhas")}
              </button>
              <button type="button" className="ck-btn" onClick={() => decide(all(true))}>
                {t("Accept all", "Aceitar tudo")}
              </button>
            </>
          )}
          <button type="button" className="ck-link" onClick={() => dialog.current?.close()}>
            {t("Close", "Fechar")}
          </button>
        </div>
      </dialog>
    </>
  );
}

/** What may only load with consent: a script, a pixel, an embed. Shown
    once the visitor has agreed to its category, never before. */
export function Consented({ category, children }: { category: ConsentCategory; children: ReactNode }) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    setOn(readConsent()?.[category] ?? false);
    return onConsent((choice) => setOn(choice?.[category] ?? false));
  }, [category]);
  return on ? <>{children}</> : null;
}
