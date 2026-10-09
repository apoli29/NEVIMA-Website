/* ==================================================================
   The studio's work, in one place: the web design page's plates, each
   project's own page and its preview are all set from these records.

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
  /** what the studio made for it */
  scope: string | null;
  year: string | null;
  /** live, or still being made: a project in production has no site to show */
  status: "live" | "in-production";
  /** the live website, once there is one */
  url: string | null;
  /** a few sentences about the website itself */
  about: string | null;
  /** the project's full report: a page on this site, once it is built */
  report: string | null;
};

export const PROJECTS: Project[] = [
  {
    slug: "bsmartish",
    name: "Bsmartish",
    sector: null,
    identity: null,
    scope: null,
    year: null,
    status: "live",
    url: "https://bsmartish.pt",
    about: null,
    report: null,
  },
  {
    slug: "estamento-de-gerona",
    name: "Estamento de Gerona",
    sector: null,
    identity: null,
    scope: null,
    year: null,
    status: "in-production",
    url: null,
    about: null,
    report: null,
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
