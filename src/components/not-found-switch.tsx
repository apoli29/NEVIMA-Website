"use client";

import { useEffect, useState } from "react";
import { NotFoundPage } from "./not-found-page";

/* The missing page is drawn once, at build time, for every address the
   site does not have (src/app/global-not-found.tsx), so the server cannot
   know which language it was asked in. It is drawn here as soon as the
   page is in the browser, where the address is known, so a Portuguese
   address never shows the English words first. Until then the document
   is the bare site (its language already set from the address, see
   NOT_FOUND_LANG_SCRIPT); without scripts, a line in both languages. */

export const NOT_FOUND_LANG_SCRIPT = `if(/^\\/pt(\\/|$)/.test(location.pathname))document.documentElement.lang="pt-PT"`;

export function NotFoundSwitch() {
  const [here, setHere] = useState(false);
  useEffect(() => setHere(true), []);
  return here ? (
    <NotFoundPage />
  ) : (
    <noscript>
      <main className="shell nf-page">
        <h1 className="display nf-title">This page doesn’t exist.</h1>
        <p className="nf-lede" lang="pt-PT">
          Esta página não existe.
        </p>
        <p className="nf-lede">
          <a href="/">nevima</a> · <a href="/pt">nevima em português</a>
        </p>
      </main>
    </noscript>
  );
}
