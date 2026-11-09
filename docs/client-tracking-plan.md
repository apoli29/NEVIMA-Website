# Acompanhamento dos clientes no Notion: alterações a fazer

Plano de 2026-11-09. **A fase 1 está construída, ensaiada numa base de ensaio (ver 8.9) e aplicada à base real a 2026-11-09, com o sim do sócio; falta o ensaio em produção (8.6, passo 6). O resto do plano ainda não está construído.** Regista tudo o que é preciso mudar no Notion, no site e no `/interno` para que cada pedido tenha, do formulário ao pagamento dos 100%, um estado por passo, visível numa só ficha. As respostas dos sócios estão em "Decisões já tomadas"; o que ainda depende deles está em "Decisões em aberto".

Nomes e estados em português, como o Notion do estúdio. Os textos novos que os clientes vêem (emails e páginas do site) escrevem-se nas duas línguas, como o resto do site.

## 1. Decisões já tomadas

- Cada passo do processo tem o seu espaço de acompanhamento, com estados próprios. Um passo pode ter também um link (por exemplo, o documento de preparação da chamada) ou uma data.
- A hora da chamada não é um estado: o estado é "Agendada" e a hora está no campo "Reunião". Tem de haver um sítio que mostre a hora **ou** que o cliente vai contactar o estúdio (fórmula "Chamada").
- A marcação tem uma terceira opção para o cliente: **contactar o estúdio para marcarmos uma hora** (não para falarmos logo). Fica "Vai contactar-nos".
- "Sem resposta" não é um estado à parte: é o mesmo que "A aguardar resposta" (a que o sócio chamou "Por responder"). Passados 3 dias sem resposta, o estúdio é avisado.
- A chamada a meio mantém-se (botões Sim e Não na proposta), com o estado "Por responder" antes da resposta.
- Acrescentam-se os passos de depois do contrato, até os 100% estarem pagos: sinal de 25%, materiais, chamada de acompanhamento, chamada de validação, fatura final, pagamento final, recibo e lançamento.
- Acrescenta-se "Válida até" à proposta (envio mais 10 dias, como diz o contrato), "Motivo de perda" e uma fórmula "Etapa atual".
- O link da videochamada passa a ter um email próprio no `/interno`. A criação automática do link pela API do Google Calendar entra na lista para **ser testada**.
- O sinal de 25% **pede-se na reunião** (na chamada), à mão. Não há email do compositor para o pedir.
- Os serviços mensais precisam de uma solução própria, mais tarde (ver "Fora deste plano").

## 2. Como fica o Notion

**Estrutura:** uma propriedade por passo, na linha de cada cliente da base "Pedidos". Escolhida porque cada passo tem estados diferentes e porque assim as fórmulas, os filtros e os avisos por data funcionam sobre uma só tabela.

**Colunas que só alguns clientes têm** (por exemplo, a chamada de acompanhamento só existe se o cliente disse Sim): o Notion não abre colunas por resposta, porque as colunas são da base inteira. Faz-se assim:

- a propriedade existe para todos, mas fica **vazia** nos clientes a que não se aplica (o site só a preenche quando faz sentido);
- na ficha de cada cliente, as propriedades ficam em **"Ocultar quando vazia"**: um cliente sem chamada de acompanhamento nem vê essa linha;
- cada vista de tabela escolhe as colunas que mostra.

**"Uma tabela de uma linha por cliente":** a ficha de cada cliente, aberta como página, é isso mesmo: as suas propriedades na ordem do processo, só as que estão preenchidas. Não se cria uma base à parte por cliente, porque se perdiam as vistas e os avisos que atravessam todos os clientes (por exemplo, "todas as propostas a expirar").

**Vistas** (cada uma com as colunas do seu momento): Quadro por estado geral; Até à chamada (passos 1 a 8); Contrato e sinal (9 a 13); Projeto até aos 100% (14 a 18); Calendário das chamadas (sobre "Reunião"); Parados (filtros por data); A expirar (pedidos sem contrato com mais de 2 meses, para a regra dos 3 meses da política de privacidade).

## 3. Passos e estados

A coluna "Quem" diz quem muda o estado: **Site** (sozinho), **Compositor** (ao enviar no `/interno`) ou **Estúdio** (à mão no Notion).

### Até à chamada

| # | Propriedade | Estados (o primeiro é o de partida) | Quem | Notas |
|---|---|---|---|---|
| 1 | Estado geral (já existe) | Novo, Contactado, Reunião marcada, Reunião feita, Proposta enviada, Ganho, Perdido (+ Em projeto, Concluído) | Site e Estúdio | Ver D5 |
| 2 | Confirmação | (vazio), Enviada, Falhou | Site | "Alertas" continua a dizer qual email falhou |
| 3 | Preparação da chamada | Por iniciar, Iniciada, Feita | Estúdio | Mais **"Documento de preparação"** (link), preenchido quando Feita |
| 4 | Convite | Não enviado, Enviado | Compositor | Passa a Enviado ao enviar o convite |
| 5 | Marcação | (vazio), A aguardar resposta, Vai contactar-nos, Agendada | Site | A aguardar resposta ao enviar o convite; as outras duas opções pelo clique do cliente. De "Vai contactar-nos" a "Agendada": o Estúdio, quando a hora ficar combinada (D6) |
| – | Chamada (fórmula) | mostra "Qui 12 nov, 15:00", "Cliente vai contactar-nos" ou "Por marcar" | – | Lê "Marcação" e "Reunião" |
| 6 | Link da chamada | Aguarda marcação, Por enviar, Enviado | Site e Compositor | Por enviar quando a Marcação passa a Agendada; Enviado ao enviar o novo email "Link da chamada" |
| 7 | Chamada realizada | Por efetuar, Efetuada, Cliente faltou | Estúdio | Chama-se "Chamada realizada" para não colidir com a fórmula "Chamada" |
| 8 | Proposta | Por enviar, Enviada | Compositor | Mais **"Válida até"** (data de envio mais 10 dias) |

### Contrato e sinal

| # | Propriedade | Estados | Quem | Notas |
|---|---|---|---|---|
| 9 | Chamada a meio (já existe "Reunião a meio") | Por responder, Sim, Não | Site | Por responder ao enviar a proposta |
| 10 | Chamada de acompanhamento | A marcar, Marcada, Feita | Site, depois Estúdio | **Só se o cliente respondeu Sim**: o site cria o estado; mais "Data do acompanhamento" |
| 11 | Contrato assinado | Por receber, Recebido assinado | Estúdio | Mais "Assinado em" |
| 12 | Sinal de 25% | Por pedir, Pedido, Recebido | Estúdio | "Valor do sinal" (fórmula: 25% do "Valor final") e "Sinal recebido em". Pedido à mão, depois de o sinal ser pedido na chamada; Recebido à mão, quando o dinheiro chega. Mais "Documento do sinal" (Por emitir, Emitido), conforme D1 |
| 13 | Materiais | Por receber, Incompletos, Completos | Estúdio | Mais **"Materiais até"** (fórmula: "Assinado em" mais 8 dias, cl. 8): sem eles o contrato perde efeito e o sinal é retido |

### Projeto até aos 100%

| # | Propriedade | Estados | Quem | Notas |
|---|---|---|---|---|
| 14 | Chamada de validação | A marcar, Marcada, Feita | Estúdio | A aceitação conta 72 horas depois (cl. 11) |
| 15 | Fatura final | Por emitir, Emitida | Estúdio | Emite-se no dia da chamada de validação. Mais "Fatura emitida em" (data) e **"Pagamento até"** (fórmula: emissão mais 72 horas, cl. 6.2) |
| 16 | Pagamento final | Por receber, Recebido, Em atraso | Estúdio | Em atraso aplica a cl. 7 |
| 17 | Recibo | Por emitir, Emitido | Estúdio | Só depois de o pagamento chegar: nunca fatura-recibo antes |
| 18 | Lançamento | Por lançar, Lançado | Estúdio | Só depois do pagamento final (cl. 6.4). Alerta se Lançado com o pagamento final por receber |

Quando os 100% estão pagos e o site no ar, o Estado geral passa a **Concluído**.

### Outras propriedades

| Propriedade | Tipo | Para quê |
|---|---|---|
| Etapa atual | Fórmula | O primeiro passo ainda não feito, na ficha e na tabela |
| Motivo de perda | Seleção: Preço, Prazo, Escolheu outro, Sem resposta, Desistiu, Outro | Para aprender com cada perda. O Notion não obriga a preenchê-lo: uma vista "Perdido sem motivo" mostra o que falta |
| Responsável | Seleção: António, Emanuel | Quem trata de cada cliente |
| Histórico | Texto | Uma linha por acontecimento: data, o quê, quem (escrita pelo site e pelo compositor) |
| Spam ou teste | Caixa | Para não contar nos números |

## 4. Alterações no código

### 4.1 Notion: propriedades novas (`scripts/setup-notion.mjs`)

- Acrescentar à base "Pedidos" todas as propriedades das secções 3, as fórmulas "Chamada" e "Etapa atual", e os estados "Em projeto" e "Concluído" ao Estado geral. O script já acrescenta o que falta sem tocar nos pedidos existentes.
- Acrescentar "Por responder" às opções de "Reunião a meio".
- A fórmula, ao ser criada por API, tem de ser escrita na linguagem de fórmulas do Notion; testar numa base de ensaio antes.
- Hoje os nomes das propriedades estão em dois sítios (o script e o `deliver.ts`). Passar a haver **um só catálogo** (`src/lib/proposal/steps.ts`: propriedade, opções, estado de partida, quem muda) que o script e o site leem. O script pode correr com `npx tsx`, como já faz `scripts/sql/rotulos.ts`.

### 4.2 Notion: ajudantes (`src/lib/proposal/notion.ts`)

- `prop.url` e `prop.status`/`prop.select` para os novos tipos; `prop.date` com e sem hora.
- `setStep(pageId, passo, estado, extras)`: muda um passo e acrescenta uma linha ao "Histórico". Falhar não deve nunca impedir o que o cliente fez: regista-se em "Alertas", como hoje.
- Alargar `RequestPage` e `readPage` com a Marcação, a hora da chamada e os estados que o compositor e as páginas precisam de ler.

### 4.3 Pedido novo (`src/lib/proposal/deliver.ts`)

- Ao criar a página, escrever os estados de partida de todos os passos (Preparação "Por iniciar", Convite "Não enviado", etc.).
- Depois de enviar a confirmação, marcar "Confirmação" como Enviada ou Falhou.
- O "Responsável" começa vazio.

### 4.4 Convite com terceira opção

- `src/lib/proposal/invite.ts`: além dos dois horários, um terceiro botão, "contactar-nos para marcarmos uma hora" (e, em baixo, os dois telefones e o email). Texto nas duas línguas.
- `src/lib/proposal/meeting.ts`: `meetingLink` e a página passam a aceitar a escolha `contact` além de `0` e `1`; o token assinado não muda.
- `src/app/api/meeting/route.ts`: tratar a escolha `contact` (Marcação "Vai contactar-nos", sem tocar em "Reunião" nem passar a "Reunião marcada"; aviso ao estúdio "O cliente vai contactar-nos para marcar uma hora"); no horário normal, Marcação "Agendada" e Link da chamada "Por enviar"; permitir mudar entre as três escolhas, avisando sempre o estúdio.
- `src/components/meeting.tsx` (e a versão em português): o ecrã de confirmação da terceira escolha, com os telefones e o email, sem nunca se dirigir ao leitor (regra do site). Sem o ficheiro de calendário nesta escolha.

### 4.5 Compositor `/interno` (`src/components/studio-composer.tsx`, `src/app/api/studio/email/route.ts`)

- Ao enviar o convite: Convite "Enviado", Marcação "A aguardar resposta", "Histórico".
- Ao enviar a proposta: Proposta "Enviada", "Válida até", Chamada a meio "Por responder" (já escreve "Valor final" e "Contrato enviado").
- **Novo separador "Link da chamada"**: procura o cliente pelo email (preenche nome, língua e a hora escolhida, que a `lookup` passa a devolver), escreve-se o link do Meet ou de outra plataforma e uma nota, vê-se o email, envia-se. Ao enviar: Link da chamada "Enviado". Novo ficheiro de modelo, na linha de `invite.ts`, nas duas línguas, com o aspeto dos outros emails (`mail.ts`).
- Se o teste do Google Calendar (4.8) correr bem, o separador "Link da chamada" passa a só confirmar e enviar o link já criado.
- A `lookup` (`src/app/api/studio/lookup/route.ts`) devolve também os novos campos.

### 4.6 Chamada a meio (`src/app/api/mid-call/route.ts`, `src/components/mid-call.tsx`)

- Escrever "Sim" ou "Não" como hoje, e, no Sim, abrir o passo "Chamada de acompanhamento" (A marcar) só para esse cliente.
- Verificar a linguagem dos botões e da página contra o contrato v1.15, onde a chamada passou a "quando parte do website estiver construída". Alterar os textos nas duas línguas, se for caso disso.

### 4.7 Resumo diário e avisos (novo)

- Uma rota chamada uma vez por dia pelo Vercel (Cron; o plano gratuito permite uma por dia), protegida por `CRON_SECRET`, que lê os pedidos no Notion e envia **um só email** ao estúdio pelo Resend, só com o que passou do prazo ou está para passar:
  - Marcação "A aguardar resposta" há mais de 3 dias;
  - Convite "Não enviado" há mais de 1 dia;
  - Proposta "Enviada" a expirar (2 dias antes de "Válida até") ou expirada;
  - Contrato por receber há mais de 5 dias úteis;
  - Materiais a 2 dias de "Materiais até" e depois do prazo;
  - Fatura final emitida a 24 horas de "Pagamento até", e em atraso;
  - Lançado com o pagamento final por receber;
  - Pedidos a 2 semanas de fazer 3 meses sem contrato (RGPD).
- O mesmo trabalho diário faz uma consulta leve à base de dados, o que a impede de pausar por inatividade, se mudarem para o Supabase.

### 4.8 Google Calendar por API (teste)

- Pequeno ensaio isolado: criar um evento com ligação do Meet e convidar o cliente por código. Resultado esperado: link criado e convite enviado sem passo manual.
- Perguntas a responder: a conta do estúdio é Google Workspace ou Gmail pessoal (muda o tipo de autorização: conta de serviço ou OAuth com token de renovação)? Que âmbitos pede? O convite do Google chega bem ao cliente e fica no calendário do estúdio?
- Se funcionar: o passo 6 passa a ser automático quando a marcação fica Agendada, e o separador "Link da chamada" fica como reserva (por exemplo, para clientes que prefiram outra plataforma).
- Variáveis novas no Vercel, quando se avançar: as do Google (a definir pelo ensaio).

### 4.9 Documentação

- `src/components/studio-guide.tsx`: atualizar os passos, a explicação das três escolhas de marcação, os novos separadores e a lista de limites ("Como funciona" tem de bater certo com o que é feito).
- `docs/backend-decisions.md`: registar estas decisões e atualizar o "Open" (o cliente passa a receber o link por email; o passo "Contact us now?" do formulário fica resolvido para o convite).
- `docs/contract-decisions.md`: só se a revisão dos textos da chamada a meio (4.6) pedir uma decisão sobre o contrato.

### 4.10 No próprio Notion, à mão

- Criar as vistas da secção 2 e pôr "Ocultar quando vazia" nas propriedades que só alguns clientes têm.
- Ordenar as propriedades na tabela e na ficha pela ordem de 8.10 (escolhida pelo sócio a 2026-11-09). Faz-se à mão: a API do Notion não muda a ordem das colunas.
- Preencher "Responsável" e "Motivo de perda" ao longo do uso.
- Rever o plano do Notion: o histórico de edições é de 7 dias no gratuito, e as automações do Notion dependem do plano (por isso o resumo diário vai por Cron, não por automação).

## 5. Ordem de trabalho

Cada fase fecha com o guia e o `backend-decisions.md` atualizados, e testada com a configuração `nevima-dev-emails` (sem enviar nada) e depois com um pedido real de ensaio.

1. **Base:** 4.1, 4.2, 4.3, as partes de 4.5 que escrevem passos e a marcação "Agendada" da 4.4. **Especificada em pormenor na secção 8.** Pronto quando um pedido novo nasce com os estados de partida e enviar o convite ou a proposta, ou o cliente marcar a hora, os atualiza.
2. **Marcação:** 4.4 e o separador "Link da chamada". Pronto quando o cliente pode escolher horário ou "contactar-nos", e o email do link sai do compositor.
3. **Depois do contrato:** os passos 11 a 18 no Notion e 4.6.
4. **Avisos:** 4.7.
5. **Ensaio do Google Calendar:** 4.8, que pode correr em paralelo com qualquer fase.

## 6. Decisões em aberto e coisas a testar

| # | Questão | Recomendação |
|---|---|---|
| D1 | **Documento fiscal do sinal e do pagamento final.** O sinal pede-se na chamada (decidido). Falta saber que documento se emite: "fatura-recibo" (o recibo verde do Portal das Finanças) ou fatura e recibo em separado. O contrato (cl. 6) diz fatura no dia da chamada de validação, recibo quando o pagamento chega, e nunca fatura-recibo antes do pagamento. Pelo que se encontra, o Portal permite fatura-recibo quando o dinheiro já entrou, incluindo como adiantamento, e fatura primeiro e recibo depois quando ainda não entrou. Não consultei a lei: os prazos e a isenção do art. 53.º do IVA têm de ser confirmados | Sinal: fatura-recibo quando o dinheiro chega (propriedade "Documento do sinal"). Pagamento final: como o contrato diz. Confirmar tudo com quem faz a contabilidade; se não forem trabalhadores independentes (por exemplo, uma sociedade), não há recibo verde |
| D2 | Servidor ou conta para o Google Calendar: Workspace ou Gmail pessoal | Decidir no ensaio (4.8) |
| D3 | Prazo para o aviso de "A aguardar resposta" | 3 dias, como combinado |
| D4 | Notion: testar numa base de ensaio as fórmulas "Chamada" e "Etapa atual" e "Ocultar quando vazia" antes de as aplicar aos pedidos reais | Fazer no início da fase 1 |
| D5 | **Quem muda o Estado geral** depois da proposta: se o Contrato assinado passa a "Recebido", o Estado geral devia passar a Ganho (e o sinal recebido a Em projeto) sem se mudar duas vezes | Manter os estados atuais escritos pelo site; para os outros, mudar à mão ou, se o plano do Notion o permitir, por uma automação do Notion |
| D6 | Se o cliente escolhe "contactar-nos" e a hora fica combinada por telefone ou email: o Estúdio escreve a hora em "Reunião" e muda a Marcação para "Agendada". O site não tem como saber | À mão, como no texto. O convite pode ser reenviado se for mais simples |
| D7 | Chamada a meio: manter os botões, ver 4.6 | Manter |

## 7. Fora deste plano

- **Serviços mensais** (faturados no dia 1, a começar no dia 1 a seguir ao lançamento; alojamento; renovação anual com lembrete 60 dias antes): precisam de uma solução própria, com cobrança recorrente e datas por cliente. A decidir depois deste plano. Provavelmente uma base à parte para clientes com projeto lançado, ligada a "Pedidos".
- **Mudar de plataforma** (Notion e Azure SQL para Supabase e NocoDB ou Appsmith) é uma decisão independente. Os passos e estados deste plano passam sem alteração para colunas de uma tabela, por isso nada do que se constrói aqui se perde.
- **Brevo:** ficou como hipótese a testar para a marcação e os lembretes. Se avançar, substitui partes das secções 4.4, 4.5 e 4.7, não o resto.

## 8. Especificação da fase 1

Para quem a executar, por exemplo uma sessão nova do Claude. Foi escrita contra o código da `main` de 2026-11-09. Tudo o que se afirma sobre o código foi confirmado nele; o que não foi está marcado **a testar**. O que a secção decide a mais do que o resto do plano:

- o passo 7 chama-se "Chamada realizada" (a fórmula é que se chama "Chamada");
- acrescenta-se "Fatura emitida em", e "Materiais até" e "Pagamento até" passam a fórmulas;
- só os passos 2 a 8 têm estado de partida à chegada do pedido; os de depois do contrato recebem-no quando a proposta é enviada (8.5);
- a marcação "Agendada" faz parte da fase 1 (era da 4.4).

### 8.1 Regras antes de tocar em nada

- **Ramo:** novo, a partir de `origin/main` (atualizar com `git fetch`), com o nome `backend/client-tracking-phase1`. O contrato v1.15 já está na `main` desde o pull request 265 (2026-11-09), com a mudança de "chamada a meio" para "chamada de acompanhamento" nos textos; a propriedade do Notion continua a chamar-se "Reunião a meio". Na pasta de trabalho principal dos sócios há trabalho por commitar (`src/lib/proposal/mail.ts`, `contratos/nevima-para-o-advogado.html`, `scripts/email-template.*`): não lhe mexer. Trabalhar numa pasta à parte mantém-no intacto: `git worktree add ..\NEVIMA-Website-fase1 -b backend/client-tracking-phase1 origin/main`.
- **Uma pasta de trabalho nova não traz o `.env.local` (não commitado) nem o `node_modules`.** Os segredos do Notion estão no `.env.local` da pasta principal: usá-lo a partir de lá, por exemplo `npx tsx --env-file="<pasta principal>\.env.local" scripts/setup-notion.mjs`, sem o copiar nem o mostrar. Para o `node_modules`, ligar o da pasta principal com uma junção (`New-Item -ItemType Junction -Path node_modules -Target "<pasta principal>\node_modules"`) ou correr `npm install`.
- **Este documento está no ramo `docs/client-tracking-plan`** (commit local, **não está na `main`** e não foi enviado para o GitHub). Para o trazer para o ramo de trabalho: `git checkout docs/client-tracking-plan -- docs/client-tracking-plan.md docs/client-tracking-plan.pdf`, e commitá-lo com o resto.
- **Regras do projeto** (`CLAUDE.md`): texto novo nas duas línguas (a fase 1 não tem texto novo para clientes; só mensagens para os sócios, em português); o trabalho acaba com um pull request, que se junta à `main` para o Vercel colocar no ar. **Mas só depois de 8.6, passo 5.**
- **O Notion real nunca se altera sem os sócios verem primeiro** o que vai ser acrescentado (8.6, passo 3). Não há como desfazer.
- Segredos: as variáveis `NOTION_TOKEN`, `NOTION_PARENT`, `NOTION_FORM1_LEADS` e `NOTION_FORM2_LEADS` estão em `.env.local` (não commitado). Não as escrever em lado nenhum, nem nos registos.
- Os registos nunca levam nome, email, telefone ou mensagem (`docs/backend-decisions.md`).

### 8.2 Âmbito

**Dentro:** as propriedades novas na base "Pedidos" (8.3); o catálogo único dos passos (8.4); o site a escrever os passos (8.5): ao chegar um pedido, ao enviar o convite, ao enviar a proposta, ao o cliente marcar a hora e, no histórico, ao o cliente responder sobre a chamada a meio; o modo de ensaio e o modo "só mostrar" do script; o guia do `/interno` e `docs/backend-decisions.md` atualizados.

**Fora** (fases seguintes): a terceira opção "contactar-nos" no convite; o separador "Link da chamada"; o resumo diário; o teste do Google Calendar; os pedidos de parceria (a base "Parceiros" não muda); as vistas do Notion (à mão, secção 4.10).

### 8.3 Propriedades a criar na base "Pedidos"

Tipos do Notion: *seleção*, *data*, *link*, *texto*, *caixa*, *fórmula*. As opções de uma seleção escrevem-se por esta ordem. Se o site escrever uma opção que não existe, o Notion cria-a; **uma propriedade que não existe, não**: recusa o pedido (ver 8.5 e 8.6).

| Propriedade | Tipo | Opções | Estado de partida | Quem escreve |
|---|---|---|---|---|
| Confirmação | seleção | Enviada, Falhou | (vazio, até haver resultado) | Site |
| Preparação da chamada | seleção | Por iniciar, Iniciada, Feita | Por iniciar | Estúdio |
| Documento de preparação | link | | (vazio) | Estúdio |
| Convite | seleção | Não enviado, Enviado | Não enviado | Compositor |
| Marcação | seleção | A aguardar resposta, Vai contactar-nos, Agendada | (vazio) | Site |
| Chamada | fórmula | (texto) | | |
| Link da chamada | seleção | Aguarda marcação, Por enviar, Enviado | Aguarda marcação | Site; Estúdio |
| Chamada realizada | seleção | Por efetuar, Efetuada, Cliente faltou | Por efetuar | Estúdio |
| Proposta | seleção | Por enviar, Enviada | Por enviar | Compositor |
| Válida até | data | | (vazio) | Compositor |
| Reunião a meio (já existe) | seleção | acrescentar **Por responder** às que há (Sim, Não) | (vazio); Por responder ao enviar a proposta | Site |
| Chamada de acompanhamento | seleção | A marcar, Marcada, Feita | (vazio) | Fase seguinte |
| Data do acompanhamento | data | | (vazio) | Estúdio |
| Contrato assinado | seleção | Por receber, Recebido assinado | (vazio); Por receber ao enviar a proposta | Estúdio |
| Assinado em | data | | (vazio) | Estúdio |
| Sinal de 25% | seleção | Por pedir, Pedido, Recebido | (vazio); Por pedir ao enviar a proposta | Estúdio |
| Valor do sinal | fórmula | (texto) | | |
| Sinal recebido em | data | | (vazio) | Estúdio |
| Documento do sinal | seleção | Por emitir, Emitido | (vazio); Por emitir ao enviar a proposta | Estúdio |
| Materiais | seleção | Por receber, Incompletos, Completos | (vazio); Por receber ao enviar a proposta | Estúdio |
| Materiais até | fórmula | (data) | | |
| Chamada de validação | seleção | A marcar, Marcada, Feita | (vazio) | Estúdio |
| Fatura final | seleção | Por emitir, Emitida | (vazio) | Estúdio |
| Fatura emitida em | data | | (vazio) | Estúdio |
| Pagamento até | fórmula | (data) | | |
| Pagamento final | seleção | Por receber, Recebido, Em atraso | (vazio) | Estúdio |
| Recibo | seleção | Por emitir, Emitido | (vazio) | Estúdio |
| Lançamento | seleção | Por lançar, Lançado | (vazio) | Estúdio |
| Etapa atual | fórmula | (texto) | | |
| Motivo de perda | seleção | Preço, Prazo, Escolheu outro, Sem resposta, Desistiu, Outro | (vazio) | Estúdio |
| Responsável | seleção | António, Emanuel | (vazio) | Estúdio |
| Histórico | texto | | (vazio); uma linha ao chegar o pedido | Site e Compositor |
| Spam ou teste | caixa | | desmarcada | Estúdio |

**Estado geral (já existe):** passa a ter, por esta ordem, Novo, Contactado, Reunião marcada, Reunião feita, Proposta enviada, Ganho, Em projeto, Concluído, Perdido. Os estados novos só devem entrar na base "Pedidos": hoje a função `updateFor` do script aplica os mesmos estados às duas bases, por isso é preciso separar.

**Fórmulas** (linguagem de fórmulas do Notion, escritas por API como `{ formula: { expression: "…" } }`; **a testar** na base de ensaio, que pode pedir pequenos ajustes de sintaxe):

```
Chamada
if(prop("Marcação") == "Agendada", formatDate(prop("Reunião"), "ddd D MMM, HH:mm"), if(prop("Marcação") == "Vai contactar-nos", "Cliente vai contactar-nos", "Por marcar"))

Valor do sinal
if(empty(prop("Valor final")), "", format(round(prop("Valor final") * 25) / 100) + " €")

Materiais até
dateAdd(prop("Assinado em"), 8, "days")

Pagamento até
dateAdd(prop("Fatura emitida em"), 3, "days")

Etapa atual
if(prop("Estado") == "Perdido", "Perdido",
if(prop("Preparação da chamada") != "Feita", "Preparar a chamada",
if(prop("Convite") != "Enviado", "Enviar o convite",
if(prop("Marcação") != "Agendada", "Marcação da chamada",
if(prop("Link da chamada") != "Enviado", "Enviar o link da chamada",
if(prop("Chamada realizada") != "Efetuada", "Fazer a chamada",
if(prop("Proposta") != "Enviada", "Enviar a proposta",
if(prop("Contrato assinado") != "Recebido assinado", "Contrato por assinar",
if(prop("Sinal de 25%") != "Recebido", "Sinal de 25%",
if(prop("Materiais") != "Completos", "Materiais",
if(prop("Chamada de validação") != "Feita", "Chamada de validação",
if(prop("Pagamento final") != "Recebido", "Pagamento final",
if(prop("Lançamento") != "Lançado", "Lançamento", "Concluído")))))))))))))
```

"Pagamento até" soma 3 dias a "Fatura emitida em" (as 72 horas do contrato, cl. 6.2).

### 8.4 Um só catálogo

Hoje os nomes das propriedades estão em dois sítios que têm de mudar juntos: `scripts/setup-notion.mjs` e `src/lib/proposal/deliver.ts`. Passam a ter um só:

- `src/lib/proposal/steps.ts` (novo, **sem** `import "server-only"`, para o script o poder ler): a lista de propriedades da secção 8.3 (nome, tipo, opções, expressão da fórmula), os estados de partida à chegada, os estados escritos ao enviar a proposta, a constante `PAST_BOOKING` (hoje no `/api/meeting/route.ts`, passa para aqui e é importada pelos dois sítios) e funções puras, sem dependências do Notion (como a que escreve a hora de Lisboa do histórico).
- `scripts/setup-notion.mjs` lê esse catálogo. É para correr com `npx tsx --env-file=.env.local scripts/setup-notion.mjs`, como já se faz com `scripts/sql/rotulos.ts` (**a testar** que o `tsx` aceita a opção `--env-file`; se não aceitar, usar uma variável de ambiente à parte). Atualizar o comentário do cimo do script.
- Dois modos novos no script, para não tocar no Notion real à toa:
  - `--ensaio`: ignora os ids das bases e cria só uma base nova, chamada **"Pedidos (ensaio)"**, dentro de `NOTION_PARENT`, com todas as propriedades. Imprime o seu id.
  - `--ver`: não escreve nada. Lê a base real e lista as propriedades que acrescentaria e os estados que mudaria.
- Cuidados na atualização de uma base que já existe (a função `updateFor` do script só trata hoje de propriedades em falta e do "Estado"):
  - nas seleções que já existem e ganham opções ("Estado", "Reunião a meio"), reenviar **todas** as opções que já há, com os seus ids, mais as novas, como a função já faz com o "Estado". Se se enviar só a lista nova, o Notion apaga as outras e os pedidos que as usam ficam sem valor;
  - as **fórmulas** criam-se num **segundo** pedido, depois de as propriedades a que se referem existirem, porque "Etapa atual" lê quase todas as outras (**a testar**);
  - o script tem de saber criar os tipos novos (`url`, `checkbox`, `formula`) além dos que já cria.

### 8.5 O que o site escreve, e quando

Dois princípios: **a entrega de um pedido nunca depende dos passos novos**, e o que já existe continua exatamente como está. Hoje o site faz no Notion: criar a página, atualizar "Estado" e "Valor final", "Contrato enviado", "Reunião" e "Reunião a meio", e escrever "Alertas". Tudo isso mantém-se, e os passos escrevem-se **a seguir**, em separado.

`src/lib/proposal/notion.ts`:

- `createPage` ganha um quarto argumento opcional, `extra` (propriedades dos passos). Tenta criar a página com elas; se o Notion responder 400, volta a tentar sem elas e regista `[nevima:notion] sem os passos` (só o estado HTTP). Assim, se as colunas ainda não existirem, o pedido é entregue na mesma.
- `RequestPage` e `readPage` passam a ler também o "Histórico" e o valor atual de cada seleção do catálogo (por exemplo `steps["Contrato assinado"]`), porque várias regras abaixo só escrevem se o campo estiver vazio.
- Nova função que acrescenta uma linha ao "Histórico": formato `09/11 17:32 · Convite enviado (António)`, hora de Lisboa, a mais recente no fim, cortando as linhas mais antigas se o texto passar os 6000 caracteres. Quem: o sócio que assina, quando é o compositor; "cliente" quando é o cliente; "site" quando é automático.

Quando e o quê (só para pedidos de proposta; os de parceria não mudam):

| Quando | Onde no código | O que escreve (depois do que já escreve hoje) |
|---|---|---|
| Chega um pedido | `deliverRequest` (`deliver.ts`), em `createPage` | Os estados de partida da tabela 8.3 (Preparação da chamada, Convite, Link da chamada, Chamada realizada, Proposta) e "Histórico": `Pedido recebido` |
| Depois dos dois emails | `deliverRequest` | Numa só atualização: "Confirmação" Enviada ou Falhou, e "Histórico" (`Confirmação enviada` ou `Confirmação não enviada`) |
| Envio do convite (botão "Enviar") | `/api/studio/email`, tipo `invite` | **Primeiro**, como hoje, o "Estado" para Contactado. **Depois**, noutra atualização: "Convite" Enviado, "Marcação" A aguardar resposta, "Histórico". Se o pedido já passou da marcação (`PAST_BOOKING`), só "Convite" e "Histórico" |
| Cliente confirma a hora | `/api/meeting` | **Primeiro**, como hoje, "Reunião" e "Estado". **Depois**: "Marcação" Agendada, "Link da chamada" Por enviar, "Histórico" (`Chamada marcada para …` ou `Chamada mudada para …`). Se o pedido já passou da marcação, só "Histórico" |
| Envio da proposta | `/api/studio/email`, tipo `offer` | **Primeiro**, como hoje, "Estado", "Valor final" e "Contrato enviado". **Depois**: "Proposta" Enviada, "Válida até" (hoje mais 10 dias, em Lisboa), "Histórico"; e **só se estiverem vazios**: "Reunião a meio" Por responder, "Contrato assinado" Por receber, "Sinal de 25%" Por pedir, "Documento do sinal" Por emitir, "Materiais" Por receber. Reenviar a proposta nunca repõe um passo que já avançou |
| Cliente responde sobre a chamada de acompanhamento | `/api/mid-call` | Como hoje, "Reunião a meio" Sim ou Não; e "Histórico" (`Chamada de acompanhamento: sim` ou `não`, com o nome do contrato v1.15) |

No envio pelo `/interno`, a resposta `notion` que o compositor mostra ("O Notion foi atualizado" ou "não foi atualizado: fazê-lo à mão") passa a ser verdadeira **só se as duas atualizações tiveram êxito**.

Os emails, as páginas do cliente e os textos do site **não mudam** nesta fase.

### 8.6 Ordem de colocação em produção

Este é o ponto onde se pode estragar o site, por isso a ordem conta:

1. Fazer o código e os testes locais com a configuração `nevima-dev-emails` (em `.claude/launch.json`: sem chave do Resend, não envia nada).
2. `--ensaio`: criar a base "Pedidos (ensaio)". Testar nela as fórmulas e a opção "Ocultar quando vazia", e corrigir a sintaxe se for preciso. Para ensaiar o site de ponta a ponta, apontá-lo à base de ensaio **só na linha de comandos** (`NOTION_FORM1_LEADS=<id do ensaio>`, que a variável de ambiente sobrepõe ao `.env.local`), nunca mudando o `.env.local`.
3. `--ver` contra a base real. **Mostrar a lista aos sócios e esperar um sim.**
4. Só então correr o script de verdade na base real. Acrescenta, não apaga nada e não toca nos pedidos; pode correr-se duas vezes.
5. **Só depois** abrir o pull request e juntá-lo à `main`. Se o código chegasse ao Vercel antes das colunas existirem, o `createPage` retomaria sem os passos (graças à tentativa de 8.5), mas as atualizações do convite, da marcação e da proposta falhariam e o compositor diria "não foi atualizado".
6. Em produção, com um email isento do limite das 24 horas (`REPEAT_ALLOWED_EMAILS_FORMS`): fazer um pedido de ensaio, ver a ficha, enviar um convite do `/interno` para um email do estúdio e conferir os estados. Marcar o pedido como "Spam ou teste" no fim.
7. Se alguma coisa correr mal, reverter o pull request. As colunas novas no Notion são inofensivas e podem ficar.

### 8.7 Lista de verificação (tudo tem de estar certo para a fase 1 estar pronta)

- [x] `npx tsc --noEmit` sem erros, e `next build` passa. **`npm run lint` não corre:** o projeto não tem ESLint configurado (o `next lint` pergunta como o configurar, também na `main`). Fica por decidir se se configura.
- [x] O script corre duas vezes na base de ensaio e a segunda diz que não há colunas novas; `--ver` não escreve nada.
- [x] As fórmulas mostram o esperado: "Chamada" ("Por marcar", depois a hora, depois "Cliente vai contactar-nos" mudando a "Marcação" à mão), "Etapa atual" a avançar, "Valor do sinal", "Materiais até" e "Pagamento até". **Falta confirmar na app do Notion** a hora de uma chamada no verão (8.9).
- [x] Um pedido novo (local, contra a base de ensaio) nasce com os estados de partida e uma linha de "Histórico"; sem chave do Resend, a "Confirmação" fica Falhou e os "Alertas" dizem-no.
- [x] Um pedido contra uma base **sem** as colunas novas continua a ser entregue (base "Pedidos (ensaio, sem passos)").
- [x] Enviar o convite: "Estado" Contactado, "Convite" Enviado, "Marcação" A aguardar resposta, "Histórico" com o sócio que assina; o compositor diz "O Notion foi atualizado".
- [x] Confirmar a hora na página de marcação: "Reunião", "Estado" Reunião marcada, "Marcação" Agendada, "Link da chamada" Por enviar. Escolher o outro horário: tudo muda. Num pedido já em "Proposta enviada", o estado e a marcação não recuam.
- [x] Enviar a proposta: "Proposta" Enviada, "Válida até" a 10 dias, e os passos de depois do contrato com o estado de partida. Reenviar a proposta com "Reunião a meio" já em Sim: não volta a Por responder; com "Contrato assinado" já em Recebido assinado: não volta a Por receber.
- [x] A resposta Sim ou Não sobre a chamada de acompanhamento continua a funcionar.
- [x] Na base real, depois do script, "Reunião a meio" mantém Sim e Não e os pedidos que já as tinham continuam com o seu valor (confirmar com `--ver` antes e uma consulta depois). O mesmo para o "Estado". *Aplicado a 2026-11-09: antes e depois, os 5 pedidos em Novo e "Reunião a meio" vazia; a segunda passagem não tem nada a acrescentar.*
- [ ] Um pedido de parceria continua a ser entregue e a base "Parceiros" não ganhou colunas nem estados. *"Parceiros" ficou sem colunas novas e com os mesmos estados (os 2 pedidos em Novo). O código da entrega de parcerias não mudou; falta o ensaio em produção.*
- [x] Nenhum registo leva nome, email, telefone ou mensagem (só o estado HTTP e o que o Notion diz, que nomeia propriedades).
- [x] `src/components/studio-guide.tsx` (os passos, o que muda em cada etapa e os limites) e `docs/backend-decisions.md` descrevem o que ficou feito; esta secção tem os itens feitos assinalados.

### 8.8 Ficheiros que a fase 1 toca

`scripts/setup-notion.mjs`; `src/lib/proposal/steps.ts` (novo); `src/lib/proposal/notion.ts`; `src/lib/proposal/deliver.ts`; `src/app/api/studio/email/route.ts`; `src/app/api/meeting/route.ts`; `src/app/api/mid-call/route.ts`; `src/components/studio-guide.tsx`; `docs/backend-decisions.md`; `docs/client-tracking-plan.md` e `.pdf`. Nada em `src/app/api/proposal/route.ts`, nos emails, em `invite.ts`, `offer.ts` ou no compositor (`studio-composer.tsx`), a não ser que o texto "O Notion foi atualizado" precise de ajuste. (Não precisou: o compositor ficou como estava.)

### 8.9 O que se decidiu ao construir (2026-11-09)

- **Fórmula "Chamada":** o `formatDate` do Notion escreve o dia e o mês em inglês ("Thu 26 Nov"). A fórmula procura-os em português: "Qui 26 nov, 15:00". Se a "Marcação" estiver Agendada sem hora em "Reunião" (D6, à mão), mostra "Agendada, falta a hora".
- **Fórmula "Valor do sinal":** com vírgula e dois decimais, "612,63 €" (o `format` do Notion dava "612.63").
- **Hora de verão, a confirmar:** lida pela API, a fórmula "Chamada" é calculada em UTC, e uma chamada às 15:00 de Lisboa em julho aparece "14:00". Na app do Notion deve aparecer a hora de quem a vê. Confirmar abrindo a página "Teste Fase 1" da base "Pedidos (ensaio)", que ficou com uma chamada a 8 de julho de 2027 às 15:00: a coluna "Chamada" deve dizer "Qui 8 jul, 15:00". O resumo diário (fase 4) lê a "Reunião", não a fórmula.
- **`PAST_BOOKING`** inclui também "Em projeto" e "Concluído": um botão antigo do convite nunca faz recuar um projeto.
- **Script:** além de `--ver` e `--ensaio`, `--ensaio --sem-passos` (uma base como as de antes, para provar que um pedido chega sem as colunas), `--base=<id>` (atualiza ou lê só essa base, sem tocar nas do `.env.local`) e `--formulas` (reenvia as fórmulas depois de as mudar). O `tsx` aceita `--env-file`.
- **Cores das opções:** cinzento por iniciar, amarelo em curso, verde feito, vermelho correu mal. As opções que já existem na base real ficam com a cor que têm.
- **Se a escrita dos passos falhar:** na marcação, os "Alertas" dizem "Marcação por atualizar à mão" (o cliente não vê nada de diferente); no convite e na proposta, o compositor diz "não foi atualizado"; na resposta sobre a chamada de acompanhamento, só fica no registo (é só a linha do histórico).
- **Bases de ensaio** criadas dentro de `NOTION_PARENT`: "Pedidos (ensaio)" e "Pedidos (ensaio, sem passos)", com um pedido de ensaio cada ("Teste Fase 1", teste@example.com). Podem ser apagadas à mão depois de confirmada a hora de verão.
- **Como se ensaiou:** em vez do servidor local, um programa chamou as funções e as rotas do próprio site (`deliverRequest`, `/api/studio/email`, `/api/meeting`, `/api/mid-call`) contra a base de ensaio, com o Resend simulado (nada foi enviado). As 50 verificações deram todas certo.

### 8.10 Ordem das colunas e o SQL Server (2026-11-09)

**Ordem** (escolhida pelo sócio): onde está o cliente, depois o que o formulário trouxe, depois os passos pela ordem do processo. Vale para a tabela e para a ficha de cada pedido. A API do Notion não muda a ordem das colunas, por isso arrastam-se à mão (os sócios fazem-no). A lista está em `COLUMN_ORDER` (`src/lib/proposal/steps.ts`), com as 54 colunas da base uma vez cada, e o guia do `/interno` mostra-a.

| Grupo | Colunas |
|---|---|
| Resumo | Nome · Estado · Etapa atual · Responsável · Alertas |
| Formulário | Email · Telefone · Empresa · Idioma · Serviços · Setor · País · Estimativa · Mensal (€) · Prazo · Mensagem · Origem · Recebido |
| Até à chamada | Confirmação · Preparação da chamada · Documento de preparação · Valor Y (cliente) · Valor X (sugestões) · Convite · Marcação · Reunião · Chamada · Link da chamada · Chamada realizada |
| Proposta | Proposta · Valor final · Contrato enviado · Válida até · Reunião a meio · Chamada de acompanhamento · Data do acompanhamento |
| Contrato e sinal | Contrato assinado · Assinado em · Sinal de 25% · Valor do sinal · Sinal recebido em · Documento do sinal · Materiais · Materiais até |
| Projeto até aos 100% | Chamada de validação · Fatura final · Fatura emitida em · Pagamento até · Pagamento final · Recibo · Lançamento |
| Fecho | Motivo de perda · Histórico · Spam ou teste |

Uma coluna nova acrescenta-se em `steps.ts` e também nesta lista.

**SQL Server: não é preciso mudar nada.** A cópia em SQL (`src/lib/proposal/sql.ts`, `scripts/sql/nevima-db.sql`) guarda o que o formulário trouxe, no momento em que chega, e não lê nem escreve no Notion: as colunas novas não lhe chegam e não a partem. O acompanhamento (estados, passos, histórico) fica só no Notion, como já estava decidido (o Notion é onde se trabalha cada pedido; o SQL é o registo para consultas). Levar os passos para o SQL obrigaria o site a alterar linhas, e o utilizador `nevima_site` só pode acrescentar pedidos; seria uma decisão à parte (por exemplo, com a mudança para o Supabase, secção 7). Um reparo: as tabelas `PedidosProposta` e `PedidosParceria` têm uma coluna `Estado` (valores `novo`, `em_analise`, …) que fica sempre em `novo`, porque ninguém a atualiza. Não é o estado do pedido; o estado verdadeiro está no Notion.
