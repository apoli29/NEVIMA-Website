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
- **Verso (utilizador):** fundo branco com grãos pretos (a referência Duna, invertida). O grão é leve em todo o cartão e mais denso e irregular no canto superior direito, com uma risca curva e subtil nesse canto, desfocada pelo próprio granulado. À volta do "n", em baixo à direita, o grão rareia aos poucos, até 85% menos junto ao símbolo, para que se leia limpo (utilizador, 2026-11-14). O desenho do grão é fixo (semente em `cartao.js`): é igual nos dois cartões e sai igual sempre que se gera.
- **Informações (utilizador: a disposição da Antora):**
  - O "n" fica em baixo à direita. Tudo em Satoshi, em maiúsculas.
  - Na 2.ª ronda (utilizador, 2026-11-14), o nome e o cargo ficaram maiores e a hierarquia passou a ter três níveis:
    - **o nome**, em 10,5 pt e peso 700, em cima à esquerda;
    - **o cargo**, em 7,5 pt e peso 500, logo por baixo;
    - **os contactos**, em 6,2 pt e peso 500, em baixo à esquerda: o email e o telefone a preto e, depois de um intervalo, o site e o país a cinzento.
  - António Policarpo · Cofundador · antonio@nevima.studio · +351 910 555 780
  - Emanuel Costa · Cofundador · emanuel@nevima.studio · +351 917 861 347
  - Em português, com emails próprios (utilizador). **Os endereços antonio@ e emanuel@ têm de existir antes de se imprimir:** hoje o site só usa ola@nevima.studio.
- **Símbolo:** o "n" do wordmark, que já é o ícone do site (`src/app/icon.svg`), escolhido pelo utilizador enquanto não há símbolo oficial. Tem 4,1 mm de altura: eram 3,4 mm e o utilizador pediu mais 20% (2026-11-14). A base assenta na mesma linha que "Portugal" e o lado direito fica a 5 mm do bordo. Quando o símbolo existir, troca-se em `marca.js` (`n`) e volta-se a gerar.

## Para a gráfica

- `cartoes/cartao-antonio.pdf` e `cartoes/cartao-emanuel.pdf`: página 1 é a frente e página 2 é o verso.
- `cartoes/chapa-deboss.pdf`: a chapa do deboss, ou seja, o logótipo a preto sobre branco, vetorial, na mesma posição. Serve para o cunho e também para a tinta branca ou o foil branco.
- A frente imprime-se sobre o papel preto: o preto do PDF é o próprio papel e o branco é tinta branca opaca (ou foil branco), aplicada com o deboss. Na prova, o logótipo branco e a chapa coincidem.
- O verso é impressão digital a preto (só K) sobre o branco. O grão vem em imagem a 600 ppp.
- O texto vai incorporado no PDF (Satoshi, vetorial). Se a gráfica pedir o texto convertido em contornos, faz-se no Illustrator a partir do PDF.

## Os mockups

`cartoes/mockups/` tem `cartao-antonio.jpg`, `cartao-emanuel.jpg` (frente e verso, um sobre o outro, como na Antora), `cartoes-todos.jpg` (em grelha, como na Duna) e `deboss-detalhe.jpg` (a frente de perto). A luz vem de cima e da direita: a sombra cai para baixo e para a esquerda, e as paredes de cima e da direita de cada letra ficam na sombra. O fundo é uma cartolina cinzenta escura.
