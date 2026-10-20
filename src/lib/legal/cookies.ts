import type { LegalRecord } from "./types";

/* ==================================================================
   Cookie Policy

   What the site keeps in the browser, as the code stands: no cookies,
   only what the visitor's own actions need (return-spot.ts, footer.tsx,
   consent.ts). When a non-essential service is added (consent.ts,
   SERVICES), it gets a row here and the banner starts asking.
   ================================================================== */

export const COOKIES: LegalRecord = {
  slug: "/cookies",
  version: "1.0",
  effective: "2026-10-19",
  updated: "2026-10-19",
  history: [{ version: "1.0", date: "2026-10-19", change: { pt: "Primeira versão.", en: "First version." } }],
  doc: {
    pt: {
      title: "Política de Cookies",
      lede: "O que este website guarda no navegador de quem o visita, e porquê.",
      summary: [
        "Este website não usa cookies.",
        "Guarda no navegador apenas o necessário para funções pedidas por quem o visita, e nada disso serve para seguir ou identificar visitantes.",
        "Se um dia for usada alguma ferramenta de análise ou de marketing, só funciona depois de autorizada, e recusar é tão fácil como aceitar.",
      ],
      sections: [
        {
          id: "o-que-sao",
          title: "O que são cookies",
          blocks: [
            {
              p: "Cookies são pequenos ficheiros que um website guarda no navegador. Há outras formas de guardar informação no navegador com o mesmo efeito, como o armazenamento local (localStorage e sessionStorage). A lei trata-as da mesma maneira: só o que for estritamente necessário para um serviço pedido pelo utilizador pode ser guardado sem autorização (Lei n.º 41/2004, artigo 5.º).",
            },
          ],
        },
        {
          id: "o-que-guardamos",
          title: "O que este website guarda",
          blocks: [
            { p: "Nenhum cookie. No armazenamento do navegador, apenas o seguinte, todo estritamente necessário:" },
            {
              table: {
                head: ["Nome", "Para quê", "Onde", "Durante quanto tempo"],
                rows: [
                  [
                    "nevima:return, nevima:restore",
                    "Voltar exatamente ao mesmo ponto da página ao sair do portefólio",
                    "sessionStorage",
                    "Até fechar o separador; a nota de regresso vale 8 segundos",
                  ],
                  [
                    "nevima:opened",
                    "Não repetir a animação de abertura na mesma visita",
                    "sessionStorage",
                    "Até fechar o separador",
                  ],
                  [
                    "nevima:lang-spot",
                    "Manter a posição na página ao mudar de língua",
                    "sessionStorage",
                    "8 segundos",
                  ],
                  [
                    "nevima:footer-still",
                    "Lembrar a opção “Parar movimento”, quando escolhida",
                    "localStorage",
                    "Até ser escolhida a opção “Retomar movimento”",
                  ],
                  [
                    "nevima:consent",
                    "Lembrar as preferências de cookies, quando alguma for guardada",
                    "localStorage",
                    "Até serem alteradas",
                  ],
                ],
              },
            },
            {
              p: "Nada disto é enviado à nevima nem a terceiros. Pode ser apagado a qualquer momento nas definições do navegador.",
            },
          ],
        },
        {
          id: "terceiros",
          title: "Conteúdos de terceiros",
          blocks: [
            {
              p: "Algumas imagens são carregadas diretamente dos servidores da Unsplash. Como em qualquer pedido de imagem, a Unsplash recebe o endereço IP e o navegador de quem visita a página. O website não usa ferramentas de análise, píxeis de publicidade, vídeos incorporados nem botões de redes sociais.",
            },
          ],
        },
        {
          id: "preferencias",
          title: "Preferências",
          blocks: [
            {
              p: "Como não há nada que precise de autorização, o website não mostra um aviso de cookies. As preferências podem ser abertas a qualquer momento em “Preferências de cookies”, no rodapé de cada página.",
            },
            {
              p: "Se um dia for acrescentada uma ferramenta de análise ou de marketing, esta página passa a descrevê-la, e o website pede autorização antes de a usar. Até haver resposta, nada é guardado. Recusar é tão fácil como aceitar, e nenhuma opção vem assinalada de antemão.",
            },
          ],
        },
        {
          id: "mais",
          title: "Mais informação",
          blocks: [
            { p: "Sobre os dados pessoais, ver a [Política de Privacidade](/privacy). Questões: [ola@nevima.studio](mailto:ola@nevima.studio)." },
          ],
        },
      ],
    },
    en: {
      title: "Cookie Policy",
      lede: "What this website keeps in your browser, and why.",
      summary: [
        "This website uses no cookies.",
        "It only keeps in your browser what is needed for things you ask it to do, and none of it is used to track or identify visitors.",
        "If an analytics or marketing tool is ever added, it will only run after you allow it, and refusing will be as easy as accepting.",
      ],
      sections: [
        {
          id: "o-que-sao",
          title: "What cookies are",
          blocks: [
            {
              p: "Cookies are small files a website stores in your browser. Other ways of storing information in the browser have the same effect, such as local storage (localStorage and sessionStorage). The law treats them alike: only what is strictly needed for a service you asked for may be stored without your permission (Portuguese Law 41/2004, Article 5).",
            },
          ],
        },
        {
          id: "o-que-guardamos",
          title: "What this website stores",
          blocks: [
            { p: "No cookies. In browser storage, only the following, all strictly necessary:" },
            {
              table: {
                head: ["Name", "Why", "Where", "How long"],
                rows: [
                  [
                    "nevima:return, nevima:restore",
                    "Bringing you back to the same place on a page when you leave the portfolio",
                    "sessionStorage",
                    "Until you close the tab; the return note lasts 8 seconds",
                  ],
                  [
                    "nevima:opened",
                    "Not replaying the opening animation in the same visit",
                    "sessionStorage",
                    "Until you close the tab",
                  ],
                  [
                    "nevima:lang-spot",
                    "Keeping your place on the page when you change language",
                    "sessionStorage",
                    "8 seconds",
                  ],
                  [
                    "nevima:footer-still",
                    "Remembering “Pause motion”, if you choose it",
                    "localStorage",
                    "Until you choose “Resume motion”",
                  ],
                  [
                    "nevima:consent",
                    "Remembering your cookie preferences, once you save any",
                    "localStorage",
                    "Until you change them",
                  ],
                ],
              },
            },
            {
              p: "None of it is sent to nevima or to anyone else. You can delete it at any time in your browser settings.",
            },
          ],
        },
        {
          id: "terceiros",
          title: "Third-party content",
          blocks: [
            {
              p: "Some images load straight from Unsplash's servers. As with any image request, Unsplash receives your IP address and browser. The website uses no analytics tools, advertising pixels, embedded videos or social media buttons.",
            },
          ],
        },
        {
          id: "preferencias",
          title: "Preferences",
          blocks: [
            {
              p: "As nothing needs your permission, the website shows no cookie notice. You can open the preferences at any time from “Cookie preferences” at the foot of every page.",
            },
            {
              p: "If an analytics or marketing tool is ever added, this page will describe it and the website will ask your permission before using it. Until you answer, nothing is stored. Refusing will be as easy as accepting, and no option will be ticked in advance.",
            },
          ],
        },
        {
          id: "mais",
          title: "More information",
          blocks: [
            { p: "For personal data, see the [Privacy Policy](/privacy). Questions: [ola@nevima.studio](mailto:ola@nevima.studio)." },
          ],
        },
      ],
    },
  },
};

/* ------------------------------------------------------------------
   NOTA INTERNA (não publicada)

   Bases legais: Lei 41/2004, art. 5.º, na redação da Lei 46/2012
   (consentimento prévio; exceção para o estritamente necessário a um
   serviço pedido); RGPD, arts. 4.º, n.º 11, e 7.º (consentimento);
   TJUE, Planet49 (C-673/17): sem caixas pré-assinaladas; EDPB,
   Orientações 2/2023 (o art. 5.º, n.º 3, abrange localStorage e outras
   técnicas, não só cookies).

   Art. 5.º da Lei 41/2004 confirmado no texto consolidado do DRE
   (n.º 1, consentimento prévio; n.º 2, al. b), estritamente necessário a
   um serviço pedido expressamente).

   A CONFIRMAR:
   - Se o pedido a unsplash.com/photos/…/download deixa cookies da
     Unsplash no navegador. Deixa de importar quando as imagens forem
     servidas pelo próprio site: retirar então a secção "Conteúdos de
     terceiros".
   - Ao acrescentar qualquer serviço em src/lib/consent.ts (SERVICES),
     acrescentar aqui a sua linha e subir a versão.
   ------------------------------------------------------------------ */
