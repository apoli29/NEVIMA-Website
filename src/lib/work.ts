/* ==================================================================
   The studio's work, in one place: the portfolio's cards and the large
   card each one opens are set from these records.

   The two projects so far are the studio's only web design and visual
   identity work; Estamento de Gerona is still being made. Every
   field the studio has not given yet is null, and the pages show it as
   TO_FILL, so nothing about a client is made up in the meantime.

   What a project says in Portuguese is kept beside it (PT, by slug):
   projectsIn() gives the list in a page's language. The services stay
   named in English, as the report finds its chapters by them;
   serviceLabel() gives each name in a language.
   ================================================================== */

import type { Lang } from "./i18n";

/** What the pages show where the studio has not filled a field in yet. */
export const TO_FILL = "[a preencher]";

export type Project = {
  slug: string;
  name: string;
  /** the client's line of business */
  sector: string | null;
  /** the visual identity's style, in a few words */
  identity: string | null;
  /** what kind of website it is (institutional, landing page, shop...) */
  websiteType: string | null;
  /** how far the design was taken (the studio's own scale) */
  designLevel: string | null;
  /** how many pages the website has */
  pages: string | null;
  /** what the studio made for it */
  scope: string | null;
  /** the studio's services it took, as the services list names them
      (user, 2026-10-12) */
  services: string[];
  year: string | null;
  /** live, or still being made: a project in production has no site to show */
  status: "live" | "in-production";
  /** the live website, once there is one */
  url: string | null;
  /** a few sentences about the website itself */
  about: string | null;
  /** the project's full report: a page on this site, once it is built */
  report: string | null;
  /** A stand-in photo until the studio has the project's own images
      (user, 2026-10-11: "fotos imaginárias", to be changed). */
  photo: { src: string; credit: string; alt: string };
  /** Two or three sentences on what was made, set justified on the photo
      when it is pointed at and under the name on the report's cover.
      Stand-ins written by the site until the studio sends its own (user,
      2026-10-12: "inventa para os 2 por agora"). */
  summary: string;
  /** The project report (see docs/report-template.md). */
  study: CaseStudy;
};

/* ==================================================================
   The project report

   One structure for every project (see docs/report-template.md): the
   overview, then a chapter for each service the project took, each with
   only what that service needs. Nothing about a client is made up: every
   field the studio has not given is null and reads as TO_FILL.
   ================================================================== */

export type CaseStudy = {
  /** Web Design: the website, in one justified paragraph */
  website: string | null;
  /** the languages the website is in, e.g. "Portuguese, English" */
  languages: string | null;
  /** with Visual identity */
  identity: {
    /** the idea behind it, a few sentences */
    idea: string | null;
    /** the brand before and after, as images in /public, the same size */
    before: string | null;
    after: string | null;
  };
  /** with SEO */
  seo: {
    /** the searches the website is set up to be found in */
    searches: string[] | null;
    /** what was put in place, a few short lines */
    work: string[] | null;
    /** where it stood before and after, as positions or a share; never
        traffic numbers the client has not agreed to show */
    before: string | null;
    after: string | null;
  };
  /** with GEO */
  geo: {
    /** what was put in place, a few short lines */
    work: string[] | null;
    /** how the business shows in AI answers now, in a sentence */
    presence: string | null;
  };
  /** with Photo shoot */
  shoot: {
    photos: string | null;
    videos: string | null;
    /** what was photographed, in a sentence */
    subject: string | null;
  };
};

/** A report the studio has not filled in yet. */
const emptyStudy = (): CaseStudy => ({
  website: null,
  languages: null,
  identity: { idea: null, before: null, after: null },
  seo: { searches: null, work: null, before: null, after: null },
  geo: { work: null, presence: null },
  shoot: { photos: null, videos: null, subject: null },
});

/** A free Unsplash photo, at a width the cards can use. */
const unsplash = (id: string) => `https://unsplash.com/photos/${id}/download?w=1400`;

export const PROJECTS: Project[] = [
  {
    slug: "bsmartish",
    name: "Bsmartish",
    sector: null,
    identity: null,
    websiteType: null,
    designLevel: null,
    pages: null,
    scope: null,
    services: ["Web design", "Visual identity", "SEO", "GEO"],
    year: null,
    status: "live",
    url: "https://www.bsmartish.pt",
    about: null,
    report: null,
    photo: {
      src: unsplash("gEN5Btvf2Eg"),
      credit: "Michael Dziedzic, Unsplash",
      alt: "A glass sphere and a prism lit red on a dark surface",
    },
    summary:
      "A website and a visual identity made together, so the brand reads the same wherever it is met. Fast, clear on every screen, and set up to be found on Google and in AI answers.",
    study: emptyStudy(),
  },
  {
    slug: "estamento-de-gerona",
    name: "Estamento de Gerona",
    sector: null,
    identity: null,
    websiteType: null,
    designLevel: null,
    pages: null,
    scope: null,
    services: ["Web design", "Visual identity"],
    year: null,
    status: "in-production",
    url: null,
    about: null,
    report: null,
    photo: {
      src: unsplash("_vLUCVQrLYg"),
      credit: "Maria Lupan, Unsplash",
      alt: "Coloured houses along a river in Girona",
    },
    summary:
      "A website and the identity behind it, designed as one piece. A calm, clear structure that presents the project with confidence, with room to grow as its content arrives.",
    study: emptyStudy(),
  },
];

/** What each project says in Portuguese; everything else is shared. */
const PT: Record<string, { summary: string; alt: string }> = {
  bsmartish: {
    summary:
      "Um website e uma identidade visual feitos em conjunto, para que a marca transmita a mesma imagem em todo o lado. Rápido, claro em qualquer ecrã, e preparado para ser encontrado no Google e nas respostas da IA.",
    alt: "Uma esfera de vidro e um prisma iluminados a vermelho sobre uma superfície escura",
  },
  "estamento-de-gerona": {
    summary:
      "Um website e a identidade por trás dele, desenhados como uma só peça. Uma estrutura calma e clara, que apresenta o projeto com confiança e tem espaço para crescer à medida que o conteúdo for surgindo.",
    alt: "Casas coloridas ao longo de um rio, em Girona",
  },
};

/** The projects, in a language. */
export const projectsIn = (lang: Lang): Project[] =>
  lang === "pt"
    ? PROJECTS.map((project) => {
        const pt = PT[project.slug];
        return pt ? { ...project, summary: pt.summary, photo: { ...project.photo, alt: pt.alt } } : project;
      })
    : PROJECTS;

const SERVICE_PT: Record<string, string> = {
  "Web design": "Web design",
  "Visual identity": "Identidade visual",
  SEO: "SEO",
  GEO: "GEO",
  "Photo shoot": "Sessão fotográfica",
};

/** A service as a project lists it, in a language. */
export const serviceLabel = (name: string, lang: Lang) => (lang === "pt" ? (SERVICE_PT[name] ?? name) : name);

export const workPath = (slug: string) => `/work/${slug}`;
export const previewPath = (slug: string) => `/work/${slug}/preview`;

export const findProject = (slug: string) => PROJECTS.find((project) => project.slug === slug);

/** A field as the pages show it. */
export const shown = (value: string | null) => value ?? TO_FILL;

export const STATUS_LABEL: Record<Project["status"], string> = {
  live: "Live",
  "in-production": "In production",
};

export const STATUS_LABEL_PT: Record<Project["status"], string> = {
  live: "Online",
  "in-production": "Em produção",
};
