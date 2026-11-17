# SEO & GEO page: decisions

The SEO & GEO service has its own page (`/services/seo`, `/pt/servicos/seo`; `seo-geo.tsx`, styled `.sg-*`), built on 2026-11-16 (user). Nothing of the template the other service pages use (`service-page.tsx`: photo hero, description, plate, other services) is used there; `ServicePage` hands the `seo` slug to `SeoGeo`. The address, the `SEO_PAGES` line, the structured data, the bar, `WorkTogether` and the footer stay as they were. The SEO plate in `service-depth.tsx` is no longer shown anywhere but stays in the code.

References found through Inspo: Aspen Search (Swiss grid, dithered texture for what cannot be read), Linked by Air (a fine chart on a dark ground); the scramble is the one the side-by-side page already uses (Linear). Adapted to the site: square, hairlines, Satoshi titles with a light and a medium line, Geist Mono labels, the side-by-side dark ground (`.sbs-ground`), the bar's switch (`Switch` in `sbs-shared.tsx`).

## The sections (user's choices, 2026-11-16)

1. **"O motor de busca só recomenda websites que comuniquem na sua língua."** (dark). The studio's SEO definition beside a results page: the query types itself, an invented business (Clínica Aurora, Vila Nova de Gaia) sits on page 4 with its result in noise, and is decoded and moved to first place, with what the engine reads (title, description, address, hours, reviews) set as tags. A "Sem SEO / Com SEO" switch lets the visitor go back and forth; it plays once by itself when first seen.
   - **GEO: "E agora, com a Inteligência Artificial, o raciocínio é o mesmo."** (white). The user's line ("A IA só recomenda negócios quando eles próprios fazem questão de garantir que a IA os percebe.") and the studio's GEO definition, beside an AI assistant asked the same question: without GEO it names no one and cites no source; with GEO it names the clinic and cites its website. Plays once by itself, then a switch.
2. **The impact of each level** (dark). One chart, twelve months of visibility in a related search, three curves: basic (stays low), one-off (rises fast, then fades), monthly (rises and keeps climbing). A switch picks the level and shows its text; moving along the chart reads off the month and where the business sits in a search by name (always 1st) and in a related search. Marked "Ilustrativo": the curves are a picture of the argument, not data.
3. **Price** (white). A calculator: the size of the website (a landing page to 10 pages) gives the one-off work and the monthly service, then the free-proposal button.
   - Worked out on the server (`src/lib/proposal/seo-table.ts`) from `PRICING`, by the form's own rule (one-off 22.5% of the website, monthly 30% of the one-off, lowest end down to 5, highest up). A size is Home, About and Contact plus the average of the usual pages (services, testimonials, FAQ, gallery, team, process, prices, portfolio), in Portugal with Essential+. It reads "Estimativa para Portugal, com o design Essencial+. O valor final fica definido na proposta gratuita."

## Copy

- The monthly maintenance text was not written; the user approved this draft: "Todos os meses, acompanhamos as mudanças nas pesquisas e no comportamento dos utilizadores e ajustamos o SEO e o GEO do website, para manter e fazer crescer os resultados do trabalho pontual."
- The basic and one-off texts are the user's, with the writing fixed; the "X activity in city Y" example became the page's own ("clínicas de estética em Vila Nova de Gaia").
- Headings written for the page: "Básico, único ou mensal: / doze meses de cada um." and "Quanto custa, / à medida do website."
- The demonstrations say they are invented, as the side-by-side page does. Nothing imitates a real search engine or assistant.

## Open

- Whether the page should say how the price is worked out in percentages, as the form does (it says it only in words now).
- The chart's curves are illustrative; replace them with real figures once the studio has some.
