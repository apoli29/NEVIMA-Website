# Cartões de visita: decisões

Os cartões do António e do Emanuel. A fonte é `cartoes/` (`cartao.js` desenha as duas faces em milímetros, `grao.js` o grão, `prova.html` os ficheiros para a gráfica, `mockup.html` os mockups). Para voltar a gerar tudo: `node cartoes/gerar.cjs` (Playwright, a partir da raiz).

## O cartão

- **Formato:** 85 × 55 mm, o corrente em Portugal, cantos retos, margens de 5 mm. Os PDFs têm 3 mm de sangria (91 × 61 mm) e não têm marcas de corte.
- **Papel:** algodão mate, grosso, como o da Antora (imagem 3 do utilizador). Um duplex: papel **preto** na frente colado a papel **branco** no verso, com cerca de 1 mm. A aresta mostra as duas camadas (o mockup desenha-a assim).
- **Frente (utilizador, 2026-11-14):** fundo totalmente preto e o wordmark **branco**, à esquerda e em baixo (a referência "martillo"), a 5 mm do bordo esquerdo e da base. O logótipo é **prensado para dentro** do papel (deboss, não emboss; a referência AURORA). O utilizador corrigiu a primeira proposta (cartão branco, deboss com tinta preta): a frente é preta e o logótipo branco.
  - **2.ª ronda (utilizador, 2026-11-14):**
    - O wordmark passou de 75 mm (quase de lado a lado) para **62 mm**, para se ler alinhado à esquerda.
    - Leva o **™**, em Satoshi 500, a seguir ao "a", com o topo na altura de x. O ™ também vai na chapa.
    - As letras são **branco puro**: saíram a sombra interior, o brilho e as manchas de tinta. O relevo lê-se só no papel à volta das letras.
    - Nos mockups, a sombra diagonal da cena passa a ficar só no fundo, para não acinzentar o branco.
  - **3.ª ronda (utilizador, 2026-11-15: "garante que esse efeito é visível"):** só com os rebordos à volta, o relevo quase não se via no papel preto. Agora lê-se por dois sinais, os de um deboss real com a luz a vir de cima e da direita:
    - a **sombra que a parede projeta para dentro da letra**, ao longo do rebordo de cima e da direita (0,3 mm, macia);
    - um **fio de luz cinzento na parede de baixo e da esquerda**, que está virada para a luz.
  - O resto da face continua branco puro, sem manchas nem textura. Tirou-se o halo de luz à volta das letras, que se lia como brilho e não como relevo. Os valores estão em `DEBOSS_FILTER`, em `cartoes/cartao.js`.
  - **Seta (utilizador, 2026-11-15):** no canto superior direito da frente há uma seta diagonal ↗ com as duas hastes da ponta em ângulo reto (uma horizontal, outra vertical). A aresta de fora da ponta assenta nas margens de 5 mm; ocupa 4,2 mm, com hastes de 3,8 mm e traço de 0,8 mm (o utilizador pediu o cano bem mais curto e as hastes maiores; antes eram 6,5 mm e hastes de 3 mm). Depois ficou 20% menor (utilizador, 2026-11-15): 3,36 mm, hastes de 3,04 mm e traço de 0,64 mm.
  - **Notas do topo (utilizador, 2026-11-15, à maneira do menu da martillo):**
    - **Onde:** duas notas em duas linhas, uma no canto superior esquerdo e outra a começar a meio do cartão. A seta fica à direita, a apontar para o site.
    - **Estilo:** o do cargo do verso (Geist Mono 500, maiúsculas, espaçamento 0,06 em).
    - **Tamanho:** cada nota tem a altura da seta. O topo das maiúsculas alinha com o topo da seta e a base da segunda linha com a base dela, o que dá um corpo de cerca de 4,4 pt.
    - **Texto (utilizador, 2026-11-15):** à esquerda, "Soluções de websites / e design de topo"; a meio, os dois endereços, "nevima.studio / nevima.pt". Substituiu a primeira versão, escrita por mim ("Estúdio de web design / e identidade visual" e "nevima.studio / Portugal").
    - **Impressão:** são brancas e impressas sem deboss, porque o relevo comeria letra tão pequena. Não vão na chapa; a gráfica imprime-as a branco com o resto do branco da frente.
 É branca e prensada como o logótipo, e vai também na chapa (`SETA`, em `cartoes/cartao.js`). Ficou na frente porque no verso esse canto é o do grão e da risca.
- **Verso (utilizador):** fundo branco com grãos pretos (a referência Duna, invertida). O grão é leve em todo o cartão e mais denso e irregular no canto superior direito, com uma risca curva e subtil nesse canto, desfocada pelo próprio granulado. À volta do "n", em baixo à direita, o grão rareia aos poucos, até 85% menos junto ao símbolo, para que se leia limpo (utilizador, 2026-11-14). O desenho do grão é fixo (semente em `cartao.js`): é igual nos dois cartões e sai igual sempre que se gera.
- **Informações (utilizador: a disposição da Antora):**
  - O "n" fica em baixo à direita. Só se usam as letras do site.
  - Na 2.ª ronda (utilizador, 2026-11-14), o nome e o cargo ficaram maiores e a hierarquia passou a ter três níveis:
    - **o nome**, em cima à esquerda (na 2.ª ronda, Satoshi 700 em maiúsculas, a 10,5 pt);
    - **o cargo**, logo por baixo (na 2.ª ronda, Satoshi 500 a 7,5 pt);
    - **os contactos**, em 6,2 pt e peso 500, em baixo à esquerda: o email e o telefone a preto e, depois de um intervalo, o site e o país a cinzento.
  - **3.ª ronda (utilizador, 2026-11-15):** o estudo da letra do nome ficou dentro das letras do site, a variar o estilo, porque o utilizador não queria uma letra nova. Foi escolhida a opção C:
    - **o nome** fica como o site o escreve na página About: Satoshi em minúsculas, o primeiro nome em Light (300) e o apelido em Medium (500), a 15 pt, com espaçamento −0,035 em;
    - **o cargo** fica como os rótulos do site (`.mono-label`): Geist Mono 500, em maiúsculas, a 6,8 pt, com espaçamento 0,06 em;
    - **os contactos** não mudam (Satoshi 500 em maiúsculas, a 6,2 pt).
  - A Geist Mono está em `fonts/GeistMono/` (latin, 500, licença OFL), porque o site a carrega do Google e os cartões precisam do ficheiro local.
  - Ficaram de fora três letras novas (Instrument Serif, Archivo Expanded e Cormorant Garamond) e outros estilos do site: a Satoshi toda em Light ou toda em Medium, e a Instrument Sans em itálico.
  - António Policarpo · Cofundador · antonio@nevima.studio · +351 910 555 780
  - Emanuel Costa · Cofundador · emanuel@nevima.studio · +351 917 861 347
  - Em português, com emails próprios (utilizador). **Os endereços antonio@ e emanuel@ têm de existir antes de se imprimir:** hoje o site só usa ola@nevima.studio.
- **Símbolo:** o "n" do wordmark, que já é o ícone do site (`src/app/icon.svg`), escolhido pelo utilizador enquanto não há símbolo oficial. Tem 4,1 mm de altura: eram 3,4 mm e o utilizador pediu mais 20% (2026-11-14). A base assenta na mesma linha que "Portugal" e o lado direito fica a 5 mm do bordo. Quando o símbolo existir, troca-se em `marca.js` (`n`) e volta-se a gerar.

## Para a gráfica

O pacote a entregar (2026-11-17) são os cinco PDFs de `cartoes/`, todos gerados por `gerar.cjs`:

- **`ficha-grafica.pdf`:** uma página A4 com o mockup, as especificações e a lista de ficheiros. A fonte é `ficha-grafica.html`. As quantidades ficam em branco, para preencher.
- **`cartao-antonio.pdf` e `cartao-emanuel.pdf`:** a página 1 é a frente (igual nas duas pessoas, para referência e posição) e a página 2 é o verso.
- **`branco-frente.pdf`:** a camada do branco da frente, a preto sobre branco e vetorial: o logótipo, o ™, a seta e as notas. Serve para o foil branco.
- **`chapa-deboss.pdf`:** o cunho do deboss, a preto sobre branco: só o logótipo, o ™ e a seta. As notas não levam relevo.

O que a ficha pede:

- **Frente:** o preto é o próprio papel. O branco é foil branco mate e opaco, com o deboss na mesma passagem e em registo.
- **Verso:** preto só K. O cinzento fica a cerca de 55–60% K e o grão vem a 600 ppp.
- **Prova:** pedir uma prova antes da tiragem.

Sobre a fonte:

- **Formato no PDF:** o Satoshi vai incorporado no PDF como "Type 3", porque o Chromium trata assim a fonte variável. A licença (FFL) permite incorporá-lo, mas proíbe convertê-lo noutros formatos (instâncias estáticas incluídas), por isso ficou assim.
- **Se a gráfica pedir:** se pedir o texto em contornos ou em curvas, faz-se no Illustrator a partir do PDF, ou pede-se ao Claude que desenhe o texto em contornos.

## Os mockups

`cartoes/mockups/` tem `cartao-antonio.jpg`, `cartao-emanuel.jpg` (frente e verso, um sobre o outro, como na Antora), `cartoes-todos.jpg` (em grelha, como na Duna) e `deboss-detalhe.jpg` (a frente de perto). A luz vem de cima e da direita: a sombra cai para baixo e para a esquerda, e as paredes de cima e da direita de cada letra ficam na sombra. O fundo é uma cartolina cinzenta escura.
