"use client";

import { useEffect } from "react";
import { HTML_LANG } from "@/lib/i18n";
import { useLang } from "@/lib/use-lang";

/* The document says which language it is in. One root layout serves
   both languages, so the server writes English; a line in the head sets
   Portuguese before the first paint on a /pt page (see LANG_SCRIPT), and
   this keeps it right as the router moves between the two. */

export const LANG_SCRIPT = `if(/^\\/pt(\\/|$)/.test(location.pathname))document.documentElement.lang="${HTML_LANG.pt}"`;

export function HtmlLang() {
  const lang = useLang();
  useEffect(() => {
    document.documentElement.lang = HTML_LANG[lang];
  }, [lang]);
  return null;
}
