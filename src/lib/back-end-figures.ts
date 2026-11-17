/* ==================================================================
   Os números da página das Funcionalidades de Back End

   TODOS os números desenhados nos gráficos dessa página estão aqui, e
   só aqui (user, 2026-11-17). Para trocar um valor, troca-se neste
   ficheiro: a página, os eixos, as legendas, os totais e as etiquetas
   acompanham sozinhos.

   SÃO VALORES ILUSTRATIVOS. Cada gráfico diz isso à vista, por baixo,
   e assim fica até o estúdio pôr aqui os seus. Nenhum deles é uma
   medição de um cliente real.

   Nada aqui tem palavras: as etiquetas vivem no componente, em
   português e em inglês, como o resto do site.
   ================================================================== */

/** 1. O crescimento de um negócio ao longo de dois anos, em índice:
    o primeiro mês é 100 e os outros dizem-se em relação a ele. Dois
    caminhos, o mesmo ponto de partida. Oito marcos, de três em três
    meses (mês 1, 4, 7, ... 22). */
export const GROWTH = {
  /** De quantos em quantos meses está cada ponto. */
  everyMonths: 3,
  /** Com processos digitais a assistir ou a automatizar o trabalho. */
  digital: [100, 112, 128, 147, 166, 188, 212, 240],
  /** Tudo à mão, como sempre se fez. */
  manual: [100, 104, 109, 113, 116, 120, 123, 126],
};

/** 2. O que um mês de back end mostra, em números: os cartões do mini
    painel. */
export const MONTH = {
  /** Pedidos recebidos e guardados sozinhos. */
  requests: 128,
  /** Marcações da semana. */
  bookings: 36,
  /** E-mails enviados automaticamente ou a partir de um modelo. */
  emails: 412,
};

/** 3. As horas de uma semana gastas em tarefas que não são o trabalho
    em si, à mão e com um back end. As somas e as horas poupadas são
    feitas a partir daqui, para nunca se desencontrarem. */
export const TASKS = [
  { key: "pedidos", manual: 3.5, auto: 0.3 },
  { key: "respostas", manual: 4, auto: 0.8 },
  { key: "marcacoes", manual: 3, auto: 0.4 },
  { key: "procura", manual: 2, auto: 0.5 },
  { key: "registos", manual: 2.5, auto: 0.6 },
] as const;

export const manualHours = TASKS.reduce((sum, task) => sum + task.manual, 0);
export const autoHours = TASKS.reduce((sum, task) => sum + task.auto, 0);
/** O contador grande: as horas que uma semana devolve. */
export const savedHours = Math.round((manualHours - autoHours) * 10) / 10;

/** 3. A semana de trabalho depois, repartida. O tempo devolvido é o
    que foi poupado acima, por isso os dois gráficos dizem o mesmo. */
export const WEEK_HOURS = 40;
export const WEEK = [
  { key: "work", hours: WEEK_HOURS - autoHours - savedHours },
  { key: "grow", hours: savedHours },
  { key: "left", hours: autoHours },
];

/** 4. O custo de cada mês, em euros.

    ESTES SÃO OS DOIS VALORES A SUBSTITUIR quando o estúdio fechar o
    preço do serviço mensal. O da solução tradicional é o que uma
    empresa pequena costuma pagar por licenças e manutenção de um
    sistema feito à medida. */
export const COST = {
  traditional: 180,
  ours: 35,
};
