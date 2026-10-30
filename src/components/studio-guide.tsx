/* ==================================================================
   How the studio's emails work: the guide in /interno

   For whichever partner opens the composer for the first time (user,
   2026-10-30): every app the process uses and what it is for, how they
   hand work to each other, and the way a request goes, from the form
   to the signed contract, step by step. Each step says who does it
   (the client, the site on its own, or the studio), which apps take
   part, what happens behind it, and what changes in Notion, so what is
   left to do by hand is plain. Then the two ways to send, and the
   limits.

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
    title: "O cliente responde sobre a reunião a meio do projeto",
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
    behind: "Os dois emails saem pelo Resend. Se o Resend falhar, o pedido não se perde: já está no Notion. Responder ao aviso responde diretamente ao cliente.",
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
    behind: "O contrato vai em anexo e o nome do ficheiro aparece no email, para o cliente o procurar. A nota de IVA por baixo do valor pode ser alterada. O email traz dois botões, sim e não, para o cliente dizer se quer a reunião a meio do projeto, que é opcional.",
    notion: "Estado Proposta enviada, \"Valor final\" preenchido e \"Contrato enviado\" assinalado.",
  },
  {
    title: "O cliente responde sobre a reunião a meio do projeto",
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
  "Os links dos botões (horários e reunião a meio do projeto) deixam de funcionar se a chave dos links (LINKS_SECRET) mudar na Vercel.",
  "A página não impede dois clientes de escolher o mesmo horário: oferecer horários diferentes a cada um.",
  "Nada do que se escreve aqui é guardado: só o que é enviado, e o que fica no Notion.",
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
          Três emails acompanham cada pedido: a confirmação, que sai sozinha; o convite para a chamada; e a proposta final com o
          contrato. Estes dois são escritos e enviados aqui. Por trás, o site, o Notion, o Resend e o Gmail passam o trabalho uns aos
          outros; o Notion é onde tudo fica registado.
        </p>
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

      <button type="button" onClick={onStart} className="cta-crate mt-14 inline-flex items-center text-[0.9375rem] leading-none">
        Abrir o convite para a chamada
        <span aria-hidden="true" className="cta-crate-key">
          &rarr;
        </span>
      </button>
    </div>
  );
}
