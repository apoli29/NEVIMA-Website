import type { LegalRecord } from "./types";

/* ==================================================================
   Privacy Policy

   What the site and the studio actually do with personal data, as the
   code stands (see legal/00-auditoria-legal.md, section 6). Change this
   page whenever a form, a provider or a period of storage changes.
   ================================================================== */

export const PRIVACY: LegalRecord = {
  slug: "/privacy",
  version: "1.0",
  effective: "2026-10-19",
  updated: "2026-10-19",
  history: [{ version: "1.0", date: "2026-10-19", change: { pt: "Primeira versão.", en: "First version." } }],
  doc: {
    pt: {
      title: "Política de Privacidade",
      lede: "Como a nevima trata os dados pessoais de quem visita este website, pede uma proposta ou trabalha connosco.",
      summary: [
        "Recolhemos apenas o necessário para responder a um pedido e para trabalhar com cada cliente.",
        "Não usamos cookies de publicidade nem ferramentas de análise, e não vendemos nem cedemos dados para marketing.",
        "Os pedidos que não dão origem a contrato são apagados ao fim de 3 meses. As faturas são guardadas durante 10 anos, porque a lei o exige.",
        "Para aceder aos dados, corrigi-los ou apagá-los, basta um email para [ola@nevima.studio](mailto:ola@nevima.studio).",
      ],
      sections: [
        {
          id: "responsaveis",
          title: "Quem é responsável pelos dados",
          blocks: [
            {
              p: "“nevima” é a marca sob a qual trabalham dois profissionais independentes, que decidem em conjunto como os dados pessoais são tratados. São, por isso, responsáveis conjuntos pelo tratamento (artigo 26.º do Regulamento Geral sobre a Proteção de Dados, RGPD):",
            },
            {
              list: [
                "António Maria das Neves Sepúlveda de Sá Policarpo, NIF 255250371;",
                "Emanuel Augusto Soares da Costa, NIF 275530671.",
              ],
            },
            { p: "Morada: [MORADA]. Email: [ola@nevima.studio](mailto:ola@nevima.studio)." },
            {
              p: "Entre os dois, ficou acordado que o email ola@nevima.studio é o ponto de contacto único para qualquer questão sobre dados pessoais e que ambos respondem pelo cumprimento desta política. Os direitos descritos abaixo podem ser exercidos junto de qualquer um dos dois.",
            },
            { p: "A nevima não tem encarregado de proteção de dados, porque a sua atividade não o exige (artigo 37.º do RGPD)." },
          ],
        },
        {
          id: "dados",
          title: "Que dados tratamos, para quê e durante quanto tempo",
          blocks: [
            {
              table: {
                head: ["Quando", "Dados", "Para quê", "Fundamento", "Durante quanto tempo"],
                rows: [
                  [
                    "Visita ao website",
                    "Endereço IP, data e hora, página pedida, navegador e dispositivo",
                    "Manter o website a funcionar e seguro; travar pedidos abusivos",
                    "Interesse legítimo (art. 6.º, n.º 1, al. f) do RGPD)",
                    "Os registos do servidor são apagados ao fim de 1 dia; o controlo de pedidos abusivos guarda o IP em memória durante 15 minutos",
                  ],
                  [
                    "Estimativa no formulário",
                    "As respostas (serviços, tipo de cliente, área, país, local da sessão, endereços de referência). Sem nome nem contactos",
                    "Calcular a estimativa e melhorar o formulário",
                    "Interesse legítimo",
                    "1 dia, nos registos do servidor",
                  ],
                  [
                    "Pedido de proposta",
                    "Nome, email, telefone, nome do negócio (quando é um negócio), a mensagem escrita e as respostas",
                    "Preparar a proposta, enviá-la e responder ao pedido",
                    "Diligências pré-contratuais a pedido do titular (art. 6.º, n.º 1, al. b) do RGPD)",
                    "3 meses após o último contacto, se não houver contrato",
                  ],
                  [
                    "Pedido de parceria (empresas de desenvolvimento)",
                    "Nome, email, telefone, empresa, notas e respostas",
                    "Responder e preparar um orçamento",
                    "Diligências pré-contratuais",
                    "3 meses após o último contacto, se não houver contrato",
                  ],
                  [
                    "Emails enviados à nevima",
                    "O que for escrito e o endereço de quem escreve",
                    "Responder",
                    "Diligências pré-contratuais ou interesse legítimo",
                    "3 meses após o último contacto, salvo se derem origem a um contrato",
                  ],
                  [
                    "Clientes",
                    "Identificação, NIF, morada, contactos, representante, assinatura, comunicações e materiais do projeto",
                    "Cumprir o contrato, faturar e cobrar",
                    "Execução do contrato (al. b)); obrigações fiscais (al. c))",
                    "Contrato e faturas: 10 anos a contar do fim do ano da fatura (art. 52.º do Código do IVA). Materiais de trabalho: 12 meses após a entrega",
                  ],
                  [
                    "Portefólio",
                    "Nome do cliente e endereço do seu website",
                    "Mostrar o trabalho feito",
                    "Interesse legítimo; o cliente pode recusar a qualquer momento",
                    "Enquanto o projeto for mostrado",
                  ],
                ],
              },
            },
          ],
        },
        {
          id: "formularios",
          title: "Os formulários do website",
          blocks: [
            {
              p: "O nome, o email, o telefone e, sendo um negócio, o seu nome são necessários para preparar a proposta e combinar os passos seguintes. A mensagem é opcional. Sem os campos obrigatórios não é possível responder ao pedido.",
            },
            {
              p: "Enquanto o envio direto a partir do website não estiver ativo, o pedido segue por email, a partir do programa de email de quem o envia, para ola@nevima.studio. As respostas ao formulário (sem nome nem contactos) ficam também 1 dia nos registos do servidor.",
            },
            {
              p: "A nevima não envia newsletters nem comunicações de marketing. Se um dia o fizer, será só com autorização própria, pedida à parte e nunca pré-assinalada.",
            },
          ],
        },
        {
          id: "destinatarios",
          title: "Quem recebe os dados",
          blocks: [
            { p: "Os dados só são partilhados com quem presta serviços à nevima ou quando a lei o exige:" },
            {
              list: [
                "**Vercel Inc.**, que aloja o website (Estados Unidos);",
                "**Google**, através do Google Workspace, onde ficam os emails;",
                "**Autoridade Tributária e Aduaneira**, para a faturação, por obrigação legal.",
              ],
            },
            {
              p: "Algumas imagens do website são carregadas diretamente dos servidores da Unsplash, que, como em qualquer pedido de imagem, recebe o endereço IP e o navegador de quem visita a página.",
            },
            {
              p: "A nevima usa ferramentas de inteligência artificial no trabalho de design e de programação, mas não lhes dá os dados pessoais de quem pede propostas. Os dados nunca são vendidos nem cedidos para publicidade.",
            },
          ],
        },
        {
          id: "transferencias",
          title: "Dados fora da União Europeia",
          blocks: [
            {
              p: "A Vercel e a Google podem tratar dados nos Estados Unidos. A Vercel está certificada no Quadro de Privacidade de Dados UE-EUA (Data Privacy Framework), reconhecido pela Comissão Europeia como garantia de proteção adequada (Decisão de Execução (UE) 2023/1795). Quando esse quadro não se aplicar, a transferência apoia-se nas cláusulas contratuais-tipo aprovadas pela Comissão Europeia.",
            },
            { p: "Uma cópia destas garantias pode ser pedida para ola@nevima.studio." },
          ],
        },
        {
          id: "direitos",
          title: "Direitos sobre os dados",
          blocks: [
            { p: "Quem tiver dados pessoais tratados pela nevima pode, a qualquer momento:" },
            {
              list: [
                "aceder aos dados e saber como são tratados;",
                "corrigir dados inexatos ou incompletos;",
                "pedir que sejam apagados;",
                "pedir a limitação do tratamento;",
                "receber os dados num formato de uso corrente, para os levar para outro lado (portabilidade);",
                "opor-se ao tratamento baseado no interesse legítimo.",
              ],
            },
            {
              p: "Basta um email para [ola@nevima.studio](mailto:ola@nevima.studio). A resposta chega no prazo de um mês, que pode ser prolongado por mais dois em pedidos complexos, com aviso (artigo 12.º do RGPD). É gratuito. Em caso de dúvida razoável sobre quem faz o pedido, pode ser pedida uma confirmação de identidade.",
            },
            {
              p: "Há também o direito de apresentar reclamação à Comissão Nacional de Proteção de Dados (CNPD), em [www.cnpd.pt](https://www.cnpd.pt).",
            },
          ],
        },
        {
          id: "decisoes",
          title: "Decisões automatizadas",
          blocks: [
            {
              p: "A estimativa do formulário é um cálculo automático e apenas indicativo. Não tem efeitos jurídicos: o preço e o âmbito são definidos por pessoas, na proposta. Não há decisões tomadas exclusivamente de forma automatizada nem definição de perfis.",
            },
          ],
        },
        {
          id: "seguranca",
          title: "Segurança",
          blocks: [
            {
              p: "O website usa ligações cifradas (HTTPS). Os dados ficam em contas protegidas, a que só os dois sócios têm acesso. Se houver uma violação de dados com risco para quem os confiou à nevima, a CNPD é notificada em 72 horas e, quando o risco for elevado, as pessoas afetadas são avisadas (artigos 33.º e 34.º do RGPD).",
            },
          ],
        },
        {
          id: "menores",
          title: "Menores",
          blocks: [
            {
              p: "Os serviços da nevima destinam-se a negócios e a adultos. Se um menor enviar dados através do website, basta avisar para ola@nevima.studio e os dados são apagados.",
            },
          ],
        },
        {
          id: "armazenamento",
          title: "Cookies e armazenamento no navegador",
          blocks: [
            {
              p: "Este website não usa cookies. Guarda no navegador apenas o necessário para funções pedidas por quem o visita: voltar ao mesmo ponto da página depois do portefólio ou de mudar de língua, não repetir a animação de abertura na mesma visita e lembrar a opção “Parar movimento”. Nada disto é usado para seguir ou identificar visitantes. O detalhe está na [Política de Cookies](/cookies).",
            },
          ],
        },
        {
          id: "sites-clientes",
          title: "Os websites dos clientes",
          blocks: [
            {
              p: "Nos websites que a nevima faz e aloja para os seus clientes, quem decide sobre os dados dos visitantes é o próprio cliente. A nevima trata esses dados apenas por conta dele, nos termos do acordo de tratamento de dados do contrato. As questões sobre esses websites devem ser dirigidas ao respetivo titular.",
            },
          ],
        },
        {
          id: "alteracoes",
          title: "Alterações a esta política",
          blocks: [
            {
              p: "Quando esta política mudar, a nova versão é publicada nesta página, com a data e o número da versão. As alterações importantes são assinaladas no website.",
            },
          ],
        },
      ],
    },
    en: {
      title: "Privacy Policy",
      lede: "How nevima handles the personal data of people who visit this website, ask for a proposal or work with us.",
      summary: [
        "We only collect what we need to answer a request and to work with each client.",
        "We use no advertising cookies or analytics tools, and we never sell or share data for marketing.",
        "Requests that don't lead to a contract are deleted after 3 months. Invoices are kept for 10 years, because the law requires it.",
        "To see, correct or delete your data, just email [ola@nevima.studio](mailto:ola@nevima.studio).",
      ],
      sections: [
        {
          id: "responsaveis",
          title: "Who is responsible for your data",
          blocks: [
            {
              p: "“nevima” is the brand under which two self-employed professionals work. They decide together how personal data is handled, so they are joint controllers (Article 26 of the General Data Protection Regulation, GDPR):",
            },
            {
              list: [
                "António Maria das Neves Sepúlveda de Sá Policarpo, tax number (NIF) 255250371;",
                "Emanuel Augusto Soares da Costa, tax number (NIF) 275530671.",
              ],
            },
            { p: "Address: [MORADA]. Email: [ola@nevima.studio](mailto:ola@nevima.studio)." },
            {
              p: "The two have agreed that ola@nevima.studio is the single point of contact for any question about personal data, and that both answer for this policy. You can exercise the rights below with either of them.",
            },
            { p: "nevima has no data protection officer, as its activity does not require one (Article 37 GDPR)." },
          ],
        },
        {
          id: "dados",
          title: "What data we handle, why and for how long",
          blocks: [
            {
              table: {
                head: ["When", "Data", "Why", "Legal basis", "How long"],
                rows: [
                  [
                    "Visiting the website",
                    "IP address, date and time, page requested, browser and device",
                    "Keeping the website running and secure; stopping abusive requests",
                    "Legitimate interest (Art. 6(1)(f) GDPR)",
                    "Server logs are deleted after 1 day; the check on abusive requests keeps the IP in memory for 15 minutes",
                  ],
                  [
                    "Estimate in the form",
                    "Your answers (services, type of client, sector, country, shoot location, reference addresses). No name or contact details",
                    "Working out the estimate and improving the form",
                    "Legitimate interest",
                    "1 day, in the server logs",
                  ],
                  [
                    "Proposal request",
                    "Name, email, phone, business name (for a business), your message and your answers",
                    "Preparing and sending the proposal, and replying",
                    "Steps taken at your request before a contract (Art. 6(1)(b) GDPR)",
                    "3 months after the last contact, if no contract follows",
                  ],
                  [
                    "Partnership request (development companies)",
                    "Name, email, phone, company, notes and answers",
                    "Replying and preparing a quote",
                    "Steps taken before a contract",
                    "3 months after the last contact, if no contract follows",
                  ],
                  [
                    "Emails sent to nevima",
                    "What you write and your address",
                    "Replying",
                    "Steps before a contract, or legitimate interest",
                    "3 months after the last contact, unless they lead to a contract",
                  ],
                  [
                    "Clients",
                    "Identification, tax number, address, contact details, representative, signature, project messages and materials",
                    "Performing the contract, invoicing and collecting payment",
                    "Performance of the contract (b); tax obligations (c)",
                    "Contract and invoices: 10 years from the end of the invoice's year (Art. 52, Portuguese VAT Code). Working materials: 12 months after delivery",
                  ],
                  [
                    "Portfolio",
                    "The client's name and website address",
                    "Showing our work",
                    "Legitimate interest; the client can say no at any time",
                    "For as long as the project is shown",
                  ],
                ],
              },
            },
          ],
        },
        {
          id: "formularios",
          title: "The website's forms",
          blocks: [
            {
              p: "Your name, email, phone and, for a business, its name are needed to prepare the proposal and arrange next steps. The message is optional. Without the required fields we can't answer the request.",
            },
            {
              p: "Until requests can be sent straight from the website, yours goes by email, from your own email app, to ola@nevima.studio. Your answers to the form (without name or contact details) also stay in the server logs for 1 day.",
            },
            {
              p: "nevima sends no newsletters or marketing. If that ever changes, it will only be with your separate permission, asked for apart and never pre-ticked.",
            },
          ],
        },
        {
          id: "destinatarios",
          title: "Who receives the data",
          blocks: [
            { p: "Data is only shared with those who provide services to nevima, or where the law requires it:" },
            {
              list: [
                "**Vercel Inc.**, which hosts the website (United States);",
                "**Google**, through Google Workspace, where emails are kept;",
                "**the Portuguese Tax Authority**, for invoicing, as the law requires.",
              ],
            },
            {
              p: "Some of the website's images load straight from Unsplash's servers, which, as with any image request, receive the visitor's IP address and browser.",
            },
            {
              p: "nevima uses artificial intelligence tools for design and programming work, but does not give them the personal data of people who ask for proposals. Data is never sold or shared for advertising.",
            },
          ],
        },
        {
          id: "transferencias",
          title: "Data outside the European Union",
          blocks: [
            {
              p: "Vercel and Google may handle data in the United States. Vercel is certified under the EU-U.S. Data Privacy Framework, which the European Commission recognises as giving adequate protection (Implementing Decision (EU) 2023/1795). Where that framework does not apply, the transfer relies on the standard contractual clauses approved by the European Commission.",
            },
            { p: "You can ask for a copy of these safeguards at ola@nevima.studio." },
          ],
        },
        {
          id: "direitos",
          title: "Your rights",
          blocks: [
            { p: "If nevima handles your personal data, you can at any time:" },
            {
              list: [
                "see your data and how it is handled;",
                "correct data that is wrong or incomplete;",
                "ask for it to be deleted;",
                "ask for its use to be restricted;",
                "receive it in a common format, to take it elsewhere (portability);",
                "object to its use based on legitimate interest.",
              ],
            },
            {
              p: "Just email [ola@nevima.studio](mailto:ola@nevima.studio). You'll get an answer within one month, which can be extended by two more for complex requests, with notice (Article 12 GDPR). It is free. If there is reasonable doubt about who is asking, we may ask you to confirm your identity.",
            },
            {
              p: "You also have the right to complain to the Portuguese data protection authority, the Comissão Nacional de Proteção de Dados (CNPD), at [www.cnpd.pt](https://www.cnpd.pt).",
            },
          ],
        },
        {
          id: "decisoes",
          title: "Automated decisions",
          blocks: [
            {
              p: "The form's estimate is an automatic calculation and only a guide. It has no legal effect: the price and scope are set by people, in the proposal. No decisions are made solely by automated means, and there is no profiling.",
            },
          ],
        },
        {
          id: "seguranca",
          title: "Security",
          blocks: [
            {
              p: "The website uses encrypted connections (HTTPS). Data is kept in protected accounts that only the two partners can access. If a data breach puts people at risk, the CNPD is notified within 72 hours and, where the risk is high, the people affected are told (Articles 33 and 34 GDPR).",
            },
          ],
        },
        {
          id: "menores",
          title: "Children",
          blocks: [
            {
              p: "nevima's services are meant for businesses and adults. If a minor sends data through the website, let us know at ola@nevima.studio and it will be deleted.",
            },
          ],
        },
        {
          id: "armazenamento",
          title: "Cookies and browser storage",
          blocks: [
            {
              p: "This website uses no cookies. It keeps in your browser only what is needed for things you ask it to do: bring you back to the same place on a page after the portfolio or a language change, not replay the opening animation in the same visit, and remember “Pause motion”. None of it is used to track or identify visitors. The details are in the [Cookie Policy](/cookies).",
            },
          ],
        },
        {
          id: "sites-clientes",
          title: "Our clients' websites",
          blocks: [
            {
              p: "On the websites nevima builds and hosts for its clients, the client decides about their visitors' data. nevima only handles that data on the client's behalf, under the data processing agreement in the contract. Questions about those websites should go to their owner.",
            },
          ],
        },
        {
          id: "alteracoes",
          title: "Changes to this policy",
          blocks: [
            {
              p: "When this policy changes, the new version is published on this page with its date and version number. Important changes are flagged on the website.",
            },
          ],
        },
      ],
    },
  },
};

/* ------------------------------------------------------------------
   NOTA INTERNA (não publicada)

   Bases legais: RGPD, arts. 5.º, 6.º, 12.º a 14.º, 15.º a 22.º, 26.º,
   28.º, 33.º, 34.º, 37.º, 44.º a 46.º; Lei 58/2019; Lei 41/2004, art. 5.º
   (armazenamento no navegador isento, n.º 2); CIVA, art. 52.º (10 anos,
   redação do DL 49/2025, confirmado no Portal das Finanças); Decisão de
   Execução (UE) 2023/1795 (DPF).

   A CONFIRMAR:
   - [MORADA] por preencher (decisão dos sócios).
   - Entidade da Google que contrata o Workspace e a sua certificação no
     DPF (dataprivacyframework.gov estava bloqueado).
   - Retenção dos registos de pedidos ao CDN guardados pela própria
     Vercel (a docs só confirma 1 dia para os registos de execução no Pro).
   - As imagens da Unsplash deixam de ser pedidas a terceiros quando
     passarem a ser servidas pelo próprio site (Fase 3): retirar então o
     parágrafo sobre a Unsplash.
   - Se passar a existir contabilista externo, acrescentá-lo aos
     destinatários.
   ------------------------------------------------------------------ */
