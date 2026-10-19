/* ==================================================================
   The legal pages, as data

   Each document is written twice, in European Portuguese and in English,
   with the same sections in the same order; the Portuguese is the one
   that counts. Text is plain, with three marks only:

   - [words](/path or https://…) is a link; a path of the site is taken
     to the page's language;
   - **words** is set in bold;
   - [CAPITALS_LIKE_THIS] is a blank the studio still has to fill (the
     address, for one), set apart so it is never missed.
   ================================================================== */

import type { Copy } from "../i18n";

export type LegalBlock =
  | { p: string }
  | { list: readonly string[] }
  | { table: { head: readonly string[]; rows: readonly (readonly string[])[] } };

export type LegalSection = {
  /** The anchor, the same in both languages. */
  id: string;
  title: string;
  blocks: readonly LegalBlock[];
};

export type LegalDoc = {
  title: string;
  /** One sentence under the title: what the page is for. */
  lede: string;
  /** The plain-language summary, when the document has one. */
  summary?: readonly string[];
  sections: readonly LegalSection[];
};

export type LegalVersion = {
  version: string;
  /** In force from, YYYY-MM-DD. */
  effective: string;
  /** Last changed, YYYY-MM-DD. */
  updated: string;
  history: readonly { version: string; date: string; change: Copy }[];
};

export type LegalRecord = LegalVersion & { slug: string; doc: Copy<LegalDoc> };
