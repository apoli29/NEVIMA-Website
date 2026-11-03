import type { Metadata } from "next";
import { alternates, localize, type Copy, type Lang } from "./i18n";
import { ACCESSIBILITY } from "./legal/accessibility";
import { AI_POLICY } from "./legal/ai";
import { COOKIES } from "./legal/cookies";
import { LEGAL_NOTICE } from "./legal/legal-notice";
import { PRIVACY } from "./legal/privacy";
import { TERMS } from "./legal/terms";
import type { LegalRecord } from "./legal/types";
import { SERVICES, findService, servicePath } from "./services";

/* ==================================================================
   What search engines are told

   Every page a search engine may see is listed here once: its address,
   whether it may be listed, its title and description in both languages.
   The page's metadata, the sitemap, the image a shared link shows and the
   structured data are all set from this list, so a page cannot be in the
   sitemap and closed to search engines at once, and a page that leaves
   its stand-in copy behind is opened by one word (`index`). A new page
   gets its line here. Decisions in docs/seo-decisions.md.

   Left out on purpose: the pages the studio's emails lead to
   (/meeting, /mid-call) and the studio's own (/interno), which are
   closed to search engines in their own metadata.
   ================================================================== */

export const SITE_URL = "https://nevima.studio";
export const SITE_NAME = "nevima";

/** The language as the Open Graph tags name it. */
const OG_LOCALE: Record<Lang, string> = { en: "en_US", pt: "pt_PT" };

export type SeoPage = {
  /** The page's address, in the English words the code names pages by. */
  path: string;
  /** Whether search engines may list it: false while its copy or its
      particulars are stand-ins. */
  index: boolean;
  /** The page's own title; the site's name is added after it, except on
      the home page, whose title is the whole line. */
  title: Copy;
  description: Copy;
  /** What a shared link shows, where it is not the title and description. */
  share?: { title: Copy; description: Copy };
  /** The words on the image a shared link shows (see src/app/og). */
  card: Copy;
  /** A service: described to search engines as one (see structured data). */
  service?: string;
};

const legal = (record: LegalRecord): SeoPage => ({
  path: record.slug,
  // Left out of search engines until the studio's address is filled in.
  index: false,
  title: { en: record.doc.en.title, pt: record.doc.pt.title },
  description: { en: record.doc.en.lede, pt: record.doc.pt.lede },
  card: { en: record.doc.en.title, pt: record.doc.pt.title },
});

export const SEO_PAGES: SeoPage[] = [
  {
    path: "/",
    index: true,
    title: {
      en: "nevima — websites and visual identity",
      pt: "nevima — websites e identidade visual",
    },
    description: {
      en: "Two people, the right tools: websites and visual identity on a par with much bigger agencies, without the red tape that usually comes with their size.",
      pt: "Duas pessoas, as ferramentas certas: websites e identidade visual ao nível de agências muito maiores, sem a burocracia que costuma vir com esse tamanho.",
    },
    share: {
      title: { en: "nevima — less structure, more reach", pt: "nevima — menos estrutura, mais alcance" },
      description: {
        en: "A website and visual identity studio. Two people, zero intermediaries, big-agency results.",
        pt: "Estúdio de websites e identidade visual. Duas pessoas, zero intermediários, resultados de agência grande.",
      },
    },
    card: { en: "Websites and visual identity", pt: "Websites e identidade visual" },
  },
  {
    path: "/about",
    // A template for now: its copy and figures are stand-ins.
    index: false,
    title: { en: "About", pt: "Sobre" },
    description: {
      en: "Two people, the right tools and nothing in between: the studio's mission, vision and values, how it works, and straight answers to what clients ask first.",
      pt: "Duas pessoas, as ferramentas certas e nada pelo meio: a missão, a visão e os valores do estúdio, como trabalha, e respostas diretas ao que os clientes perguntam primeiro.",
    },
    card: { en: "About nevima", pt: "Sobre a nevima" },
  },
  {
    path: "/portfolio",
    // Its fields and photos are still stand-ins.
    index: false,
    title: { en: "Portfolio", pt: "Portefólio" },
    description: {
      en: "The websites and visual identities Nevima has made, case by case.",
      pt: "Os websites e as identidades visuais que a Nevima fez, caso a caso.",
    },
    card: { en: "Portfolio", pt: "Portefólio" },
  },
  // Web design has no page of its own for now (docs/web-design-decisions.md).
  ...SERVICES.filter((service) => service.slug !== "web-design").map((service): SeoPage => {
    const en = findService(service.slug, "en")!;
    const pt = findService(service.slug, "pt")!;
    return {
      path: servicePath(service.slug),
      index: true,
      title: { en: en.title, pt: pt.title },
      description: { en: en.body, pt: pt.body },
      card: { en: en.title, pt: pt.title },
      service: service.slug,
    };
  }),
  legal(PRIVACY),
  legal(COOKIES),
  legal(TERMS),
  legal(LEGAL_NOTICE),
  legal(ACCESSIBILITY),
  legal(AI_POLICY),
];

export function seoPage(path: string): SeoPage {
  const page = SEO_PAGES.find((entry) => entry.path === path);
  if (!page) throw new Error(`No SEO entry for ${path} (src/lib/seo.ts)`);
  return page;
}

/** The full address of a page of the site, in a language. */
export const absolute = (path: string, lang: Lang) => `${SITE_URL}${localize(path, lang)}`;

/** Where the image a shared link shows is drawn (src/app/og). */
export const cardPath = (path: string, lang: Lang) => `/og/${lang}/${path === "/" ? "home" : path.slice(1)}`;

/** A search description stops at about 160 characters; a longer one is
    cut at the last whole word, so it never ends mid-word. The page itself
    keeps its words. */
function clip(text: string, max = 160) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[,;:.]$/, "")}…`;
}

/** A page's metadata: its title and description, its address in both
    languages, whether search engines may list it, and what a shared link
    shows. */
export function pageMetadata(path: string, lang: Lang): Metadata {
  const page = seoPage(path);
  const title = page.title[lang];
  const description = clip(page.description[lang]);
  const shareTitle = page.share?.title[lang] ?? (path === "/" ? title : `${title} · ${SITE_NAME}`);
  const shareDescription = clip(page.share?.description[lang] ?? page.description[lang], 200);
  const image = { url: cardPath(path, lang), width: 1200, height: 630, alt: shareTitle };
  return {
    title: path === "/" ? { absolute: title } : title,
    description,
    alternates: alternates(path, lang),
    robots: page.index ? undefined : { index: false, follow: true },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      url: localize(path, lang),
      locale: OG_LOCALE[lang],
      alternateLocale: OG_LOCALE[lang === "en" ? "pt" : "en"],
      title: shareTitle,
      description: shareDescription,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: shareTitle,
      description: shareDescription,
      images: [image.url],
    },
  };
}

/** The metadata every page starts from, in its language (the root
    layouts); a page listed above replaces what it names. */
export function siteMetadata(lang: Lang): Metadata {
  const home = seoPage("/");
  return {
    metadataBase: new URL(SITE_URL),
    applicationName: SITE_NAME,
    title: { default: home.title[lang], template: `%s · ${SITE_NAME}` },
    description: home.description[lang],
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: OG_LOCALE[lang],
      title: home.share!.title[lang],
      description: home.share!.description[lang],
      images: [{ url: cardPath("/", lang), width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image" },
  };
}

/* ==================================================================
   Structured data (schema.org, JSON-LD)

   The studio as an organisation, its two founders and the website, on
   every page; each service page adds the service and its place under the
   home page. Only what is settled is said: no address (not decided yet),
   no profiles elsewhere (none yet; when there are, they go in `sameAs`,
   the same ones as the footer's), nothing about prices.
   ================================================================== */

const ORG_ID = `${SITE_URL}/#organization`;
const SITE_ID = `${SITE_URL}/#website`;

/** The founders, as the about page names them (cofounders.tsx). */
const FOUNDERS: { id: string; name: string; role: Copy }[] = [
  { id: "emanuel-costa", name: "Emanuel Costa", role: { en: "Co-founder", pt: "Cofundador" } },
  { id: "antonio-policarpo", name: "António Policarpo", role: { en: "Co-founder", pt: "Cofundador" } },
];

/** Profiles of the studio elsewhere, the same as the footer shows. None yet. */
const SAME_AS: string[] = [];

export function siteGraph(lang: Lang) {
  const home = seoPage("/");
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": ORG_ID,
        name: SITE_NAME,
        alternateName: "Nevima",
        url: SITE_URL,
        // The site's icon, drawn square at 512px (src/app/logo.png).
        logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png`, width: 512, height: 512 },
        description: home.description[lang],
        email: "ola@nevima.studio",
        knowsLanguage: ["en", "pt-PT"],
        founder: FOUNDERS.map((person) => ({ "@id": `${SITE_URL}/#${person.id}` })),
        ...(SAME_AS.length ? { sameAs: SAME_AS } : {}),
      },
      ...FOUNDERS.map((person) => ({
        "@type": "Person",
        "@id": `${SITE_URL}/#${person.id}`,
        name: person.name,
        jobTitle: person.role[lang],
        worksFor: { "@id": ORG_ID },
      })),
      {
        "@type": "WebSite",
        "@id": SITE_ID,
        name: SITE_NAME,
        alternateName: "Nevima",
        url: SITE_URL,
        inLanguage: ["en", "pt-PT"],
        publisher: { "@id": ORG_ID },
      },
    ],
  };
}

export function serviceGraph(slug: string, lang: Lang) {
  const service = findService(slug, lang)!;
  const path = servicePath(slug);
  const url = absolute(path, lang);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": `${url}#service`,
        name: service.full ? `${service.title} (${service.full})` : service.title,
        description: service.body,
        url,
        provider: { "@id": ORG_ID },
        inLanguage: lang === "pt" ? "pt-PT" : "en",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: SITE_NAME, item: absolute("/", lang) },
          { "@type": "ListItem", position: 2, name: service.title, item: url },
        ],
      },
    ],
  };
}
