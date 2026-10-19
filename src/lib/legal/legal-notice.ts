import type { LegalRecord } from "./types";

/* ==================================================================
   Legal notice

   Who provides the services, as the law asks every website to say
   (DL 7/2004, art. 10.º): names, address, email, public registrations
   and tax numbers; plus VAT, complaints and dispute resolution, which
   apply because the studio also works for consumers in Portugal.
   ================================================================== */

export const LEGAL_NOTICE: LegalRecord = {
  slug: "/legal-notice",
  version: "1.0",
  effective: "2026-10-19",
  updated: "2026-10-19",
  history: [{ version: "1.0", date: "2026-10-19", change: { pt: "Primeira versão.", en: "First version." } }],
  doc: {
    pt: {
      title: "Aviso legal",
      lede: "Quem está por trás deste website e como contactar.",
      sections: [
        {
          id: "prestadores",
          title: "Prestadores dos serviços",
          blocks: [
            {
              p: "“nevima” é uma marca, não uma sociedade. Os serviços são prestados por dois trabalhadores independentes, com atividade aberta em Portugal:",
            },
            {
              list: [
                "**António Maria das Neves Sepúlveda de Sá Policarpo**, NIF 255250371;",
                "**Emanuel Augusto Soares da Costa**, NIF 275530671.",
              ],
            },
            {
              p: "Morada: [MORADA]. Email: [ola@nevima.studio](mailto:ola@nevima.studio). Website: nevima.studio.",
            },
            {
              p: "Como pessoas singulares, os prestadores não estão inscritos no registo comercial. A sua atividade não depende de autorização prévia nem de inscrição numa ordem profissional.",
            },
          ],
        },
        {
          id: "iva",
          title: "IVA",
          blocks: [
            {
              p: "Os prestadores estão isentos de IVA ao abrigo do artigo 53.º do Código do IVA. Os preços indicados não incluem IVA porque não há IVA a cobrar; se um dos prestadores deixar de estar isento, as condições aplicáveis constam da proposta e do contrato.",
            },
          ],
        },
        {
          id: "reclamacoes",
          title: "Reclamações",
          blocks: [
            {
              p: "Os clientes particulares podem apresentar reclamação no Livro de Reclamações Eletrónico, em [www.livroreclamacoes.pt](https://www.livroreclamacoes.pt). As reclamações também podem ser enviadas para ola@nevima.studio.",
            },
          ],
        },
        {
          id: "litigios",
          title: "Resolução alternativa de litígios de consumo",
          blocks: [
            {
              p: "Em caso de litígio de consumo, o consumidor pode recorrer a uma entidade de resolução alternativa de litígios. Nos litígios de valor até à alçada dos tribunais de primeira instância (5 000 €), o consumidor pode optar por levar o litígio a um centro de arbitragem de conflitos de consumo, e a nevima fica obrigada a aceitar essa arbitragem (Lei n.º 24/96, artigo 14.º).",
            },
            {
              list: [
                "CICAP, Centro de Informação de Consumo e Arbitragem do Porto: [www.cicap.pt](https://www.cicap.pt);",
                "CNIACC, Centro Nacional de Informação e Arbitragem de Conflitos de Consumo: [www.cniacc.pt](https://www.cniacc.pt).",
              ],
            },
            {
              p: "A lista completa das entidades está no Portal do Consumidor, em [www.consumidor.gov.pt](https://www.consumidor.gov.pt).",
            },
          ],
        },
        {
          id: "conteudos",
          title: "Conteúdos do website",
          blocks: [
            {
              p: "Os textos, o design e a marca deste website pertencem aos prestadores. As imagens de terceiros são usadas ao abrigo das respetivas licenças.",
            },
            {
              p: "O tratamento de dados pessoais está descrito na [Política de Privacidade](/privacy).",
            },
          ],
        },
        {
          id: "lei",
          title: "Lei aplicável",
          blocks: [{ p: "Este website e este aviso regem-se pela lei portuguesa." }],
        },
      ],
    },
    en: {
      title: "Legal notice",
      lede: "Who is behind this website and how to reach us.",
      sections: [
        {
          id: "prestadores",
          title: "Service providers",
          blocks: [
            {
              p: "“nevima” is a brand, not a company. The services are provided by two self-employed professionals registered in Portugal:",
            },
            {
              list: [
                "**António Maria das Neves Sepúlveda de Sá Policarpo**, tax number (NIF) 255250371;",
                "**Emanuel Augusto Soares da Costa**, tax number (NIF) 275530671.",
              ],
            },
            {
              p: "Address: [MORADA]. Email: [ola@nevima.studio](mailto:ola@nevima.studio). Website: nevima.studio.",
            },
            {
              p: "As individuals, the providers are not on the commercial register. Their activity needs no prior authorisation and no membership of a professional body.",
            },
          ],
        },
        {
          id: "iva",
          title: "VAT",
          blocks: [
            {
              p: "The providers are exempt from VAT under Article 53 of the Portuguese VAT Code. Prices carry no VAT because there is none to charge; if either provider stops being exempt, the terms that apply are set out in the proposal and the contract.",
            },
          ],
        },
        {
          id: "reclamacoes",
          title: "Complaints",
          blocks: [
            {
              p: "Consumers can file a complaint in Portugal's electronic complaints book, at [www.livroreclamacoes.pt](https://www.livroreclamacoes.pt). Complaints can also be sent to ola@nevima.studio.",
            },
          ],
        },
        {
          id: "litigios",
          title: "Alternative dispute resolution for consumers",
          blocks: [
            {
              p: "In a consumer dispute, the consumer can turn to an alternative dispute resolution body. For disputes up to the limit of the courts of first instance (€5,000), the consumer can choose to take the dispute to a consumer arbitration centre, and nevima must accept that arbitration (Portuguese Law 24/96, Article 14).",
            },
            {
              list: [
                "CICAP, the Porto consumer information and arbitration centre: [www.cicap.pt](https://www.cicap.pt);",
                "CNIACC, the national consumer information and arbitration centre: [www.cniacc.pt](https://www.cniacc.pt).",
              ],
            },
            {
              p: "The full list of bodies is on the Portuguese Consumer Portal, at [www.consumidor.gov.pt](https://www.consumidor.gov.pt).",
            },
          ],
        },
        {
          id: "conteudos",
          title: "Website content",
          blocks: [
            {
              p: "The texts, design and brand on this website belong to the providers. Third-party images are used under their licences.",
            },
            { p: "How personal data is handled is set out in the [Privacy Policy](/privacy)." },
          ],
        },
        {
          id: "lei",
          title: "Governing law",
          blocks: [{ p: "This website and this notice are governed by Portuguese law." }],
        },
      ],
    },
  },
};

/* ------------------------------------------------------------------
   NOTA INTERNA (não publicada)

   Bases legais: DL 7/2004, art. 10.º (texto consolidado confirmado no
   DRE, sem alterações da Lei 12-A/2026); CIVA, arts. 36.º, n.º 5, al. e)
   e 53.º; DL 156/2005 (Livro de Reclamações Eletrónico, red. DL
   74/2017); Lei 144/2015, art. 18.º (red. DL 102/2017, confirmado no
   DRE); Lei 24/96, art. 14.º, n.os 2 e 3 (red. Lei 63/2019, confirmado
   no DRE). Plataforma ODR extinta (Reg. (UE) 2024/3228): sem ligação.

   A CONFIRMAR / PENDENTE:
   - [MORADA] por preencher.
   - Registar os dois prestadores na plataforma do Livro de Reclamações
     Eletrónico e acrescentar ao rodapé o ícone com ligação, em local
     visível e destacado (DL 156/2005, art. 5.º-B).
   - Área territorial atual do CICAP (Regulamento Harmonizado 2026); o
     CNIACC fica como entidade supletiva nacional.
   - Quando existirem os Termos de Utilização, ligá-los em "Conteúdos".
   - Valor da alçada (5 000 €): Lei da Organização do Sistema Judiciário.
   ------------------------------------------------------------------ */
