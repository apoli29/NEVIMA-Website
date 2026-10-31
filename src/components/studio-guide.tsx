/* ==================================================================
   How the whole back end works: the guide in /interno

   For whichever partner opens the composer for the first time (user,
   2026-10-30): every app the process uses and what it is for, how they
   hand work to each other, and the way a request goes, from the form
   to the signed contract, step by step. Each step says who does it
   (the client, the site on its own, or the studio), which apps take
   part, what happens behind it, and what changes in Notion, so what is
   left to do by hand is plain. It opens with the process in a few short
   steps; after them comes every detail of the back end (user, 2026-10-31):
   what pressing "Enviar" does, who can reach what, what happens when
   something fails, the keys, the routes, the limits and where data stays.

   Portuguese only, as the rest of /interno. When the process changes,
   change it here and in docs/backend-decisions.md together.
   ================================================================== */

type Who = "Cliente" | "Automático" | "Estúdio";

type AppId = "site" | "vercel" | "notion" | "resend" | "gmail" | "hostinger" | "mail" | "calendar" | "call";

type App = { name: string; what: string; who: string };

const APPS: Record<AppId, App> = {
  site: {
    name: "Site",
    what: "O website (nevima-website.vercel.app, mais tarde nevima.studio). Tem o formulário, a página onde o cliente confirma o horário, esta página interna e as rotas do servidor que ligam tudo: recebem o pedido, falam com o Notion e mandam o Resend enviar.",
    who: "Cliente e estúdio",
  },
  vercel: {
    name: "Vercel",
    what: "Aloja o site e publica cada alteração do código. Guarda as chaves secretas (Notion, Resend, a chave desta página, a dos links) e os registos, onde se vê se um envio falhou.",
    who: "Estúdio (só para configurar)",
  },
  notion: {
    name: "Notion",
    what: "Onde ficam os pedidos: a base \"Pedidos\" (clientes) e a base \"Parceiros\" (empresas de desenvolvimento). Cada pedido é uma página com as respostas, a estimativa, o estado, a data da reunião e os valores. O site escreve e lê nelas através de uma integração; o estúdio trabalha nelas à mão.",
    who: "Estúdio",
  },
  resend: {
    name: "Resend",
    what: "O serviço que envia os emails em nome de ola@nevima.studio: a confirmação ao cliente, os avisos ao estúdio, e o convite e a proposta quando se carrega em Enviar aqui. Não guarda conversas: só envia.",
    who: "Automático",
  },
  gmail: {
    name: "Gmail",
    what: "A caixa do estúdio, onde chegam os emails para ola@nevima.studio: os avisos de pedidos e de reuniões, a cópia oculta de cada email enviado daqui, e as respostas dos clientes. É de lá que se responde ao cliente no dia a dia.",
    who: "Estúdio",
  },
  hostinger: {
    name: "Hostinger",
    what: "Onde está registado o domínio nevima.studio. Os registos DNS que o Resend pede para verificar o domínio são acrescentados lá, uma única vez; sem eles o Resend não envia a partir de ola@nevima.studio.",
    who: "Estúdio (só para configurar)",
  },
  mail: {
    name: "Email do cliente",
    what: "A app de email do cliente (Gmail, Outlook, Apple Mail…). Recebe a confirmação, o convite e a proposta; os botões dos horários abrem o site.",
    who: "Cliente",
  },
  calendar: {
    name: "Calendário do cliente",
    what: "Depois de confirmar o horário, o cliente pode juntá-lo ao calendário dele com um clique (um ficheiro .ics que abre no Google Calendar, Outlook ou Apple Calendar).",
    who: "Cliente",
  },
  call: {
    name: "Videochamada",
    what: "Google Meet ou outra. Fica fora do sistema: o link da chamada é criado e enviado à mão, depois de o cliente escolher o horário.",
    who: "Estúdio",
  },
};

/** The circuits the apps make between them. */
const FLOWS: { title: string; when: string; chain: { app: AppId; does: string }[] }[] = [
  {
    title: "Um pedido chega",
    when: "O cliente envia o formulário.",
    chain: [
      { app: "site", does: "Recebe o pedido, volta a verificar as respostas e calcula a estimativa no servidor." },
      { app: "notion", does: "Cria a página do pedido em \"Pedidos\", estado Novo." },
      { app: "resend", does: "Envia a confirmação ao cliente e o aviso ao estúdio." },
      { app: "gmail", does: "O aviso chega ao estúdio, com o link para a página do Notion." },
    ],
  },
  {
    title: "O estúdio envia um email daqui",
    when: "Convite para chamada ou proposta final.",
    chain: [
      { app: "site", does: "Esta página procura o pedido pelo email do cliente." },
      { app: "notion", does: "Devolve o nome, a empresa e a língua." },
      { app: "resend", does: "Envia o email ao cliente, com cópia oculta para o estúdio." },
      { app: "notion", does: "O estado do pedido avança sozinho." },
    ],
  },
  {
    title: "O cliente marca a chamada",
    when: "Clica num dos horários do convite.",
    chain: [
      { app: "mail", does: "O botão do horário abre o site." },
      { app: "site", does: "Mostra o horário e pede um clique para o confirmar." },
      { app: "notion", does: "Guarda a data em \"Reunião\" e muda o estado para Reunião marcada." },
      { app: "resend", does: "Avisa o estúdio, que recebe o aviso no Gmail." },
    ],
  },
  {
    title: "O cliente responde sobre a chamada a meio do projeto",
    when: "Clica em sim ou não no email da proposta final.",
    chain: [
      { app: "mail", does: "O botão abre o site." },
      { app: "site", does: "Mostra a resposta e pede um clique para a confirmar." },
      { app: "notion", does: "Guarda \"Sim\" ou \"Não\" em \"Reunião a meio\"." },
      { app: "resend", does: "Avisa o estúdio, que recebe o aviso no Gmail." },
    ],
  },
];

type Step = {
  title: string;
  who: Who;
  apps: AppId[];
  body: string;
  /** What happens without anyone seeing it. */
  behind?: string;
  /** What changes in Notion. */
  notion?: string;
};

const STEPS: Step[] = [
  {
    title: "O pedido chega",
    who: "Cliente",
    apps: ["site", "notion"],
    body: "O cliente responde ao formulário do site (no fim de cada página, ou pelo botão da barra). No último passo escolhe a língua da resposta, português ou inglês, já marcada com a língua em que usou o site, e envia.",
    behind: "O servidor do site volta a verificar as respostas e recalcula a estimativa, para não depender do que o navegador mostrou. Recusa um segundo pedido do mesmo email em 24 horas, e pedidos feitos depressa demais (robôs).",
    notion: "Nova página em \"Pedidos\" (ou \"Parceiros\"), estado Novo, com as respostas, a estimativa mostrada ao cliente, a origem, a data em \"Recebido\" e a língua em \"Idioma\". A página já traz os títulos de \"Preparação da reunião\".",
  },
  {
    title: "Confirmação e aviso",
    who: "Automático",
    apps: ["resend", "mail", "gmail"],
    body: "No mesmo instante, o cliente recebe a confirmação automática, na língua que escolheu (pode vê-la no separador \"Confirmação automática\"). O estúdio recebe no Gmail um aviso com o resumo do pedido, a estimativa e o link para a página do Notion.",
    behind: "Os dois emails saem pelo Resend. Se o Resend falhar, o pedido não se perde, porque já está no Notion, e a coluna \"Alertas\" diz qual dos emails não saiu. Responder ao aviso responde diretamente ao cliente.",
  },
  {
    title: "Preparar a chamada",
    who: "Estúdio",
    apps: ["notion"],
    body: "Abrir a página do pedido no Notion. Em \"Preparação da reunião\", escrever sobre o negócio do cliente, as escolhas a rever (que podem ser desnecessárias) e o que não escolheu mas pode fazer sentido. Preencher \"Valor Y (cliente)\" (o que as respostas dão) e \"Valor X (sugestões)\" (com as sugestões do estúdio).",
  },
  {
    title: "Convite para a chamada",
    who: "Estúdio",
    apps: ["site", "notion", "resend", "gmail"],
    body: "Separador \"Convite para chamada\": escrever o email do cliente e carregar em Procurar; o nome, a empresa e a língua vêm do Notion e podem ser corrigidos. Escolher dois horários, na hora de Lisboa. Ver o email à direita e carregar em Enviar.",
    behind: "Cada botão de horário leva um link assinado, que só serve para este pedido e estes dois horários; não leva o nome nem o email do cliente. O Resend envia o convite e uma cópia oculta chega ao Gmail do estúdio.",
    notion: "Estado passa de Novo a Contactado.",
  },
  {
    title: "O cliente escolhe um horário",
    who: "Cliente",
    apps: ["mail", "site", "notion", "calendar"],
    body: "O cliente clica num dos horários no email. Abre-se uma página do site com esse horário, a indicação da hora de Lisboa e um botão \"Confirmar este horário\"; o outro horário fica a um clique. Depois de confirmar, pode juntá-lo ao calendário.",
    behind: "O clique no email só abre a página; a marcação só acontece com o segundo clique, para que um programa de email que abra links sozinho não marque nada. Se o cliente mudar de ideias e confirmar o outro horário, a marcação muda e o estúdio é avisado de novo. Um horário que já passou não pode ser marcado.",
    notion: "\"Reunião\" fica com a data e a hora (hora de Lisboa); estado Reunião marcada. O estúdio recebe no Gmail o aviso \"Reunião marcada\".",
  },
  {
    title: "Enviar o link da chamada",
    who: "Estúdio",
    apps: ["call", "gmail"],
    body: "À mão: criar a chamada (Google Meet ou outra) para o horário escolhido e enviar o convite com o link ao cliente, a partir do calendário ou do Gmail. A página do site já disse ao cliente que o link segue por email.",
  },
  {
    title: "A chamada",
    who: "Estúdio",
    apps: ["call", "notion"],
    body: "Na chamada, apresentar a proposta e rever as escolhas, com os dois valores preparados. Depois, à mão no Notion: estado Reunião feita, e as notas do que ficou decidido.",
  },
  {
    title: "Proposta final e contrato",
    who: "Estúdio",
    apps: ["site", "notion", "resend", "gmail"],
    body: "Separador \"Proposta final\": procurar o cliente pelo email (sem pedido ligado, o email não sai, porque os botões precisam dele). Preencher o valor final e, se houver, o valor mensal; escrever os materiais em falta, que aparecem numa caixa; se for preciso, acrescentar um texto da proposta. Anexar o contrato em PDF, escolher quem assina, ver o email e carregar em Enviar.",
    behind: "O contrato vai em anexo e o nome do ficheiro aparece no email, para o cliente o procurar. A nota de IVA por baixo do valor pode ser alterada. O email traz dois botões, sim e não, para o cliente dizer se quer a chamada a meio do projeto, que é opcional.",
    notion: "Estado Proposta enviada, \"Valor final\" preenchido e \"Contrato enviado\" assinalado.",
  },
  {
    title: "O cliente responde sobre a chamada a meio do projeto",
    who: "Cliente",
    apps: ["mail", "site", "notion", "gmail"],
    body: "O cliente clica em sim ou não no email. Abre-se uma página do site com a resposta e um botão para a confirmar. Se a resposta for sim, o estúdio envia depois, à mão, um email para marcar a data.",
    behind: "Tal como nos horários, o clique no email só abre a página; a resposta só conta com o segundo clique. Se o cliente mudar de ideias, vale a última resposta e o estúdio é avisado de novo.",
    notion: "\"Reunião a meio\" fica com Sim ou Não. O estúdio recebe no Gmail um aviso com a resposta.",
  },
  {
    title: "Fecho",
    who: "Estúdio",
    apps: ["gmail", "notion"],
    body: "O cliente responde ao email com o contrato assinado; a resposta chega ao Gmail. O projeto começa quando estiverem disponíveis todos os materiais. À mão no Notion: estado Ganho, ou Perdido se não avançar.",
  },
];

const WAYS = [
  {
    title: "Enviar",
    body: "Sai de ola@nevima.studio pelo Resend, com uma cópia oculta para o estúdio, que fica no Gmail, onde chega a resposta do cliente. O Notion é atualizado sozinho. Pede confirmação antes de enviar.",
  },
  {
    title: "Copiar para o Gmail",
    body: "Copia o email pronto, com os links dos botões já a funcionar. No Gmail: nova mensagem, colar no corpo, escrever o assunto (aparece por cima da pré-visualização) e, na proposta, anexar o contrato. O Notion fica por atualizar à mão.",
  },
];

const LIMITS = [
  "Enviar só funciona depois de o domínio nevima.studio estar verificado no Resend (registos DNS na Hostinger); até lá, usar Copiar para o Gmail.",
  "O plano gratuito do Resend envia 100 emails por dia e 3000 por mês, contando as confirmações e os avisos automáticos.",
  "O contrato vai num só PDF, até 4 MB.",
  "Uma só chave para os dois; mudá-la na Vercel fecha todas as sessões abertas. A sessão dura 30 dias em cada navegador.",
  "Os links dos botões (horários e chamada a meio do projeto) deixam de funcionar se a chave dos links (LINKS_SECRET) mudar na Vercel.",
  "A página não impede dois clientes de escolher o mesmo horário: oferecer horários diferentes a cada um.",
  "Nada do que se escreve aqui é guardado: só o que é enviado, e o que fica no Notion.",
];

/** The whole process, short: the simple version at the top of the page. */
const SIMPLE: { who: Who; text: string }[] = [
  { who: "Cliente", text: "Preenche o formulário do site e vê uma estimativa." },
  { who: "Automático", text: "O pedido fica no Notion. O cliente recebe a confirmação e o estúdio recebe um aviso." },
  { who: "Estúdio", text: "Prepara a chamada no Notion e envia daqui o convite, com dois horários." },
  { who: "Cliente", text: "Escolhe um horário no email e confirma-o no site. O Notion fica com a data." },
  { who: "Estúdio", text: "Cria a videochamada, envia o link à mão e faz a chamada." },
  { who: "Estúdio", text: "Envia daqui a proposta final, com o contrato em anexo e os materiais em falta." },
  { who: "Cliente", text: "Diz nos botões se quer a chamada a meio do projeto e responde ao email com o contrato assinado." },
  { who: "Estúdio", text: "Marca o pedido como Ganho ou Perdido no Notion. O projeto começa quando houver todos os materiais." },
];

const BY_HAND = [
  "Preparar a chamada no Notion e preencher os valores X e Y.",
  "Criar a videochamada e enviar o link ao cliente.",
  "Mudar o estado para Reunião feita, Ganho ou Perdido.",
  "Se o cliente disser sim, enviar o email para marcar a chamada a meio do projeto.",
];

/** Pressing "Enviar", in order. */
const SEND = [
  { title: "Antes do clique", body: "A pré-visualização é desenhada no navegador, com o mesmo código que o servidor usa. Até carregar em Enviar, nada sai do navegador, a não ser a procura do cliente pelo email. O que se escreve não fica guardado: recarregar a página apaga-o." },
  { title: "Confirmação", body: "O navegador pergunta se é para enviar, com o assunto, o nome e o email. Cancelar não faz nada." },
  { title: "O pedido ao servidor", body: "O navegador envia os campos e o PDF para a rota /api/studio/email, com o cookie da sessão." },
  { title: "Verificações", body: "O servidor confirma, por esta ordem: a sessão; o nome; a ligação ao pedido no Notion; no convite, os dois horários; a LINKS_SECRET; na proposta, o PDF (até 4 MB); o email do cliente; a RESEND_API_KEY. Se algo falhar, nada é enviado e a página diz o que falta." },
  { title: "O email é montado", body: "O servidor volta a gerar o email e assina os links dos botões. Os campos do cliente ficam só no texto do email: o cliente recebe uma mensagem normal, sem acesso a nada." },
  { title: "O Resend envia", body: "De: ola@nevima.studio (MAIL_FROM). Para: o cliente, o único destinatário visível. Cópia oculta: a caixa do estúdio (NOTIFY_TO). Respostas: ola@nevima.studio. Um email enviado já não pode ser cancelado." },
  { title: "O Notion é atualizado", body: "Convite: de Novo para Contactado; noutro estado, não muda. Proposta: Proposta enviada e Valor final; com PDF, também Contrato enviado. Só acontece depois de o Resend aceitar o email." },
  { title: "A resposta no ecrã", body: "Verde: enviado, e se o Notion foi atualizado. Vermelho: não enviado, e porquê. Se disser que o email saiu mas o Notion não foi atualizado, atualizar à mão e não carregar outra vez em Enviar, ou o cliente recebe o email duas vezes." },
];

const ACCESS = [
  { who: "Cliente", can: "Receber os emails, responder-lhes e usar os botões do seu próprio pedido.", cannot: "Entrar nesta página, ver o Notion, a caixa do estúdio ou outros pedidos, ou enviar emails em nome do estúdio. Ter o email dele preenchido aqui só diz para onde enviar." },
  { who: "Quem receber um link reencaminhado", can: "Abrir a página do botão e confirmar ou mudar o horário, ou a resposta sobre a chamada a meio do projeto, desse pedido. O link não identifica quem clica.", cannot: "Ver nome, email ou telefone do cliente, ou usar o link noutro pedido: a assinatura deixa de valer." },
  { who: "Visitante do site", can: "Preencher os formulários e ver a estimativa das suas respostas.", cannot: "Ver a tabela de preços (só o servidor a tem) ou entrar nesta página." },
  { who: "Quem tiver a STUDIO_KEY", can: "Entrar aqui, procurar pedidos em \"Pedidos\" pelo email e enviar emails como ola@nevima.studio para qualquer endereço. Atualiza assim o estado desses pedidos.", cannot: "Ver as chaves, abrir o Notion, o Gmail ou o Resend. Não fica registado qual dos dois sócios enviou: \"Assinado por\" é só o nome no email." },
  { who: "Quem tiver acesso à Vercel", can: "Ver e mudar todas as chaves, ler os registos e publicar código. É o acesso mais sensível.", cannot: "" },
  { who: "Notion, Resend e Gmail", can: "Cada conta vê os seus dados: os pedidos, os emails enviados e a correspondência. O site entra no Notion com NOTION_TOKEN, só nas páginas partilhadas com a integração, e no Resend com RESEND_API_KEY.", cannot: "O site não usa a palavra-passe de nenhuma conta nem entra na caixa de correio: só envia, nunca lê." },
];

const FAILURES = [
  { when: "Um pedido chega e o Notion falha", then: "O formulário diz que o pedido não chegou e propõe enviá-lo pela app de email do visitante. Nada fica guardado: os registos não têm os contactos.", todo: "Ver o erro nos registos da Vercel." },
  { when: "Um pedido chega e o Resend falha", then: "O pedido fica no Notion e o visitante vê sucesso. A coluna \"Alertas\" diz qual dos emails não saiu: a confirmação, o aviso ao estúdio ou os dois.", todo: "Consultar o Notion com regularidade: sem aviso, um pedido novo só se vê lá. Se a confirmação não saiu, contactar o cliente." },
  { when: "O mesmo email pede de novo em 24 horas", then: "É recusado e o formulário diz quanto falta. Conta em cada base em separado.", todo: "Para testes, usar um endereço de REPEAT_ALLOWED_EMAILS_FORMS." },
  { when: "Um robô preenche o formulário", then: "Campo escondido preenchido, ou envio em menos de 4 segundos: o site responde que correu bem e não guarda nada.", todo: "Nada." },
  { when: "Enviar e o Resend recusa", then: "O email não sai e o Notion não muda.", todo: "Ver os registos, ou usar Copiar para o Gmail." },
  { when: "Enviar: o email sai e o Notion falha", then: "O cliente recebe o email e a página avisa que o Notion ficou por atualizar.", todo: "Atualizar à mão. Não voltar a enviar." },
  { when: "O cliente confirma um horário e o Notion falha", then: "A marcação não fica feita, o estúdio não é avisado e o cliente é convidado a tentar de novo ou a ligar.", todo: "Atender a chamada ou o email do cliente." },
  { when: "O horário fica marcado e o aviso falha", then: "O Notion tem a data e a coluna \"Alertas\" regista que o aviso não saiu.", todo: "Ver as colunas \"Reunião\" e \"Alertas\" no Notion." },
  { when: "O cliente usa um botão antigo do convite", then: "Se o horário ainda não passou, a data muda. Com o pedido em Reunião feita, Proposta enviada, Ganho ou Perdido, o estado não muda. O estúdio é avisado.", todo: "Ver se a nova data ainda faz sentido e falar com o cliente." },
  { when: "O cliente escolhe um horário que já passou", then: "O site recusa e a página diz que o horário já passou.", todo: "Enviar novo convite." },
  { when: "A resposta sobre a chamada a meio não entra no Notion", then: "Se o aviso ao estúdio sair, o cliente vê sucesso e o aviso diz para atualizar à mão. Se também falhar, o cliente vê o erro.", todo: "Atualizar à mão \"Reunião a meio\"." },
  { when: "A resposta entra no Notion e o aviso falha", then: "A coluna \"Reunião a meio\" tem a resposta e \"Alertas\" regista que o aviso não saiu.", todo: "Ver as duas colunas. Se a resposta for sim, enviar o email para marcar a data." },
  { when: "Muda a LINKS_SECRET", then: "Todos os botões já enviados deixam de funcionar: a página diz que o link não é válido.", todo: "Não a mudar sem necessidade, ou reenviar os emails pendentes." },
  { when: "SITE_URL errado ou em falta", then: "As imagens dos emails não carregam e os botões apontam para o endereço errado.", todo: "Definir o endereço real na Vercel e publicar de novo." },
];

const KEYS = [
  { name: "STUDIO_KEY", what: "A chave desta página.", without: "Ninguém consegue entrar." },
  { name: "LINKS_SECRET", what: "Assina os links dos botões.", without: "O convite e a proposta não saem. Os links antigos deixam de valer." },
  { name: "RESEND_API_KEY", what: "Permite enviar pelo Resend.", without: "Nenhum email sai; os pedidos continuam a chegar ao Notion." },
  { name: "NOTION_TOKEN", what: "O acesso do site ao Notion.", without: "Os formulários dizem que o pedido não chegou; os botões e a procura falham." },
  { name: "NOTION_FORM1_LEADS", what: "O id da base \"Pedidos\".", without: "O formulário de proposta falha; a procura deixa de funcionar." },
  { name: "NOTION_FORM2_LEADS", what: "O id da base \"Parceiros\".", without: "O formulário de parceiros falha." },
  { name: "SITE_URL", what: "O endereço do site, para imagens e botões.", without: "Usa https://nevima.studio." },
  { name: "MAIL_FROM", what: "O remetente dos emails (opcional).", without: "Usa nevima <ola@nevima.studio>." },
  { name: "NOTIFY_TO", what: "Quem recebe os avisos e a cópia oculta (opcional; vírgulas entre endereços).", without: "Usa ola@nevima.studio." },
  { name: "REPEAT_ALLOWED_EMAILS_FORMS", what: "Emails isentos do limite de 24 horas, para testes (opcional).", without: "Ninguém fica isento." },
];

const ROUTES = [
  { path: "/api/estimate", who: "Público", what: "Verifica as respostas e calcula a estimativa no servidor." },
  { path: "/api/proposal", who: "Público", what: "Recebe o pedido de proposta: verifica, calcula de novo, cria a página no Notion e envia a confirmação e o aviso." },
  { path: "/api/partner", who: "Público", what: "Recebe o pedido de parceria: cria a página em \"Parceiros\" e avisa o estúdio. O parceiro não recebe confirmação." },
  { path: "/meeting", who: "Link assinado", what: "Mostra o horário escolhido. Abrir a página não marca nada." },
  { path: "/api/meeting", who: "Link assinado", what: "Marca o horário no Notion e avisa o estúdio." },
  { path: "/api/meeting/ics", who: "Link assinado", what: "Dá o ficheiro de calendário: só tem a hora e o email do estúdio." },
  { path: "/mid-call", who: "Link assinado", what: "Mostra a resposta sobre a chamada a meio do projeto. Abrir a página não regista nada." },
  { path: "/api/mid-call", who: "Link assinado", what: "Guarda a resposta no Notion e avisa o estúdio." },
  { path: "/interno", who: "Chave", what: "Sem sessão válida mostra a porta; com sessão, esta página. Sem links para ela e fora dos motores de busca." },
  { path: "/api/studio/login", who: "Público", what: "Compara a chave e devolve o cookie da sessão." },
  { path: "/api/studio/lookup", who: "Sessão", what: "Procura em \"Pedidos\" o pedido mais recente de um email." },
  { path: "/api/studio/email", who: "Sessão", what: "Gera os emails e, em Enviar, envia-os e atualiza o Notion." },
];

const GUARDS = [
  "Chave: comparada no servidor, sem espaços acidentais. O cookie guarda uma impressão da chave, nunca a própria chave; dura 30 dias, não é legível por código da página, só viaja por HTTPS em produção e só em pedidos vindos do próprio site.",
  "Não há contas nem segundo fator: a mesma chave serve aos dois. Mudá-la na Vercel, com nova publicação, fecha todas as sessões.",
  "Links dos botões: levam só o id da página do Notion, os horários e a língua, com uma assinatura. Não levam nome, email ou telefone, não expiram e não indicam quem clicou.",
  "Duplo clique: o botão no email só abre a página do site, e só a confirmação conta. Assim, um programa de email que abra links não marca nem responde nada.",
  "Formulários: nada do que o navegador envia é aceite sem verificação. Cada resposta tem de pertencer à lista prevista, o texto livre é limpo e cortado, e a estimativa é sempre recalculada no servidor.",
];

const NUMBERS = [
  "Proposta e parceiros: 5 pedidos em 15 minutos por IP, e um pedido por email em 24 horas.",
  "Estimativa: 30 cálculos em 10 minutos por IP.",
  "Entrada nesta página: 10 tentativas por minuto por IP.",
  "Marcar horário e responder sobre a chamada a meio: 10 vezes em 15 minutos por IP.",
  "Estes limites por IP ficam na memória de cada instância do servidor e são esquecidos quando ela reinicia: travam um script simples, não um ataque determinado.",
  "Pedidos de formulário: até 16 KB. Contrato: um PDF até 4 MB.",
  "Notion e Resend: cada pedido do site espera até 10 segundos pela resposta.",
  "No Notion, cada pedaço de texto vai até 2000 caracteres e as vírgulas das opções passam a ponto e vírgula.",
  "Duração no ficheiro de calendário: 30 minutos.",
];

const NOTION_FIELDS = [
  { field: "Novo, e os dados do formulário", by: "Automático", when: "Quando o pedido chega." },
  { field: "Contactado", by: "Automático", when: "Convite enviado com Enviar, se o pedido estava em Novo." },
  { field: "Reunião e Reunião marcada", by: "Automático", when: "O cliente confirma um horário." },
  { field: "Valor Y, Valor X e notas", by: "À mão", when: "A preparar a chamada." },
  { field: "Reunião feita", by: "À mão", when: "Depois da chamada." },
  { field: "Proposta enviada e Valor final", by: "Automático", when: "Proposta enviada com Enviar." },
  { field: "Contrato enviado", by: "Automático", when: "Proposta enviada com Enviar e com PDF." },
  { field: "Reunião a meio", by: "Automático", when: "O cliente confirma sim ou não." },
  { field: "Ganho ou Perdido", by: "À mão", when: "No fecho." },
  { field: "Alertas", by: "Automático", when: "Quando um email automático não sai. Apagar à mão depois de resolver." },
];

const DATA_PLACES = [
  { where: "Notion", what: "Tudo o que o cliente preencheu, a estimativa e o que o estúdio acrescenta. É o registo principal." },
  { where: "Resend", what: "Os emails passam por lá para serem enviados, com o conteúdo e o anexo." },
  { where: "Gmail", what: "Os avisos, as cópias ocultas e as respostas dos clientes. Os emails enviados daqui não aparecem nos \"Enviados\": a cópia oculta faz esse papel." },
  { where: "Registos da Vercel", what: "Erros e simulações da estimativa, sem nome, email, telefone, mensagem ou IP. Podem conter as respostas ao formulário." },
  { where: "Navegador", what: "Só o cookie da sessão e a indicação de que este guia já foi visto." },
];

const WATCH = [
  "Copiar para o Gmail também precisa do pedido ligado e da LINKS_SECRET. Gera o email e os links, mas não muda o Notion nem junta o PDF, que tem de ser anexado à mão.",
  "A procura só encontra pedidos de \"Pedidos\". Para um parceiro, é preciso colar o link da página, e a base \"Parceiros\" não tem Valor final, por isso o Notion não é atualizado ao enviar a proposta.",
  "A procura devolve o pedido mais recente daquele email e mostra a vermelho os alertas que ele tiver.",
  "A caixa dos materiais aparece sempre: se ficar vazia, o cliente recebe-a em branco.",
  "A confirmação automática não se envia daqui: esse separador só a mostra.",
  "Por confirmar: que ola@nevima.studio encaminha para o Gmail do estúdio. Sem isso, os avisos e as respostas não chegam lá.",
];

const TONE: Record<Who, string> = {
  Cliente: "border-hair-strong text-ink",
  Automático: "border-ink bg-ink text-paper",
  Estúdio: "border-ink text-ink",
};

function AppChip({ id }: { id: AppId }) {
  return <span className="mono-label border border-hair-strong px-2 py-1 text-ash">{APPS[id].name}</span>;
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="mono-label text-ash">{children}</p>;
}

export function StudioGuide({ onStart }: { onStart: () => void }) {
  return (
    <div className="shell py-12">
      <div className="max-w-[46rem]">
        <Label>Como funciona</Label>
        <h1 className="h1 mt-4 font-title font-medium leading-[1.05]">Do pedido ao contrato.</h1>
        <p className="mt-6 text-[1.0625rem] leading-relaxed text-ash">
          Primeiro, o processo em poucos passos. Depois, tudo o que acontece por trás: as apps, cada passo, o que acontece ao carregar
          em Enviar, quem tem acesso a quê, o que acontece quando algo falha, as chaves e os limites.
        </p>
      </div>

      <section className="mt-14">
        <Label>Versão simples</Label>
        <ol className="mt-4 border-b border-ink">
          {SIMPLE.map((step, i) => (
            <li key={step.text} className="grid gap-x-6 gap-y-2 border-t border-ink py-4 sm:grid-cols-[3rem_8rem_minmax(0,1fr)] sm:items-baseline">
              <span className="mono-label text-ash">{String(i + 1).padStart(2, "0")}</span>
              <span className={`mono-label w-fit border px-2 py-1 ${TONE[step.who]}`}>{step.who}</span>
              <p className="max-w-[42rem] leading-relaxed">{step.text}</p>
            </li>
          ))}
        </ol>
        <div className="mt-8 max-w-[46rem]">
          <Label>O que fica à mão</Label>
          <ul className="mt-3 border-b border-hair">
            {BY_HAND.map((item) => (
              <li key={item} className="border-t border-hair py-3 leading-relaxed">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="mt-20 max-w-[46rem] border-t border-ink pt-6">
        <Label>Em detalhe</Label>
        <h2 className="mt-3 font-title text-[2rem] font-medium leading-tight tracking-[-0.02em]">Todo o backend.</h2>
      </div>

      <section className="mt-14">
        <Label>As apps</Label>
        <ul className="mt-4 grid border-b border-l border-ink md:grid-cols-2 xl:grid-cols-3">
          {(Object.keys(APPS) as AppId[]).map((id) => (
            <li key={id} className="border-r border-t border-ink p-5">
              <h2 className="font-title text-[1.25rem] font-medium leading-tight">{APPS[id].name}</h2>
              <p className="mono-label mt-2 text-ash">{APPS[id].who}</p>
              <p className="mt-3 text-[0.9375rem] leading-relaxed">{APPS[id].what}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-16">
        <Label>Como se ligam</Label>
        <div className="mt-4 border-b border-ink">
          {FLOWS.map((flow) => (
            <div key={flow.title} className="border-t border-ink py-6">
              <h2 className="font-title text-[1.25rem] font-medium leading-tight">{flow.title}</h2>
              <p className="mt-1 text-ash">{flow.when}</p>
              <ol className="mt-5 grid gap-3 md:grid-cols-4 md:gap-0">
                {flow.chain.map((link, i) => (
                  <li key={i} className="flex gap-3 md:block md:pr-6">
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="mono-label border border-ink bg-ink px-2 py-1 text-paper">{APPS[link.app].name}</span>
                      {i < flow.chain.length - 1 && (
                        <span aria-hidden="true" className="hidden text-ash md:inline">
                          &rarr;
                        </span>
                      )}
                    </div>
                    <p className="text-[0.9375rem] leading-relaxed md:mt-3">{link.does}</p>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <div className="flex flex-wrap items-center gap-2">
          <Label>Passo a passo</Label>
          <span className="mono-label text-ash">·</span>
          {(Object.keys(TONE) as Who[]).map((who) => (
            <span key={who} className={`mono-label border px-2 py-1 ${TONE[who]}`}>
              {who}
            </span>
          ))}
          <span className="mono-label text-ash">quem faz cada passo</span>
        </div>
        <ol className="mt-4 border-b border-ink">
          {STEPS.map((step) => (
            <li key={step.title} className="grid gap-x-8 gap-y-3 border-t border-ink py-6 md:grid-cols-[minmax(0,15rem)_minmax(0,1fr)]">
              <div>
                <h2 className="font-title text-[1.375rem] font-medium leading-tight tracking-[-0.01em]">{step.title}</h2>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <span className={`mono-label border px-2 py-1 ${TONE[step.who]}`}>{step.who}</span>
                  {step.apps.map((app) => (
                    <AppChip key={app} id={app} />
                  ))}
                </div>
              </div>
              <div className="max-w-[42rem]">
                <p className="leading-relaxed">{step.body}</p>
                {step.behind && (
                  <p className="mt-3 text-[0.9375rem] leading-relaxed text-ash">
                    <span className="mono-label mr-2 text-ink">Por trás</span>
                    {step.behind}
                  </p>
                )}
                {step.notion && (
                  <p className="mt-3 border-l border-ink pl-3 text-[0.9375rem] leading-relaxed text-ash">
                    <span className="mono-label mr-2 text-ink">Notion</span>
                    {step.notion}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-16 grid gap-10 lg:grid-cols-2">
        <div>
          <Label>Duas formas de enviar</Label>
          <div className="mt-4 border-b border-ink">
            {WAYS.map((way) => (
              <div key={way.title} className="border-t border-ink py-5">
                <h2 className="font-title text-[1.25rem] font-medium">{way.title}</h2>
                <p className="mt-2 leading-relaxed text-ash">{way.body}</p>
              </div>
            ))}
          </div>
        </div>
        <div>
          <Label>Limites</Label>
          <ul className="mt-4 border-b border-ink">
            {LIMITS.map((limit) => (
              <li key={limit} className="border-t border-hair py-3.5 leading-relaxed">
                {limit}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-16">
        <Label>Ao carregar em Enviar</Label>
        <ol className="mt-4 border-b border-ink">
          {SEND.map((step, i) => (
            <li key={step.title} className="grid gap-x-8 gap-y-2 border-t border-ink py-5 md:grid-cols-[minmax(0,15rem)_minmax(0,1fr)]">
              <h2 className="font-title text-[1.25rem] font-medium leading-tight">
                <span className="mono-label mr-2 text-ash">{i + 1}</span>
                {step.title}
              </h2>
              <p className="max-w-[42rem] leading-relaxed">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-16">
        <Label>Quem tem acesso a quê</Label>
        <div className="mt-4 border-b border-ink">
          {ACCESS.map((row) => (
            <div key={row.who} className="grid gap-x-8 gap-y-3 border-t border-ink py-5 md:grid-cols-[minmax(0,15rem)_minmax(0,1fr)_minmax(0,1fr)]">
              <h2 className="font-title text-[1.25rem] font-medium leading-tight">{row.who}</h2>
              <p className="leading-relaxed">
                <span className="mono-label mb-1 block text-ash">Pode</span>
                {row.can}
              </p>
              {row.cannot && (
                <p className="leading-relaxed">
                  <span className="mono-label mb-1 block text-ash">Não pode</span>
                  {row.cannot}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <Label>Quando algo falha</Label>
        <div className="mt-4 border-b border-ink">
          {FAILURES.map((row) => (
            <div key={row.when} className="grid gap-x-8 gap-y-3 border-t border-ink py-5 md:grid-cols-[minmax(0,15rem)_minmax(0,1fr)_minmax(0,1fr)]">
              <h2 className="font-medium leading-snug">{row.when}</h2>
              <p className="leading-relaxed">
                <span className="mono-label mb-1 block text-ash">O que acontece</span>
                {row.then}
              </p>
              <p className="leading-relaxed">
                <span className="mono-label mb-1 block text-ash">O que fazer</span>
                {row.todo}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <Label>Quem escreve o quê no Notion</Label>
        <div className="mt-4 border-b border-ink">
          {NOTION_FIELDS.map((row) => (
            <div key={row.field} className="grid gap-x-6 gap-y-1 border-t border-hair py-3 sm:grid-cols-[minmax(0,1fr)_7rem_minmax(0,1fr)] sm:items-baseline">
              <span className="font-medium">{row.field}</span>
              <span className="mono-label text-ash">{row.by}</span>
              <span className="text-ash">{row.when}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16 grid gap-10 lg:grid-cols-2">
        <div>
          <Label>Segurança</Label>
          <ul className="mt-4 border-b border-ink">
            {GUARDS.map((item) => (
              <li key={item} className="border-t border-hair py-3.5 leading-relaxed">
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <Label>Números</Label>
          <ul className="mt-4 border-b border-ink">
            {NUMBERS.map((item) => (
              <li key={item} className="border-t border-hair py-3.5 leading-relaxed">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-16">
        <Label>As chaves na Vercel</Label>
        <p className="mt-2 max-w-[42rem] text-ash">Depois de mudar qualquer uma, é preciso publicar o site de novo.</p>
        <div className="mt-4 border-b border-ink">
          {KEYS.map((row) => (
            <div key={row.name} className="grid gap-x-6 gap-y-1 border-t border-hair py-3 md:grid-cols-[minmax(0,17rem)_minmax(0,1fr)_minmax(0,1fr)] md:items-baseline">
              <code className="break-all font-mono text-[0.8125rem]">{row.name}</code>
              <span>{row.what}</span>
              <span className="text-ash">Sem ela: {row.without}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <Label>As páginas e rotas do servidor</Label>
        <div className="mt-4 border-b border-ink">
          {ROUTES.map((row) => (
            <div key={row.path} className="grid gap-x-6 gap-y-1 border-t border-hair py-3 md:grid-cols-[minmax(0,14rem)_7rem_minmax(0,1fr)] md:items-baseline">
              <code className="break-all font-mono text-[0.8125rem]">{row.path}</code>
              <span className="mono-label text-ash">{row.who}</span>
              <span>{row.what}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16 grid gap-10 lg:grid-cols-2">
        <div>
          <Label>Onde ficam os dados</Label>
          <div className="mt-4 border-b border-ink">
            {DATA_PLACES.map((row) => (
              <div key={row.where} className="border-t border-hair py-3.5">
                <h2 className="font-medium">{row.where}</h2>
                <p className="mt-1 leading-relaxed text-ash">{row.what}</p>
              </div>
            ))}
          </div>
        </div>
        <div>
          <Label>A ter em conta</Label>
          <ul className="mt-4 border-b border-ink">
            {WATCH.map((item) => (
              <li key={item} className="border-t border-hair py-3.5 leading-relaxed">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <button type="button" onClick={onStart} className="cta-crate mt-14 inline-flex items-center text-[0.9375rem] leading-none">
        Abrir o convite para a chamada
        <span aria-hidden="true" className="cta-crate-key">
          &rarr;
        </span>
      </button>
    </div>
  );
}
