# Funcionalidades de Back End — decisões

A página do serviço (`/services/back-end-features`,
`/pt/servicos/funcionalidades-back-end`), em `src/components/back-end.tsx`,
com os estilos `.be-*` ao fundo de `src/app/globals.css`. Pedida pelo
utilizador a 2026-11-17, a partir do texto do estúdio.

## O sistema

É a quarta página de serviço feita com o mesmo sistema da Sessão
Fotográfica e da Identidade Visual, para as quatro se lerem como uma só:

- o mesmo cabeçalho (`.ps-head`), alinhado à esquerda, sem botão próprio
  — a barra leva a proposta sempre e a página acaba em "Let's work
  together";
- um só `ToneRoom`, com as secções a virar de claro para escuro por baixo
  do véu tonal;
- o mesmo `SlideIn` em cada título e a mesma linha de entrada
  (`.ps-lede`) no início de cada secção;
- o mesmo livro-razão de linhas (`.sht-*`) que a secção "o que inclui" da
  sessão fotográfica usa.

## O tom

O serviço é o mais técnico dos quatro, e foi escrito como o utilizador
pediu: para quem tem um negócio pequeno, com o resultado prático à frente
e a tecnologia atrás. Nenhum termo técnico fica sozinho — "base de
dados" vem sempre com o que faz. Não há uma única palavra em inglês que
não seja o nome do serviço.

## As quatro secções

1. **Porquê, mesmo para o negócio mais pequeno.** A frase do estúdio
   sobre o digital e as inteligências artificiais acende-se palavra a
   palavra à medida que é lida (`Illuminated`, o mesmo mecanismo da
   comparação da página inicial). Só arranca quando a frase é alcançada,
   e até lá as mesmas palavras estão no mesmo sítio, no mesmo tipo, para
   nada saltar. Por baixo, o mesmo dia contado duas vezes: à mão e com um
   back end. À direita, as tarefas que deixam de ser feitas à mão riscam-
   se e apagam-se, uma a seguir à outra, e fica de pé "O que sobra é o
   trabalho em si."
2. **O que são.** Três coisas que se veem em vez de se lerem: um pedido a
   cair numa tabela, um calendário a preencher-se e um e-mail a
   escrever-se com os espaços preenchidos. Cada uma é o lugar da captura
   de ecrã real: enquanto o ficheiro não existir, a pequena interface
   anima-se ali, com a mesma forma e o mesmo tamanho. Fecha com "e
   outras: não há uma lista fechada".
3. **O que a empresa ganha.** Nove linhas num livro-razão. Nenhuma tem um
   número — "x horas poupadas por semana" seria inventado, e o estúdio
   não deu nenhum.
4. **Simples, eficientes, feitas para uma empresa pequena.** As
   ferramentas como nós ligados por fios, com a informação a correr por
   eles (em pé no telemóvel, deitado a partir dos 820px), e três linhas:
   as ferramentas, como as interligamos e o serviço mensal.

## Referências (Inspo)

- **n8n**, a tela de trabalho: nós ligados por fios sobre fundo escuro —
  a composição do diagrama da secção 4.
- **Factory**, os preços: numeração em mono sobre linhas regradas — a
  composição do livro-razão da secção 3.

Só a composição veio; a cor, o tipo e o espaçamento são os da casa.

## À espera do estúdio

Três coisas ficaram em branco no texto que o estúdio deu, e não são para
inventar. Leem-se `[a preencher]` (`TO_FILL`), como tudo o que falta
neste site:

- **as ferramentas** que usamos;
- **como as interligamos**;
- **o valor** do serviço mensal.

Os três nós do diagrama são essas ferramentas, por isso enchem-se com os
nomes assim que o estúdio os der — sem mexer no código.

## Imagens

Três lugares em `public/back-end/`, com o README a dizer qual o ficheiro
de cada um (4:3, `.webp`). São capturas de trabalho real: qualquer dado
de cliente tem de ser trocado por dados inventados antes de entrar.

## Os gráficos (2026-11-17, segundo pedido)

A estrutura, os textos e o cabeçalho ficaram como estavam; o que entrou
foram desenhos, por cima do que já se lia.

**Todos os números estão em `src/lib/back-end-figures.ts`, e só aí.** O
ficheiro não tem palavras: as etiquetas continuam no componente, em
português e em inglês. Cada gráfico diz por baixo **"Valores
ilustrativos"**, e assim fica enquanto forem inventados. As horas
poupadas e a repartição da semana são **calculadas** a partir da tabela
de tarefas, para os dois gráficos nunca se desencontrarem.

Os desenhos estão em `src/components/back-end-charts.tsx`, com os
estilos `.bef-*`. Não entrou nenhuma biblioteca de gráficos: é SVG e CSS
da casa.

1. **Porquê** — duas linhas ao longo de dois anos, com o primeiro mês
   como 100. Descobrem-se da esquerda para a direita quando a secção é
   alcançada. O cursor levanta uma mira e um painel com os dois valores
   do mês; as setas ← e → fazem o mesmo pelo teclado.
2. **O que são** — três cartões (pedidos, marcações, e-mails) que contam
   até ao valor quando entram no ecrã. São números-resumo, não gráficos,
   por isso não têm tooltip: o número já está escrito.
3. **Como beneficiam** — as horas de uma semana por tarefa, à mão e com
   um back end (de pé no computador, deitadas no telemóvel, porque cinco
   colunas não deixam espaço para o nome); a semana de 40 horas repartida
   num anel; e o contador grande das horas devolvidas, com o número
   metido na frase que o lê.
4. **As nossas soluções** — o diagrama substituiu a linha de nós: o
   website, as três ferramentas e o cliente, com os dados a correr pelos
   fios (em pé no telemóvel). E duas barras com o custo de um mês.

### As regras que todos seguem

- **Sem cor a distinguir séries.** A marca tem duas cores, por isso o que
  separa uma série da outra é a espessura, o preenchimento e o nome
  escrito ao lado do desenho. É também o que os faz ler em preto e
  branco, em impressão e para quem distingue cores de outra maneira.
- **Animam uma vez.** `useSeenOnce` guarda que já foi visto; não repete.
- **O valor nunca depende do rato.** Está sempre escrito no desenho, na
  legenda ou na linha por baixo; o tooltip só acrescenta.
- **Alvos maiores do que a marca.** Uma barra de 0,3 h tem uma área de
  toque muito maior do que o traço que se vê.
- **Com movimento reduzido**, tudo aparece feito: sem contagens, sem
  traços a crescer, sem dados a circular.

### Método e referências

Método: a skill **dataviz** (escolher a forma antes da cor, marcas
finas, eixos a fio, rótulos só onde contam a história, o fundo a separar
marcas encostadas em vez de um contorno). Direção: a skill
**frontend-design**. Referências pelo **INSPO MCP**: o contador da
Bandcamp (o número metido na própria frase) e a tela do n8n (nós ligados
por fios) — só a composição; a cor e o tipo são os da casa.

As skills `gpt-taste`, `stitch-design-taste` e `design-taste-frontend`
não foram aplicadas: refazem a página inteira no sistema delas e isso
contraria o que ficou assente, que é esta página seguir as outras
páginas de serviço.

### A substituir

`COST.traditional` e `COST.ours` em `back-end-figures.ts` são os valores
do custo mensal, à espera do preço do estúdio. Os nomes das três
ferramentas continuam a vir de `TO_FILL`, e o diagrama enche-se sozinho
quando chegarem.

## O elemento do cabeçalho (2026-11-17, terceiro pedido)

Escolhida a **opção B**: um elemento novo, em vez de mudar de sítio um
dos que já existiam. A opção A pedia tirar o mini painel ou o diagrama
da secção onde está, e os dois estão lá a fazer um trabalho que mais
nada faz — o painel dá os números a seguir às três interfaces, o
diagrama é a única coisa que mostra como as ferramentas se ligam. Tirar
qualquer um deixava um buraco para tapar com outra coisa.

`RequestLoop` (em `back-end-charts.tsx`, estilos `.be-rl-*`) mostra um
pedido a andar pelo back end, em quatro passos ligados por um fio com um
ponto a descer: o formulário é enviado, o pedido entra na base de dados,
a marcação ocupa o calendário, a confirmação sai. No fim recomeça com um
pedido novo.

- O texto, a ordem e os três factos do cabeçalho ficaram como estavam.
  O que entrou foi `.be-head-top`, que a partir dos 1024px põe o
  elemento ao lado das palavras; abaixo disso ele cai para debaixo do
  texto do hero, antes dos factos, e mantém o tamanho.
- É apoio, não manchete: fios de 1px da mesma espessura da régua dos
  factos, rótulos em mono de 10px, e nada mais claro do que o título ao
  lado. O branco cheio só aparece no passo que está a acontecer.
- Com movimento reduzido fica parado no estado final, com os quatro
  passos dados e sem pontos a circular.
- Lê-se sem texto explicativo; os rótulos de uma palavra estão lá como
  nome de cada passo, não como explicação, e o conjunto tem um
  `aria-label` que conta a mesma história por palavras.

Referência pelo INSPO MCP: a Builder.io (título à esquerda, interface do
produto à direita, sobre preto) — só a composição. A nossa é muito mais
contida: sem capturas de ecrã, sem cor de destaque, só fios e tipo.

## A página refeita (2026-11-18, quarto pedido)

O utilizador reviu a página print a print. O que ficou:

**Hero.** Passou do preto para o cinzento quente `#f4f4f2` — o mesmo
das folhas dentro do card da Personalização do Side by Side (escolhido
pelo utilizador de entre três cinzentos, 2026-11-18, porque não havia
um cinzento já usado nos headers dos serviços: os da Sessão Fotográfica
e da Identidade Visual são pretos). O título ficou em cima de tudo, com
o rótulo por baixo dele. O pequeno elemento de ontem (`RequestLoop`)
deu lugar a `ProcessCard`: um card retangular, do formato e do feitio
do card da Personalização, com os quatro passos listados de um lado
(ligados por um fio com um ponto a descer) e, do outro, o passo a
acontecer numa folha branca — o formulário a ser enviado, o pedido a
cair na tabela, o calendário a ser ocupado, a confirmação a sair.
Recomeça sozinho. Com movimento reduzido fica no último passo.

**A abertura** ("A parte do website que trata da papelada") saiu.

**Porque deve um negócio pequeno investir em soluções de back end.**
Fundo branco. "O trabalho de secretaria não paga as contas", e por
baixo a frase onde a palavra **horas** se acende: um bloco preto
desenha-se por trás dela da esquerda para a direita e a palavra passa a
branco. As barras das horas e o anel da semana passaram para dentro de
um card cinzento, com o contador das horas devolvidas no pé. Saíram a
lista "Um dia à mão" e o gráfico das duas linhas de crescimento: diziam
o mesmo que o card.

**As percentagens do anel** somavam 101% por arredondamento. Agora
guardam a meia casa onde existe: 62,5% + 31% + 6,5% = 100%.

**As nossas três soluções de back end.** Fundo branco, três cards, cada
um com o fio da página da Sessão Fotográfica — a linha-guia do mapa,
com a mesma espessura e o mesmo ponto na ponta — a descer do nome e a
atravessar até ao desenho da solução. Desenha-se quando os três são
alcançados. No fim, um retângulo cinzento, ao feitio do bloco preto do
portfolio, para o que as três não cobrem, com o botão do formulário.

**Um mês de um negócio pequeno** (os três cartões de números) saiu.

**O que a empresa ganha** ficou compacto: os nove títulos sempre à
vista e a descrição só quando é pedida. É feito com `<details>`, por
isso funciona com o teclado e sem script nenhum; abrir um fecha o
anterior (`name="be-nine"`).

**Como é feito** saiu da página e está inteiro em
`src/components/back-end-built.tsx`, com o sítio onde pode ser
reaproveitado escrito no topo do ficheiro. A primeira escolha é o Side
by Side, por baixo do "nosso" website: é o único desenho do site que
mostra o que está por trás de um website nosso.

**Como funcionam os preços** é nova, antes do CTA final: o valor de
implementação (depende das soluções e de quanto têm de ser
interligadas), o serviço mensal simbólico, e a reunião inicial
gratuita. Os dois valores leem `[a preencher]`.

### Skills e referências

A skill `gpt-taste` foi invocada a pedido do utilizador. Dela ficou o
que não choca com o sistema da casa: títulos em contentores largos (o
H1 nunca passa de duas ou três linhas), espaçamento generoso entre
secções, cards que respondem ao ponteiro e grelhas sem células vazias.
O resto dela — GSAP, fontes à sorte, imagens do picsum, a proibição dos
rótulos em mono — contraria o que está assente neste ficheiro e no
CLAUDE.md, e o projeto ganha. A `dataviz` e a `frontend-design`
continuaram a valer para os desenhos. O INSPO MCP foi consultado para
listas compactas e interativas; não devolveu nada melhor do que a
linguagem de linhas que o site já tem, por isso o acordeão é feito
dela.

**O botão do retângulo cinzento saiu** (user, 2026-11-18): o bloco
mantém o texto e fica só com ele. A barra leva o formulário em todo o
lado e a página acaba em "Let's work together", pelo mesmo
raciocínio que tirou os botões dos cabeçalhos dos serviços.

### O cinzento era só para os gráficos (2026-11-18)

Corrigido no mesmo dia: o cinzento que o utilizador tinha sugerido era
para o **fundo dos gráficos**, não para a página. As cores da página
voltaram ao que eram — cabeçalho preto, "porque deve investir" preto,
as três soluções e os nove ganhos em branco, e os preços pretos, onde
dantes estava o "como é feito" — e o cinzento ficou onde foi pedido:

- o card onde o pedido anda (`.be-pc`) e o card que segura os desenhos
  da semana (`.be-card`) usam o mesmo fundo escuro do card da
  Personalização do Side by Side, que foi o exemplo que o utilizador
  deu em print;
- dentro deles, os desenhos passam para o jogo escuro dos tokens
  `.bef` (`data-dark`): as barras, as duas sombras do anel, as chaves
  da legenda e o contador viram passos de branco.

O título continua no topo do cabeçalho e o retângulo cinzento das três
soluções fica como estava, porque esse foi pedido cinzento de propósito.


## A página em movimento (2026-11-19, quinto pedido)

Pedido secção a secção, com a skill `redesign-skill` (taste-skill) e o
INSPO MCP. As cinco peças novas estão em
`src/components/back-end-motion.tsx`, com os estilos no fim do bloco
`.be-*` de `globals.css` ("the back-end page in motion"). O `ProcessCard`
continua em `back-end-charts.tsx`, sem uso, como manda a regra dos
componentes antigos.

**1. Cabeçalho.** O H1 fica onde estava; o card passou para baixo dele,
em toda a largura (`DepthCard`). Saíram os três factos ("Pedidos e
contactos", "Calendários e reservas", "E-mails"): é o card que os mostra.
O card conta um pedido em profundidade, como o da Personalização: o
formulário à frente, e atrás dele as três folhas (base de dados,
calendário, e-mail) em leque, umas atrás das outras. O pedido entra no
leque, e a folha onde ele está sai para a frente, iluminada: a linha
cai na tabela, a vaga é ocupada no calendário, o e-mail escreve-se e leva
o visto. No fim, as três vêm para a frente lado a lado, direitas, ligadas
por fios com os dados a correr. Cada passo tem a sua legenda por baixo
(cinco, em PT e EN), com uma régua de cinco traços a mostrar onde vai.
Recomeça sozinho; para quando sai do ecrã; com movimento reduzido fica
no último passo. No telemóvel os nomes dentro das folhas escondem-se (não
se leriam); a legenda diz o mesmo.

**2. Porque deve investir.** As barras, o anel e o contador são agora
três cards (`GlowTrail`), dispostos como o esboço do utilizador: o grande
à esquerda, o mais pequeno à direita e mais abaixo, o médio ao centro no
fundo (numa grelha de 12 colunas: 1–8, 7–12, 3–9; empilhados abaixo de
900px). Uma luz suave anda com o scroll do centro de um card para o
centro do seguinte, e o card onde ela está acende a borda. Sem luz com
movimento reduzido.

**3. As três soluções.** O rótulo e o título diziam o mesmo; ficou só o
título, com o nome que o utilizador usa: "As nossas três principais
soluções de back end". Os cards passaram ao cinzento escuro do card da
Personalização, com o texto claro. No computador (a partir de 1024px de
largura e 800px de altura) a secção fica presa e o scroll puxa os cards
uns dos outros (`DragRun`): o da esquerda entra pela esquerda, o do
centro nasce de trás dele e é empurrado para o centro, o da direita nasce
de trás do do centro. O fio de cada card desenha-se quando ele assenta.
Por fim, o bloco "É preciso algo mais específico?" nasce de debaixo dos
três, no mesmo cinzento. Só a pergunta fica em tamanho de título; "Não há
problema. Basta dizer…" passou a texto. No telemóvel e em ecrãs baixos
entram da esquerda, um a seguir ao outro, quando são alcançados.

**4. O que a empresa ganha.** Opção A. Os nove pontos juntaram-se em três,
sem perder nenhuma informação dos nove:

- *O dia é gerido, não corrido*: o tempo organizado, as decisões sobre
  os números do negócio, e cresce com a empresa;
- *Nada se perde*: nada se perde, o que se sabe do cliente fica guardado,
  e menos erros à mão;
- *O cliente sente a diferença*: respondido mais depressa, menos faltas,
  e parece uma empresa.

O título passou a "Três coisas, e o tempo é só a primeira." Os nove
continuam no código (`gains()`), sem uso. À esquerda os três; à direita
um card preso ao ecrã cujo desenho muda para o ponto que se está a ler
(`GainStory`; referência Linear Features, pelo Inspo: só a composição):
a semana a arrumar-se com o fim do dia livre e a linha dos números a
subir; o registo de um cliente a encher-se sozinho; um telemóvel a
receber a confirmação às 23:47, o lembrete na véspera e uma resposta que
conhece o histórico. No telemóvel cada desenho vem debaixo do seu ponto.

**5. Como funcionam os preços.** Opção A: uma linha que o scroll desenha
(`PriceLine`), na ordem em que as coisas acontecem — a reunião inicial
(gratuita) primeiro, depois a implementação (uma vez), depois o serviço
mensal (um anel que gira). Cada paragem tem um rótulo de quando, o nome,
o valor em grande e uma linha. "Duas que vivem sozinhas custam menos…"
ficou como nota debaixo da implementação, para não se perder. Os valores
continuam `[a preencher]`. Deitada no computador, em pé no telemóvel.

Fica por correr `node audit/seo-check.mjs` contra uma build de produção
(a build parte o servidor de desenvolvimento enquanto ele corre).

## Segunda volta (2026-11-19, sexto pedido)

**O card do cabeçalho, mais fundo.** Passou para
`src/components/back-end-depth.tsx` (`DepthSystem`, estilos `.be-ds-*` e
`.be-x-*`); o `DepthCard` da primeira volta fica no código, sem uso. As
folhas são interfaces a sério, com nomes, horas e estados inventados:

- **Base de dados**: seis pedidos a entrar um por linha, com cliente e
  e-mail, pedido, origem, hora e estado, debaixo de uma pesquisa, um
  filtro e a contagem; o mais recente realçado; "Guardado à chegada".
- **Calendário**: a semana (seg–sex, 9h–13h) com as marcações; a nova
  cai no seu lugar e abre-se, a mostrar tudo o que fica guardado
  (cliente, quando, com quem e em que sala, contacto mascarado, lembrete,
  notas, de onde veio). Depois, um passo próprio: o mesmo calendário como
  reservas de um restaurante, por mesa e por meia hora, com os lugares
  ocupados e os livres.
- **E-mail**: os e-mails que saíram sozinhos, um por linha (para quem,
  assunto, modelo, hora, estado); depois o que acabou de sair, aberto,
  com os espaços do modelo ({nome}, {serviço}, {data}, {quem}) a
  preencherem-se, e quanto tempo depois do pedido saiu.
- **No fim** as três encolhem lado a lado, ligadas, e depois ficam no
  meio de um back end maior, desenhado quase sem pormenor (pagamentos,
  faturação, área de cliente, avaliações, stock, escalas, SMS,
  relatórios): "E outras, feitas à medida de cada negócio".

Sete passos, sete legendas. O tamanho das folhas lê-se pela largura do
próprio card (abaixo de 600px as folhas ocupam quase tudo e as colunas
menos importantes saem).

**Porque investir.** O esboço era um esboço: os três cards encaixam
agora em ziguezague — o largo à esquerda, o anel à direita e mais
abaixo, ao lado dele, e o contador debaixo do primeiro, um pouco para
dentro — em vez de três linhas separadas.

**As três soluções.** Ganhou o eyebrow "O que construímos"; a secção
fica presa mais acima; os três cards descem em degraus da esquerda para
a direita; "É preciso algo mais específico?" ficou mais pequeno.

**O que a empresa ganha.** Mais compacta: cada ganho tem o nome, uma
frase que o abre, e o resto em linhas curtas com a palavra-chave a negro,
que só se desdobram no ganho que está a ser lido (pelo Inspo: os termos
em destaque da The Equity Fund e a lista que se dobra das Features do
GitHub; só a composição). As palavras são as mesmas dos parágrafos,
cortadas onde cada facto acaba. O card de fundo toma o tamanho do desenho
que segura (largo para a semana, alto para o telemóvel), com a mesma
margem à volta.

**Como funcionam os preços.** A linha responde mais cedo (começa quando
a secção entra no fundo do ecrã) e cada paragem acende um pouco antes de
a linha lá chegar. O tipo passou de cinco níveis a três: o nome pequeno,
o valor grande (com "uma vez" / "por mês" ao lado, pequeno), e a linha
por baixo. O rótulo mono por cima saiu.

## Terceira volta (2026-11-19, sétimo pedido)

**Um negócio de cada vez.** Misturar uma clínica, uma imobiliária e um
restaurante na mesma lista não fazia sentido. Cada folha mostra agora um
negócio e depois, mudando só o conteúdo, os outros dois — sempre pela
mesma ordem: clínica de estética, imobiliária, restaurante. O nome do
negócio está na etiqueta da folha e no fim da legenda.

- **Base de dados**: seis pedidos de cada negócio, um por linha.
- **Calendário**: a semana de consultas da clínica, com a marcação nova
  aberta em zoom; a semana de visitas da imobiliária; as mesas do
  restaurante ao jantar. O passo à parte do restaurante saiu: é agora a
  terceira versão do calendário.
- **E-mail**: os e-mails enviados sozinhos de cada negócio; o da clínica
  abre-se com os espaços a preencher.
- A clínica é o negócio por onde o pedido passa: o formulário, a linha,
  a marcação aberta e o e-mail aberto são todos da Marta.

Cada versão é uma camada (`.be-lay`) da mesma folha; só a que está a ser
mostrada tem `data-live`, que é o que lhe começa os movimentos.

**O sistema do fim, mais simples.** Ainda não montamos ecossistemas
completos, por isso saiu o que o estúdio não faz (pagamentos, faturação,
stock, SMS). À volta das três ficam seis coisas simples feitas à medida:
portal de clientes, portal da equipa, formulários à medida, lista de
espera, pedidos de avaliação e relatórios mensais (à espera de o estúdio
confirmar a lista). E têm todas a mesma estética das três: a mesma folha
branca, do mesmo tamanho, quase sem pormenor, em três linhas por três
colunas, com o nome por baixo e um fio para a da sua coluna. As caixas
escuras de antes saíram.

**1,5 vezes mais depressa.** Os tempos do card dividem-se por `SPEED`
(`back-end-depth.tsx`), e a página corre todas as animações e transições
CSS a 1,5 (`usePageSpeed` em `back-end.tsx`, o mesmo método do card da
Personalização), por isso os tempos escritos guardam as proporções. O que
o scroll conduz não tem tempo e não muda. As contagens dos números
(`useCount`) continuam ao ritmo de antes.

## Quarta volta (2026-11-19, oitavo pedido)

**Os três negócios com a mesma profundidade.** A imobiliária e o
restaurante estavam incompletos; agora cada um tem tudo o que a clínica
tem:

- **o formulário** do início em três versões (marcar consulta, pedir
  visita, reservar mesa), cada uma com o seu pedido (Marta, Rui, Ana);
- **a marcação aberta** no calendário: a visita ao T2 (consultor, morada,
  chaves, o que procura) e a mesa para 4 (mesa, cadeira de bebé, alergia,
  lembrete), além da consulta da clínica (`Detail`);
- **o e-mail de confirmação** aberto, com os espaços a preencher, para os
  três (visita confirmada com o consultor; mesa reservada com a cadeira de
  bebé guardada).

Cada pedido corre a cadeia toda no seu negócio: o Rui pede a visita de
quinta às 12:00, é essa visita que se abre no calendário e é essa que o
e-mail confirma; o mesmo para a Ana, sábado às 20:30.

**O monte à direita.** As folhas em espera eram translúcidas e liam-se
umas através das outras. Agora são folhas opacas, escurecidas, com o
conteúdo apagado, empilhadas uma atrás da outra; só se veem as margens, e
a que vem a seguir é a da frente.

**O sistema do fim.** O utilizador gostou dos portais e dos formulários;
ficaram o portal de clientes, o portal da equipa e os formulários à
medida. As outras três passaram a ser coisas que estes mesmos negócios
pedem e que o estúdio já faz: uma calculadora de orçamentos (como a da
página de SEO & GEO), um catálogo que o próprio negócio edita
(tratamentos, imóveis, menu) e uma pesquisa com filtros por cima dele.

## Porque investir: a escada da primeira versão, acertada (2026-11-19, nono pedido)

O utilizador queria o desalinhamento da primeira versão, só com ajustes
pequenos: a mudança da segunda volta (as cards encaixadas em ziguezague)
saiu, e a escada em diagonal voltou — barras em cima à esquerda, o anel à
direita, o contador ao centro, por baixo.

O que a tornou exata, em vez de estranha:

- as três com a **mesma largura** (14 de 24 colunas);
- **passos iguais**: a primeira encostada à esquerda, a segunda à
  direita, a terceira exatamente ao meio (a 261px de cada uma, a 1440px);
- **o mesmo espaço vertical** entre cada uma;
- no card do anel, agora tão largo como os outros, **o anel e as três
  partes lado a lado**, para não ficar um anel perdido num card vazio;
- a borda acesa pela luz mais **discreta** (um fio, não uma moldura).

A segunda volta perdia as margens para uma regra posterior
(`.be-trail .be-trail-card { margin-top: 0 }`, da mesma força); as
posições estão agora debaixo de `.be-trail .be-trail-card[...]`.

**Os gráficos maiores** (2026-11-19, décimo pedido). As posições ficaram;
os cards passaram de 14 para 16 das 24 colunas, na mesma regra (encostado
à esquerda, encostado à direita, o terceiro exatamente ao meio), e o que
está dentro cresceu: as barras até 300px de altura (eram 180), o anel até
288px (era cerca de 200), o número do contador até 11,5rem (era 8,5), e os
nomes e valores que os acompanham um passo acima.

**A luz passou a meteorito** (2026-11-19, décimo primeiro pedido). A
mancha difusa saiu: agora é uma cabeça pequena e brilhante com um rasto
fino, quase uma linha (um traço curto e claro logo atrás e um mais longo
e ténue atrás desse), por cima de um trilho quase invisível. Já não se
esconde atrás dos cards: corre pelos espaços à volta deles, como uma pista
num circuito — desce pelo lado esquerdo do primeiro, atravessa o espaço
por baixo dele, desce pelo lado direito do segundo, volta pelo espaço por
baixo deste e desce pelo lado esquerdo do terceiro. O percurso lê-se das
próprias posições dos cards, por isso acompanha-os a qualquer largura. O
card por onde vai passa a ter a borda acesa. Os espaços entre os cards
cresceram (até 5,5rem) para se ver o meteorito a passar.

**O meteorito acompanha quem lê** (2026-11-19, plano 004). Andava pela
fração do comprimento do percurso, por isso corria à frente da página nas
descidas e ficava para trás nas travessias compridas. Agora fica à altura
de uma linha de leitura a 55% do ecrã, píxel a píxel, ao descer por cada
lado; e atravessa cada espaço enquanto essa linha passa por ele, numa
janela de 80 a 140px acima e abaixo, sem nunca se afastar mais do que
isso. Aparece e desaparece com um esbatimento, em vez de surgir de
repente. Sem mola: o scroll já é suavizado pelo Lenis.

**Duas afinações** (2026-11-19). O meteorito começa mais cedo: a linha de
leitura que ele segue desceu de 55% para 65% do ecrã. A passagem para o
fundo branco das soluções começa mais tarde: quando o topo da secção está
a 60% do ecrã, em vez dos 75% comuns a todas as passagens. É só esta
passagem; o `ToneRoom` aceita agora `data-tone-from` em cada secção, e as
outras páginas que o usam ficam como estavam.

**O card do cabeçalho maior** (2026-11-19). O card cinzento ficou 20% mais
alto e a folha branca aberta passou de 60% para 72% da largura dele (887 x
517px a 1440px), com tudo o que tem dentro a crescer na mesma proporção.
O monte de trás e as vistas finais foram reajustados para manterem o
tamanho relativo. Corrigido também: os títulos das colunas do calendário
(dias e horas) ficavam uma coluna fora do sítio, porque eram colocados
antes da célula do canto; agora cada um tem a sua coluna.
