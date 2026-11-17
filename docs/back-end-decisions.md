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
