/* ==================================================================
   Languages

   The site is in English at its own addresses and in European
   Portuguese under /pt (user, 2026-10-18), with the words of its
   addresses in Portuguese (user, 2026-11-03): "/about" is "/pt/sobre",
   the home page is "/pt". The language is read from the address, so a
   page, a link and the server all agree on it without anything stored.

   The Portuguese is not a translation word for word, nor one that
   changes what is said: the same reasoning and meaning, written the way
   it would be said in Portugal, with the spelling of the current
   agreement, as in the studio's contract. The reader is never addressed
   as "tu", nor as "você" or "o senhor" (user, 2026-10-18): sentences are
   recast as impersonal or from the studio's side, with "o cliente" where
   a subject is needed and buttons in the infinitive.
   ================================================================== */

export type Lang = "en" | "pt";

/** The same words in both languages. */
export type Copy<T = string> = { en: T; pt: T };

export const PT_PREFIX = "/pt";

/** The Portuguese address of every page whose words are translated
    (user, 2026-11-03): "/about" is "/pt/sobre". The words in an address
    are shown in search results and in a shared link, so they are in the
    page's language; once the site is live an address never changes
    without a redirect (docs/seo-decisions.md). No accents, so a copied
    link stays legible. A page left out keeps its English words under
    /pt: "/cookies", and the pages the studio's emails link to
    ("/meeting", "/mid-call"), which search engines never see. A new page
    with words in its address gets its line here (the SEO check in
    audit/seo-check.mjs fails a Portuguese link that is not on the site). */
const PT_PATHS: Record<string, string> = {
  "/about": "/sobre",
  "/portfolio": "/portefolio",
  "/side-by-side": "/lado-a-lado",
  "/services/visual-identity": "/servicos/identidade-visual",
  "/services/seo": "/servicos/seo",
  "/services/back-end-features": "/servicos/funcionalidades-back-end",
  "/services/photo-shoot": "/servicos/sessao-fotografica",
  "/privacy": "/privacidade",
  "/terms": "/termos",
  "/legal-notice": "/aviso-legal",
  "/accessibility": "/acessibilidade",
  "/ai": "/ia",
};

const EN_PATHS: Record<string, string> = Object.fromEntries(
  Object.entries(PT_PATHS).map(([en, pt]) => [pt, en]),
);

/** The language a path of the site is in. */
export function langOf(pathname: string): Lang {
  return pathname === PT_PREFIX || pathname.startsWith(`${PT_PREFIX}/`) ? "pt" : "en";
}

/** A path with its language taken off, in the English words the code
    names pages by: "/pt/sobre" is "/about", "/pt" is "/". */
export function basePath(pathname: string): string {
  if (langOf(pathname) === "en") return pathname || "/";
  const path = pathname.slice(PT_PREFIX.length) || "/";
  return EN_PATHS[path] ?? path;
}

/** A link of the site, in a language. Paths are prefixed and their words
    translated ("/about" is "/pt/sobre", "/#services" is "/pt#services");
    a place on the same page ("#top"), another site and an email address
    are left as they are. */
export function localize(href: string, lang: Lang): string {
  if (lang === "en" || !href.startsWith("/") || href.startsWith("//")) return href;
  if (langOf(href.split(/[?#]/)[0]) === "pt") return href;
  const at = href.search(/[?#]/);
  const path = at === -1 ? href : href.slice(0, at);
  const rest = at === -1 ? "" : href.slice(at);
  return (path === "/" ? PT_PREFIX : `${PT_PREFIX}${PT_PATHS[path] ?? path}`) + rest;
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
