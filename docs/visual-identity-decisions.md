# Visual Identity — decisions

The service's own page: `/services/visual-identity`,
`/pt/servicos/identidade-visual`, in `src/components/visual-identity.tsx`,
styled `.vi-*` (and on the photo shoot's `.ps-*` for everything the two
share). Written from the studio's brief of 2026-11-17.

## Coherence with the other service pages

Asked for first, and done by using the same pieces rather than copying
their look:

- The **header is the photo shoot's**, which is the side-by-side page's:
  `data-tone="dark"`, `.ps-head`, the mono label "Additional service",
  the name as `h1` in `display` light, the studio's sentence in two
  lines (light then medium), three facts under a hairline, and the
  free-proposal drop. The same four `SlideIn`s at the same delays.
- One **`ToneRoom`**: header (dark), opening (light), the proposal
  (dark), who it is for (light), then "Let's work together" in ink.
- The **leading line** at the head of every section is `.ps-lede`, the
  same one the photo shoot uses, and the sections keep `.ps-sec`'s
  rhythm.
- The **before and after** is `BeforeAfter` from `project-report.tsx`,
  the slider the reports and the photo shoot already carry: the same
  follow, the same handle, the same keys.
- The **words that change in place** in "who it is for" are the photo
  shoot's dials, rebuilt on one clock (2.8s) with the longest case
  holding the line open so nothing under it moves.

## The two sections

1. **The proposal.** Three things seen rather than described: the old
   mark against the new one on the slider; the symbol on the guides a
   mark is built on, which draw themselves as the section is reached;
   and the two applied to the website they were made with. The grid is
   ours and generic — the square, its halves, its diagonals and two
   circles — not any client's geometry.
2. **Does it make sense for every business?** Answered "No." in display
   size, with the condition beside it, and then the cases that do make
   sense cycling in place. It ends on the doubt the studio wrote and
   the free-proposal drop.

## Places for the work

Named and empty under `public/visual-identity/` (its README says which
file goes where): the old logo and the new one (3:2, the pair must share
their frame), the symbol (1:1, centred with margin), and the website
with the identity applied (16:10). A missing file leaves its place
saying what belongs in it and holding its shape, so dropping the real
work in is the whole of the work.

## References

Through Inspo: Orpetron (the mark shown as a seal with its construction
in view) and Feathericons (the mark as a specimen in a ruled cell).
Their colour and type stay with them; this is the site's own black,
white and light grey, Satoshi and Geist Mono.

## Changed since

- 2026-11-17 (user): the page carries **no free-proposal drop of its
  own**, in the header or at the foot of "who it is for". The bar has
  one all the way down the page and the page ends on "Let's work
  together"; a third was one too many.

## Open

- The real work: four images.
- A price, if the studio ever wants one on the page. Today the
  free-proposal drop stands in its place, as on every other service.

## A página alargada (2026-11-18)

### Três negócios inventados

O utilizador pediu para reaproveitar a **Pilar** (a mediadora de seguros
inventada em que o Side by Side assenta) e inventar mais duas. Ficaram:

| Nome | Setor | Antes | Depois |
| --- | --- | --- | --- |
| Pilar | Mediação de seguros | escudo com uma letra dentro, estrela por cima | o pilar e a abertura (o mesmo de `sbs-pilar.tsx`) |
| Aurora | Clínica de estética | floreado à volta de uma folha, dentro de uma oval fina | o primeiro sol sobre uma linha |
| Terral | Mediação imobiliária | casa desenhada com chaminé, dentro de um anel | a terra, o céu e o T que assenta neles |

Estão todas em `src/components/vi-brands.tsx`, desenhadas em SVG no
preto e branco da casa, dentro de um quadrado de cem unidades. Não há
um único ficheiro de imagem nem uma linha de tipo que não seja nossa.

O que faz um "antes" parecer um antes nunca é uma piada à custa dele:
são as quatro coisas que realmente datam uma marca — um desenho do
ofício em vez de um sinal para ele, um contorno dentro de outro, um
floreado, e uma moldura à volta de tudo. O "depois" responde a cada um
com uma figura geométrica só, que o mesmo ofício aguenta a qualquer
tamanho.

Cada forma leva `.vi-sh` e um índice em `--n`: é isso que permite ao
card da secção 3 desfazer uma marca e construir a seguinte, forma a
forma.

### Secção 1 — o hero

H1 "Visual identity". Logo a seguir, dois cards lado a lado: num a
marca que cada negócio tinha, no outro a marca que passa a ter. Correm
do mesmo relógio, por isso o antes e o depois no ecrã pertencem sempre
um ao outro. No telemóvel um fica por cima do outro. O card do "antes"
é desenhado um passo mais apagado, para o ganho se ler sozinho. A frase
"An outdated logo undoes a first-rate website" passou para debaixo dos
cards, onde funciona como legenda do que se acabou de ver.

### Secção 2 — para quem é

A pergunta ficou igual. A resposta **"No."** começa escondida e é
descoberta uma vez, quando é alcançada, por uma barra preta que corre
por cima dela da esquerda para a direita — o marcador da secção "Como
trabalhamos", que enche o seu carril da esquerda à medida que a fila
passa. Com movimento reduzido já lá está.

O componente que o utilizador apontou passou a dois, lado a lado e
sincronizados: à esquerda os casos em que faz sentido, com o estilo que
já tinha; à direita, em cinzento, os casos em que não faz. O cinzento é
deliberado — o que está à direita é o que recusaríamos.

### Secção 3 — com dúvidas?

Card cinzento com o texto e o botão do formulário, e ao lado a animação
em loop: a marca antiga está de pé, desfaz-se (cada forma afasta-se,
roda e apaga-se, uma a seguir à outra) enquanto as guias se desenham, a
marca nova é construída sobre elas forma a forma, e fica de pé antes de
passar ao negócio seguinte. Quatro passos de 1,25 s cada.

Referências pelo INSPO MCP: a **Geex** (formas esculpidas e resolvidas
sobre um fundo vazio) e a **Portal One** (a geometria de construção
deixada à vista). Só a composição; a cor e o tipo são os da casa.

### Secção nova — como funcionam os preços

Antes do CTA final, na mesma apresentação da secção de preços das
Funcionalidades de Back End: o que inclui o serviço, quanto custa e se
é à parte ou em pacote, quantas propostas e revisões, e a reunião
inicial gratuita. Os valores leem `[a preencher]`.

### Skills

A `gpt-taste` foi invocada a pedido do utilizador. Dela ficou o que não
choca com o sistema da casa: o H1 em contentor largo e nunca acima de
duas ou três linhas, espaçamento largo entre secções, cards que
respondem ao ponteiro, e nenhuma célula vazia nas grelhas. O resto —
GSAP, fontes à sorte, imagens do picsum, proibir os rótulos em mono —
contraria o que está assente, e o projeto ganha.

### Corrigido no mesmo dia (2026-11-18)

Duas coisas, depois de ver a pagina no ar:

- **So a Pilar.** O estudio nao quis negocios inventados para alem do
  que o site ja tem. A Aurora e a Terral continuam desenhadas em
  `vi-brands.tsx`, em `SPARE_BRANDS`, fora de uso: pô-las de volta e
  uma linha na lista `BRANDS` e mais nada. Com um so negocio os cards
  do hero nao rodam, e o loop da seccao 3 repete a Pilar.
- **No hero, o texto primeiro e os cards depois.** Os cards passaram
  para o fim do cabecalho, a seguir ao titulo, a frase e aos tres
  factos. A troca entre negocios foi endurecida enquanto la estava: o
  que sai vai-se embora antes de o que entra assentar, para nunca
  haver dois nomes meio-desenhados um por cima do outro, que era o que
  se via no print.

**O botao do card cinzento saiu** (user, 2026-11-18): o card fica com o
texto e com o loop da marca. A barra leva o formulario em todo o lado,
a seccao dos precos tem o seu proprio botao e a pagina acaba em "Let's
work together" - o mesmo raciocinio que tirou o botao do retangulo
cinzento da pagina do back end.

