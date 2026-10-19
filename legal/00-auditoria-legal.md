# Auditoria legal da nevima: Fase 1

| | |
|---|---|
| Versão | 0.2 (verificação no texto oficial, decisões do utilizador) |
| Data | 19 de outubro de 2026 |
| Âmbito | Website nevima (repositório `NEVIMA-Website`, branch `main` em `146eaee`) e atividade dos dois prestadores |
| Contrato analisado | v1.5 (enviado pelo utilizador) **e** v1.8 (`contratos/contrato-nevima.html`, a versão mais recente no repositório) |
| Estado | Para decisão. Não é parecer jurídico: ver "Limites desta auditoria" |

---

## 0. Limites desta auditoria (ler primeiro)

1. **Acesso às fontes oficiais.** A rede deste ambiente bloqueia `diariodarepublica.pt`, `files.diariodarepublica.pt`, `data.dre.pt`, `eur-lex.europa.eu` e `cnpd.pt` (erro 403 do proxy). Pude pesquisar e ler os excertos indexados dessas fontes (e de fontes secundárias fiáveis: AT, ERS, AMT, sociedades de advogados), mas **não li o texto consolidado** dos diplomas. Por isso:
   - quando a regra foi confirmada por pesquisa (fonte oficial ou secundária identificada), cito a fonte;
   - quando a regra vem do meu conhecimento e não a consegui confirmar nesta sessão, fica **[A CONFIRMAR]**;
   - números de artigo que não vi no texto oficial ficam **[A CONFIRMAR]**, mesmo quando estou razoavelmente seguro.
   Para fechar estes pontos, basta acrescentar esses domínios em *Allowed domains* (definições do ambiente → Network access) e eu verifico tudo de uma vez.
2. Não sou advogado. A secção 8 diz quais os pontos que, na minha avaliação, precisam mesmo de um.
3. Não presumi factos sobre a nevima que não estejam no pedido, no contrato ou no repositório. O que falta está nas perguntas da secção 9.

**Legenda:** **O** = obrigatório por lei · **R** = recomendado · **D** = depende (de uma decisão ou de uma condição) · **N/A** = não se aplica.

---

## 1. Resumo executivo

- **O site recolhe dados pessoais sem política de privacidade.** O formulário de proposta liga a `#privacy-policy`, uma âncora que não existe. Não há identificação do prestador em lado nenhum.
- **A base legal está mal escolhida.** O formulário obriga a assinalar uma caixa de "consentimento" para enviar o pedido. A base certa é a diligência pré-contratual (RGPD, art. 6.º, n.º 1, al. b). Um consentimento imposto como condição não é livre (art. 7.º, n.º 4).
- **O site promete coisas que o contrato não dá**: alojamento grátis "enquanto o website estiver online", alterações pequenas "nunca cobradas", desconto do domínio existente, resultados de SEO "garantidos", tradução por IA "com mais de 95% de precisão". O contrato diz outra coisa. Isto é risco de prática comercial enganosa e de interpretação contra a nevima. Ver a secção 2.
- **O contrato está composto em 9,4 pt.** Com Particulares (consumidores), as cláusulas em letra inferior a 11 (ou 2,5 mm) ou com espaçamento inferior a 1,15 são absolutamente proibidas (DL 446/85, art. 21.º, al. i), aditada pela Lei 32/2021). Isso pode anular as cláusulas, ou o contrato inteiro. É de correção imediata.
- **Banner de cookies: hoje não é legalmente necessário.** O site não define cookies nem usa analytics. Só usa armazenamento estritamente funcional, pedido pelo próprio visitante. Há, no entanto, pedidos a terceiros (imagens servidas pela Unsplash) que convém eliminar. Recomendo construir o gestor de consentimento pronto a usar, sem mostrar um banner vazio (pergunta 9.6).
- **Ser dois independentes sem sociedade** traz responsabilidade pessoal ilimitada. Traz também a questão de serem, perante o RGPD, **responsáveis conjuntos** (art. 26.º), o que exige um acordo escrito entre os dois. E cada um fatura e tem o seu próprio limiar de isenção de IVA.
- **Plataforma ODR:** foi extinta (Reg. (UE) 2024/3228, com efeitos a 20/07/2025). **Não** se deve pôr a ligação.

---

## 2. Contradições a resolver antes de escrever documentos

Os documentos legais têm de dizer o mesmo que o contrato e o site. Hoje não dizem. Por ordem de gravidade:

| # | Tema | O que diz o site / código | O que diz o contrato (v1.8) | Risco | Proposta |
|---|---|---|---|---|---|
| C1 | **Versão do contrato** | — | Recebi a **v1.5**; o repositório tem a **v1.8** (17/10/2026). A v1.8 muda a cl. 4.1 (estimativa em intervalo; duas Propostas quando a nevima sugere outro âmbito), a 11.1 (nível de design; escrita de textos orçamentada à parte), a 14 e a 15 (SEO e GEO pontuais, com um mensal opcional) e a Parte II (linhas pontual e mensal). | Documentos alinhados com a versão errada | Trabalhar sobre a **v1.8** (pergunta 9.1) |
| C2 | **Alojamento** | "Free hosting, for as long as your website is live" (`services.ts`, `web-design.tsx`); "o alojamento é gratuito enquanto estiver online" (FAQ "monthly"); "Totalmente gratuito" (`comparison.tsx`) | Cl. 12: gratuito no 1.º ano; depois, renovações de 6 meses; a nevima pode passar a cobrar até 60 €/ano; limite justo (120 €/ano acima de 100 mil pedidos por mês); não renovação com 2 meses de aviso | Publicidade enganosa (DL 57/2008, ações enganosas [artigo A CONFIRMAR]); as declarações públicas contam para a conformidade com consumidores (DL 84/2021); na dúvida, a cláusula interpreta-se contra quem a redigiu (DL 446/85, art. 11.º [A CONFIRMAR]) | Alinhar o site com o contrato (o teu próprio briefing diz "1 ano, pode deixar de ser gratuito") — pergunta 9.5 |
| C3 | **Alterações pequenas** | "Changes that take us only a few minutes are never charged" (FAQ, `web-design.tsx`, processo) | Cl. 11.9: até 15 min cada, **máximo de 4** gratuitas; a partir da 5.ª, orçamentadas | Idem | Site: "as primeiras quatro alterações pequenas são gratuitas" — pergunta 9.5 |
| C4 | **Domínio já existente** | FAQ: "if you already have one, we take its cost off the final price"; o simulador desconta 10–30 € | Cl. 13.3: "não há qualquer custo" (sem desconto). Cl. 13 inteira está "decisão pendente" | Promessa de desconto sem base contratual | Decidir uma regra (pergunta 9.5). **Não toco na lógica de preços**: só sinalizo |
| C5 | **Páginas legais dos clientes** | FAQ "Porquê a Nevima": "criamos as páginas para as informações legais"; FAQ/Processo: o conteúdo "por lei tem de ser produzido pelo próprio negócio" | Cl. 11.2 e 18.3: o conteúdo **não** está incluído; o Cliente produz-o; a nevima "não presta aconselhamento jurídico" | (a) Contradição. (b) **Afirmação falsa**: nenhuma lei obriga o negócio a redigir ele próprio os seus textos legais; obriga a que existam e estejam corretos. (c) A Lei 49/2004 foi revogada pela Lei n.º 10/2024; a consulta jurídica deixou de ser ato exclusivo de advogados (só o mandato forense o é), mas a nevima continua a não dever aconselhar juridicamente os clientes (responsabilidade) | Corrigir a cópia: "colocamos no website as páginas legais que o cliente fornecer"; retirar "por lei" |
| C6 | **Tradução por IA** | FAQ: "com mais de 95% de precisão"; correções "com um preço adicional" | Cl. 11.5: o Cliente indica as correções num documento; não fala de preço; a exatidão é da responsabilidade do Cliente depois de aprovar | Alegação numérica não demonstrável (DL 57/2008); contradição no preço | Retirar o "95%" ou ter prova; alinhar o preço das correções |
| C7 | **Preço das línguas** | Simulador: inglês a 45 €, outra língua a 20 € (`docs/contract-decisions.md`) | Cl. 11.4: uma a 35 €, duas a 55 €, três a 80 € | A Proposta prevalece (cl. 4.1), mas a estimativa vira expectativa | Sinalizar; não mexo em preços |
| C8 | **Funcionalidades** | O estimador oferece formulários, **newsletter, emails automáticos e marcações** (`questions.ts`) | Desde a v1.7 "já não há funcionalidades extra, porque a nevima não faz backend"; só os formulários estão no contrato | Newsletter, emails e marcações implicam tratar dados por conta do cliente com fornecedores que não estão identificados no Acordo de Tratamento de Dados (Parte IV) | Pergunta 9.7 |
| C9 | **Formulários dos clientes** | — | Cl. 11.3 e Parte IV, art. 2.4 (a laranja): "a nevima não as guarda nem as lê"; o serviço de envio de email não está identificado (art. 4.1) | O RGPD exige identificar os subcontratantes ulteriores (art. 28.º, n.º 2 e n.º 4) | Nomear o fornecedor (pergunta 9.7) |
| C10 | **SEO "garantido"** | Processo: "Este trabalho garante bons resultados nos primeiros meses"; FAQ: "com um SEO personalizado, alcança posições mais altas, nas primeiras páginas" | Cl. 14.4: "não garante posições nem tráfego" | Promessa pública contra a cláusula | Reescrever sem promessa de resultado |
| C11 | **Fotografias** | Processo: "Ficam inteiramente propriedade do cliente, que os pode usar livremente noutros projetos" | Cl. 17.1 e 17.2: os direitos só passam com o pagamento integral; e as pessoas fotografadas têm direito de imagem (CC, art. 79.º) | O cliente pode usar as fotos fora do âmbito das autorizações das pessoas retratadas | Acrescentar "depois de pagas" e remeter para as autorizações |
| C12 | **Contacto e domínio** | Email `ola@nevima.pt` (em 5 ficheiros); `metadataBase` = `https://nevima.pt` | `ola@nevima.studio`; o briefing diz: domínio principal nevima.studio, com nevima.pt a redirecionar | A identificação do prestador tem de ter um endereço de email que funcione e seja coerente | Pergunta 9.3 |
| C13 | **Reunião intermédia** | "Once part of the website is built" | Cl. 3/11.7: "a meio do projeto"; o briefing diz "aos 25–30%" | Baixo | Escolher uma formulação única |
| C14 | **Consentimento no formulário** | Caixa obrigatória "Aceito que a Nevima use estes dados…" | Cl. 19.1: dados tratados "apenas para cumprir este contrato" | Consentimento imposto (RGPD, art. 7.º, n.º 4, e considerando 43) | Trocar por aviso informativo (secção 6) |
| C15 | **Livro de Reclamações** | Nada no site | Anexo III, C.1: o Cliente pode reclamar no Livro Eletrónico | Se há obrigação, falta o acesso destacado no site | Pergunta 9.2 |
| C16 | **Documentos dos domínios .pt** | — | Cl. 13.4: "normalmente cerca de 2 dias" | As Regras de Registo .pt de 2026 falam em verificação por amostragem nos 10 dias seguintes ao registo, pedido de informação "no prazo máximo de 4 dias" e remoção imediata se houver violação ([pt.pt, Regras 2026](https://www.pt.pt/fotos/editor2/pt_regras_registo_2026.pdf)) [leitura do prazo A CONFIRMAR] | Remeter para "o prazo que a DNS.PT indicar", sem números |
| C17 | **Acordo de Tratamento de Dados, art. 3.2** | — | "Só os dois prestadores têm acesso aos dados" | Inexato: a Vercel (e o fornecedor de email) também tratam os dados | Reescrever |
| C18 | **Acordo de Tratamento de Dados, auditorias** | — | O art. 3.6 só diz "disponibiliza informação" | O art. 28.º, n.º 3, al. h) exige também permitir e contribuir para auditorias e inspeções | Acrescentar |
| C19 | **Arcozelo** (cl. 10.3) | — | "30 km de Arcozelo" | Há várias freguesias com esse nome; é ambíguo | Indicar o concelho |

---

## 3. Dois trabalhadores independentes sem sociedade: implicações

**Identificação do prestador.** Quem presta o serviço são duas pessoas singulares, não "a Nevima". O site e os documentos têm de identificar **os dois**: nome completo, NIF, morada, email e telefone se for usado (DL 7/2004, art. 10.º; lista exata [A CONFIRMAR]; [vLex, texto consolidado](https://vlex.pt/vid/decreto-lei-n-7-1034385953), [ELI DRE](https://data.dre.pt/eli/dec-lei/7/2004/p/cons/20230530/pt/html)). A Lei 12-A/2026 (execução do DSA) poderá ter alterado este decreto-lei [A CONFIRMAR o quê] ([PLMJ](https://www.plmj.com/pt/conhecimento/notas-informativas/Digital-Services-Act-publicada-a-Lei-de-Execucao-em-Portugal/34521/)).

**O que fica público.** A lei pede o "endereço geográfico" onde o prestador está estabelecido [A CONFIRMAR a formulação]. Para não expor a casa de cada um, a solução habitual é uma morada profissional comum (escritório partilhado ou serviço de domiciliação) que receba correio. É uma decisão tua (pergunta 9.4). O NIF dos dois tem de estar visível [A CONFIRMAR al. d) do art. 10.º].

**"nevima" não é uma pessoa.** Usar a marca é lícito, mas os documentos devem dizer sempre "António … e Emanuel …, que trabalham sob a marca nevima". Recomendo registar a marca no INPI (R; não é obrigatório). Assim fica protegida, e o "™" já usado passa a poder ser "®".

**Responsabilidade.** Cada sócio responde com o **seu património pessoal**, sem limite. Quando os dois assumem uma obrigação "em conjunto" (cl. 1.2), fica por esclarecer se a responsabilidade é **conjunta** (cada um pela sua parte) ou **solidária** (cada um pelo todo). No Código Civil, a solidariedade só existe quando resulta da lei ou da vontade das partes (art. 513.º — [informador.pt](https://informador.pt/?p=156544)), e essa vontade pode ser tácita ([TRG, 19-05-2011](https://vlex.pt/vid/acordao-n-1585-10-1044240272)). A presunção de solidariedade nas obrigações comerciais (Código Comercial, art. 100.º) e a questão de saber se a atividade é comercial ficam **[A CONFIRMAR]**. Há ainda um risco a avaliar por advogado: dois profissionais que exploram em comum uma atividade, com marca e resultados partilhados, podem ser vistos como uma **sociedade civil de facto** (CC, art. 980.º [A CONFIRMAR]), com as consequências fiscais e de responsabilidade que isso traz.
→ **Mitigação:** limitação de responsabilidade válida no contrato (secção 8), seguro de responsabilidade civil profissional, acordo escrito entre os dois sócios e, quando o volume justificar, uma sociedade por quotas.

**Faturação e IVA.** Cada sócio fatura a parte que presta (cl. 1.4). O limiar de isenção do art. 53.º do CIVA é **por sujeito passivo**: 15 000 € de volume de negócios no ano anterior, com saída imediata se no ano em curso passar 25% acima (18 750 €), segundo a redação dada pelo DL 35/2025 ([Santander](https://www.santander.pt/salto/isencao-iva), [Vendus](https://www.vendus.pt/blog/questoes-frequentes-53-civa/amp/)) [valores e datas A CONFIRMAR no CIVA consolidado]. A fatura de uma operação isenta tem de dizer o motivo da não aplicação do imposto (CIVA, art. 36.º, n.º 5, al. e) — [AT, ficha doutrinária](https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/informacoes_vinculativas/despesa/civa/Documents/PIV_29266.pdf)).
→ Os sócios podem sair do regime em datas diferentes. Os documentos têm de prever que **um** dos prestadores passe a liquidar IVA e o outro não. A cl. 4.4 já o faz ("se algum deles").

**RGPD.** Os dois decidem em conjunto para que servem e como são tratados os dados dos visitantes e dos clientes. São **responsáveis conjuntos** (art. 26.º RGPD) e têm de ter um acordo entre si sobre quem faz o quê, cuja essência é comunicada aos titulares (art. 26.º, n.º 2). Hoje esse acordo não existe. É um documento curto e entra na Fase 2 (B17).

---

## 4. Fronteira B2B/B2C e mercados

**Quem é consumidor.** É consumidor quem contrata para uso não profissional (Lei 24/96 e DL 24/2014 [definições A CONFIRMAR]). O contrato já faz bem a distinção (Profissional/Particular). Um **empresário em nome individual que contrata o site para o seu negócio é Profissional**, não consumidor. Só o particular (um site pessoal ou um portefólio de hobby) é consumidor.

**O que muda com Particulares:**
1. Informação pré-contratual e direito de livre resolução de 14 dias, porque o contrato é celebrado à distância, por email e assinatura digital (DL 24/2014 [artigos 4.º, 10.º, 15.º e 17.º A CONFIRMAR] — [vLex](https://vlex.pt/vid/decreto-lei-n-24-908798341), [ELI DRE](https://data.dre.pt/eli/dec-lei/24/2014/p/cons/20230303/pt/html)). O Anexo III cobre isto.
2. Conformidade de conteúdos e serviços digitais (DL 84/2021, que transpõe a Diretiva 2019/770). A diretiva aplica-se também a conteúdos "desenvolvidos de acordo com as especificações do consumidor" (Diretiva 2019/770, art. 3.º, n.º 2 [A CONFIRMAR no texto]). Um website por medida para um particular entra aqui ([MLGTS](https://www.mlgts.pt/xms/files/site_2018/Newsletters/2021/Direitos_do_consumidor_na_compra_e_venda_de_bens_moveis_e_imoveis_e_de_conteudos_e_servicos_digitais_-_Legal_Alert.pdf)).
3. Cláusulas proibidas próprias dos consumidores (DL 446/85, arts. 20.º a 22.º), incluindo a regra dos 11 pt (secção 1).
4. Livro de Reclamações e informação sobre RAL (matriz, linhas 14 e 15).
5. O preço tem de ser o preço total. Com Particulares, não é possível "acrescer IVA" a meio do contrato sem uma cláusula clara e aceite [A CONFIRMAR o regime de alteração do preço].

**Fora de Portugal:**
- **Profissionais (B2B)**: a escolha da lei portuguesa e do foro do Porto é válida (Roma I, art. 3.º; Bruxelas I-bis, art. 25.º [A CONFIRMAR]). Basta isso e a versão portuguesa a prevalecer.
- **Consumidores em Espanha e Itália**: se a nevima "dirigir" a atividade a esses países, e o site em inglês que diz que esses mercados são prioridade pode bastar como indício, o consumidor mantém a proteção imperativa da lei do seu país (Roma I, art. 6.º) e pode processar a nevima em casa (Bruxelas I-bis, arts. 17.º e 18.º). A língua do site é só um indício em casos limite ([Pammer/Alpenhof, C-585/08 e C-144/09](https://en.wikipedia.org/wiki/Pammer_and_Alpenhof_cases)). **Excessivo para o vosso perfil:** adaptar os documentos à lei de consumo espanhola e italiana. **Proporcional:** aceitar consumidores só em Portugal, e no estrangeiro só profissionais (pergunta 9.2).
- **Espanha (LSSI-CE)**: a informação geral do prestador (art. 10.º [A CONFIRMAR]) fica coberta pelo Aviso Legal português. Não justifica uma versão em espanhol.
- **Itália**: D.Lgs. 70/2003 [A CONFIRMAR]. Idem.
- **EUA**: o CCPA só se aplica acima de cerca de 26,6 M$ de receita anual, ou com dados de 100 000 consumidores ou agregados, ou com 50% da receita vinda da venda de dados ([Jackson Lewis](https://www.jacksonlewis.com/insights/navigating-california-consumer-privacy-act-30-essential-faqs-covered-businesses-including-clarifying-regulations-effective-1126)). **Não se aplica.** O que é relevante nos EUA: contratos só B2B, lei portuguesa e limitação de responsabilidade. O cliente americano tem as suas próprias obrigações (acessibilidade, privacidade estadual), que não são da nevima. Recomendo uma cláusula a dizê-lo.
- **Espanhol e italiano nos documentos:** **não são necessários** com a opção acima. Ficam PT e EN.

---

## 5. Matriz de obrigações

Prioridade: **P1** = antes de receber o próximo pedido; **P2** = antes de assinar o próximo contrato; **P3** = nos próximos 3 meses.

| # | Documento / obrigação | Base legal (fonte) | O/R/D | Quando se aplica à nevima | Estado | Prior. |
|---|---|---|---|---|---|---|
| 1 | Identificação do prestador (Aviso Legal) | DL 7/2004, art. 10.º [lista A CONFIRMAR] ([vLex](https://vlex.pt/vid/decreto-lei-n-7-1034385953)) | O | Sempre (o site é um serviço da sociedade da informação) | **Falta** | P1 |
| 2 | Política de Privacidade | RGPD, arts. 12.º a 14.º; Lei 58/2019 | O | Recolha por formulários e por email | **Falta** (ligação morta) | P1 |
| 3 | Aviso no ponto de recolha (1.ª camada) | RGPD, arts. 12.º e 13.º | O | Estimador, pedido de proposta, formulário de parceiros | Parcial (caixa mal enquadrada) | P1 |
| 4 | Base de licitude correta e fim do consentimento imposto | RGPD, art. 6.º, n.º 1, al. b) e f); art. 7.º, n.º 4 | O | Idem | **Errado** | P1 |
| 5 | Política de Cookies | Lei 41/2004, art. 5.º, na redação da Lei 46/2012: consentimento prévio, salvo armazenamento estritamente necessário a um serviço pedido ([DRE, Lei 41/2004](https://diariodarepublica.pt/dr/detalhe/lei/41-2004-480710), [DRE, Lei 46/2012](https://diariodarepublica.pt/dr/detalhe/lei/46-2012-174793)) [texto consolidado A CONFIRMAR] | R hoje / O se houver não essenciais | Hoje só há armazenamento funcional (secção 6) | Falta | P2 |
| 6 | Banner / gestor de consentimento | Idem; RGPD, art. 7.º; TJUE Planet49 (sem caixas pré-marcadas — [PLMJ](https://www.plmj.com/xms/files/03_Novidades_legislativas/2019/010_outubro/NI_Cookies-Decisao_do_TJUE_fornece_orientacoes_uteis.pdf)) | D | Só quando houver cookies, analytics ou embeds não essenciais | N/A hoje | P3 (preparar) |
| 7 | Termos de Utilização do site | Sem obrigação legal; CDADC para a proteção dos conteúdos | R | — | Falta | P2 |
| 8 | Reserva de mineração de texto e dados / uso por IA | CDADC, exceção de TDM com reserva por meios legíveis por máquina (transposição da Diretiva 2019/790, art. 4.º, n.º 3) [artigo do CDADC A CONFIRMAR]; AI Act, art. 53.º, n.º 1, al. c) (os fornecedores de IA de uso geral têm de respeitar essas reservas) | R | Se quiserem impedir o treino de IA com o conteúdo do site | Falta (sem `robots.txt`) | P3 |
| 9 | Acordo de responsabilidade conjunta entre os sócios | RGPD, art. 26.º | O | Os dois decidem juntos sobre os dados | **Falta** | P1 |
| 10 | Registo de atividades de tratamento | RGPD, art. 30.º (a dispensa abaixo de 250 trabalhadores não se aplica a tratamentos não ocasionais — art. 30.º, n.º 5) | O (na prática) | Tratamento contínuo de dados de clientes e visitantes | Falta | P2 |
| 11 | Procedimento de violação de dados | RGPD, arts. 33.º e 34.º (72 horas para notificar a CNPD) | O | Sempre | Falta | P2 |
| 12 | Procedimento de pedidos dos titulares | RGPD, arts. 12.º, n.º 3 (1 mês), e 15.º a 22.º | O | Sempre | Falta | P2 |
| 13 | Encarregado de Proteção de Dados (DPO) | RGPD, art. 37.º | N/A | Sem controlo sistemático em grande escala nem categorias especiais em grande escala | — | — |
| 14 | Acordo de subcontratação com os clientes | RGPD, art. 28.º | O | Alojamento, formulários e, se avançarem, newsletter e marcações | Existe (Parte IV), com lacunas (C9, C17, C18, IA, fotos) | P1 |
| 15 | Acordos com os vossos subcontratantes | RGPD, art. 28.º; Vercel DPA (Pro) ([Vercel](https://vercel.com/docs/security/compliance)); Google Workspace [CDPA A CONFIRMAR]; ferramentas de IA [A CONFIRMAR] | O | Vercel, Google, IA, envio de email | Por verificar | P1 |
| 16 | Transferências para os EUA | Decisão de adequação UE-EUA (DPF) em vigor; o Tribunal Geral confirmou-a em 03/09/2025 (T-553/23) e há recurso pendente no TJUE (C-703/25 P) ([HLC](https://www.hlc.com/en/publications/transatlantic-data-transfers-eu-general-court-upholds-dat-privacy-framework), [EDPL](https://edpl.lexxion.eu/article/EDPL/2026/1/15)); a Vercel está certificada no DPF ([Vercel](https://vercel.com/kb/guide/is-vercel-certified-under-dpf)); Google [certificação A CONFIRMAR] | O (informar e ter mecanismo) | Vercel, Google, Anthropic | Por documentar | P1 |
| 17 | Condições gerais (CCG): comunicação e informação | DL 446/85, arts. 5.º e 6.º (dever de comunicar e de informar; sem isso, a cláusula é excluída — art. 8.º) [A CONFIRMAR] | O | Todos os contratos | Contrato existe | P2 |
| 18 | CCG: letra ≥ 11 (ou 2,5 mm) e espaçamento ≥ 1,15 | DL 446/85, art. 21.º, al. i), aditada pela Lei 32/2021, em vigor desde 25/08/2021 ([idealista](https://www.idealista.pt/news/node/48642), [CMS](https://cms.law/en/prt/publication/meet-the-law-alteracao-ao-regime-juridico-das-clausulas-contratuais-gerais)); uso de cláusulas absolutamente proibidas é contraordenação muito grave (DL 109-G/2021 — [Garrigues](https://www.garrigues.com/sites/default/files/noticias/files/decreto-lei_109-g_2021_implicacoes_no_seu_negocio_e_os_novos_direitos_dos_consumidores.pdf)) | O com Particulares | Contrato a **9,4 pt** (`contrato-nevima.html`, linha 65) | **Incumprido** | **P1** |
| 19 | CCG: cláusulas proibidas (limitação de responsabilidade, cláusulas penais) | DL 446/85, art. 18.º (absolutas, entre empresários e com consumidores) e art. 19.º (relativas, p. ex. cláusulas penais desproporcionadas — [TRC 2025](https://trc.pt/clausulas-contratuais-gerais-clausula-penal-desproporcionalidade-nulidade-e-exclusao/)) [alíneas A CONFIRMAR] | O | Cl. 7.4 b), 8.3, 10.6, 21.2 e 22 | Risco (secção 8) | P2 |
| 20 | Informação pré-contratual e livre resolução | DL 24/2014 ([vLex](https://vlex.pt/vid/decreto-lei-n-24-908798341)) [artigos A CONFIRMAR] | O com Particulares | Contratos à distância | Existe (Anexo III); faltam o envio prévio em suporte duradouro e algumas menções | P2 |
| 21 | Conformidade digital para consumidores | DL 84/2021 ([vLex](https://vlex.pt/vid/decreto-lei-n-84-951213915)) | D (Particulares) | Website para um particular | Mencionado genericamente | P3 |
| 22 | Livro de Reclamações Eletrónico | DL 156/2005, na redação do DL 74/2017 e posteriores: formato eletrónico para quem presta serviços "através de meios digitais" e acesso destacado no site ([AMT](https://www.amt-autoridade.pt/media/2053/manual_utilizacao_icone_lre.pdf), [ERS](https://ers.pt/media/fuam0eaw/alerta_supervisao_05_2024_lre.pdf)); o regime dirige-se a quem tem contacto com o público / consumidores ([DRE consolidado](https://diariodarepublica.pt/dr/legislacao-consolidada/decreto-lei/2005-34431675)) | D | **Se** aceitarem Particulares. Só B2B: provavelmente não obrigatório [A CONFIRMAR com a DGC/ASAE] | Falta | P2 |
| 23 | Informação sobre RAL | Lei 144/2015, art. 18.º, na redação do DL 102/2017: só as entidades a que o profissional está vinculado ([APCMC](https://apcmc.pt/legislacao/resolucao-alternativa-litigios-ral-dispensa-informacao-aos-consumidores-2/)); arbitragem necessária a pedido do consumidor até à alçada da 1.ª instância (5 000 €), Lei 24/96, art. 14.º, na redação da Lei 63/2019 ([DRE](https://diariodarepublica.pt/dr/detalhe/lei/63-2019-123962147)) | D (Particulares) | No site e no contrato | Contrato: CICAP; site: nada | P2 |
| 24 | Ligação à plataforma ODR | Reg. (UE) 524/2013, revogado pelo Reg. (UE) 2024/3228 com efeitos a 20/07/2025 ([EUR-Lex](https://eur-lex.europa.eu/eli/reg/2024/3228/oj/eng)) | **N/A** | — | Correto (não existe) | — |
| 25 | Juros de mora e indemnização | DL 62/2013 (mínimo de 40 € por custos de cobrança); taxas no 2.º semestre de 2026: 10,40% (DL 62/2013) e 9,40% (Código Comercial, art. 102.º, § 3.º), Aviso n.º 16623/2026/2 ([APCMC](https://apcmc.pt/legislacao/juros-de-mora-comerciais-2-o-semestre-2026/)); Particulares: juro legal civil [Portaria 291/2003, 4% — A CONFIRMAR] | O (se cobrados) | Cl. 7 | Correto | — |
| 26 | Menções obrigatórias na fatura e isenção | CIVA, art. 36.º, n.º 5, al. e); art. 53.º (DL 35/2025) | O | Cada fatura | Modelo falta | P2 |
| 27 | Refaturação do domínio | CIVA, art. 16.º, n.º 6, al. c): fica fora do valor tributável só se for pago "em nome e por conta" do cliente, com fatura do registador em nome do cliente e registo em conta de terceiros ([AT, inf. 17558](https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/informacoes_vinculativas/despesa/civa/Documents/Vinculativa_17558.pdf), [OCC](https://occ.pt/pt-pt/noticias/iva-debito-de-despesas)) | D | Se a nevima pagar o domínio pelo cliente | Por decidir | P2 |
| 28 | Publicidade e alegações | DL 57/2008 (práticas comerciais desleais); Código da Publicidade [artigos A CONFIRMAR] | O | Afirmações do site (C2–C6, C10) | **Incumprido** | P1 |
| 29 | Propriedade intelectual e cessão | CDADC, art. 14.º (obra por encomenda: titularidade conforme o convencionado; na falta, presume-se do criador — [DRE consolidado](https://diariodarepublica.pt/dr/legislacao-consolidada/lei/1985-34436175)); direitos morais inalienáveis [art. 56.º A CONFIRMAR]; forma da transmissão [arts. 43.º e 44.º A CONFIRMAR]; software por encomenda: os direitos são do destinatário, salvo estipulação em contrário (DL 252/94, art. 3.º, n.º 3 — [TRC](https://trc.pt/?p=35940), [DRE](https://diariodarepublica.pt/dr/detalhe/decreto-lei/252-1994-625995)) | O | Cl. 17 | Existe, com lacunas (secção 8) | P2 |
| 30 | Obras feitas com IA | CDADC, arts. 1.º, 2.º e 11.º: só há obra protegida com criação intelectual humana e original; a proteção depende do grau de intervenção humana (doutrina — [Cuatrecasas](https://www.cuatrecasas.com/pt/portugal/propriedade-intelectual/art/arte-sem-artista)) | O (informar) | Logótipos, textos e traduções feitos com IA | **Não tratado** | P2 |
| 31 | Direito de imagem | CC, art. 79.º [texto A CONFIRMAR]; RGPD (a imagem de uma pessoa identificável é um dado pessoal) | O | Sessão fotográfica | Modelo prometido na cl. 10.5; falta | P2 |
| 32 | AI Act: literacia em IA | Reg. (UE) 2024/1689, art. 4.º (aplicável desde 02/02/2025 [A CONFIRMAR]) | O | A nevima é "responsável pela implantação" (usa IA profissionalmente) | Falta prova | P2 |
| 33 | AI Act: transparência | Art. 50.º, aplicável desde 02/08/2026; o Digital Omnibus (Reg. (UE) 2026/1744 [A CONFIRMAR]) não o adiou, salvo o período de graça do n.º 2 ([Cooley](https://cdp.cooley.com/digital-ai-omnibus-delays-key-deadlines-introduces-new-rules/)) | D | Só para chatbots, deepfakes e texto de IA publicado para informar o público sobre matérias de interesse público. **Não** se aplica a logótipos nem a textos de marketing revistos por humanos | N/A em geral | — |
| 34 | Política de utilização de IA | Sem obrigação; transparência; evita práticas enganosas | R | — | Falta (o FAQ já diz que usam IA) | P2 |
| 35 | Acessibilidade | DL 82/2022 (Diretiva 2019/882), em vigor para serviços a partir de 28/06/2025; os serviços listados (incluindo comércio eletrónico) excluem as microempresas ([Garrigues](https://www.garrigues.com/pt/pt-PT/news/primeiro-prazo-do-novo-regime-juridico-da-acessibilidade-termina-em-junho-2025-com-novas), [MLGTS](https://www.mlgts.pt/en/knowledge/legal-alerts/Legal-Alert-Legal-framework-for-accessibility-what-will-change-from-28-June-onwards/26173)) [artigo da isenção A CONFIRMAR] | N/A para o site da nevima; R (WCAG 2.2 AA) | Clientes com loja online que não sejam microempresas podem estar obrigados | — | P3 |
| 36 | DSA: estatuto de alojamento | Reg. (UE) 2022/2065; execução pela Lei 12-A/2026, com a ANACOM como Coordenador dos Serviços Digitais ([PwC](https://www.pwc.pt/pt/servicos/legal/legal-flash/nova-lei-aplicavel-servicos-digitais-portugal.html), [MLGTS](https://www.mlgts.pt/pt/conhecimento/legal-alerts/Legal-Alert-Execucao-do-Regulamento-dos-Servicos-Digitais-na-Ordem-Juridica-Portuguesa-Lei-n-12/26856/)). O art. 16.º (notificação e ação) aplica-se a todos os alojamentos; a isenção para micro e pequenas empresas (art. 19.º) só cobre as plataformas ([sota.io](https://sota.io/blog/eu-digital-services-act-2024-hosting-provider-developer-guide)) | D | Se a nevima for um "serviço de alojamento" para os sites dos clientes (secção 8) | Não tratado | P3 |
| 37 | Domínios .pt | Regras de Registo .pt de 2026 (titular e entidade gestora; verificação; remoção) ([pt.pt](https://www.pt.pt/fotos/editor2/pt_regras_registo_2026.pdf)) | O (para quem regista) | Se a nevima registar por conta do cliente | Cl. 13 pendente | P2 |
| 38 | Domínios .studio | Registo da Identity Digital, aberto ([IANA](https://www.iana.org/domains/root/db/studio.html)); exatidão dos dados do titular (ICANN RAA) [A CONFIRMAR] | O (para quem regista) | Idem | — | P3 |
| 39 | Segurança do site | RGPD, art. 32.º | R | Cabeçalhos de segurança ausentes em `next.config.ts` | Falta | P3 |
| 40 | Marca "nevima" | Código da Propriedade Industrial (registo no INPI) | R | — | Desconhecido | P3 |

---

## 6. Mapa de dados pessoais (o que o código faz hoje)

### 6.1 No site da nevima (vocês são responsáveis conjuntos)

| # | Fluxo | Dados | Onde | Finalidade | Base de licitude | Conservação | Subcontratantes / transferências |
|---|---|---|---|---|---|---|---|
| D1 | **Estimador** (`POST /api/estimate`) | Respostas: serviços, setor, país, cidade da sessão, URLs de referência, URL do site atual, texto livre ("outro setor", "outra língua"). **Sem** nome, email, telefone ou IP no registo | Registo do servidor `[nevima:simulation]` (`deliver.ts`) nos logs da Vercel | Calcular a estimativa; estatística interna | Art. 6.º, n.º 1, al. f) (interesse legítimo). A maioria das respostas não é dado pessoal; o texto livre e o URL podem identificar um empresário em nome individual | Logs da Vercel em Pro: **1 dia** ([Vercel](https://vercel.com/docs/functions/logs)) | Vercel Inc. (EUA, DPF + cláusulas-tipo) |
| D2 | **Pedido de proposta** (`POST /api/proposal`) | Nome, email, telefone, empresa, mensagem livre, respostas, língua | O servidor **não entrega** (`deliverRequest` devolve `false`); regista as respostas **sem** os contactos; o visitante envia por **mailto** a partir do seu programa de email → caixa `ola@nevima.pt` (Google Workspace) | Preparar e enviar a Proposta | Art. 6.º, n.º 1, al. b) (diligências pré-contratuais a pedido do titular). **Não** o consentimento | **Por definir** (pergunta 9.8) | Google (Workspace); Vercel (só as respostas); o fornecedor de email do próprio visitante |
| D3 | **Formulário de parceiros** (`POST /api/partner`) | Idem (empresa de desenvolvimento), mais tipo de projeto, prazos, NDA | Igual ao D2 | Contacto comercial B2B | Art. 6.º, n.º 1, al. b) ou f) | Por definir | Idem |
| D4 | **Contactos diretos** (ligações mailto no rodapé e no FAQ) | O que a pessoa escrever | Google Workspace | Responder | Art. 6.º, n.º 1, al. b) ou f) | Por definir | Google |
| D5 | **Limitação de pedidos** (`guard.ts`) | IP (`x-forwarded-for`) | Memória do servidor, 10–15 min, não persistido | Segurança e antiabuso | Art. 6.º, n.º 1, al. f) | Minutos | Vercel |
| D6 | **Registos da plataforma** | IP, data e hora, caminho, user agent | Vercel | Funcionamento e segurança | Art. 6.º, n.º 1, al. f) | Conforme a Vercel [A CONFIRMAR para os pedidos ao CDN] | Vercel |
| D7 | **Armazenamento no navegador** | `sessionStorage`: `nevima:return`, `nevima:restore`, `nevima:opened`, `nevima:lang-spot`; `localStorage`: `nevima:footer-still` | Navegador | Voltar ao mesmo sítio depois do portefólio e da mudança de língua; não repetir a abertura na mesma sessão; lembrar o "Parar movimento" que o visitante pediu | Isento de consentimento: estritamente necessário a um serviço pedido pelo utilizador (Lei 41/2004, art. 5.º, n.º 2 [A CONFIRMAR]); o WP29 Parecer 04/2012 (WP194) trata as preferências de interface pedidas pelo utilizador como isentas [A CONFIRMAR] | Sessão / até o visitante desligar | — |
| D8 | **Imagens de terceiros** | O navegador envia o **IP e o user agent à Unsplash** ao carregar `images.unsplash.com` (cartões dos serviços) e `unsplash.com/photos/…/download` (portefólio) | Servidores da Unsplash | — (é só uma imagem) | Sem base própria; é evitável | — | Unsplash [sede e cookies A CONFIRMAR] |
| D9 | **Tipos de letra** | Nenhum: `next/font` descarrega as fontes Google no build e serve-as a partir do próprio domínio [A CONFIRMAR no build] | — | — | — | — | — |
| D10 | **Portefólio** | Nome dos clientes (Bsmartish, Estamento de Gerona) e URL do site | Código | Mostrar trabalho | Art. 6.º, n.º 1, al. f); a cl. 16 permite recusar | Enquanto se mantiver | — |
| D11 | **Fotos dos sócios** | Imagem dos dois | `public/cofounders` | Apresentação | Dados dos próprios | — | — |

**Não existe hoje:** cookies, analytics, píxeis, mapas, vídeos incorporados, Google Fonts em tempo real, chat ou newsletter no site da nevima. A pré-visualização em `iframe` dos sites dos clientes (`site-preview.tsx`) e a página de projeto (`project-page.tsx`) **não têm rota publicada**. Quando tiverem, o `iframe` carrega o site do cliente, com os cookies dele.

### 6.2 Fora do site (atividade com clientes)

| # | Fluxo | Dados | Papel da nevima | Base / instrumento | Conservação proposta | Terceiros |
|---|---|---|---|---|---|---|
| D12 | Contrato e Proposta | Nome, NIF, morada, email, telefone, representante, assinatura (Chave Móvel Digital), IBAN | Responsável | Art. 6.º, n.º 1, al. b) | Duração do contrato + prazo de prescrição [A DECIDIR, ver 9.8] | Google (email), AMA (Chave Móvel Digital) |
| D13 | Faturação | Idem | Responsável | Art. 6.º, n.º 1, al. c) (obrigação legal) | Prazo fiscal [10 anos? A CONFIRMAR] | Portal das Finanças (AT) |
| D14 | Materiais do cliente | Textos e fotos, que podem conter dados de terceiros (equipa, clientes do cliente) | **Subcontratante** do cliente | Art. 28.º (Parte IV) | Até à entrega + prazo curto | Google, **ferramentas de IA** |
| D15 | Alojamento dos sites dos clientes | Registos técnicos dos visitantes | Subcontratante | Parte IV | Enquanto durar o alojamento | Vercel |
| D16 | Formulários dos sites dos clientes | Mensagens dos visitantes | Subcontratante | Parte IV | Não guardadas (a confirmar no código) | **Fornecedor de envio de email por identificar** |
| D17 | Newsletter, emails automáticos, marcações (se avançarem) | Emails, horários, nomes | Subcontratante | Parte IV, a completar | — | **Por identificar** |
| D18 | Sessão fotográfica | Imagem de pessoas | Subcontratante (para o cliente); **responsável** se usarem as fotos no vosso portefólio | Art. 28.º + art. 79.º CC + autorização específica para o portefólio | — | — |
| D19 | **IA (Claude, tradução)** | Textos do cliente, por vezes com dados pessoais | Subcontratante; a ferramenta de IA é subcontratante ulterior | Exige um DPA com o fornecedor de IA e um plano sem treino com os dados | — | Anthropic (EUA) [plano e DPA A CONFIRMAR]; ferramenta de tradução [A IDENTIFICAR] |

---

## 7. Riscos e lacunas no site atual

| # | Lacuna | Onde | Gravidade | O que proponho (Fase 3) |
|---|---|---|---|---|
| R1 | Sem Política de Privacidade; a ligação aponta para `#privacy-policy` | `proposal-steps.tsx:1355` | Alta | Página `/privacidade` (PT) e `/privacy` (EN) e ligação real |
| R2 | Consentimento imposto como condição de envio | `proposal-steps.tsx:1333-1366`; `validate.ts` (`consent !== true` → erro) | Alta | Aviso informativo sem caixa; uma caixa opcional de marketing só se houver marketing (hoje não há) |
| R3 | Nenhuma identificação do prestador | Rodapé | Alta | Página "Aviso legal" + linha no rodapé |
| R4 | Promessas comerciais contrárias ao contrato | `about-faq.tsx`, `services.ts`, `web-design.tsx`, `process.tsx`, `comparison.tsx` | Alta | **Não altero sem a tua aprovação**: a cópia é vossa (CLAUDE.md). Proponho os textos na Fase 3 |
| R5 | Imagens servidas pela Unsplash (envio de IP a terceiros) | `services.ts:34`, `work.ts:120` | Média | Descarregar as imagens (a licença da Unsplash permite usá-las sem a API) e servi-las do próprio site |
| R6 | Envio de pedidos por desligar; tudo vai por mailto | `deliver.ts` | Média | A política descreve o fluxo real (email); quando houver fornecedor, atualiza-se |
| R7 | Campos obrigatórios "Empresa" e "Telefone" | `validate.ts:212-214` | Média | "Empresa" obrigatório exclui particulares (coerente se só aceitarem B2B). O telefone obrigatório é discutível em termos de minimização. **Não altero sem decisão** (pergunta 9.2) |
| R8 | Texto livre nos logs (outro setor, cidade, URLs) | `estimate/route.ts` → `recordSimulation` | Baixa | Manter (retenção de 1 dia) e documentar; em alternativa, não registar o texto livre |
| R9 | Sem cabeçalhos de segurança (HSTS, CSP, frame-ancestors, Referrer-Policy, Permissions-Policy) | `next.config.ts` | Média | Acrescentar `headers()` sem partir o site (testado em build) |
| R10 | Sem `robots.txt` nem reserva de mineração de texto e dados | `src/app` | Baixa | `robots.ts` com a reserva, se a quiserem |
| R11 | `metadataBase` aponta para nevima.pt; o email é @nevima.pt | `layout.tsx:42`, 5 ficheiros | Média | Depende da pergunta 9.3 |
| R12 | Clientes no portefólio sem autorização documentada | `work.ts` | Média | Confirmar a autorização escrita (cl. 16), sobretudo para um projeto "em produção" |
| R13 | Contrato a 9,4 pt | `contrato-nevima.html:65` | **Alta** | Subir para 11 pt e espaçamento 1,2 (quatro mudanças de CSS; o contrato fica mais longo) |
| R14 | Página About com textos e números provisórios (`robots: noindex`) | `about/page.tsx:10-13` | Média | O `noindex` não impede visitas: números provisórios publicados contam como alegações (DL 57/2008). Confirmar se ainda lá estão |

---

## 8. Onde a vossa situação é arriscada, e onde é preciso advogado

**Riscos reais, por ordem:**
1. **Responsabilidade pessoal ilimitada** (secção 3). Mitigação: um limite contratual válido e um seguro de responsabilidade civil profissional. A prazo, uma Lda.
2. **Cláusulas de "retenção" e de "preço total"** (cl. 7.4 b), 8.3, 10.6 e 21.2). Exigir o preço total quando o trabalho não foi feito, ou ficar com 25% quando nada começou, pode ser visto como cláusula penal desproporcionada. Entre empresários é uma proibição relativa (art. 19.º, al. c) [A CONFIRMAR]): o tribunal pondera; não é nulidade automática. Com consumidores, a fórmula "na medida em que a lei o permita" não é transparente.
3. **Limitação de responsabilidade (cl. 22).** Exclui bem o dolo e a culpa grave, mas **não exclui os danos à vida, à integridade física e à saúde**, que não podem ser limitados (DL 446/85, art. 18.º, al. a) [A CONFIRMAR]). Isto conta numa sessão fotográfica no local. Fácil de corrigir.
4. **Propriedade intelectual com IA (cl. 17).** **Novo, confirmado no DRE:** a transmissão parcial de direitos de autor exige documento escrito com reconhecimento notarial das assinaturas, e a total exige escritura pública, ambas sob pena de nulidade (CDADC, arts. 43.º, n.º 2, e 44.º). A cl. 17.1 apoia-se no art. 14.º (titularidade convencionada na obra por encomenda, que não é transmissão), mas, como só atribui os direitos ao Cliente "a partir do pagamento integral", pode ser lida como transmissão diferida. É o ponto mais urgente para o advogado. Prometem "direitos patrimoniais de autor" sobre obras que podem não ter proteção se a contribuição humana for mínima. Correção: informar, ceder "os direitos que existam" e garantir apenas o que controlam (não infração a vosso conhecimento, revisão humana). Há outro ponto: no software por encomenda, a lei dá os direitos ao **destinatário** salvo estipulação em contrário (DL 252/94, art. 3.º, n.º 3). A reserva de componentes genéricos (cl. 17.3) tem de ser explícita, e já está. A forma escrita da transmissão (CDADC, arts. 43.º e 44.º) também tem de ser verificada [A CONFIRMAR].
5. **Alojar sites de clientes.** Implica disponibilidade, violações de dados, conteúdos ilícitos de terceiros (DSA) e dependência de uma única conta Vercel. Se a conta Pro for suspensa, todos os sites caem. A política de uso justo e os termos da Vercel sobre alojar sites de terceiros numa equipa Pro ficam **[A CONFIRMAR]**: não os consegui ler ([docs do plano Pro](https://vercel.com/docs/plans/pro-plan)).
6. **Promessas públicas** (secção 2): o risco mais fácil de eliminar.
7. **Dados de clientes nas ferramentas de IA** sem DPA (D19).

**Pontos que, na minha avaliação, exigem advogado** (por esta ordem):
- (a) **Cl. 7, 8.3, 10.6, 21 e 22**: cláusulas penais e limite de responsabilidade em CCG, B2B e B2C. É onde está o dinheiro e onde um tribunal pode anular.
- (b) **Cl. 17 (cessão de direitos)**: forma, obras com IA, software e direitos morais.
- (c) **Estrutura entre os dois sócios**: solidariedade, sociedade civil de facto e fiscalidade da faturação partilhada (com contabilista).
- (d) **Clientes fora da UE (EUA)**: a escolha de lei e foro e a execução de uma sentença portuguesa nos EUA.
Os restantes documentos (privacidade, cookies, aviso legal, acordo de subcontratação, termos de alojamento) consigo prepará-los com rigor suficiente para publicar, com os [A CONFIRMAR] fechados.

---

## 9. Perguntas em aberto (só as que bloqueiam decisões legais)

Cada pergunta tem uma **resposta por omissão**. Se concordares com todas, basta dizeres "aprovo as omissões".

**A. Base de trabalho**
- **9.1 Versão do contrato.** Os documentos alinham pela **v1.8** (repositório), não pela v1.5 que enviaste? → *Omissão: v1.8.*

**B. Clientes e mercados**
- **9.2 Particulares.** Aceitam consumidores? → *Omissão: sim, **só em Portugal**; fora de Portugal, só profissionais. Consequências: registar no Livro de Reclamações Eletrónico e pôr o ícone no site; RAL no site (CICAP e a entidade que fizer sentido [A CONFIRMAR a área territorial do CICAP]); o campo "Empresa" passa a "Empresa (se aplicável)" ou mantém-se obrigatório, conforme decidirem.*

**C. Identificação**
- **9.3 Domínio e email oficiais.** → *Omissão: **nevima.studio** e **ola@nevima.studio** em todo o site; nevima.pt redireciona. Corrijo os 5 ficheiros e o `metadataBase` (é uma correção de contacto, não de copy).*
- **9.4 Morada publicada.** A lei exige uma morada geográfica. → *Omissão: uma morada profissional comum, se existir; até lá, placeholder `[MORADA PROFISSIONAL]` e não publicamos as páginas sem ela. Preciso também de `[NIF_ANTONIO]`, `[NIF_EMANUEL]` e de saber se publicam um telefone.*

**D. Promessas do site** (estas exigem alterar copy vossa)
- **9.5 Alinhar o site com o contrato**: alojamento (C2), alterações pequenas (C3), domínio existente (C4), páginas legais (C5), tradução e 95% (C6), SEO "garante" (C10) e fotografias (C11). → *Omissão: o contrato prevalece. Proponho na Fase 3 os textos novos, em PT e EN, para aprovares antes de os aplicar. O desconto do domínio no simulador (C4) é lógica de preços: só sinalizo.*

**E. Fornecedores e dados**
- **9.6 Banner de cookies.** Hoje não há nada não essencial. → *Omissão: construir o gestor de consentimento (categorias, guardar a escolha, "Preferências de cookies" no rodapé, bloqueio de scripts até haver consentimento), mas **sem mostrar banner enquanto não houver nenhuma categoria não essencial**. Um banner sem nada para recusar seria enganador e atrito inútil. Liga-se sozinho no dia em que entrar analytics.*
- **9.7 Fornecedores por identificar.** (a) Serviço de envio de email dos formulários dos clientes; (b) newsletter, emails automáticos e marcações vão mesmo ser oferecidos (C8)? Com que ferramentas? (c) Que ferramenta de tradução por IA? (d) Usam o Claude num plano com contrato de tratamento de dados e sem treino com os vossos dados (Team, Enterprise ou API), ou num plano pessoal? → *Omissão: a lista de subcontratantes fica com Vercel, Google e Anthropic, mais `[FORNECEDOR_EMAIL_FORMULARIOS]` e `[FERRAMENTA_TRADUCAO]`; newsletter e marcações ficam fora do acordo até as escolherem; regra interna de não pôr dados pessoais de terceiros na IA sem necessidade.*
- **9.8 Prazos de conservação.** → *Omissão:*
  - *pedidos de proposta não convertidos: **12 meses** após o último contacto;*
  - *dados de clientes: duração do contrato + **10 anos** (faturas: o prazo fiscal [A CONFIRMAR]);*
  - *logs: os da Vercel (1 dia);*
  - *candidaturas e contactos de parceiros: 12 meses.*
- **9.9 Destino dos pedidos de proposta** (`deliver.ts` desligado). → *Omissão: a política descreve o fluxo atual (email do próprio visitante → Google Workspace). Quando ligarem um fornecedor, atualiza-se. Não ligo nada agora: não é conformidade, é funcionalidade.*

**F. IVA e faturação**
- **9.10 Quando o IVA passar a aplicar-se.** → *Omissão:*
  - *profissionais: "aos preços acresce IVA à taxa legal quando o prestador que fatura o serviço não estiver isento";*
  - *Particulares: o preço da Proposta é o preço final; se um prestador deixar de estar isento a meio do contrato, o preço contratado não muda.*
  *Sem contradição entre os documentos.*
- **9.11 Domínio pago pela nevima.** → *Omissão: é possível, mas só como "despesa em nome e por conta do cliente": registo e fatura do registador **em nome do cliente**, refaturação sem margem e em conta de terceiros (CIVA, art. 16.º, n.º 6, al. c)). A nevima fica como contacto técnico e nunca como titular. Confirmar com o contabilista o efeito no limiar do art. 53.º.*

**G. Serviços**
- **9.12 Sessão fotográfica.** Está no contrato e no estimador; trato-a como lançada (B15 incluído)? → *Omissão: sim.*

---

## 10. Documentos a produzir na Fase 2 (proposta ajustada)

| Doc | Decisão | Porquê |
|---|---|---|
| A1–A4, A7, A8 | Produzir (PT e EN) | Obrigatórios ou de baixo custo e alto valor |
| A3 Cookies | Produzir a política; banner conforme a pergunta 9.6 | Ver acima |
| A5 Livro de Reclamações / RAL | Produzir **só se** a pergunta 9.2 for "sim" | Só se aplica a consumidores |
| A6 Acessibilidade | Substituir por uma **nota de acessibilidade** voluntária (não uma "declaração" formal) | O DL 82/2022 não se aplica (microempresa, sem comércio eletrónico) |
| B9–B11 | **Não criar CCG novas de raiz.** As CCG já existem (contrato v1.8). Proponho alterações ao contrato (letra, cl. 17, cl. 22, IA, mercados), marcadas para os sócios decidirem | Evita dois textos contratuais em contradição |
| B12 | Rever a Parte IV em vez de criar outro acordo de subcontratação | Idem |
| B13, B14 | Documentos autónomos curtos, para os quais o contrato remete | Alojamento e manutenção continuam depois do projeto |
| B15 | Produzir | Ver a pergunta 9.12 |
| B16 | Produzir (texto para orçamento e fatura, com as duas hipóteses de IVA) | — |
| B17 | Produzir (com o acordo do art. 26.º entre os sócios) | Obrigatório |

---

## 11. Fontes consultadas

Oficiais ou primárias: [DRE, Lei 41/2004](https://diariodarepublica.pt/dr/detalhe/lei/41-2004-480710) · [DRE, Lei 46/2012](https://diariodarepublica.pt/dr/detalhe/lei/46-2012-174793) · [DRE, Lei 63/2019](https://diariodarepublica.pt/dr/detalhe/lei/63-2019-123962147) · [DRE, DL 156/2005 consolidado](https://diariodarepublica.pt/dr/legislacao-consolidada/decreto-lei/2005-34431675) · [DRE, CDADC consolidado](https://diariodarepublica.pt/dr/legislacao-consolidada/lei/1985-34436175) · [DRE, DL 252/94](https://diariodarepublica.pt/dr/detalhe/decreto-lei/252-1994-625995) · [EUR-Lex, Reg. 2024/3228](https://eur-lex.europa.eu/eli/reg/2024/3228/oj/eng) · [AT, informação vinculativa 17558](https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/informacoes_vinculativas/despesa/civa/Documents/Vinculativa_17558.pdf) · [AT, PIV 29266](https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/informacoes_vinculativas/despesa/civa/Documents/PIV_29266.pdf) · [AMT, ícone do Livro de Reclamações Eletrónico](https://www.amt-autoridade.pt/media/2053/manual_utilizacao_icone_lre.pdf) · [ERS, alerta 05/2024](https://ers.pt/media/fuam0eaw/alerta_supervisao_05_2024_lre.pdf) · [DNS.PT, Regras de Registo 2026](https://www.pt.pt/fotos/editor2/pt_regras_registo_2026.pdf) · [IANA, .studio](https://www.iana.org/domains/root/db/studio.html) · [Vercel, DPF](https://vercel.com/kb/guide/is-vercel-certified-under-dpf) · [Vercel, conformidade](https://vercel.com/docs/security/compliance) · [Vercel, logs](https://vercel.com/docs/functions/logs) · [Vercel, plano Pro](https://vercel.com/docs/plans/pro-plan) · [Unsplash, diretrizes da API](https://help.unsplash.com/api-guidelines/unsplash-api-guidelines)

Secundárias (doutrina, sociedades de advogados, associações): [PwC, Lei 12-A/2026](https://www.pwc.pt/pt/servicos/legal/legal-flash/nova-lei-aplicavel-servicos-digitais-portugal.html) · [PLMJ, Lei 12-A/2026](https://www.plmj.com/pt/conhecimento/notas-informativas/Digital-Services-Act-publicada-a-Lei-de-Execucao-em-Portugal/34521/) · [MLGTS, Lei 12-A/2026](https://www.mlgts.pt/pt/conhecimento/legal-alerts/Legal-Alert-Execucao-do-Regulamento-dos-Servicos-Digitais-na-Ordem-Juridica-Portuguesa-Lei-n-12/26856/) · [vLex, DL 7/2004](https://vlex.pt/vid/decreto-lei-n-7-1034385953) · [vLex, DL 24/2014](https://vlex.pt/vid/decreto-lei-n-24-908798341) · [vLex, DL 84/2021](https://vlex.pt/vid/decreto-lei-n-84-951213915) · [APCMC, RAL](https://apcmc.pt/legislacao/resolucao-alternativa-litigios-ral-dispensa-informacao-aos-consumidores-2/) · [APCMC, juros 2.º sem. 2026](https://apcmc.pt/legislacao/juros-de-mora-comerciais-2-o-semestre-2026/) · [Santander, art. 53.º](https://www.santander.pt/salto/isencao-iva) · [Vendus, art. 53.º](https://www.vendus.pt/blog/questoes-frequentes-53-civa/amp/) · [OCC, débito de despesas](https://occ.pt/pt-pt/noticias/iva-debito-de-despesas) · [Garrigues, acessibilidade](https://www.garrigues.com/pt/pt-PT/news/primeiro-prazo-do-novo-regime-juridico-da-acessibilidade-termina-em-junho-2025-com-novas) · [MLGTS, acessibilidade](https://www.mlgts.pt/en/knowledge/legal-alerts/Legal-Alert-Legal-framework-for-accessibility-what-will-change-from-28-June-onwards/26173) · [MLGTS, DL 84/2021](https://www.mlgts.pt/xms/files/site_2018/Newsletters/2021/Direitos_do_consumidor_na_compra_e_venda_de_bens_moveis_e_imoveis_e_de_conteudos_e_servicos_digitais_-_Legal_Alert.pdf) · [idealista, letra 11](https://www.idealista.pt/news/node/48642) · [CMS, CCG](https://cms.law/en/prt/publication/meet-the-law-alteracao-ao-regime-juridico-das-clausulas-contratuais-gerais) · [Garrigues, DL 109-G/2021](https://www.garrigues.com/sites/default/files/noticias/files/decreto-lei_109-g_2021_implicacoes_no_seu_negocio_e_os_novos_direitos_dos_consumidores.pdf) · [TRC, cláusula penal em CCG](https://trc.pt/clausulas-contratuais-gerais-clausula-penal-desproporcionalidade-nulidade-e-exclusao/) · [TRC, programa de computador](https://trc.pt/?p=35940) · [Cuatrecasas, IA e autoria](https://www.cuatrecasas.com/pt/portugal/propriedade-intelectual/art/arte-sem-artista) · [Cooley, Digital Omnibus](https://cdp.cooley.com/digital-ai-omnibus-delays-key-deadlines-introduces-new-rules/) · [HLC, Latombe](https://www.hlc.com/en/publications/transatlantic-data-transfers-eu-general-court-upholds-dat-privacy-framework) · [EDPL, Latombe](https://edpl.lexxion.eu/article/EDPL/2026/1/15) · [PLMJ, Planet49](https://www.plmj.com/xms/files/03_Novidades_legislativas/2019/010_outubro/NI_Cookies-Decisao_do_TJUE_fornece_orientacoes_uteis.pdf) · [Jackson Lewis, CCPA](https://www.jacksonlewis.com/insights/navigating-california-consumer-privacy-act-30-essential-faqs-covered-businesses-including-clarifying-regulations-effective-1126) · [Pammer/Alpenhof](https://en.wikipedia.org/wiki/Pammer_and_Alpenhof_cases) · [informador.pt, CC art. 513.º](https://informador.pt/?p=156544) · [TRG, 19-05-2011](https://vlex.pt/vid/acordao-n-1585-10-1044240272) · [sota.io, DSA](https://sota.io/blog/eu-digital-services-act-2024-hosting-provider-developer-guide)


---

## 12. Verificação no texto oficial (19 de outubro de 2026)

Com o acesso aberto, li os textos consolidados no Diário da República (via ELI, versão em vigor a 19/10/2026) e o AI Act no EUR-Lex.

| Ponto | Resultado | Fonte |
|---|---|---|
| DL 7/2004, art. 10.º | **Confirmado**: nome, endereço geográfico e eletrónico, registos públicos, NIF. A Lei 12-A/2026 não o alterou. | DRE, DL 7/2004 consolidado |
| DL 7/2004, art. 30.º | **Confirmado**: os arts. 27.º a 29.º não se aplicam a contratos celebrados só por email | Idem |
| Lei 41/2004, art. 5.º | **Confirmado**: consentimento prévio; exceção para o estritamente necessário a um serviço pedido expressamente | DRE, Lei 41/2004 consolidada |
| DL 446/85, arts. 5.º, 6.º, 8.º, 11.º, 17.º a 21.º | **Confirmados**. Novo: art. 19.º, al. d) (ficções de aceitação; ver a cl. 11.13, "aceite 72 horas depois"); art. 21.º, al. d) e e) (indemnizações predeterminadas; "declara ter recebido e lido") | DRE, DL 446/85 consolidado |
| DL 446/85, art. 21.º, al. i) | **Confirmado** e já corrigido (contrato v1.10, 11 pt) | Idem |
| DL 57/2008, arts. 7.º e 9.º | **Confirmados**: ações e omissões enganosas | DRE, DL 57/2008 |
| CDADC, arts. 14.º, 43.º, 44.º, 56.º | **Confirmados**; ver a secção 8, risco 4 | DRE, CDADC consolidado |
| CDADC, art. 75.º, n.º 2, al. w) | **Confirmado**: a mineração de textos e dados é livre salvo reserva expressa "por meio de leitura ótica" | Idem |
| DL 252/94, art. 3.º, n.º 3 | **Confirmado e em vigor**: software por encomenda é do destinatário, salvo estipulação em contrário | DRE, DL 252/94 consolidado |
| Código Civil, arts. 79.º, 513.º, 980.º e 981.º | **Confirmados**. Novo: o contrato de sociedade civil não exige forma especial (art. 981.º), o que reforça o risco de sociedade de facto | DRE, Código Civil consolidado |
| Lei 58/2019, art. 16.º | **Confirmado**: 13 anos, para consentimento em serviços da sociedade da informação | DRE, Lei 58/2019 |
| DL 156/2005, art. 2.º, n.º 2 | **Confirmado**: o formato eletrónico abrange todos os prestadores, incluindo os que atuam só por meios digitais. Com particulares, é obrigatório | DRE, DL 156/2005 consolidado |
| Lei 144/2015, art. 18.º; Lei 24/96, art. 14.º | **Confirmados** (red. DL 102/2017 e Lei 63/2019) | DRE |
| DL 62/2013, art. 7.º | **Confirmado**: 40 € mínimos, sem interpelação | DRE, DL 62/2013 |
| Portaria 291/2003 | **Confirmada e em vigor**: juro legal civil de 4% | DRE |
| DL 82/2022, art. 2.º, n.º 5, al. b) | **Confirmado**: exclui as microempresas que prestam os serviços abrangidos | DRE, DL 82/2022 consolidado |
| Lei 49/2004 | **Revogada** pela Lei n.º 10/2024; a consulta jurídica já não é exclusiva | DRE; [Ordem dos Advogados](https://portal.oa.pt/ordem/regras-profissionais/regime-juridico-dos-atos-de-advogados-e-solicitadores-lei-n%C2%BA-102024-de-19-de-janeiro/lei-dos-actos-proprios-dos-advogados-lei-n%C2%BA-492004-de-24-de-agosto-revogado/) |
| AI Act, art. 4.º | **Confirmado** (literacia em IA) | EUR-Lex, Reg. (UE) 2024/1689 |

**Ainda por confirmar** (fontes bloqueadas ou que não carregaram): o art. 53.º do CIVA na redação do DL 35/2025; o art. 50.º e as datas do AI Act depois do Digital Omnibus; o art. 100.º do Código Comercial; os termos da Vercel para alojar sites de terceiros; a certificação DPF da Google; a área territorial do CICAP; as regras .pt de 2026 (prazo de 4 dias).

## 13. Decisões tomadas pelo utilizador (19/10/2026)

- **Base:** o contrato é sempre a versão mais recente (agora a v1.11).
- **Clientes:** particulares só em Portugal; o formulário pergunta "O website é para…".
- **Domínio e email:** nevima.studio e ola@nevima.studio.
- **Morada:** ainda por decidir; os documentos levam `[MORADA]`.
- **Alojamento:** "gratuito", sem prometer prazo.
- **Domínio dos clientes:** registado e pago pelo próprio cliente, numa conta sua (Hostinger, com partilha de acesso). O formulário mostra o custo só como referência.
- **Formulários, newsletter e emails dos clientes:** numa conta Brevo do cliente. **Marcações:** Cal.com gratuito.
- **Claude Pro:** sem dados pessoais de terceiros. **Higgsfield:** conforme o projeto, com autorização das pessoas e identificação de conteúdos realistas.
- **Conservação:** pedidos sem contrato, 3 meses; faturas, 10 anos.
- **Línguas:** português e inglês incluídos; 35 € por cada outra língua.
- **Cookies:** sem banner enquanto não houver nada não essencial; gestor pronto e preferências no rodapé.
- **Copy:** alinhada com o contrato (alterações pequenas, páginas legais, SEO, fotografias, tradução).

<!--
NOTA INTERNA (não publicar)
Pontos [A CONFIRMAR] desta auditoria, para fechar com acesso ao DRE/EUR-Lex:
- DL 7/2004: texto atual do art. 10.º (lista de elementos) e do art. 30.º; se a Lei 12-A/2026 o alterou e em quê.
- Lei 41/2004: texto consolidado do art. 5.º (n.º 2, exceções).
- DL 24/2014: arts. 4.º, 10.º, 15.º e 17.º, redação atual.
- DL 446/85: arts. 5.º, 6.º, 8.º, 11.º, 18.º, 19.º e 21.º (alíneas).
- DL 57/2008: artigos das ações enganosas.
- CDADC: arts. 43.º, 44.º e 56.º; artigo da exceção de mineração de texto e dados com reserva de direitos.
- DL 252/94: se ainda vigora (o WIPO Lex lista-o como "superseded").
- CIVA: art. 52.º (prazo de conservação); art. 53.º na redação do DL 35/2025.
- CC: arts. 79.º e 980.º; Código Comercial, art. 100.º.
- Portaria do juro legal civil (4%).
- Lei 58/2019, art. 16.º (13 anos).
- DL 156/2005: âmbito para prestadores sem estabelecimento que só servem profissionais.
- CICAP: área territorial atual (Regulamento Harmonizado 2026).
- Lei 49/2004 (atos próprios de advogados): vigência e redação.
- AI Act: art. 4.º (data), art. 50.º; número e data do Digital Omnibus (2026/1744).
- DL 82/2022: artigo da isenção das microempresas.
- Termos da Vercel: alojar sites de terceiros numa equipa Pro; retenção dos registos de pedidos ao CDN.
- Certificação DPF da Google LLC; termos e DPA da Anthropic para o plano usado.
- Regras .pt de 2026: leitura exata do prazo de "4 dias".
-->