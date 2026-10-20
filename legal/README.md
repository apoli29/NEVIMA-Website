# Documentos legais da nevima

Índice dos documentos, onde estão, o que falta da vossa parte e quando rever cada um. Atualizado a 20 de outubro de 2026.

**Atenção:** nada disto substitui um advogado. Os pontos que precisam mesmo de um estão na secção 3.

## 1. Índice

### No website (PT em `/pt/…`, EN na raiz)

| Documento | Página | Fonte no código | Versão |
|---|---|---|---|
| Política de Privacidade | `/privacy` | `src/lib/legal/privacy.ts` | 1.0 |
| Aviso legal | `/legal-notice` | `src/lib/legal/legal-notice.ts` | 1.0 |
| Política de Cookies | `/cookies` | `src/lib/legal/cookies.ts` | 1.0 |
| Termos de Utilização | `/terms` | `src/lib/legal/terms.ts` | 1.0 |
| Utilização de IA | `/ai` | `src/lib/legal/ai.ts` | 1.0 |
| Acessibilidade | `/accessibility` | `src/lib/legal/accessibility.ts` | 1.0 |
| Avisos nos formulários | formulário de proposta e de parceria | `src/components/proposal-steps.tsx` (`ContactScreen`) | — |
| Preferências de cookies | rodapé de todas as páginas | `src/lib/consent.ts`, `src/components/cookie-consent.tsx` | — |

Todas as páginas legais estão fora dos motores de busca (`noindex`) até a morada ser preenchida.

### Contratuais e internos (nesta pasta)

| Documento | Ficheiro | Para quem |
|---|---|---|
| Auditoria legal (Fase 1, verificada no texto oficial) | `00-auditoria-legal.md` | Sócios |
| Acordo de responsabilidade conjunta entre os sócios | `01-acordo-responsaveis-conjuntos.md` | Sócios (assinar) |
| Propostas de alteração ao contrato | `02-propostas-alteracao-contrato.md` | Sócios e advogado |
| Termos de Alojamento e Domínios | `03-termos-alojamento-dominios.md` | Clientes |
| Termos de Manutenção e Alterações | `04-termos-manutencao.md` | Clientes |
| Autorização de uso de imagem (modelo) | `05-autorizacao-uso-imagem.md` | Pessoas fotografadas, via cliente |
| Texto para orçamentos, propostas e faturas | `06-texto-orcamentos-faturas.md` | Sócios e contabilista |
| Política interna de dados e segurança | `07-politica-interna-dados-seguranca.md` | Sócios |
| Contrato de prestação de serviços | `../contratos/contrato-nevima.html` (v1.11, PDF ao lado) | Clientes |
| Decisões do contrato | `../docs/contract-decisions.md` | Sócios |

## 2. O que falta da vossa parte

**Dados a fornecer** (procurar por `[` nos ficheiros):
- `[MORADA]`: a morada a publicar no website e no contrato;
- `[MORADA_ANTONIO]`, `[MORADA_EMANUEL]`: os domicílios fiscais, no acordo entre os sócios e no contrato;
- **telefone**: obrigatório na informação pré-contratual com particulares (DL 24/2014, art. 4.º, n.º 1, al. a));
- `[FERRAMENTA_TRADUCAO]`: o nome da ferramenta de tradução por IA;
- `[VALOR_HORA]`, `[MINIMO]`: o preço por hora das alterações maiores;
- `[RESPONSAVEL_REGISTO]`, `[RESPONSAVEL_FORNECEDORES]`, `[RESPONSAVEL_APAGAMENTO]`: quem trata de cada tarefa;
- `[IBAN DO PRESTADOR]`: nos textos de faturação.

**Ações:**
1. Registar os dois prestadores no Livro de Reclamações Eletrónico (www.livroreclamacoes.pt). Depois disso, pôr o ícone no rodapé.
2. Assinar o acordo entre os sócios (`01`).
3. Verificar que os acordos de tratamento de dados da Vercel e da Google estão aceites (`07`, secção 2).
4. Desligar o treino nas duas contas Claude.
5. Pedir confirmação escrita à Vercel sobre alojar e cobrar sites de clientes no plano Pro (`02`, P5).
6. Obter a autorização escrita dos clientes já mostrados no portefólio (Bsmartish, Estamento de Gerona).
7. Decidir as propostas de alteração ao contrato (`02`) e levá-las ao advogado.
8. Decidir a reserva contra o treino de IA no `robots.txt` (bloquear os robôs de treino e manter os de pesquisa e respostas, importantes para o GEO).
9. Recomendado: seguro de responsabilidade civil profissional e registo da marca "nevima" no INPI.

## 3. Para o advogado e para o contabilista

**Advogado:**
1. Cl. 17: cessão de direitos de autor (CDADC, arts. 43.º e 44.º) e obras feitas com IA. O mais urgente.
2. Cl. 22 e 11.13, aceitação da Proposta: limite de responsabilidade, aceitação presumida, "declara ter recebido e lido".
3. Cl. 7.4 b), 8.3, 10.6, 21.2: cláusulas penais.
4. Relação entre os dois sócios: solidariedade e sociedade civil de facto (CC, arts. 980.º e 981.º).
5. Clientes nos EUA; termos da Vercel (revenda).

**Contabilista:**
1. IVA de cada sócio (art. 53.º do CIVA em vigor) e acompanhamento do limiar.
2. Clientes profissionais noutros países da UE: autoliquidação, VIES e declaração recapitulativa.
3. Clientes fora da UE.
4. Prazo de conservação dos documentos de cada um.

## 4. Pontos ainda por confirmar no texto oficial

- CIVA, art. 53.º, na redação do DL 35/2025.
- AI Act, art. 50.º, e as datas depois do Digital Omnibus.
- Código Comercial, art. 100.º (solidariedade).
- Certificação da Google no Data Privacy Framework (a lista oficial não carregou).
- Área territorial do CICAP (o domínio não abriu).
- Regras de registo .pt de 2026 (prazo de 4 dias).
- Isenção dos alojamentos micro no DSA (texto no EUR-Lex).

## 5. Calendário de revisão

| Documento | Quando rever |
|---|---|
| Política de Privacidade, Cookies, IA | Sempre que mudar um formulário, um fornecedor, uma ferramenta ou um prazo; no mínimo, uma vez por ano (outubro) |
| Aviso legal | Quando mudar a morada, a situação de IVA ou a estrutura (por exemplo, uma sociedade) |
| Termos de Utilização, Acessibilidade | Uma vez por ano |
| Contrato e termos de alojamento e manutenção | Depois de cada parecer do advogado; quando mudarem preços ou condições; no mínimo, uma vez por ano |
| Texto de faturas | Em janeiro de cada ano (limiar de IVA, taxas de juro de mora publicadas em janeiro e julho) |
| Política interna e acordo entre os sócios | Uma vez por ano (outubro) e sempre que houver uma violação de dados |
| Auditoria legal | Uma vez por ano, ou quando a atividade mudar (novo serviço, mercado ou ferramenta) |
