/* ==================================================================
   The studio's work, in one place: the portfolio's cards and the large
   card each one opens are set from these records.

   The two projects so far are the studio's only web design and visual
   identity work; Estamento de Gerona is still being made. Every
   field the studio has not given yet is null, and the pages show it as
   TO_FILL, so nothing about a client is made up in the meantime.
   ================================================================== */

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
};

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
  },
];

export const workPath = (slug: string) => `/work/${slug}`;
export const previewPath = (slug: string) => `/work/${slug}/preview`;

export const findProject = (slug: string) => PROJECTS.find((project) => project.slug === slug);

/** A field as the pages show it. */
export const shown = (value: string | null) => value ?? TO_FILL;

export const STATUS_LABEL: Record<Project["status"], string> = {
  live: "Live",
  "in-production": "In production",
};
