# Languages

- 2026-10-18 (user): a Portuguese version of the whole site, with a button to change language (bar or foot: our choice). Not a word-for-word translation, nor one that changes the content: the same reasoning and meaning, adapted so it sounds natural in European Portuguese.

## How it works

- English stays at its addresses; Portuguese is under `/pt` (`/pt`, `/pt/about`, `/pt/portfolio`, `/pt/services/<slug>`). The routes in `src/app/pt/` render the same components; nothing is stored, the address decides.
- `src/lib/i18n.ts`: `langOf`, `basePath`, `localize` (a site link in a language), `switchPath`, `translator`, `alternates` (canonical + hreflang). `src/lib/use-lang.ts`: `useLang`, `useT` (`t("Close", "Fechar")` or `t(COPY)`), `useHref`.
- Copy lives where it did, with its Portuguese beside it: inline `t(en, pt)` pairs, `Copy` objects, or a `PT` record by id/slug for data (`services.ts`, `work.ts`, process steps, FAQ, comparison rows, values, co-founders, mission and vision).
- The proposal form's options carry `pt` / `notePt` (`questions.ts`, `inLang`); `/api/estimate` and `/api/proposal` take `lang` and the estimate's labels and notes come back in it. The request logged for the studio records the visitor's language. Euros are written `650 €` in Portuguese.
- `<html lang>`: the root layout serves both languages, so the server writes `en`; a line in the head sets `pt-PT` before paint on `/pt` pages and `HtmlLang` keeps it right on router moves. Each page has its canonical and hreflang alternates; the Portuguese layout carries Portuguese title, description and `og:locale`.
- The switch: footer bottom row, "English / Português", each named in itself, the current one inked. The bar was left alone (its contents are fixed by the user). Following it opens the same page in the other language, kept as far from the page's end as the visitor was (`keepLangSpot`, read by `ReturnKeeper`), so changing language at the foot leaves you at the foot. On the home page the opening is not replayed (router move).
- The portfolio has no foot, so no switch: it follows the language it was entered from; "Exit portfolio" returns to the same language.

## Writing

- European Portuguese, the reader addressed as "tu" (the user's own "e mais dinheiro para ti"), spelling of the current agreement (as in the contract: projeto, setor, ótimo).
- Mission, vision and values start from the studio's own Portuguese originals (`docs/about-decisions.md`), carried to the content the English has now.
- Glossary: hosting → alojamento; photo shoot → sessão fotográfica; estimate → estimativa; quote → orçamento; free proposal → proposta gratuita; feedback call → chamada de acompanhamento (the contract's term); working days → dias úteis; logo → logótipo; portfolio → portefólio; web development, SEO, GEO, know-how, landing page stay as they are. Service names: Web Design, Identidade Visual, SEO, GEO, Sessão Fotográfica. Design levels: Essencial+, Avançado.
- Headline: "Criamos websites que contam. / inspiram confiança. / trazem clientes. / captam atenção." The services title plays "Fazemos só websites" → "Fazemos muito mais do que websites".
- Layout fitted to the copy, never the other way round: the home subtitle's first sentence is set on two lines in Portuguese so it stays beside the headline; soft hyphens in the studio statement (jovens, amigos, nascemos) keep its justified lines even. On phones under ~440px the portfolio's two buttons stack in Portuguese (the CSS's own wrap; English stacks under ~380px).
- The invisible placeholder form under the index (`proposal-form.tsx`) is translated too, so no English text sits in the Portuguese page.
