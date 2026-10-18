"use client";

import { useCallback, useMemo } from "react";
import { usePathname } from "next/navigation";
import { langOf, localize, translator, type Lang } from "./i18n";

/** The language of the page on screen, read from its address. */
export function useLang(): Lang {
  return langOf(usePathname() ?? "/");
}

/** The words for the page's language (see translator). */
export function useT() {
  const lang = useLang();
  return useMemo(() => translator(lang), [lang]);
}

/** A link of the site, in the page's language. */
export function useHref() {
  const lang = useLang();
  return useCallback((href: string) => localize(href, lang), [lang]);
}
