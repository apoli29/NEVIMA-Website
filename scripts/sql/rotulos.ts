/* ==================================================================
   Writes the Portuguese labels of every answer into the SQL script

   The answers reach SQL Server as the site's ids ("health", "4-6"):
   dbo.Rotulos turns them into the words the form shows in Portuguese
   ("Saúde", "4–6"), for vw_Pedidos, vw_Parcerias and the two ficha
   procedures. The labels come from the form's own lists, so they never
   drift from it: run this after any change to an option, then run
   nevima-db.sql again in the Nevima database.

     npx tsx scripts/sql/rotulos.ts

   It rewrites only the part of scripts/sql/nevima-db.sql between the
   "-- <rotulos>" and "-- </rotulos>" lines.
   ================================================================== */

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  AUDIENCES,
  COUNTRIES,
  DESIGN,
  FEATURES,
  FORM_KINDS,
  LANGUAGES,
  PAGE_MODES,
  PAGE_TYPES,
  PAGES,
  PHOTO_PLANS,
  REACH,
  REGIONS,
  SEARCH_PLANS,
  SECTORS,
  SERVICES,
  TEXTS,
  YES_NO,
} from "../../src/lib/proposal/questions";
import {
  BUDGETS,
  CREDITS,
  DELIVERIES,
  MODELS,
  PARTNER_YES_NO,
  PROJECT_TYPES,
  SCREENS,
  STARTS,
} from "../../src/lib/proposal/partner";

type Option = { readonly id: string; readonly pt: string };

/* The list's name here is the name dbo.Perguntas uses in "Lista". */
const LISTS: Record<string, readonly Option[]> = {
  SERVICES,
  AUDIENCES,
  SECTORS,
  COUNTRIES,
  PAGES,
  PAGE_MODES,
  PAGE_TYPES,
  LANGUAGES,
  FEATURES,
  FORM_KINDS,
  DESIGN,
  TEXTS,
  YES_NO,
  PHOTO_PLANS,
  REGIONS,
  SEARCH_PLANS,
  REACH,
  PROJECT_TYPES,
  SCREENS,
  STARTS,
  DELIVERIES,
  MODELS,
  BUDGETS,
  CREDITS,
  PARTNER_YES_NO,
};

const quote = (value: string) => `N'${value.replace(/'/g, "''")}'`;

const rows = Object.entries(LISTS).flatMap(([list, options]) =>
  options.map((o) => `    (${quote(list)}, ${quote(o.id)}, ${quote(o.pt)})`),
);

const block = [
  "-- <rotulos> (gerado por scripts/sql/rotulos.ts a partir das listas do formulário: não editar à mão)",
  "DELETE FROM dbo.Rotulos;",
  "INSERT INTO dbo.Rotulos (Lista, Codigo, Texto) VALUES",
  rows.join(",\n") + ";",
  "-- </rotulos>",
].join("\n");

const file = fileURLToPath(new URL("./nevima-db.sql", import.meta.url));
const sql = readFileSync(file, "utf8");
const start = sql.indexOf("-- <rotulos>");
const end = sql.indexOf("-- </rotulos>");
if (start < 0 || end < start) throw new Error("Faltam as marcas -- <rotulos> e -- </rotulos> em nevima-db.sql.");
writeFileSync(file, sql.slice(0, start) + block + sql.slice(end + "-- </rotulos>".length));
console.log(`${rows.length} rótulos escritos em scripts/sql/nevima-db.sql.`);
