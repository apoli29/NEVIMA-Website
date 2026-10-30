/* ==================================================================
   How the studio's emails work: the guide in /interno

   For whichever partner opens the composer for the first time (user,
   2026-10-30): the way a request goes, from the form to the signed
   contract, step by step. Each step says who does it (the client, the
   site on its own, or the studio) and where (the site, Notion, email,
   this page), so what is left to do by hand is plain. Then the two ways
   to send, and the limits.

   Portuguese only, as the rest of /interno. When the process changes,
   change it here and in docs/backend-decisions.md together.
   ================================================================== */

type Who = "Cliente" | "Automático" | "Estúdio";

type Step = {
  title: string;
  who: Who;
  where: string;
  body: string;
  /** What changes in Notion. */
  notion?: string;
};

const STEPS: Step[] = [
  {
    title: "O pedido chega",
    who: "Cliente",
    where: "Site",
    body: "O cliente responde ao formulário e, no fim, escolhe a língua da resposta (português ou inglês, já marcada com a língua do site).",
    notion: "Nova página em \"Pedidos\" (ou \"Parceiros\"), estado Novo, com as respostas, a estimativa e a língua em \"Idioma\".",
  },
  {
    title: "Confirmação e aviso",
    who: "Automático",
    where: "Email",
    body: "O cliente recebe a confirmação automática, na língua escolhida. O estúdio recebe um aviso com o resumo e o link para a página do Notion; responder a esse aviso responde ao cliente.",
  },
  {
    title: "Preparar a chamada",
    who: "Estúdio",
    where: "Notion",
    body: "Na página do pedido, em \"Preparação da reunião\": o negócio do cliente, as escolhas a rever e o que não escolheu mas pode fazer sentido. Preencher \"Valor Y (cliente)\" e \"Valor X (sugestões)\".",
  },
  {
    title: "Convite para a chamada",
    who: "Estúdio",
    where: "Interno",
    body: "Separador \"Convite para chamada\": procurar pelo email do cliente (o nome, a empresa e a língua vêm do Notion), escolher dois horários na hora de Lisboa e Enviar.",
    notion: "Estado passa de Novo a Contactado.",
  },
  {
    title: "O cliente escolhe um horário",
    who: "Cliente",
    where: "Email e site",
    body: "Um clique num dos horários abre uma página do site com esse horário e um botão para o confirmar (pode trocar para o outro). Depois de confirmar, pode guardá-lo no calendário.",
    notion: "\"Reunião\" fica com a data e a hora; estado Reunião marcada. O estúdio recebe um aviso.",
  },
  {
    title: "Enviar o link da chamada",
    who: "Estúdio",
    where: "Email",
    body: "À mão: o convite do calendário com o link (Google Meet ou outro) para o horário escolhido. A página do site diz ao cliente que o link segue por email.",
  },
  {
    title: "Depois da chamada",
    who: "Estúdio",
    where: "Notion",
    body: "À mão: estado Reunião feita, e as notas do que ficou decidido.",
  },
  {
    title: "Proposta final e contrato",
    who: "Estúdio",
    where: "Interno",
    body: "Separador \"Proposta final\": escrever o texto da proposta, o valor final (e o mensal, se houver), anexar o contrato em PDF e Enviar.",
    notion: "Estado Proposta enviada, \"Valor final\" preenchido e \"Contrato enviado\" assinalado.",
  },
  {
    title: "Fecho",
    who: "Estúdio",
    where: "Notion",
    body: "O cliente responde com o contrato assinado. À mão: estado Ganho, ou Perdido se não avançar.",
  },
];

const WAYS = [
  {
    title: "Enviar",
    body: "Sai de ola@nevima.studio pelo Resend, com uma cópia oculta para o estúdio (fica no Gmail, onde chega a resposta do cliente). O Notion é atualizado sozinho. Pede confirmação antes de enviar.",
  },
  {
    title: "Copiar para o Gmail",
    body: "Copia o email pronto, com os links dos horários já a funcionar. No Gmail: nova mensagem, colar no corpo, escrever o assunto (aparece aqui) e, na proposta, anexar o contrato. O Notion fica por atualizar à mão.",
  },
];

const LIMITS = [
  "Enviar só funciona depois de o domínio nevima.studio estar verificado no Resend; até lá, usar Copiar para o Gmail.",
  "O plano gratuito do Resend envia 100 emails por dia e 3000 por mês, contando as confirmações e os avisos automáticos.",
  "O contrato vai num só PDF, até 4 MB.",
  "Uma só chave para os dois; mudá-la na Vercel fecha todas as sessões abertas.",
  "Os links dos horários deixam de funcionar se LINKS_SECRET mudar. Um horário que já passou não pode ser marcado.",
  "A página não impede dois clientes de escolher o mesmo horário: oferecer horários diferentes a cada um.",
  "Nada do que se escreve aqui é guardado: só o que é enviado (e o Notion).",
];

const TONE: Record<Who, string> = {
  Cliente: "border-hair-strong text-ink",
  Automático: "border-ink bg-ink text-paper",
  Estúdio: "border-ink text-ink",
};

export function StudioGuide({ onStart }: { onStart: () => void }) {
  return (
    <div className="shell py-12">
      <div className="max-w-[46rem]">
        <p className="mono-label text-ash">Como funciona</p>
        <h1 className="h1 mt-4 font-title font-medium leading-[1.05]">Do pedido ao contrato.</h1>
        <p className="mt-6 text-[1.0625rem] leading-relaxed text-ash">
          Três emails acompanham cada pedido: a confirmação, que sai sozinha; o convite para a chamada; e a proposta final com o
          contrato. Estes dois são escritos e enviados aqui. O Notion é onde tudo fica registado.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          {(Object.keys(TONE) as Who[]).map((who) => (
            <span key={who} className={`mono-label border px-2.5 py-1.5 ${TONE[who]}`}>
              {who}
            </span>
          ))}
          <span className="mono-label self-center text-ash">quem faz cada passo</span>
        </div>
      </div>

      <ol className="mt-12 border-b border-ink">
        {STEPS.map((step) => (
          <li key={step.title} className="grid gap-x-8 gap-y-3 border-t border-ink py-6 md:grid-cols-[minmax(0,15rem)_minmax(0,1fr)]">
            <div>
              <h2 className="font-title text-[1.375rem] font-medium leading-tight tracking-[-0.01em]">{step.title}</h2>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <span className={`mono-label border px-2 py-1 ${TONE[step.who]}`}>{step.who}</span>
                <span className="mono-label border border-hair-strong px-2 py-1 text-ash">{step.where}</span>
              </div>
            </div>
            <div className="max-w-[40rem]">
              <p className="leading-relaxed">{step.body}</p>
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

      <section className="mt-16 grid gap-10 lg:grid-cols-2">
        <div>
          <p className="mono-label text-ash">Duas formas de enviar</p>
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
          <p className="mono-label text-ash">Limites</p>
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
