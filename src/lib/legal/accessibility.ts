import type { LegalRecord } from "./types";

/* ==================================================================
   Accessibility note

   Voluntary: the Accessibility Act (DL 82/2022) leaves out
   microenterprises providing services (art. 2.º, n.º 5, al. b),
   confirmed on DRE), and this site sells nothing online. What it says
   must stay true to the site: reduced motion is honoured
   (useReducedMotion throughout), the foot has "Pause motion", and the
   forms are labelled.
   ================================================================== */

export const ACCESSIBILITY: LegalRecord = {
  slug: "/accessibility",
  version: "1.0",
  effective: "2026-10-20",
  updated: "2026-10-20",
  history: [{ version: "1.0", date: "2026-10-20", change: { pt: "Primeira versão.", en: "First version." } }],
  doc: {
    pt: {
      title: "Acessibilidade",
      lede: "O que fazemos para que este website possa ser usado por todos, e como assinalar um problema.",
      sections: [
        {
          id: "compromisso",
          title: "O nosso compromisso",
          blocks: [
            {
              p: "Procuramos que este website siga as Diretrizes de Acessibilidade para o Conteúdo da Web (WCAG) 2.2, nível AA, incluindo o uso completo com teclado e contraste suficiente entre o texto e o fundo. Ainda não foi feita uma auditoria, por isso não declaramos conformidade total.",
            },
          ],
        },
        {
          id: "medidas",
          title: "O que já está feito",
          blocks: [
            {
              list: [
                "Quem pede ao sistema menos movimento recebe o website sem animações; no rodapé, “Parar movimento” para o fundo animado;",
                "Os formulários têm etiquetas e mensagens de erro associadas a cada campo;",
                "O website está em português e em inglês, com a língua de cada página indicada.",
              ],
            },
          ],
        },
        {
          id: "limites",
          title: "Limitações conhecidas",
          blocks: [
            {
              p: "Algumas animações e efeitos visuais da página inicial podem ser difíceis para algumas pessoas; desligam-se com a preferência de menos movimento do sistema. As imagens de projetos de clientes podem não ter sempre uma descrição completa.",
            },
          ],
        },
        {
          id: "contacto",
          title: "Assinalar um problema",
          blocks: [
            {
              p: "Se algo neste website não for acessível, basta escrever para [ola@nevima.studio](mailto:ola@nevima.studio). Respondemos e, sempre que possível, corrigimos ou enviamos a informação noutro formato.",
            },
          ],
        },
      ],
    },
    en: {
      title: "Accessibility",
      lede: "What we do so that everyone can use this website, and how to report a problem.",
      sections: [
        {
          id: "compromisso",
          title: "Our commitment",
          blocks: [
            {
              p: "We aim for this website to follow the Web Content Accessibility Guidelines (WCAG) 2.2, level AA, including full keyboard use and enough contrast between text and background. It has not been audited yet, so we do not claim full conformance.",
            },
          ],
        },
        {
          id: "medidas",
          title: "What is already in place",
          blocks: [
            {
              list: [
                "If your system asks for reduced motion, the website runs without animations; “Pause motion” in the foot stops the animated background;",
                "Forms have labels and error messages tied to each field;",
                "The website is in Portuguese and English, with each page's language declared.",
              ],
            },
          ],
        },
        {
          id: "limites",
          title: "Known limitations",
          blocks: [
            {
              p: "Some animations and visual effects on the home page may be hard for some people; they switch off with your system's reduced-motion setting. Images of client projects may not always have a full description.",
            },
          ],
        },
        {
          id: "contacto",
          title: "Report a problem",
          blocks: [
            {
              p: "If something on this website isn't accessible, write to [ola@nevima.studio](mailto:ola@nevima.studio). We'll reply and, wherever possible, fix it or send you the information in another format.",
            },
          ],
        },
      ],
    },
  },
};
