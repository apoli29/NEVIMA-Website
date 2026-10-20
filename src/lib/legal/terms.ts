import type { LegalRecord } from "./types";

/* ==================================================================
   Terms of Use (of this website, not of the services: those are in the
   contract each client signs).
   ================================================================== */

export const TERMS: LegalRecord = {
  slug: "/terms",
  version: "1.0",
  effective: "2026-10-20",
  updated: "2026-10-20",
  history: [{ version: "1.0", date: "2026-10-20", change: { pt: "Primeira versão.", en: "First version." } }],
  doc: {
    pt: {
      title: "Termos de Utilização",
      lede: "As regras de utilização deste website. Os serviços da nevima regem-se pelo contrato assinado com cada cliente.",
      summary: [
        "O website pode ser consultado livremente; os textos, o design e a marca pertencem à nevima.",
        "A estimativa do formulário é indicativa: o preço e o âmbito vinculativos são os da proposta e do contrato.",
        "Nada nestes termos afasta os direitos que a lei garante aos consumidores.",
      ],
      sections: [
        {
          id: "ambito",
          title: "Âmbito",
          blocks: [
            {
              p: "Estes termos aplicam-se a quem visita nevima.studio. Quem presta os serviços e como contactar está no [Aviso legal](/legal-notice); o tratamento de dados pessoais, na [Política de Privacidade](/privacy).",
            },
            {
              p: "Os serviços da nevima (web design, identidade visual, sessão fotográfica, SEO e GEO) não são contratados através do website: regem-se pelo contrato de prestação de serviços que cada cliente assina, e que prevalece sobre o que aqui se diz.",
            },
          ],
        },
        {
          id: "estimativas",
          title: "Estimativas e informação",
          blocks: [
            {
              p: "A estimativa calculada no formulário é apenas indicativa e não constitui uma proposta contratual. O preço, o âmbito e os prazos vinculativos são os da proposta enviada pela nevima e aceite pelo cliente.",
            },
            {
              p: "A informação do website é apresentada com cuidado, mas pode mudar. Em caso de diferença entre o website e o contrato assinado, vale o contrato.",
            },
          ],
        },
        {
          id: "uso",
          title: "Uso permitido",
          blocks: [
            { p: "O website pode ser consultado, partilhado por ligação e citado, com indicação da fonte. Não é permitido:" },
            {
              list: [
                "copiar ou reutilizar os textos, o design, as imagens ou a marca para fins comerciais sem autorização escrita;",
                "tentar aceder a áreas ou sistemas não públicos, testar vulnerabilidades sem autorização ou perturbar o funcionamento do website;",
                "enviar pedidos falsos ou automatizados através dos formulários.",
              ],
            },
          ],
        },
        {
          id: "propriedade",
          title: "Propriedade intelectual",
          blocks: [
            {
              p: "Os textos, o design, o código e a marca “nevima” pertencem aos prestadores identificados no Aviso legal. Os projetos mostrados no portefólio pertencem aos respetivos clientes. As imagens de terceiros são usadas ao abrigo das respetivas licenças.",
            },
          ],
        },
        {
          id: "ligacoes",
          title: "Ligações externas",
          blocks: [
            {
              p: "O website tem ligações para websites de terceiros, incluindo os de clientes. A nevima não controla esses websites e não responde pelo seu conteúdo nem pelas suas práticas de privacidade.",
            },
          ],
        },
        {
          id: "responsabilidade",
          title: "Disponibilidade e responsabilidade",
          blocks: [
            {
              p: "A nevima procura manter o website disponível e correto, mas não garante que funcione sem interrupções nem erros. Na medida em que a lei o permita, não responde por danos resultantes da simples consulta do website. Esta limitação não se aplica a danos causados com dolo ou culpa grave, nem afasta os direitos que a lei garante aos consumidores.",
            },
          ],
        },
        {
          id: "alteracoes",
          title: "Alterações",
          blocks: [
            { p: "Estes termos podem ser atualizados. A versão em vigor está sempre nesta página, com a data e o número da versão." },
          ],
        },
        {
          id: "lei",
          title: "Lei aplicável e litígios",
          blocks: [
            {
              p: "Estes termos regem-se pela lei portuguesa. Os consumidores mantêm a proteção que a lei do seu país de residência lhes garanta e podem recorrer às entidades de resolução alternativa de litígios indicadas no [Aviso legal](/legal-notice).",
            },
          ],
        },
      ],
    },
    en: {
      title: "Terms of Use",
      lede: "The rules for using this website. nevima's services are governed by the contract each client signs.",
      summary: [
        "You are free to browse the website; its texts, design and brand belong to nevima.",
        "The form's estimate is only a guide: the binding price and scope are those of the proposal and the contract.",
        "Nothing in these terms takes away the rights the law gives consumers.",
      ],
      sections: [
        {
          id: "ambito",
          title: "Scope",
          blocks: [
            {
              p: "These terms apply to anyone visiting nevima.studio. Who provides the services and how to reach us is in the [Legal notice](/legal-notice); how personal data is handled, in the [Privacy Policy](/privacy).",
            },
            {
              p: "nevima's services (web design, visual identity, photo shoots, SEO and GEO) are not contracted through the website: they are governed by the service contract each client signs, which prevails over anything said here.",
            },
          ],
        },
        {
          id: "estimativas",
          title: "Estimates and information",
          blocks: [
            {
              p: "The estimate worked out in the form is only a guide and is not a contractual offer. The binding price, scope and timeline are those of the proposal nevima sends and the client accepts.",
            },
            {
              p: "The information on the website is presented with care, but it can change. If the website and a signed contract differ, the contract prevails.",
            },
          ],
        },
        {
          id: "uso",
          title: "Permitted use",
          blocks: [
            { p: "You may browse the website, share links to it and quote it with credit. You may not:" },
            {
              list: [
                "copy or reuse its texts, design, images or brand for commercial purposes without written permission;",
                "try to access non-public areas or systems, test for vulnerabilities without permission, or disrupt the website;",
                "send false or automated requests through the forms.",
              ],
            },
          ],
        },
        {
          id: "propriedade",
          title: "Intellectual property",
          blocks: [
            {
              p: "The texts, design, code and the “nevima” brand belong to the providers named in the Legal notice. Projects shown in the portfolio belong to their clients. Third-party images are used under their licences.",
            },
          ],
        },
        {
          id: "ligacoes",
          title: "External links",
          blocks: [
            {
              p: "The website links to third-party websites, including clients'. nevima does not control them and is not responsible for their content or their privacy practices.",
            },
          ],
        },
        {
          id: "responsabilidade",
          title: "Availability and liability",
          blocks: [
            {
              p: "nevima tries to keep the website available and accurate, but does not guarantee it will run without interruptions or errors. To the extent the law allows, nevima is not liable for damage arising merely from browsing the website. This does not apply to damage caused wilfully or by gross negligence, and does not take away the rights the law gives consumers.",
            },
          ],
        },
        {
          id: "alteracoes",
          title: "Changes",
          blocks: [
            { p: "These terms may be updated. The version in force is always on this page, with its date and version number." },
          ],
        },
        {
          id: "lei",
          title: "Governing law and disputes",
          blocks: [
            {
              p: "These terms are governed by Portuguese law. Consumers keep the protection the law of their country of residence gives them, and can turn to the alternative dispute resolution bodies listed in the [Legal notice](/legal-notice).",
            },
          ],
        },
      ],
    },
  },
};

/* ------------------------------------------------------------------
   NOTA INTERNA (não publicada)

   Bases legais: DL 7/2004 (serviços da sociedade da informação); CDADC
   (proteção dos conteúdos); DL 446/85, arts. 18.º, al. a) e c), e 21.º
   (limites à exclusão de responsabilidade); Regulamento Roma I, art. 6.º
   (proteção dos consumidores); Lei 144/2015 (RAL).

   PENDENTE (decisão dos sócios): reserva de mineração de textos e dados
   para treino de IA (CDADC, art. 75.º, n.º 2, al. w), "por meio de
   leitura ótica"). Ver a pergunta sobre robots.txt: bloquear os robôs de
   treino sem bloquear os de pesquisa e de respostas, que contam para o
   GEO da própria nevima. Quando decidido, acrescentar aqui uma secção.
   ------------------------------------------------------------------ */
