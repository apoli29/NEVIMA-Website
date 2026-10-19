# Política interna de proteção de dados e segurança

| | |
|---|---|
| Versão | 1.0 |
| Última atualização | 20 de outubro de 2026 |
| Uso | Interno, para os dois sócios. Junta o registo das atividades de tratamento (RGPD, art. 30.º), os procedimentos para violações de dados e para pedidos dos titulares, os prazos de conservação e as regras mínimas de segurança. Complementa o acordo entre os sócios (`legal/01`). |
| Revisão | Uma vez por ano e sempre que mudar um fornecedor, um formulário ou um prazo. Próxima: [DATA, outubro de 2027]. |

## Em linguagem simples

Isto é o que fazemos com os dados, escrito numa página, para não depender da memória. Se acontecer um problema (um email enviado à pessoa errada, uma conta invadida), a secção 4 diz o que fazer nas primeiras 72 horas.

## 1. Registo das atividades de tratamento (art. 30.º)

### 1.1 Como responsáveis (conjuntos)

Responsáveis: António Maria das Neves Sepúlveda de Sá Policarpo (NIF 255250371) e Emanuel Augusto Soares da Costa (NIF 275530671), ola@nevima.studio.

| Atividade | Titulares | Dados | Finalidade e fundamento | Destinatários | Fora da UE | Conservação |
|---|---|---|---|---|---|---|
| Website | Visitantes | IP, data, página, navegador | Funcionamento e segurança · art. 6.º, n.º 1, f) | Vercel | EUA (DPF) | 1 dia; 15 min em memória |
| Estimador | Visitantes | Respostas sem contactos | Estimativa · f) | Vercel | EUA (DPF) | 1 dia |
| Pedidos de proposta e parceria | Potenciais clientes | Nome, email, telefone, negócio, mensagem, respostas | Proposta · b) | Google | EUA (DPF ou cláusulas-tipo) | 3 meses sem contrato |
| Emails | Quem escreve | O que escrever | Responder · b) ou f) | Google | Idem | 3 meses sem contrato |
| Clientes | Clientes e representantes | Identificação, NIF, morada, contactos, assinatura, IBAN, comunicações | Contrato e faturação · b) e c) | Google; AT; contabilista [se existir] | Idem | 10 anos a contar do fim do ano da fatura |
| Materiais de projeto | Pessoas nos materiais | Textos e imagens | Execução do projeto · b) | Google; IA só sem dados pessoais | Idem | 12 meses após a entrega |
| Portefólio | Clientes; pessoas fotografadas com autorização | Nome do cliente, website, imagens | Mostrar trabalho · f); imagens de pessoas · a) | Público | — | Enquanto mostrado ou até oposição |

### 1.2 Como subcontratantes (por conta dos clientes)

| Atividade | Cliente (responsável) | Dados | Subcontratantes ulteriores | Instrumento |
|---|---|---|---|---|
| Alojamento dos websites | Cada cliente | Registos técnicos dos visitantes | Vercel | Parte IV do contrato |
| Formulários dos websites | Cada cliente | Mensagens dos visitantes (só em trânsito) | Vercel; conta Brevo do próprio cliente | Parte IV |
| Sessões fotográficas | Cada cliente | Imagens de pessoas | — | Parte IV + `legal/05` |
| Materiais com dados de terceiros | Cada cliente | Conforme o projeto | Só ferramentas com acordo de tratamento de dados | Parte IV |

## 2. Fornecedores e acordos de tratamento de dados

| Fornecedor | Para quê | Acordo de tratamento | Transferência | Estado |
|---|---|---|---|---|
| Vercel Inc. | Alojamento | DPA da Vercel (planos Pro e Enterprise) | DPF (certificada) + cláusulas-tipo | [VERIFICAR que está aceite na conta] |
| Google (Workspace) | Email | Cloud Data Processing Addendum (consola de administração) | DPF [A CONFIRMAR] ou cláusulas-tipo | [VERIFICAR que está aceite] |
| Anthropic (Claude Pro) | Design, código, textos | **Não há** no plano pessoal | — | Regra: sem dados pessoais de terceiros |
| [FERRAMENTA_TRADUCAO] | Traduções | [VERIFICAR] | [VERIFICAR] | Regra: sem dados pessoais de terceiros sem acordo |
| Higgsfield | Imagem, vídeo, 3D | [VERIFICAR] | [VERIFICAR] | Só com autorização das pessoas retratadas |

## 3. Segurança mínima (art. 32.º)

- [ ] Verificação em dois passos ativa nas contas Google, Vercel, GitHub, Hostinger, Anthropic e no banco.
- [ ] Gestor de palavras-passe; nenhuma palavra-passe partilhada por mensagem.
- [ ] Discos dos computadores cifrados (FileVault / BitLocker) e bloqueio de ecrã automático.
- [ ] Credenciais de clientes (chaves Brevo, acessos Hostinger) só nas definições da Vercel ou no gestor de palavras-passe, nunca no código nem no email.
- [ ] Treino desligado nas definições de privacidade das contas Claude.
- [ ] Acessos de clientes retirados no fim de cada projeto em que já não sejam precisos.

## 4. Violação de dados (arts. 33.º e 34.º)

Uma violação é qualquer perda, divulgação ou acesso indevido a dados pessoais: um email com dados enviado à pessoa errada, uma conta invadida, um portátil perdido sem cifra.

1. **Hora 0, quem deteta:** contém o problema (muda a palavra-passe, revoga o acesso, pede ao destinatário que apague) e avisa o outro sócio de imediato.
2. **Até 24 h, os dois:** registam o que aconteceu (data, dados, pessoas afetadas, causa, medidas) na secção 6.
3. **Até 72 h:** se houver risco para as pessoas, notificam a CNPD (formulário em www.cnpd.pt), com a natureza da violação, o número aproximado de pessoas e de registos, o contacto, as consequências prováveis e as medidas tomadas. Se faltar informação, notificam na mesma e completam depois.
4. **Se o risco for elevado:** avisam as pessoas afetadas, em linguagem simples, sem demora.
5. **Se os dados forem de um cliente (como subcontratantes):** avisam o cliente sem demora e, sempre que possível, em 48 horas (Parte IV, art. 3.5). É o cliente que notifica a CNPD.

## 5. Pedidos dos titulares (arts. 12.º e 15.º a 22.º)

1. O pedido chega a ola@nevima.studio (ou a qualquer um dos dois). Quem o vê regista-o na secção 6 no próprio dia e avisa o outro.
2. Se houver dúvida razoável sobre a identidade, pede-se uma confirmação simples (por exemplo, responder a partir do mesmo email). Não se pedem documentos sem necessidade.
3. Procuram-se os dados no email, nas pastas de projeto, na Vercel e na faturação.
4. **Resposta em 1 mês** a contar da receção (prolongável por mais 2 em pedidos complexos, avisando dentro do primeiro mês). É gratuita.
5. **Apagamento:** apaga-se tudo, exceto o que a lei obriga a guardar (faturas: 10 anos), e explica-se porquê.
6. **Pedido sobre o website de um cliente:** reencaminha-se ao cliente, que é o responsável, e ajuda-se a responder.

## 6. Registo de incidentes e pedidos

| Data | Tipo (violação / pedido) | Descrição | Decisão e ações | Fechado em |
|---|---|---|---|---|
| | | | | |

## 7. Calendário de conservação (trimestral, responsável: [RESPONSAVEL_APAGAMENTO])

- [ ] Apagar os pedidos de proposta e de parceria sem contrato com mais de 3 meses desde o último contacto (email e anexos).
- [ ] Apagar os materiais de projetos entregues há mais de 12 meses (sem apagar o contrato nem as faturas).
- [ ] Apagar as faturas e contratos com mais de 10 anos a contar do fim do ano em que foram emitidos.
- [ ] Rever as autorizações de imagem caducadas ou retiradas e retirar essas imagens do portefólio.

<!--
NOTA INTERNA (não publicar)
Bases legais: RGPD, arts. 5.º, 6.º, 12.º, 15.º a 22.º, 24.º, 26.º, 28.º, 30.º, 32.º, 33.º, 34.º; Lei 58/2019; CIVA, art. 52.º.
A preencher: [DATA], [RESPONSAVEL_APAGAMENTO], [FERRAMENTA_TRADUCAO], estado dos acordos ([VERIFICAR]).
-->
