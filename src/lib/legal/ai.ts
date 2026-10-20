import type { LegalRecord } from "./types";

/* ==================================================================
   AI Use Policy

   Where the studio uses AI and how a client is told, as the partners
   decided it (legal audit, 2026-10-19): Claude for design, code and
   writing; an AI translation tool for languages other than Portuguese
   and English; Higgsfield for images, video and 3D when a project needs
   it; never third parties' personal data in a tool without a data
   processing agreement.
   ================================================================== */

export const AI_POLICY: LegalRecord = {
  slug: "/ai",
  version: "1.0",
  effective: "2026-10-20",
  updated: "2026-10-20",
  history: [{ version: "1.0", date: "2026-10-20", change: { pt: "Primeira versão.", en: "First version." } }],
  doc: {
    pt: {
      title: "Utilização de IA",
      lede: "Onde a nevima usa inteligência artificial, onde não usa, e como o cliente fica a saber.",
      summary: [
        "Usamos IA para trabalhar mais depressa, mas todas as decisões e todas as entregas passam por nós.",
        "Não pomos dados pessoais de terceiros em ferramentas de IA sem um contrato que os proteja.",
        "O cliente sabe sempre o que foi feito com IA: dizemo-lo nesta página e na entrega.",
      ],
      sections: [
        {
          id: "onde",
          title: "Onde usamos IA",
          blocks: [
            {
              list: [
                "**Design e programação:** como apoio na criação de propostas visuais, de código e de variações, a partir das decisões tomadas por nós;",
                "**Textos:** como apoio na revisão e na escrita dos textos do website, sempre revistos por nós e aprovados pelo cliente;",
                "**Identidade visual:** como apoio na exploração de logótipos e símbolos, que desenvolvemos e afinamos à mão;",
                "**Traduções:** as línguas além do português e do inglês são traduzidas por uma ferramenta de IA especializada; o cliente revê a tradução num documento simples antes de ela ser publicada;",
                "**Imagem, vídeo e 3D:** quando o projeto o pede, geramos ou tratamos imagens com ferramentas de IA.",
              ],
            },
          ],
        },
        {
          id: "onde-nao",
          title: "Onde não usamos IA",
          blocks: [
            {
              list: [
                "O preço, o âmbito e o prazo de cada proposta são decididos por nós. A estimativa do formulário é um cálculo automático, mas não usa IA e é apenas indicativa;",
                "Não usamos IA para tomar decisões sobre pessoas;",
                "Não colocamos em ferramentas de IA dados pessoais de terceiros (nomes, contactos, fotografias de pessoas) sem que a ferramenta esteja coberta por um acordo de tratamento de dados. Quando é preciso trabalhar esse material, retiramos primeiro os dados pessoais.",
              ],
            },
          ],
        },
        {
          id: "revisao",
          title: "Revisão humana",
          blocks: [
            {
              p: "Tudo o que é feito com apoio de IA é visto e revisto por nós antes de chegar ao cliente. A responsabilidade pelo trabalho entregue é sempre nossa, nos termos do contrato.",
            },
          ],
        },
        {
          id: "cliente",
          title: "Como o cliente fica a saber",
          blocks: [
            {
              p: "Antes de contratar, o cliente pode ver nesta página onde e como usamos IA. Na entrega, indicamos os elementos gerados total ou parcialmente com IA (por exemplo, imagens ou traduções), para que o cliente decida com conhecimento como os usa.",
            },
            {
              p: "Quando uma imagem, um vídeo ou um áudio gerado com IA mostra de forma realista pessoas, lugares ou acontecimentos que parecem reais, é identificado como tal, como exige o Regulamento Europeu da Inteligência Artificial (Regulamento (UE) 2024/1689, artigo 50.º). Nunca geramos a imagem de uma pessoa real sem a sua autorização.",
            },
          ],
        },
        {
          id: "direitos",
          title: "Direitos sobre trabalhos feitos com IA",
          blocks: [
            {
              p: "A proteção por direito de autor depende de haver uma criação intelectual humana. Num trabalho feito com apoio de IA, essa proteção cobre o contributo criativo humano; o que for gerado de forma totalmente automática pode não estar protegido. Por isso, informamos o cliente sempre que um elemento central (como um logótipo) tenha origem em IA, e recomendamos o registo da marca, que protege o logótipo independentemente do direito de autor.",
            },
            {
              p: "Usamos ferramentas cujas condições permitem o uso comercial dos resultados, e não usamos intencionalmente materiais de terceiros sem direito para isso.",
            },
          ],
        },
        {
          id: "ferramentas",
          title: "Ferramentas",
          blocks: [
            {
              p: "Usamos, entre outras, o Claude (Anthropic) para design, programação e textos, uma ferramenta de tradução especializada ([FERRAMENTA_TRADUCAO]) e o Higgsfield para imagem, vídeo e 3D. A lista pode mudar; a versão em vigor está sempre nesta página.",
            },
          ],
        },
        {
          id: "formacao",
          title: "Formação",
          blocks: [
            {
              p: "Mantemo-nos a par do funcionamento, dos limites e dos riscos das ferramentas que usamos, como pede o Regulamento Europeu da Inteligência Artificial (artigo 4.º).",
            },
          ],
        },
        {
          id: "contacto",
          title: "Questões",
          blocks: [{ p: "Questões sobre esta política: [ola@nevima.studio](mailto:ola@nevima.studio)." }],
        },
      ],
    },
    en: {
      title: "Use of AI",
      lede: "Where nevima uses artificial intelligence, where it doesn't, and how clients are told.",
      summary: [
        "We use AI to work faster, but every decision and every delivery goes through us.",
        "We don't put third parties' personal data into AI tools without a contract that protects it.",
        "Clients always know what was made with AI: we say so on this page and at delivery.",
      ],
      sections: [
        {
          id: "onde",
          title: "Where we use AI",
          blocks: [
            {
              list: [
                "**Design and programming:** to support visual proposals, code and variations, based on decisions we make;",
                "**Texts:** to support reviewing and writing the website's texts, always reviewed by us and approved by the client;",
                "**Visual identity:** to support exploring logos and symbols, which we develop and refine by hand;",
                "**Translations:** languages other than Portuguese and English are translated by a specialised AI tool; the client reviews the translation in a simple document before it is published;",
                "**Images, video and 3D:** when the project calls for it, we generate or process images with AI tools.",
              ],
            },
          ],
        },
        {
          id: "onde-nao",
          title: "Where we don't use AI",
          blocks: [
            {
              list: [
                "The price, scope and timeline of each proposal are decided by us. The form's estimate is an automatic calculation, but it uses no AI and is only a guide;",
                "We don't use AI to make decisions about people;",
                "We don't put third parties' personal data (names, contact details, photos of people) into AI tools unless the tool is covered by a data processing agreement. When such material has to be worked on, we remove the personal data first.",
              ],
            },
          ],
        },
        {
          id: "revisao",
          title: "Human review",
          blocks: [
            {
              p: "Everything made with the help of AI is checked and reviewed by us before it reaches the client. We remain responsible for the work delivered, under the contract.",
            },
          ],
        },
        {
          id: "cliente",
          title: "How clients are told",
          blocks: [
            {
              p: "Before signing, clients can see on this page where and how we use AI. At delivery, we point out the elements generated wholly or partly with AI (images or translations, for instance), so the client can decide knowingly how to use them.",
            },
            {
              p: "When an AI-generated image, video or audio realistically shows people, places or events that look real, it is labelled as such, as the EU Artificial Intelligence Act requires (Regulation (EU) 2024/1689, Article 50). We never generate a real person's likeness without their permission.",
            },
          ],
        },
        {
          id: "direitos",
          title: "Rights in work made with AI",
          blocks: [
            {
              p: "Copyright protects human intellectual creation. In work made with the help of AI, it covers the human creative contribution; anything generated wholly automatically may not be protected. So we tell the client whenever a central element (such as a logo) originates in AI, and we recommend registering the trademark, which protects the logo regardless of copyright.",
            },
            {
              p: "We use tools whose terms allow commercial use of their output, and we never knowingly use third-party material without the right to do so.",
            },
          ],
        },
        {
          id: "ferramentas",
          title: "Tools",
          blocks: [
            {
              p: "Among others, we use Claude (Anthropic) for design, programming and writing, a specialised translation tool ([FERRAMENTA_TRADUCAO]), and Higgsfield for images, video and 3D. The list may change; the current version is always on this page.",
            },
          ],
        },
        {
          id: "formacao",
          title: "Training",
          blocks: [
            {
              p: "We keep up to date with how the tools we use work, and with their limits and risks, as the EU Artificial Intelligence Act asks (Article 4).",
            },
          ],
        },
        {
          id: "contacto",
          title: "Questions",
          blocks: [{ p: "Questions about this policy: [ola@nevima.studio](mailto:ola@nevima.studio)." }],
        },
      ],
    },
  },
};

/* ------------------------------------------------------------------
   NOTA INTERNA (não publicada)

   Bases legais: Regulamento (UE) 2024/1689 (AI Act), art. 4.º
   (literacia, confirmado no EUR-Lex) e art. 50.º, n.º 4 (conteúdos
   realistas gerados por IA: o responsável pela implantação divulga-o;
   aplicável desde 02/08/2026 segundo fontes secundárias, A CONFIRMAR o
   texto e o Digital Omnibus); CDADC, arts. 1.º, 2.º e 11.º; RGPD, arts.
   5.º, 28.º e 32.º; CC, art. 79.º (imagem de pessoas reais); DL 57/2008
   (sem alegações não demonstráveis: saiu o "95%").

   A PREENCHER: [FERRAMENTA_TRADUCAO].
   A CONFIRMAR: as condições de uso comercial dos resultados de cada
   ferramenta (Anthropic, ferramenta de tradução, Higgsfield) no plano
   usado; a promessa "indicamos na entrega os elementos feitos com IA"
   tem de passar a ser prática (ver a proposta de cláusula de IA no
   contrato, legal/02).
   ------------------------------------------------------------------ */
