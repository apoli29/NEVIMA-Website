# Fotografias da página da sessão fotográfica

Esta pasta é só para as fotografias da página `/services/photo-shoot`
(`/pt/servicos/sessao-fotografica`). Cada lugar já está desenhado na
página: enquanto o ficheiro não existir, o lugar diz o que lá vai e
guarda a forma certa. **Basta largar o ficheiro com o nome exato abaixo
— não é preciso mexer em código, nem o layout muda.**

## A comparação (secção "Duas maneiras de fotografar a mesma coisa")

Três pares. Os dois lados de cada par têm de ter a mesma proporção, ou
o corte do slider fica torto.

| Ficheiro | O que é | Proporção |
| --- | --- | --- |
| `produto/antes.webp` | Um produto como costuma acabar fotografado | 1:1 |
| `produto/depois.webp` | Um produto fotografado a sério | 1:1 |
| `equipa/antes.webp` | Pessoas, com a luz que havia | 4:5 |
| `equipa/depois.webp` | Um retrato feito a sério | 4:5 |
| `espaco/antes.webp` | Um espaço interior, à pressa | 3:2 |
| `espaco/depois.webp` | Um espaço interior feito a sério | 3:2 |

**O que lá está agora são imagens licenciadas da Unsplash**, de exemplo,
e a página diz isso por baixo da comparação. Quando houver trabalho
nosso, substituem-se os ficheiros pelos nomes acima e tira-se essa
linha de `photo-shoot.tsx`.

| Ficheiro | Fotógrafo | Licença |
| --- | --- | --- |
| `produto/antes.webp` | Małgorzata Szuba | Unsplash |
| `produto/depois.webp` | Alexandr Marynkin | Unsplash |
| `equipa/antes.webp` | Vitaly Gariev | Unsplash |
| `equipa/depois.webp` | Vitaly Gariev | Unsplash |
| `espaco/antes.webp` | C. Stone | Unsplash |
| `espaco/depois.webp` | Declan Sun | Unsplash |

## Como gravar

- **Formato:** `.webp` (o site usa webp em todo o lado). Qualidade 80 a 86.
- **Tamanho:** o lado maior com 1600px chega. A página serve a imagem
  dentro de uma coluna de ~400px, por isso 1600px cobre ecrãs retina.
- **Peso:** abaixo de 250 kB cada uma, por favor. São seis.
- **Enquadramento:** o par tem de mostrar **o mesmo assunto**, no mesmo
  enquadramento, para o antes e o depois serem comparáveis. É isso que
  faz a secção valer alguma coisa.

## Se o nome não bater certo

O lugar continua a dizer "Fotografia: … — antes". Não parte nada; é só
sinal de que o nome do ficheiro ou a pasta estão trocados.
