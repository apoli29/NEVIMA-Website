# Contrato de prestação de serviços: decisões

O estado atual do contrato, as decisões dos sócios e o que ainda está em aberto. A fonte é `contratos/contrato-nevima.html`, impresso em PDF com o Edge sem interface (ver o histórico do git). Este ficheiro descreve a **v1.6** (2026-10-17), em `contratos/contrato-nevima-v1.6.pdf`. A v1.6 alinha o contrato com o formulário de proposta (PR #123, #125 e #126), sem os preços do formulário: a estimativa é um intervalo (cl. 4.1); o nível de design é Essential+ ou Advanced (cl. 11.1); a escrita dos textos em falta e as funcionalidades extra são orçamentadas na Proposta (cl. 11.2); o SEO intensivo é pontual (cl. 14) e o SEO e GEO mensal o mantém (cl. 15); e a Proposta tem as linhas correspondentes.

Os trechos a laranja escuro (`.pending`) aguardam a decisão final dos sócios. As cláusulas ajustáveis têm a etiqueta **Ajustável** no título e uma frase que diz **quais os pontos** se podem ajustar (v1.5): **6.1** (sinal), **6.2** (prazo do pagamento final), **6.5** (meios de pagamento), **8.2** (prazo dos Materiais), **10.6** (desmarcação da sessão) e **21.2** (o sinal no cancelamento). A cl. 16 deixou de ser ajustável, porque as escolhas de portfólio e de crédito já se fazem na Proposta. Um ajuste só vale se ficar escrito nas Condições específicas, com a cláusula e o ponto (cl. 5.2).

## Estrutura (v1.4)
- **Parte I, Condições Gerais:**
  1. Partes
  2. Objeto
  3. Definições
  4. Estimativa, Proposta e preços
  5. Formação do contrato
  6. Pagamentos
  7. Atrasos no pagamento
  8. Envio de materiais e prazos
  9. Identidade visual
  10. Sessão fotográfica
  11. Web design
  12. Alojamento
  13. Domínio
  14. SEO intensivo
  15. SEO e GEO mensal
  16. Portfólio e crédito
  17. Propriedade intelectual
  18. Obrigações do Cliente
  19. Dados pessoais
  20. Confidencialidade
  21. Cancelamento
  22. Responsabilidade
  23. Duração e cessação
  24. Comunicações
  25. Lei aplicável
- **Parte II:** Proposta / Ordem de Serviço.
- **Parte III:** Anexo para clientes particulares.
- **Parte IV:** Acordo de Tratamento de Dados.

Cada serviço tem uma cláusula própria (9 a 15) com o que inclui, o que não inclui e as suas condições. A antiga "Descrição dos serviços" foi absorvida por essas cláusulas. Ordem dos serviços: a de execução, escolhida pelos sócios.

## Decidido (por cláusula da v1.4)
- **4:**
  - a estimativa do formulário é indicativa; vale a Proposta, enviada em resposta ao formulário;
  - a Proposta é válida por 10 dias; depois disso, a nevima pode rever os preços e os prazos, ou cancelar a Proposta;
  - prazo urgente: +40%.
- **6 (Pagamentos):**
  - sinal de 25% na assinatura; o trabalho só começa com o sinal recebido e os Materiais completos (em destaque);
  - pagamento final em **72 horas** a contar do envio da fatura;
  - **nota:** quem não puder pagar nesse prazo avisa antes de assinar, e a nova data fica nas Condições específicas; se não avisar, aplica-se a cl. 7;
  - fatura no dia da Chamada de Validação e recibo quando o pagamento chega (nunca fatura-recibo antes do pagamento);
  - fora da zona euro, o comprovativo é enviado nas mesmas 72 horas.
- **7 (Atrasos):**
  - juros de mora;
  - o site não é lançado;
  - o Cliente não adquire direitos enquanto não pagar;
  - 15 dias depois de avisado por escrito, a nevima escolhe entre a) exigir o valor em falta, com juros e custos, por injunção, ou b) resolver o contrato e exigir o **preço total** como indemnização, descontado o que recebeu;
  - com Particulares, na medida em que a lei o permita.
- **8 (Materiais e prazos):**
  - 8 dias para entregar os Materiais, a contar da receção da Proposta assinada (outro prazo a pedido do Cliente, nas Condições específicas);
  - se o prazo passar, o contrato perde efeito e a nevima retém o sinal na medida em que a lei o permita;
  - "Prazos do contrato" foi fundida aqui.
- **9 (Identidade visual):** a nevima acompanha o registo de marca **sem custo adicional**, mas não o faz por inteiro.
- **10 (Sessão fotográfica):**
  - deslocações incluídas até 30 km de Arcozelo; acima disso, €/km na Proposta;
  - desmarcação com menos de 48 horas: **15%** do preço da sessão, mais as deslocações (a laranja: "a confirmar com parecer profissional").
- **11 (Web design):**
  - o português é sempre a língua incluída; línguas adicionais a 35 / 55 / 80 €, com reunião de revisão;
  - a tradução por IA é revista pelo Cliente num documento formatado pela nevima;
  - os ajustes da **Chamada de Acompanhamento** são **gratuitos**;
  - **alterações pequenas:** até 15 minutos cada, **máximo de 4** gratuitas; a partir da 5.ª, orçamentadas; sem prazo fixo (a nevima faz e avisa);
  - **Lançamento:** a) alterações antes de lançar, ou b) lançar já: o Cliente paga normalmente, o site vai para o ar e as alterações maiores são orçamentadas e publicadas quando pagas;
  - em ambos os casos, o pagamento final vence nas 72 horas da cl. 6.2;
  - **aceitação:** 72 horas depois da Chamada de Validação.
- **12 (Alojamento):**
  - gratuito; o primeiro período é de **1 ano** a partir do Lançamento, e depois renova-se automaticamente por **períodos de 6 meses**;
  - não renovação com **2 meses** de aviso;
  - na renovação, a nevima pode passar a cobrar um **valor simbólico** que só cobre custos, **até 60 €/ano**; se o Cliente recusar (ou não renovar), recebe o código sem custo;
  - alojado no plano **Pro** da Vercel;
  - **limite justo:** 100 mil CDN requests por mês; acima disso, **120 €/ano** entre 100 mil e 1 milhão, e **orçamento especializado** acima de 1 milhão (valores a laranja, para os sócios confirmarem que são justos);
  - o site continua a dizer "for as long as your website is live": **o site não muda** por agora (pedido do utilizador).
- **16:** o crédito é o logótipo da nevima no rodapé, com −5% no website.
- **17 (Propriedade intelectual):**
  - "integral" quer dizer todo o preço;
  - para usar um trabalho antes, o Cliente paga antecipadamente o preço desse serviço;
  - as ferramentas e componentes da nevima não dão direitos ao Cliente; os que ficam dentro do website só podem ser usados como parte dele.
- **18.4:** 5 dias úteis para o Cliente responder a perguntas e aprovações durante o projeto.
- **21 (Cancelamento):**
  - profissionais: a nevima fica sempre com os 25% ou com o valor proporcional, o que for maior;
  - Particulares: o anexo nos primeiros 14 dias.
- **24:** contactos pontuais por telefone; tudo o resto por email.
- **Proposta (Parte II):**
  - n.º no formato `nomedaempresa-2026-01`;
  - serviços com caixas e subpreços;
  - linha de registo de domínio;
  - Condições específicas.

## Por decidir (a laranja)
- **Domínio (cl. 13):**
  - a nevima regista o domínio por quem não o tem e cobra o custo à parte; quem já tem não paga, e a nevima liga o website se for exequível;
  - falta definir **como** (a partilha de conta do Hostinger foi a recomendação).
- **Formulários (cl. 11.3 e Parte IV, art. 2.4):** confirmar como funcionam.
- **SEO e GEO (cl. 14, 15, 6.6):** conteúdo e cobrança. O GEO pode ser pontual ou mensal (ver a memória de questões de preço). A cl. 6.7 também está a laranja.
- **Identidade visual (cl. 9.4):** quantas rondas de revisão estão incluídas.
- **Alojamento (cl. 12.3 e 12.6):** se os 60 €, os 100 mil, os 120 € e o 1 milhão são justos.
- **15% na desmarcação (cl. 10.6):** parecer profissional.

## Por confirmar
- Qual Arcozelo (o concelho), na cl. 10.3.
- Se o web design inclui a escrita dos textos (cl. 11.1; o site diz "includes copy").
- Diferenças entre o site e o contrato:
  - o simulador desconta o domínio existente (10 a 30 €) e cobra 45 € pelo inglês e 20 € por outra língua, contra 35 / 55 / 80 € no contrato;
  - a duração do alojamento.
- **Atualizações de segurança (a explorar mais tarde):** se o alojamento gratuito inclui aplicar as correções de segurança do Next.js (por exemplo, as falhas de março de 2025 e o "React2Shell" de dezembro de 2025), e como fazê-lo em muitos sites (a mesma base em todos, Dependabot). Frase proposta: "O alojamento inclui manter o website no ar tal como foi entregue e aplicar as atualizações de segurança que a nevima considere necessárias. Não inclui alterações, funcionalidades novas nem atualizações de outra natureza, que seguem a cláusula 11."
- NIF e morada de cada sócio; revisão pelo advogado.

## Contas da Vercel (2026-10-16)
- **O que o Pro inclui:** 20 $/mês, com 20 $ de crédito, e o escalão Flat Rate CDN base: 1 milhão de CDN requests e 1 TB, **para a equipa inteira**. O escalão seguinte custa mais 20 $/mês (10 milhões de requests, 50 TB).
- **Medido no site da nevima:** cerca de 21 pedidos e 0,4 a 0,8 MB numa primeira visita; cerca de 7 a 8 pedidos por página extra.
- **Estimativa dos sócios:** cerca de 100 visitas por mês por site, o que dá 5 a 10 mil requests por site, robôs incluídos.
- **Consequência:** 30 sites cabem no Pro (20 $/mês) sem custos extra; ~100 a 200 sites antes do limite incluído.
- **Plano para crescer:** quando a conta se aproximar do limite, o segundo sócio abre uma segunda conta Pro e passa a publicar lá.
