# Cartões de visita: decisões

Os cartões do António e do Emanuel. A fonte é `cartoes/` (`cartao.js` desenha as duas faces em milímetros, `grao.js` o grão, `prova.html` os ficheiros para a gráfica, `mockup.html` os mockups). Para voltar a gerar tudo: `node cartoes/gerar.cjs` (Playwright, a partir da raiz).

## O cartão

- **Formato:** 85 × 55 mm, o corrente em Portugal, cantos retos, margens de 5 mm. Os PDFs têm 3 mm de sangria (91 × 61 mm) e não têm marcas de corte.
- **Papel:** algodão mate, grosso, como o da Antora (imagem 3 do utilizador). Um duplex: papel **preto** na frente colado a papel **branco** no verso, com cerca de 1 mm. A aresta mostra as duas camadas (o mockup desenha-a assim).
- **Frente (utilizador, 2026-11-14):** fundo totalmente preto, o wordmark **branco**, à esquerda e em baixo, quase de lado a lado (a referência "martillo"), com 75 mm de largura e a 5 mm do bordo esquerdo e da base. O logótipo é **prensado para dentro** do papel (deboss, não emboss; a referência AURORA). O utilizador corrigiu a primeira proposta (cartão branco, deboss com tinta preta): a frente é preta e o logótipo branco.
- **Verso (utilizador):** fundo branco com grãos pretos (a referência Duna, invertida). O grão é leve em todo o cartão e mais denso e irregular no canto superior direito, com uma risca curva e subtil nesse canto, desfocada pelo próprio granulado. O desenho do grão é fixo (semente em `cartao.js`): é igual nos dois cartões e sai igual sempre que se gera.
- **Informações (utilizador: a disposição da Antora):** nome em cima à esquerda; em baixo à esquerda o cargo, o email e o telefone; depois, a cinzento, o site e o país. O "n" fica em baixo à direita. Tudo em Satoshi, em maiúsculas: o nome a 700 e o resto a 500, com 6,6 pt.
  - António Policarpo · Cofundador · antonio@nevima.studio · +351 910 555 780
  - Emanuel Costa · Cofundador · emanuel@nevima.studio · +351 917 861 347
  - Em português, com emails próprios (utilizador). **Os endereços antonio@ e emanuel@ têm de existir antes de se imprimir:** hoje o site só usa ola@nevima.studio.
- **Símbolo:** o "n" do wordmark, que já é o ícone do site (`src/app/icon.svg`), escolhido pelo utilizador enquanto não há símbolo oficial. Quando o símbolo existir, troca-se em `marca.js` (`n`) e volta-se a gerar.

## Para a gráfica

- `cartoes/cartao-antonio.pdf` e `cartoes/cartao-emanuel.pdf`: página 1 é a frente e página 2 é o verso.
- `cartoes/chapa-deboss.pdf`: a chapa do deboss, ou seja, o logótipo a preto sobre branco, vetorial, na mesma posição. Serve para o cunho e também para a tinta branca ou o foil branco.
- A frente imprime-se sobre o papel preto: o preto do PDF é o próprio papel e o branco é tinta branca opaca (ou foil branco), aplicada com o deboss. Na prova, o logótipo branco e a chapa coincidem.
- O verso é impressão digital a preto (só K) sobre o branco. O grão vem em imagem a 600 ppp.
- O texto vai incorporado no PDF (Satoshi, vetorial). Se a gráfica pedir o texto convertido em contornos, faz-se no Illustrator a partir do PDF.

## Os mockups

`cartoes/mockups/` tem `cartao-antonio.jpg`, `cartao-emanuel.jpg` (frente e verso, um sobre o outro, como na Antora), `cartoes-todos.jpg` (em grelha, como na Duna) e `deboss-detalhe.jpg` (a frente de perto). A luz vem de cima e da direita: a sombra cai para baixo e para a esquerda, e as paredes de cima e da direita de cada letra ficam na sombra. O fundo é uma cartolina cinzenta escura.
