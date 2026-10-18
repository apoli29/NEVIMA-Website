/* ==================================================================
   Languages

   The site is in English at its own addresses and in European
   Portuguese under /pt (user, 2026-10-18): "/about" is "/pt/about",
   the home page is "/pt". The language is read from the address, so a
   page, a link and the server all agree on it without anything stored.

   The Portuguese is not a translation word for word, nor one that
   changes what is said: the same reasoning and meaning, written the way
   it would be said in Portugal, addressing the reader as "tu" (the
   user's own "e mais dinheiro para ti"), with the spelling of the
   current agreement, as in the studio's contract.
   ================================================================== */

export type Lang = "en" | "pt";

/** The same words in both languages. */
export type Copy<T = string> = { en: T; pt: T };

export const PT_PREFIX = "/pt";

/** The language a path of the site is in. */
export function langOf(pathname: string): Lang {
  return pathname === PT_PREFIX || pathname.startsWith(`${PT_PREFIX}/`) ? "pt" : "en";
}

/** A path with its language taken off: "/pt/about" is "/about", "/pt" is "/". */
export function basePath(pathname: string): string {
  if (langOf(pathname) === "en") return pathname || "/";
  return pathname.slice(PT_PREFIX.length) || "/";
}

/** A link of the site, in a language. Paths are prefixed ("/about" is
    "/pt/about", "/#services" is "/pt#services"); a place on the same
    page ("#top"), another site and an email address are left as they are. */
export function localize(href: string, lang: Lang): string {
  if (lang === "en" || !href.startsWith("/") || href.startsWith("//")) return href;
  if (langOf(href.split(/[?#]/)[0]) === "pt") return href;
  const at = href.search(/[?#]/);
  const path = at === -1 ? href : href.slice(0, at);
  const rest = at === -1 ? "" : href.slice(at);
  return (path === "/" ? PT_PREFIX : `${PT_PREFIX}${path}`) + rest;
}

/** The same page in the other language. */
export function switchPath(pathname: string, to: Lang): string {
  return localize(basePath(pathname), to);
}

/** One of two, by language. */
export const pick = <T>(lang: Lang, en: T, pt: T): T => (lang === "pt" ? pt : en);

/** Picks the words for a language: t("Close", "Fechar"), or t(COPY) for
    a pair kept elsewhere. Anything can be picked, a node too. */
export type Translate = {
  <T>(en: T, pt: T): T;
  <T>(copy: Copy<T>): T;
};

export function translator(lang: Lang): Translate {
  return ((...args: unknown[]) =>
    args.length === 1 ? (args[0] as Copy<unknown>)[lang] : args[lang === "pt" ? 1 : 0]) as Translate;
}

/** The language as the document names it. */
export const HTML_LANG: Record<Lang, string> = { en: "en", pt: "pt-PT" };

/** Each language's name in itself, for the switch. */
export const LANG_NAME: Record<Lang, string> = { en: "English", pt: "Português" };

/** The alternates a page gives search engines: the same page in each
    language, English as the default. */
export function alternates(path: string, lang: Lang) {
  return {
    canonical: localize(path, lang),
    languages: {
      en: path,
      "pt-PT": localize(path, "pt"),
      "x-default": path,
    },
  };
}
