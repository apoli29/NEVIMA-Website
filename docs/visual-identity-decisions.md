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

## A página refeita (2026-11-19)

Pedido do utilizador, secção a secção:

- **Secção 1.** Fica só o H1 e os dois cards (saíram a etiqueta
  "Additional service", a frase "An outdated logo…" e os três factos).
  Cada card tem o fundo da sua marca: a **marca antiga é a do site
  template** do Side by Side (o emblema azul com o anel laranja, "Pilar"
  em itálico e SEGUROS a laranja, `CLogo` em `side-by-side.tsx`), em
  branco; a nova é a assinatura do nosso site (símbolo + "Pilar
  Seguros" na Plus Jakarta Sans) no Noite #111525. O escudo que lá
  estava saiu de `vi-brands.tsx`: o emblema do template passou a ser o
  "antes" da Pilar, desenhado forma a forma para o loop. Cards e
  logótipos **25% maiores** do que estavam.
- **Secção 2.** Debaixo do texto, o card da chamada do Side by Side (o
  mesmo metal, o mesmo quadrado, a mesma linha com o ponto de luz, o
  mesmo painel escrito letra a letra), com o cliente sozinho e um
  telemóvel: vê o site com a identidade antiga, franze ("Será que ainda
  existem?"), o ecrã passa à nova e sorri ("Nestes confiava."). A cabeça
  do boneco é desenhada maior que na chamada para levar olhos, boca e
  sobrancelhas. Com movimento reduzido fica a nova e o sorriso.
- **Secção 3** (a proposta em três coisas vistas) saiu: repetia a 2.
  Fica inteira em `visual-identity.tsx`, `Proposal`, fora de uso.
- **Secção 4** passou ao cinzento escuro. A pergunta fica presa ao
  centro do ecrã; o scroll apaga-a e traz o "Não." para o mesmo sítio,
  descoberto pela barra (agora branca), com a frase por baixo; depois a
  secção solta-se e vêm os dois widgets e o card cinzento do "Com
  dúvidas?", que passou para dentro desta secção. No loop do card, a
  marca antiga está no branco do template e a nova constrói-se no Noite.
  As opacidades do scroll são funções e não intervalos: com intervalos o
  Motion entrega a opacidade ao scroll timeline do browser, que media
  mal a secção presa.

### Segunda volta no mesmo dia (2026-11-19)

- **Secção 1** passou a ser o card cinzento do "Com dúvidas?" três
  vezes (`Cases3`): o primeiro com o loop da Pilar, os outros dois
  vazios (um quadrado tracejado e `[a preencher]`) para os dois casos
  que o estúdio vai acrescentar. Os dois cards antes/depois saíram.
- **Secção 2.** O texto foi mantido palavra a palavra, mas posto como
  uma frase grande em dois parágrafos desencontrados, com as três ideias
  que a seguram ("o logótipo e o símbolo ao lado dele", "entra em
  contradição com ele", "tudo fale a mesma linguagem") acesas por um
  bloco preto que se desenha atrás delas quando são alcançadas.
  Referência pelo Inspo: **Bandcamp** (a frase com os números em blocos
  pretos). O card da chamada era uma imitação demasiado literal; só o
  boneco e as falas ficaram. No lugar dele há um pequeno filme
  (`Glance`): o boneco a traço branco sobre o fundo escuro levanta o
  telemóvel, a câmara entra no ecrã (o site da Pilar antigo), volta à
  cara, que franze e diz "Será que ainda existem?"; depois o mesmo com
  o site novo, sorri e diz "Nestes confiava.". É uma câmara só, movida
  por transform, e cerca de 15 s por volta. Com movimento reduzido fica
  o último plano.
- **Secção 4.** A frase debaixo do "Não." saiu. A pergunta aparece ao
  centro e apaga-se, o "Não." entra ao centro e vai para a esquerda, e
  a pergunta volta por cima dele como título da secção (a estrutura
  normal). Os widgets e o card sobem para o espaço que o ecrã preso
  deixa livre, para chegarem colados quando a secção se solta (antes
  ficava tão longe que pareciam duas secções).

**O botao do card cinzento saiu** (user, 2026-11-18): o card fica com o
texto e com o loop da marca. A barra leva o formulario em todo o lado,
a seccao dos precos tem o seu proprio botao e a pagina acaba em "Let's
work together" - o mesmo raciocinio que tirou o botao do retangulo
cinzento da pagina do back end.


## 2026-11-19 — terceira ronda (utilizador)

- Os cartões do cabeçalho mostram o logótipo inteiro da Pilar (símbolo e palavras), antigo e novo, e não só o símbolo (`Morph` com `whole`). As palavras saem com o símbolo antigo e chegam depois do novo.
- O filme (o cliente e o telemóvel) subiu para o cabeçalho, logo por baixo dos três cartões. Os dois parágrafos de "Why it is worth it" ficam por baixo, em três opções emolduradas para o utilizador escolher (`WorthOptions`): A duas colunas (Frontier Climate), B uma frase grande e o detalhe pequeno (NB Studio, Linked by Air), C três pontos numerados (Dia & Co). Escolhida uma, as outras e a moldura saem.
- O "Não." passa a ser revelado pelo próprio scroll (recorte e barra ligados ao progresso), em vez de uma transição disparada a 0,32: num scroll longo e rápido a transição podia não correr e o "Não." não aparecia.
- (mais tarde, no mesmo dia) "Why it is worth it" foi cortado para cerca de um quinto e passou para dentro do cabeçalho, por baixo do filme: o título numa linha e uma frase ("Quando o logótipo e o símbolo estão desatualizados, até o website mais bem feito entra em contradição com eles. Por isso são desenhados com o website, para que tudo fale a mesma linguagem."). O utilizador pediu os cortes. A secção completa e as três opções ficam fora de uso em `Opening` e `WorthOptions`.
- Tudo o que vem depois do cabeçalho ("Does it make sense…" e o preço) passou a fundo branco; o cartão cinzento "Not sure?" mantém-se.

## Terral, o segundo exemplo (2026-11-19)

O utilizador pediu um segundo negócio na página, com uma referência
própria, e escolheu a Terral (mediação imobiliária).

### O que ficou por preencher no pedido

Perguntado antes de desenhar: o nome e o setor vinham como `[NOME]` e
`[SETOR]`, e das "2 referências em anexo" só chegou uma. O utilizador
escolheu a Terral e mandou avançar com a referência única.

O pedido descrevia também um bloco "These I'd trust." e um contador
01/04 no cartão da homepage. Nenhum dos dois existe no site. A skill
`/improve-animations` não está instalada; a animação foi feita à mão
com o easing e as durações da casa.

### O símbolo

Quatro quintos da referência: a empena construída com **massas
sólidas** e não com contorno, o **vazio vertical** entre elas em vez de
qualquer linha desenhada, o **vértice descentrado** (uma massa larga e
outra estreita), todos os ângulos a 45°, e o conjunto assente no módulo
de baixo da grelha.

O quinto que é nosso: os cantos de baixo viram a 6 — um passo abaixo
dos 8 da Pilar, para serem da mesma família — e o vértice fica afiado,
que é o carácter da referência. E a **barra de terra** por baixo, que é
o que o nome diz (um terral é a brisa que vem de terra) e o que impede
o símbolo de ser mais um desenho de uma casa. Dá também três formas,
logo três tempos de construção.

Medidas, no quadrado de cem: paredes de 22 a 78, vértice a 20, base a
82, terra de 14 a 86. O vazio tem 8 de largura e a terra 10 — é o que
os mantém acima de um pixel quando a marca é posta a 16 px.

### O prato de construção

`MarkPlate`: fundo #1c1c1c, uma grelha de módulos de dez quase
invisível, as guias da marca tracejadas em ciano (verticais e
horizontais nos limites das formas, diagonais a prolongar os ângulos),
a marca a branco ao centro e o ® à direita. Por baixo, o wordmark e a
subline legal. As duas marcas levam o mesmo tratamento.

O ciano é a única cor neste site que não é preto nem branco, e está cá
pela razão por que um gabinete de desenho o usa: uma guia não pode
confundir-se com a coisa que guia. Nunca toca na marca.

A sequência, uma vez, quando o bloco é alcançado: a grelha aparece
(0,5 s); as guias retas entram varridas da esquerda (0,7 s @ 250 ms);
as diagonais de cima (0,6 s @ 750 ms); as formas preenchem-se pela
ordem de construção (160 ms entre cada, a partir de 1,15 s); o ® e o
wordmark chegam por último (1,9 s). Só `transform` e `opacity` — as
guias mantêm o tracejado porque quem as faz entrar é um `clipPath` que
escala, e não o `stroke-dasharray`.

### O encontro com o trabalho do António

No mesmo dia o António refez a página (cabeçalho novo com três cards,
um filme, o "porque vale a pena" encurtado) e fez push primeiro. O
merge deu oito conflitos no ficheiro da página.

Decisão do utilizador (2026-11-20): **a versão dele fica como base** e
o que foi feito aqui enxerta-se por cima.

- A **Terral entra no segundo dos três cards**, que ele tinha deixado
  a `[a preencher]` à espera exactamente disto. O `Morph` passou a
  aceitar um negócio (`only`): um card que o recebe fica com ele, e o
  loop sem negócio continua a percorrer todos.
- Os **pratos de construção** ganharam secção própria entre o cabeçalho
  e o "para quem é", porque a secção "The proposal", onde iam ficar,
  deixou de ser renderizada.
- O **cabeçalho com os dois cards antes/depois** que tinha sido feito
  aqui foi abandonado: ele refez essa parte. O código está na branch
  `vi/terral-keep`.
- `useStill()` é novo: liga o "Parar movimento" do rodapé, que a versão
  dele não lia (só tratava do `prefers-reduced-motion`).

### A barra saiu (2026-11-20)

O utilizador tirou a barra de terra. Fica o que era a referência e mais
nada: as duas massas e o vazio entre elas. Como a marca tinha sido
desenhada para assentar nessa barra, foi redesenhada ao tamanho que
enche o quadrado — o mesmo que a Pilar enche — para as duas carregarem
o mesmo peso lado a lado.

Medidas novas: paredes de 14 a 86, vértice a 8, base a 92, vazio de 46
a 54. Todos os ângulos continuam a 45° e o vazio continua com 8 de
largura, que é o que o mantém acima de um pixel a 16 px.

### O nome onde estava a barra (2026-11-20)

O utilizador deixou a decisao: "no lugar da antiga barra podes meter o
nome da marca se achares que fique bem".

**Dentro do simbolo, nao.** Um simbolo tem de funcionar sozinho e tem
de aguentar 16 px; uma palavra de oito unidades por baixo de uma empena
de oitenta e quatro desapareceria a esse tamanho e tirava ao simbolo o
que o faz simbolo. E no prato de construcao as guias sao da geometria
da marca, nao de tipo.

**Como assinatura, sim** - e era isso que faltava. A Terral passou a
ter o seu par de assinaturas, como a Pilar ja tinha: `TerralOldLogo` e
`TerralNewLogo`. A nova e a marca com o nome **por baixo**, que e
exactamente onde a barra estava; a antiga e a mesma coisa em serif com
relevo, a palavra do oficio espacejada ao lado e a linha legal em
cinzento - os tres habitos que datam uma assinatura. As cores da antiga
sao da empresa, como o azul antigo da Pilar, nao nossas.

A Pilar assina ao lado, a Terral assina por baixo: uma empena e uma
palavra nao se deitam lado a lado sem uma delas ficar pequena.

O `Brand` ganhou `oldLogo` e `newLogo` opcionais, e o `Morph` mostra a
assinatura que o negocio tiver, caindo nos dois simbolos quando nao
tem. Os dois cards do cabecalho ficaram presos ao seu negocio
(`only`): sem isso o loop percorria todos e os dois cards trocavam de
empresa entre si.

### O tamanho das assinaturas (2026-11-20)

O utilizador: "o logo em geral esta pequeno". Subiram dentro dos cards,
cada uma pelo que a mede:

| | antes | depois | ocupa |
| --- | --- | --- | --- |
| Pilar, antiga | 10,5cqw | 11cqw | 88% da largura |
| Pilar, nova | 9,25cqw | 10,75cqw | 85% da largura |
| Terral, antiga | - | 13cqw | 88% da largura |
| Terral, nova | - | 28cqw | 58% da altura |

Uma assinatura deitada mede-se pela largura e uma empilhada pela
altura, que e porque a da Terral leva mais do dobro em `cqw` para ler
como do mesmo tamanho. Um primeiro acerto por igual pos a da Pilar a
99% da largura e a antiga da Terral a 135%, cortada pelo `overflow`
do card; os valores acima sao os medidos depois de corrigir.


## A limen no lugar da Terral (2026-11-20)

O utilizador pediu uma identidade fictícia nova para o cartão do meio do
cabeçalho, no lugar da Terral, **sem apagar a Terral dos ficheiros**.

- **O negócio:** limen (do latim, «limiar»), imobiliário e design de
  interiores; identidade ultra moderna, sofisticada, suave e madura. Em
  minúsculas: o nome nunca se traduz. Descritor «Imobiliário &
  Interiores» / «Real Estate & Interiors».
- **A referência:** um logótipo «4 Space» (um 4 de traço único com
  pontas retas, o nome numa grotesca regular, o descritor em duas linhas
  ao lado, o ®), pedido com 75% de semelhança e 25% nossos.
- **O símbolo:** duas paredes em L que se encaixam numa sala vista em
  planta, com duas passagens em diagonal; em cada passagem uma porta
  desenhada como numa planta (a folha e o arco), num traço a um quarto
  do das paredes, e um losango de luz ao centro. A primeira versão era
  só as paredes; o utilizador pediu-a «menos minimalista e mais
  sofisticada», e foram as duas espessuras de traço que o deram.
- **A assinatura nova:** símbolo à altura das hastes, «limen» em Inter
  Tight 400 apertado, ® sobre o fim, o descritor em duas linhas na linha
  de base. Linho #F5F2ED sobre Basalto #1E1D1B (e não sobre a Noite da
  Pilar: o `Morph` passou a levar `data-brand` para cada marca ter o
  seu fundo).
- **A assinatura antiga:** um anel duplo com um telhado, uma janela de
  quatro vidros e um floreado; «Limen» em serif itálico com relevo,
  «INTERIORES» espacejado a dourado, linha legal a cinzento. Cor de
  vinho, as cores da empresa, como o azul antigo da Pilar.
- **A paleta** desenhada com ela: Basalto #1E1D1B, Pedra #948C82,
  Travertino #DDD6CB, Linho #F5F2ED. O quadro com o mini sistema visual
  está no artefacto «limen — identidade visual».
- **A Terral** saiu de `BRANDS` para `SPARE_BRANDS` (`TERRAL` em
  `vi-brands.tsx`), inteira, com as duas assinaturas e o CSS. O prato
  de construção da secção «Como se constrói uma marca» passou a mostrar
  a limen, porque lê os mesmos `BRANDS`.
- O nome por baixo do cartão da limen deixou de aparecer a cinzento: o
  cartão só fica marcado como vazio quando ainda espera um caso.

## Briciola, o terceiro caso (2026-11-20)

Pedida para o terceiro card e refeita tres vezes no mesmo dia: para
restauracao a partir das referencias Geranos e Pomodoro; para
interiores a partir da referencia "crunch"; e, finalmente, esta - a
**referencia "crunch" com o ramo de volta a restauracao e hotelaria**.
As duas primeiras estao no historico do git e nao ficaram em codigo,
para nao haver tres marcas com o mesmo nome no ficheiro.

Apresentada **so como fica depois** de passar por nos: este negocio
nao tem um antes, e o card fica parado no fim do percurso em vez de o
percorrer.

### O que vem da referencia (tres quartos)

- o **nome numa so linha, minusculas e pesada**, com a massa a fazer o
  trabalho e os olhos das letras pequenos;
- as **migalhas a subir de uma das letras**, a ocupar o lugar do ponto
  dela;
- um sistema **plano de duas cores**: um campo e uma marca sobre ele, e
  mais nada.

O nome ajuda: *briciola* e migalha, por isso o proprio dispositivo da
referencia e tambem a coisa mais verdadeira que este negocio podia
carregar.

### O quarto que e nosso, e porque

Precisamente porque o dispositivo assenta, o quarto que e nosso tem de
trabalhar mais, ou o resultado e a referencia com outra palavra la
dentro. A referencia e um snack: letras cortadas a mao, uma
inclinacao, um bando de pontinhos atirado em arco, um amarelo alto. Um
restaurante que se quer ler sofisticado e maduro nao pode pedir
emprestada a piada. Por isso:

- as mesmas minusculas pesadas sao desenhadas como **geometria
  verdadeira** - peso igual, sem inclinacao, sem terminais irregulares.
  A face e a **Outfit**, 700;
- as migalhas sao **quatro, nao um bando**, cada uma arredondada e cada
  uma menor do que a anterior, e sobem **por um arco so** em vez de se
  espalharem. Ordenadas, leem-se como deliberadas;
- o **i perde o ponto** (U+0131, i sem ponto) para as migalhas poderem
  subir dele, que e o que a referencia faz com o u;
- o campo deixa de ser o amarelo alto e passa a um **linho**, para a
  marca poder assentar numa ementa, numa montra ou num guardanapo sem
  gritar.

### O sistema de cores

Quatro, declaradas em `.vi-logo-bri` e em mais lado nenhum:

| | | |
| --- | --- | --- |
| **Tostado** | `#1E1814` | tostado. A marca. |
| **Linho** | `#EDE8DE` | linho. O campo onde assenta. |
| **Vinho** | `#5B2733` | o unico acento. |
| **Cinza** | `#6A635C` | para a letra miuda. |

O acento e um vinho e nao a argila quente para onde este tipo de marca
costuma cair. O **simbolo e de uma cor so** - Tostado ou Linho, a que o
fundo pedir - para aguentar ser carimbado em qualquer coisa.

### Onde esta

- O terceiro card do cabecalho, com a assinatura inteira.
- O terceiro prato de construcao, com o simbolo nu sobre as guias: onde
  cada migalha comeca e acaba, e o arco por onde todas sobem.
- O descritor existe nas duas linguas: "Cozinha e mesa" / "Kitchen and
  table", e a linha legal "Briciola Restauracao e Hotelaria, Lda." /
  "Briciola Restaurants & Hospitality, Lda.".

### Mais perto da referencia (2026-11-20)

O utilizador pediu duas vezes mais semelhanca e depois **cerca de 99%**,
com as migalhas **no meio do texto**. Ficou assim:

- as migalhas saem do **segundo i**, que e a letra que cai no meio de
  "briciola", e nao do primeiro. O i perde o ponto, elas ocupam-lhe o
  lugar;
- deixaram de ser quatro em arco ordenado e passaram a **um bando de
  dez**, atirado para cima e a espalhar-se, como no *crunch*;
- **nenhum dos dez e simetrico**: quatro pontos iguais leem-se como um
  brilho, e um brilho nao e uma migalha.

**O que continua a nao ser emprestado, e porque.** A 99% o desenho
deixa de ser inspirado e passa a ser a marca de outra pessoa com outra
palavra la dentro, e a referencia e uma marca real. Por isso duas
coisas ficam nossas: **as letras**, que sao geometria verdadeira e nao
as formas cortadas a mao da referencia, com a sua inclinacao e os seus
terminais irregulares; e **a cor**, um campo de linho e uma marca
tostada em vez do amarelo alto. Sao essas duas que mantem isto um
trabalho nosso e nao uma copia apresentada como tal.

**O que custa a semelhanca:** dez flocos pequenos nao leem a 16 px. O
simbolo sozinho aguenta como desenho mas nao como icone miudo - e a
referencia tambem nao tem simbolo separado.


## Briciola, refeita a partir de duas referencias novas (2026-11-20, mais tarde)

O utilizador trouxe **duas referencias novas** - trocou-as a meio - e
pediu a identidade outra vez, com **80% de precisao em relacao as
duas**, nenhuma a pesar mais do que a outra, e com um **sistema basico
de cores** apresentado como um mini sistema visual. As versoes
anteriores (Geranos/Pomodoro, "crunch" para interiores, "crunch" para
restauracao, e uma tentativa a partir de uma mao vermelha com uma
grotesca pesadissima) ficam no historico do git; em codigo fica so
esta.

As referencias:

1. **o desenho** - um empregado de mesa feito a pincel numa linha so,
   caricatura a tinta preta sobre creme, com a cloche numa mao e o
   braco livre num arco largo por cima da cabeca;
2. **o logotipo** - PIATTO, uma Didone alta e estreita em caixa alta,
   num vermelho fundo sobre creme, com as hastes finas muito finas.

### O que vem de cada uma

**Do desenho, o simbolo e a tinta.** Uma linha de pincel de espessura
quase constante com as pontas redondas, nada cheio e nada medido, e o
assunto tirado de la de dentro: a **cloche** que o empregado carrega,
com o **arco** do braco livre guardado por cima dela. A tinta e o
preto do desenho, nao o vermelho da palavra.

**Do logotipo, a disciplina.** O nome numa linha de **Didone**, caixa
alta, alta e estreitada, com as hastes finas deixadas finas; o
**vermelho fundo**; e o creme onde tudo assenta. A linha por baixo e
composta na mesma face, aberta, em vez de numa monoespacada, para a
assinatura falar numa voz so.

### Os 20% que sao nossos

As duas puxam para lados opostos: uma e uma piada contada a tinta, a
outra e uma letra fria e perfeita. A toda a forca leem-se como duas
marcas pregadas lado a lado. Tres coisas fecham a distancia:

- **o desenho e reduzido ao que ele e.** A referencia e uma caricatura
  inteira - figura, cara, arco, tabuleiro; a nossa fica em quatro
  tracos, e uma marca de quatro tracos pode ser carimbada num
  guardanapo, coisa que uma caricatura nao pode;
- **as migalhas sao acrescentadas, e sao elas a ponte.** O nome e uma
  migalha, por isso tres caem de debaixo da cloche. Sao a unica coisa
  da marca que nao vem de nenhuma das duas referencias, e a unica que
  faz disto este negocio e nao outro qualquer;
- **o vermelho recua** do brilho da referencia para um *rosso antico*,
  e o desenho fica a tinta. E essa divisao que impede as duas metades
  de brigarem.

### O sistema de cores

Declarado em `.vi-logo-bri` (`globals.css`) e em mais lado nenhum:

| | | |
| --- | --- | --- |
| **Rosso Antico** | `#9B2A2A` | a palavra. |
| **Inchiostro** | `#15120F` | o desenho. |
| **Panna** | `#F4EFE6` | o fundo onde os dois assentam. |
| **Cenere** | `#8A8178` | a letra miuda. |

A divisao e o sistema: **a marca e tinta, a palavra e vermelha, o
fundo e creme**, e nada e uma terceira coisa. O simbolo e sempre de
uma cor so, a que o fundo pedir.

**Nas nossas paginas a marca continua a preto e branco**, como a da
Pilar e a da limen: a cor pertence ao quadro da marca, nao a nossa
pagina, que so admite o ciano das guias.

### Como esta feito

- **O simbolo** (`BriciolaAfter`): oito formas - o arco, a cupula, a
  haste, o botao, a linha do prato e as tres migalhas - para o card
  poder construi-lo uma de cada vez. E desenhado **a traco e nao a
  cheio**: a referencia e um pincel, e um pincel nao tem contorno para
  preencher.
- **As migalhas sao formas desenhadas, nao elipses rodadas.** O
  atributo `transform` numa forma com `.vi-sh` colide com o
  `transform-box: fill-box` que a animacao usa, e a forma salta para
  fora da chapa. Se alguma vez forem redesenhadas, tem de continuar
  sem `transform`.
- **A palavra** (`BriciolaWord`): composta em SVG e nao num `<span>`,
  para a marca nao assumir nada sobre o que esta por baixo e para o
  estreitamento ser o mesmo em todo o lado - o `textLength` segura a
  linha a mesma largura seja qual for a face que a desenhe, e e isso
  que estreita a Didone como a da referencia (cerca de 16%).
- **O quadro**: `docs/briciola/sistema-visual.html`, um ficheiro so,
  para abrir no browser - assinatura, construcao, o simbolo sobre os
  tres fundos, cor, tipografia, as migalhas, aplicacoes e tamanho
  minimo.

### O que fica por decidir

- A chapa de construcao diz «nada e desenhado a olho: cada aresta
  assenta numa guia», e esta marca **e** desenhada a olho. As guias
  marcam a largura da cupula, a linha do prato e o circulo em que a
  cupula assenta, mas a frase fica a puxar contra o desenho. Ou a
  Briciola sai dessa fila, ou a frase ganha uma excecao.
- Se o quadro deve virar uma pagina do site ou ficar so como ficheiro
  de referencia.
- Se vale a pena um bloqueio horizontal (cloche a esquerda, palavra a
  direita) para sitios baixos e largos: por agora so existe o
  vertical.
