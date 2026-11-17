# SEO & GEO page: decisions

The SEO & GEO service has its own page (`/services/seo`, `/pt/servicos/seo`; `seo-geo.tsx`, styled `.sg-*`), built on 2026-11-16 (user). Nothing of the template the other service pages use (`service-page.tsx`: photo hero, description, plate, other services) is used there; `ServicePage` hands the `seo` slug to `SeoGeo`. The address, the `SEO_PAGES` line, the structured data, the bar, `WorkTogether` and the footer stay as they were. The SEO plate in `service-depth.tsx` is no longer shown anywhere but stays in the code.

References found through Inspo: Aspen Search (Swiss grid, dithered texture for what cannot be read), Linked by Air (a fine chart on a dark ground); the scramble is the one the side-by-side page already uses (Linear). Adapted to the site: square, hairlines, Satoshi titles with a light and a medium line, Geist Mono labels, the side-by-side dark ground (`.sbs-ground`), the bar's switch (`Switch` in `sbs-shared.tsx`).

## The sections (user's choices, 2026-11-16)

1. **"O motor de busca só recomenda websites que comuniquem na sua língua."** (dark). The studio's SEO definition beside a results page: the query types itself, an invented business (Clínica Aurora, Vila Nova de Gaia) sits on page 4 with its result in noise, and is decoded and moved to first place, with what the engine reads (title, description, address, hours, reviews) set as tags. A "Sem SEO / Com SEO" switch lets the visitor go back and forth; it plays once by itself when first seen.
   - **GEO: "E agora, com a Inteligência Artificial, o raciocínio é o mesmo."** (white). The user's line ("A IA só recomenda negócios quando eles próprios fazem questão de garantir que a IA os percebe.") and the studio's GEO definition, beside an AI assistant asked the same question: without GEO it names no one and cites no source; with GEO it names the clinic and cites its website. Plays once by itself, then a switch.
2. **The impact of each level** (dark). One chart, twelve months of visibility in a related search, three curves: basic (stays low), one-off (rises fast, then fades), monthly (rises and keeps climbing). A switch picks the level and shows its text; moving along the chart reads off the month and where the business sits in a search by name (always 1st) and in a related search. Marked "Ilustrativo": the curves are a picture of the argument, not data.
3. **Price** (white). A calculator: the size of the website (a landing page to 10 pages) gives the one-off work and the monthly service, then the free-proposal button.
   - Worked out on the server (`src/lib/proposal/seo-table.ts`) from `PRICING`, by the form's own rule (one-off 22.5% of the website, monthly 30% of the one-off, lowest end down to 5, highest up). A size is Home, About and Contact plus the average of the usual pages (services, testimonials, FAQ, gallery, team, process, prices, portfolio), in Portugal with Essential+. It reads "Estimativa para Portugal, com o design Essencial+. O valor final fica definido na proposta gratuita."

## Between the sections (2026-11-16)

- A pixel dissolve was built first (after Locomotive's pixel mosaic) and turned down by the user: "demasiado tecnológico", no pixels or squares of any kind; the most refined result possible, choice left to me.
- Chosen: a **tonal veil**. The sections have no ground of their own; one ground lies behind the page, held to the screen and clipped to it (`.sg-room`, `.sg-ground`), and its tone follows the scroll both ways: as a section's top goes from 75% to 33% down the screen, the ground passes from `#0b0b0b` to white or back (smoothstep), with no line anywhere. The section going out dims to 42% and settles back to 97% scale; the one coming in takes its place. The corner light and grain of the dark ground fade with it. The last turn darkens the ground into Let's work together without dimming the prices. Reduced motion keeps the tone and the dimming, not the scale. The same idea as the about page's water (references through Inspo: Audo and Chloé's veils). `useToneVeil` in `seo-geo.tsx`.

## Second round (2026-11-17, user)

References through Awwwards: Miguel Recio (editorial figure captions in mono), Cheese Design (a white card set on a dark, textured ground).

- **Long texts.** The definitions of SEO and GEO are set as wall labels (`.sg-def`: the acronym, what it stands for in mono, one sentence). The rest of each definition became the **live caption** under its demonstration (`LiveCaption`), swapped with it: "Com um SEO mal trabalhado…" without SEO, "Com um SEO personalizado…" with it; for GEO, "Todos nós usamos cada vez mais a IA…" and "Estas práticas aumentam a probabilidade…". Every piece of the studio's copy is kept.
- **Three examples in a loop**, shared by the results page and the assistant (`examples()`): "dentista perto de mim" (Clínica Dentária Sorriso, Alvalade), "imobiliária em Lisboa" (Casa Alfama Imobiliária) and "cerâmica artesanal" with no place (Barro & Forno). All invented. Keys over hairlines that fill with each example's time (the side-by-side gallery's time); the loop holds under the pointer and off screen, and stops once the visitor picks an example or turns the switch.
- **Without SEO** is now realistic: the page is called "Início"/"Página inicial"/"Loja", the description says little, and the address is on someone else's domain (`*.site-gratis.com`). The results header says only the page the business is on (page 4: results 36 to 40, the business 38th; with SEO, page 1, first).
- **Without GEO** the assistant still answers and cites sources (it always does: a health directory, a property portal, a craft marketplace…), it just does not name the business. With GEO it names it and cites its website.
- **The chart section is white**; the chart sits on a black card with grain and a light in one corner (`.sg-card-dark`). The tonal veil now turns only twice: black to white after the first section, white to black into Let's work together.
- **Price**: the white price card sits inside a wide black card with the same grain, which carries the title and the explanation.

## Copy

- The monthly maintenance text was not written; the user approved this draft: "Todos os meses, acompanhamos as mudanças nas pesquisas e no comportamento dos utilizadores e ajustamos o SEO e o GEO do website, para manter e fazer crescer os resultados do trabalho pontual."
- The basic and one-off texts are the user's, with the writing fixed; the "X activity in city Y" example became the page's own ("clínicas de estética em Vila Nova de Gaia").
- Headings written for the page: "Básico, único ou mensal: / doze meses de cada um." and "Quanto custa, / à medida do website."
- The demonstrations say they are invented, as the side-by-side page does. Nothing imitates a real search engine or assistant.

## Open

- Whether the page should say how the price is worked out in percentages, as the form does (it says it only in words now).
- The chart's curves are illustrative; replace them with real figures once the studio has some.
