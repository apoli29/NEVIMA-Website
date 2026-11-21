# Photo shoot — decisions

The service's page (`/services/photo-shoot`, `/pt/servicos/sessao-fotografica`).
Its hero, facts and first three blocks come from `service-depth.tsx` (see
`docs/side-by-side-decisions.md`); the three sections under them are
`src/components/shoot-sections.tsx`, styled `.sht-*`.

## The brief (user, 2026-11-17)

Five sections were asked for: the before and after, what the session
includes, the packages and prices, the coverage area, and personalization.
Three were built. The other two wait on the studio:

- **Before and after.** It needs pairs of photographs of the same subject,
  one taken carelessly and one by us, and the studio has none. The user
  chose to wait for real pairs rather than stage them with stock
  (2026-11-17). Nothing is in the page until they exist.
- **Packages and prices.** The brief left them as "[inserir pacotes e
  preços]". No figure is invented here, and the user chose to leave the
  section out rather than show one half-filled.

## What was built

- **What the session includes.** Six rows, ruled off one another, each
  with what it is and what it means: the free briefing meeting, art
  direction, the session itself, editing and retouching, delivery in an
  online gallery, and the right to use the photographs. The section's
  title holds still beside them while they go by (`position: sticky`,
  not a scroll library). "Limpa mas compacta", as asked: every
  explanation is read at once, none is hidden behind a click.
- **Where we work.** A map drawn here, not fetched from a map service.
  Mainland Portugal is plotted from real coordinates into kilometres
  (`x = (lon + 9.62) x 85.6`, `y = (42.25 - lat) x 111`), so the thirty
  kilometres around Vila Nova de Gaia are thirty real kilometres against
  the rest of the country, not a ring drawn to look right. The near zone
  is clipped to the land so it never swims out to sea. Two legend rows,
  and pointing at one lights its zone. Above 30 km the page says what
  the form and the price already say — "cobrada ao km, como fica
  definido na proposta" — because the studio has set no rate (user's
  pick, 2026-11-17).
- **Personalization.** Four dials — what is photographed, where, in what
  style, how many — whose words change in place on one clock every
  2.6s while the section is on screen, so the section is read rather
  than waded through. The quantities are qualitative ("poucas e
  certeiras", "uma série", "um catálogo inteiro") because the packages
  that would give numbers are not decided. Under them, the studio's own
  line: "Sem saber o que escolher? Na reunião, ajudamos a definir a
  sessão ideal."

## References

Found through Inspo (the user asked for it) and turned into the site's
own black, white, Satoshi and Geist Mono: UAL and Ferrari for a title
laid straight on the page with no card under it, and Modern Treasury's
and Unkey's node diagrams for the map. None of their colour, type or
glass was taken.

## Second pass (2026-11-17, user): its own page, and room for the photographs

- The page is no longer set from the services' template. It is its own
  (`photo-shoot.tsx`), the way SEO & GEO's is: the plate at its head,
  then one `ToneRoom` whose sections turn from light to dark under the
  tonal veil, headings arriving on the site's own `SlideIn`, and the
  free-proposal drop the whole site presses. The template's grey "Get in
  touch" button and "Back to nevima" link went with it; the bar and
  "Let's work together" are the way on, as everywhere else.
- **An opening**, after the plate: what a session is worth to a brand,
  in two paragraphs, not a wall.
- **A line at the head of every section**, one or two sentences, so the
  reading is led rather than dropped into.
- **The comparison is built** (section 1 of the brief), with places for
  the photographs rather than photographs: three pairs — a product
  (1:1), the team (4:5), the place (3:2) — each on the slider the
  project reports already carry (`BeforeAfter`, project-report.tsx,
  exported for this), so the interaction is the same thing in both
  places. A side whose file is missing says what belongs in it and holds
  its shape; dropping the file in is the whole of the work. The files
  are named in `public/photo-shoot/README.md`.
- **The packages are built** (section 3), as three cards with the middle
  one inverted, each with the four things that tell them apart:
  photographs delivered, how long the session runs, how many places, and
  the delivery time. Every value reads `[a preencher]`, the site's own
  mark for what the studio has not given (TO_FILL), and a line under
  them says so. No price is invented.
- References through Inspo for this pass: Works Studio (three examples
  read side by side with their captions under them) and Luma's pricing
  (three plain cards, the middle one inverted). Nothing of their colour
  or type was taken.

## Third pass (2026-11-17, user): the header, and the country in relief

- **The header is the side-by-side page's**, not a photograph: the same
  dark ground inside the room, the same `pt-[calc(var(--section-gap)+2rem)]`
  and `pb-[clamp(2.5rem,5vw,4rem)]`, the same mono label, the same
  `display` size, the same two `SlideIn`s. It carries the label, the
  name, the studio's sentence, the three facts and the free-proposal
  drop. The photograph, its cut corner and its credit are gone, and
  `ServiceHero` is no longer called here (the other three service pages
  still use it).
- **The map has volume.** No WebGL and no new dependency: the land is
  twelve boxes cut by one path and stacked in Z, the thirty kilometres
  eight shorter boxes standing on it (cut to the land first, then to a
  circle of thirty), and over them the outline, which draws itself
  before either rises. The stage is laid back 54 degrees and turned 9,
  and follows the hand within seven degrees where there is a hand to
  follow (`pointer: fine`); a soft ellipse under it is the shadow.
  Everything is a transition on `transform`, so a phone draws it as
  cheaply as a photograph, and `prefers-reduced-motion` leaves it as it
  ends up.
- The order of the entrance is the one asked for: the outline draws, the
  land rises slice by slice, then the thirty kilometres, then the ring
  goes out from the point and pulses on.
- Pointing at a legend row lights its zone: the thirty kilometres go to
  solid black with their ring, or the rest of the country darkens.
- **The label left the drawing** (it used to cross the outline): it is
  flat to the page under the map, "Vila Nova de Gaia · 30 km à volta",
  with the black key beside it.
- The Inspo archive had no extruded map to take from, so this is built
  from the technique rather than from a reference, in the page's own
  black, white and light grey.
- **Editing** (user, 2026-11-17): the row in "what the session includes"
  now names the programs and the care — developed in Lightroom (colour,
  light, contrast, the frame) and retouched in detail in Photoshop. The
  programs are the studio's own answer, not a guess.
- 2026-11-17 (user): the header has no drop of its own, for the same
  reason the visual identity page has none. It was centred in the page
  for one pass and put back to the shell's left edge the same day, so
  every service header starts on the same line.
- 2026-11-17 (user: "nao o metas deitado como esta prefiro em pe"): the
  country stands instead of lying back. It faces the reader, turned
  13 degrees so the wall its thickness makes is seen along one side,
  and the hand turns it ten degrees either way; under that, an inner
  box drifts five degrees on a fourteen-second loop, so it is never
  quite still without ever fighting the hand for the same transform.
  The slices darken with depth, the lit face is lighter than they are,
  and the shadow falls behind rather than under it.
- The same day, the phone's overlap: the drawing is 600 tall and its box
  is what that comes to once scaled, and a grid box that size pushes an
  oversized child down instead of centring it — which put the map over
  the words. The stage is hung on the box's middle with `position:
  absolute` and `translate(-50%, -50%)` instead. Measured at 375px: 37px
  clear above and 22px below.

## Os pacotes, preenchidos (2026-11-20)

Ficaram decididos com o utilizador. Os nomes foram deixados ao meu
criterio ("essencial, basics alguma coisa assim do genero"): escolhi
**Essencial / Completo / Alargado** (EN: Essentials / Complete /
Extended). "Basico" le-se barato, e esta escada diz o tamanho sem
desvalorizar o primeiro.

| | Fotografias | Duracao | Locais | Prazo |
| --- | --- | --- | --- | --- |
| Essencial | 15 | 2 horas | 1 local | 7 dias |
| Completo | 30 | 4 horas | ate 2 locais | 7 dias |
| Alargado | 50 | um dia inteiro | ate 3 locais | 10 dias |

A contagem dobra e depois cresce menos, que e a forma como estes
pacotes sao comprados, e os dois primeiros mantem o mesmo prazo: o que
muda do primeiro para o segundo e o tempo em cima do trabalho, nao o
tempo em cima da edicao.

**Os precos continuam por dar** e sao a unica coisa que ainda le
`[a preencher]` nesta seccao. A linha do rodape passou a dizer isso
mesmo, em vez de dizer que os pacotes tambem estavam por definir.

## As seis fotografias da comparacao (2026-11-20)

O utilizador escolheu, de tres caminhos possiveis, o de **imagens
livres dos dois lados**, sabendo que era o mais fraco: nenhum banco de
imagens da pares do mesmo assunto, por isso a seccao deixou de poder
prometer "o mesmo negocio, duas vezes".

O que mudou no texto:

- o rotulo passou a **"Duas maneiras de fotografar a mesma coisa"**;
- a linha de entrada deixou de dizer "fotografadas a pressa e
  fotografadas por nos" e passa a descrever os dois lados sem os
  atribuir a ninguem;
- por baixo da comparacao ficou uma linha em mono: **"Imagens de
  exemplo, nao trabalho nosso."** Sem ela, seis fotografias
  licenciadas a fazer de antes e depois leem-se como portefolio, e
  isso nao e verdade.

As seis sao da Unsplash, licenca livre confirmada pagina a pagina
(nenhuma e Unsplash+), apresentadas ao utilizador antes de qualquer
descarga como manda o CLAUDE.md. Os creditos estao na tabela do
`public/photo-shoot/README.md`. Foram cortadas para 1:1, 4:5 e 3:2 com
o `sharp`, lado maior 1600px, todas entre 15 kB e 177 kB.

**O par do produto e o mais fraco e foi dito assim ao utilizador**: a
Unsplash quase nao tem fotografia de produto deliberadamente ma, e o
"antes" que la esta le-se como uma fotografia escura de proposito, nao
como uma fotografia falhada. Troca-se quando houver melhor, ou quando
houver trabalho nosso.

## O preco sai dos cartoes, e as duas maneiras saem da pagina (2026-11-20)

Dois pedidos do utilizador.

**O preco.** Os tres cartoes traziam uma linha de preco a dizer
`[a preencher]`, por baixo do nome. Saiu. Um `[a preencher]` grande
debaixo de tres nomes nao e um espaco reservado, e um buraco: o leitor
le-o como «ainda nao sabem quanto custa». O que os cartoes tem para
dizer esta escrito - fotografias, horas, locais, dias - e o pe da
seccao continua a dizer que os precos sao do estudio e que o
formulario calcula uma estimativa entretanto, com o botao ao lado. Nao
ha buraco nenhum onde a linha estava: o nome passa direto para as
linhas.

A regra de estilo `.ps-pack-price` fica, fora de uso, para o dia em
que o estudio der os numeros.

**As duas maneiras de fotografar a mesma coisa.** A seccao inteira -
o titulo «A diferenca nao esta na camara», o paragrafo e os tres
comparadores antes/depois - saiu da pagina. Como tudo neste projeto,
**nao foi apagada**: o componente `Compare` fica inteiro em
`photo-shoot.tsx`, com uma nota no topo a dizer desde quando esta fora
de uso, e volta com uma linha em `PhotoShoot`. As seis fotografias que
ele le continuam em `public/photo-shoot/`.

A pagina fica com cinco seccoes em vez de seis: abertura, o que a
sessao inclui, os pacotes, onde trabalhamos e personalizacao.

## «Onde trabalhamos» sobe para debaixo da abertura (2026-11-21)

O utilizador mandou por o mapa logo a seguir ao texto de abertura
(«Um website acredita-se primeiro pelas fotografias»). Estava entre os
pacotes e a personalizacao.

A ordem fica: cabecalho, abertura, onde trabalhamos, o que a sessao
inclui, os pacotes, personalizacao. Faz sentido: **se sequer nos
deslocamos ate la e uma coisa que se resolve antes de haver uma
proposta, nao depois de ela estar com preco.** Quem esta fora dos 30
km sabe-o na segunda ecra em vez de o descobrir no fim.

Os tons ficam escuro, claro, claro, claro, escuro, claro. Sao tres
claros seguidos onde antes eram dois, mas o veu do `ToneRoom` so
reage a mudanca, por isso nao ha nada a corrigir.
