# Auditoria de performance e formatação responsiva — nevima

Fase 1 (só análise). Nenhum ficheiro do site foi alterado: tudo o que aqui está vive em `audit/` (relatório, scripts de medição, experiências e evidências). Data: 2026-10-19. Build medido: `main` em `146eaee`.

---

## 0. Resumo

O site não está lento por causa do JavaScript nem das imagens. O problema principal é este: **em todas as páginas que têm botões em gota (`.cta-drop`), o browser repinta a página inteira em todos os frames, para sempre**, mesmo com tudo parado. Por cima disso, uma regra de CSS (`html:has([data-opening])`) faz o browser **recalcular o estilo dos ~1600 elementos da página** sempre que o React insere ou troca um nó: o título rotativo, os chips do "How we work", as linhas da comparação, a abertura… Isto dá tarefas de 70–200 ms que congelam a página.

Num telemóvel médio (CPU 6x mais lenta), as duas coisas juntas deixam o thread principal 84–99% ocupado em toda a home. Nenhuma animação pode correr a 60 fps assim. A página de serviço, que não tem gotas, é o grupo de controlo: 60 fps com o thread principal a 19%.

| | Base (CPU 6x) | Com as correções propostas (experiência, CPU 6x) |
|---|---|---|
| How we work, scroll | 40 fps, thread 87% ocupado, 689 ms de bloqueio | **60 fps**, 38%, 0 ms |
| How we work, toque num chip | 27 fps, 464 ms de latência | 52 fps, **160 ms** |
| Segundo ecrã parado | 43 fps, 94% | 59 fps, 52% |
| Comparação → rodapé | 35 fps, 785 ms de bloqueio | 59 fps, 0 ms |

As correções propostas não mudam nenhuma animação: mesmas durações, curvas, sequências e efeitos. A única com diferença mensurável em pixels é a "fusão" das gotas no compositor (lote 5): a diferença é um contorno subpixel na borda, invisível a olho nu (ver §2, P2), e fica sujeita à tua aprovação.

Na formatação: **não há overflow horizontal em nenhum tamanho** (320 a 2560, vertical e horizontal), nem imagens deformadas, nem `100vh`. Há dois problemas reais em ecrãs baixos. O ecrã fixo do "How we work" e o segundo ecrã não cabem em telemóveis pequenos (320×568, 360×640), em **qualquer telemóvel na horizontal** e em portáteis de 1024×600. O conteúdo fica cortado e é impossível lá chegar. Há também alguns alvos de toque abaixo dos 24 px.

---

## 1. Baseline — o que foi medido e como

### 1.1 Método

- **Build de produção**: `next build && next start` (nunca `next dev`).
- **Telemóvel emulado** (Playwright + Chrome DevTools Protocol): 412×915, DPR 2,625, toque, user-agent Android. CPU abrandada **4x** e **6x** (`Emulation.setCPUThrottlingRate`).
- **Scroll real com o dedo**: `Input.synthesizeScrollGesture` com `gestureSourceType: touch`, o que faz o compositor deslizar a página como um dedo faria. Os mesmos gestos, pela mesma ordem, em todas as corridas.
- **Em cada cenário recolhe-se**:
  - frames por `requestAnimationFrame` (fps, p95, % de frames >33 ms);
  - long tasks e latência das interações (Event Timing, base do INP);
  - layout shifts (CLS);
  - um trace do Chrome: tempo do thread principal por categoria (script, estilo, layout, paint, prepaint, layerize), número de repinturas e **quais os elementos repintados**.
- **Lighthouse 12** em modo mobile (simulação de 4G lento e CPU 4x), mediana de 3 corridas por rota.
- **Experiências "e se"**: CSS ou JS injetado em runtime pelo script de medição (`--inject`, `--init`), para pôr preço a cada correção antes de a fazer. O projeto não muda.

Scripts (repetíveis tal e qual na Fase 2):

| Script | Para quê |
|---|---|
| `audit/measure.mjs` | fps, thread principal, repinturas, long tasks, INP por cenário (`--cpu 4/6`, `--runs`, `--only`, `--inject`, `--init`, `--webgl on`) |
| `audit/summarise.mjs` | tabela de uma corrida, ou comparação antes → depois |
| `audit/lighthouse.mjs` | Lighthouse mobile por rota |
| `audit/responsive.mjs` | 12 tamanhos × 6 páginas: screenshots + verificações (overflow, texto <12 px, alvos de toque, imagens deformadas, texto cortado) |
| `audit/fit-check.mjs` | quanto dos dois ecrãs fixos fica cortado em cada tamanho |
| `audit/screens.mjs` | screenshots determinísticos (relógio congelado) e comparação pixel a pixel antes/depois |
| `audit/experiments/*` | as experiências usadas neste relatório |

As ferramentas (playwright-core, lighthouse) **não** foram instaladas no projeto: ficaram numa pasta fora do repositório, apontada por `AUDIT_TOOLS`. Para o build foi preciso `npm ci`, que só instala o que o `package-lock.json` já fixa. Nada foi acrescentado.

```bash
npm i --prefix ~/nevima-audit-tools playwright-core@1.56.1 lighthouse@12
npm run build && npm start &
AUDIT_TOOLS=~/nevima-audit-tools node audit/measure.mjs --cpu 6 --runs 2 --label baseline
AUDIT_TOOLS=~/nevima-audit-tools node audit/lighthouse.mjs --label baseline
```

### 1.2 Limites desta medição (o que exige o teu telemóvel)

1. **Sem GPU.** Este ambiente não tem placa gráfica, por isso o WebGL corre em software. Cada frame da água do segundo ecrã bloqueava o thread principal ~850 ms, o que não diz nada sobre um telemóvel. Por isso **as medições correm com o WebGL desligado** (`--webgl off`): os três canvases (água, lente do rodapé, valores do About) não arrancam e o que se mede é o custo de DOM/CSS/JS. Esse é fielmente modelado pelo abrandamento de CPU. **O custo WebGL tem de ser medido no telemóvel.**
2. **Rasterização.** O abrandamento de CPU só afeta o thread principal. A rasterização das repinturas, onde entram os filtros SVG das gotas, corre aqui em 4 núcleos rápidos sem abrandamento. Num telemóvel esse custo cai na GPU/nos threads de raster, que são lentos. Ou seja, **os números aqui são otimistas**: aqui o "How we work" faz ~40 fps a 6x, no teu telemóvel ~20 fps. Bate certo com isso.
3. **Toque.** Os gestos sintéticos não reproduzem a latência de um listener `touchmove` não-passivo (P5). O efeito desse problema não aparece aqui e tem de ser confirmado no telemóvel.
4. **Fotos do Unsplash.** As fotos dos serviços vêm de `images.unsplash.com`, que este ambiente não alcança. Nas medições foram substituídas por uma webp local de tamanho parecido (14 KB). No Lighthouse foram bloqueadas.
5. **O próprio medidor.** O medidor usa um loop de rAF para contar frames, o que mantém o browser a produzir frames. Isso explica parte do "custo residual" em repouso (~25%).

**Para verificar no teu telemóvel (Android + Chrome):** liga-o por USB com a depuração USB ativa, abre `chrome://inspect` no computador e escolhe o separador do site.
- *Rendering → Frame Rendering Stats*: mostra o fps real no ecrã do telemóvel.
- *Rendering → Paint flashing*: hoje a página pisca a verde sem parar, mesmo parada. Depois dos lotes 1–5 só deve piscar quando algo muda.
- *Performance → Record*: grava enquanto fazes scroll no "How we work", na água do segundo ecrã e no rodapé. Olha para a faixa "GPU" e para os frames vermelhos.

Num iPhone: Safari → Desenvolvimento → [iPhone] → Linhas temporais → *Rendering Frames*.

### 1.3 Números de base

**CPU 6x** (telemóvel médio/fraco), WebGL desligado, média de corridas (`audit/results/baseline-cpu6.json`):

| Cenário | fps (rAF) | p95 frame | frames >33 ms | thread principal ocupado | estilo ms/s | paint+prepaint+layerize ms/s | script ms/s | repinturas/s | bloqueio por long tasks | interação mais lenta |
|---|---|---|---|---|---|---|---|---|---|---|
| Abertura (toque → voo → cortina) | 49 | 33 ms | 1,8% | **98%** | 350 | 326 | 407 | 199 | **869 ms** | 360 ms |
| Segundo ecrã parado | 43 | 33 ms | 5,2% | **94%** | 254 | 457 | 136 | 410 | 355 ms | – |
| Gateway (o estúdio sobe) | 43 | 33 ms | 6,5% | 96% | 267 | 416 | 119 | 414 | 498 ms | 216 ms |
| Estúdio + serviços (scroll) | 44 | 33 ms | 5,3% | 99% | 264 | 428 | 109 | 394 | 552 ms | 128 ms |
| **How we work (scroll)** | **40** | 33 ms | 5,4% | **87%** | 236 | 368 | 108 | 378 | **689 ms** | 208 ms |
| How we work parado | 44 | 33 ms | 1,7% | **84%** | 211 | 421 | 78 | 416 | 196 ms | – |
| **How we work (4 toques nos chips)** | **28** | 117 ms | 14,1% | 94% | 315 | 346 | 134 | 286 | **1067 ms** | **464 ms** |
| Comparação → rodapé | 35 | 50 ms | 8,8% | 94% | 234 | 368 | 363 | 368 | 785 ms | 544 ms |
| About (scroll) | 60 | 17 ms | 0% | 66% | 98 | 345 | 74 | 361 | 0 | 48 ms |
| **Serviço SEO (scroll) — controlo** | **60** | 17 ms | 0% | **19%** | 19 | 8 | 66 | **0** | 0 | 32 ms |
| Portefólio parado | 60 | 17 ms | 0% | 31% | 57 | 135 | 38 | 181 | 0 | – |

O mesmo a **CPU 4x** está em `audit/results/baseline-cpu4.json`: How we work 54 fps com o thread a 72%, chips 45 fps com 320 ms de latência, segundo ecrã parado 69% ocupado.

**Lighthouse mobile** (mediana de 3, `audit/results/lighthouse-baseline.json`):

| Rota | Score | FCP | LCP | TBT | CLS | Speed Index | JS (transfer) | Total | DOM |
|---|---|---|---|---|---|---|---|---|---|
| `/` | 90 | 1,2 s | 3,3 s | 155 ms | 0 | 1,5 s | 237 KB | 422 KB | 967 |
| `/pt` | 90 | 1,2 s | 3,4 s | 141 ms | 0 | 1,5 s | 237 KB | 423 KB | 984 |
| `/about` | 76 | 1,2 s | 4,8 s | 307 ms | 0 | 1,7 s | 243 KB | 628 KB | 721 |
| `/services/seo` | 95 | 1,1 s | 2,8 s | 111 ms | 0 | 1,1 s | 242 KB | 591 KB | 300 |
| `/portfolio` | – | – | – | – | – | – | – | – | – |

- O portefólio dá `NO_FCP`: todo o conteúdo vem do servidor com `opacity:0` e só aparece depois de o JS arrancar (ver P12). No Playwright o FCP é de 336 ms.
- Na home, o Lighthouse aponta **10 animações não-compositadas**: todas são `background-position`/`background-size` das gotas e os brilhos do índice.
- No About, o elemento LCP é o parágrafo do manifesto, que é revelado por animação.

**JS por rota** (gzip): home 228 KB, about 234 KB, serviço 210 KB, portefólio 189 KB. Partilhado: react-dom 52 KB, next 45 KB, **motion 49 KB**, lenis+outros 30 KB. O Lighthouse estima ~46 KB de JS não usado na home.

**CLS**: 0 em todas as rotas, e 0 nos cenários de scroll.

---

## 2. Problemas encontrados

Legenda — Impacto: alto/médio/baixo. Risco visual: nenhum/baixo/médio. Esforço: baixo (<1 h), médio (meio dia), alto (>1 dia).

### P1 — `html:has([data-opening])` recalcula o estilo da página inteira a cada inserção
- **Onde:** `src/app/globals.css:105`.
- **Causa:** a regra serve para trancar o scroll antes da hidratação (comentário nas linhas 98–104). O `:has()` aplicado a `<html>` com um argumento que pode aparecer em qualquer ponto da árvore obriga o Chrome a reavaliar `<html>` sempre que há uma inserção em qualquer sítio. Cada reavaliação marca a raiz e recalcula o estilo de todos os descendentes. A regra fica ativa para sempre, não só durante a abertura.
- **Evidência:**
  - trace com *invalidation tracking* de um toque num chip: `HTML … Affected by :has()` → dois recálculos de **1624 e 1622 elementos (90 e 84 ms a CPU 4x)**;
  - as long tasks da abertura (155 + 255 ms a 4x) são quase só recálculo de estilo forçado;
  - experiência `no-html-has.js` (retira só esta regra depois do load), a CPU 6x:

| Cenário | bloqueio por long tasks | fps | latência dos chips |
|---|---|---|---|
| How we work, scroll | 689 → **0 ms** | 40 → 48 | |
| How we work, chips | 1067 → 187 ms | 28 → 41 | 464 → **232 ms** |
| Comparação → rodapé | 785 → **0 ms** | 35 → 48 | |
| Segundo ecrã parado | 355 → **0 ms** | 43 → 49 | |

- **Correção:** trocar a regra por uma classe em `<html>` (`html.nv-opening`), com exatamente as mesmas propriedades.
  - A classe é posta antes da primeira pintura por um `<script>` inline renderizado com a secção da abertura, no mesmo padrão do `LANG_SCRIPT` que já existe.
  - Um `useLayoutEffect` em `home.tsx` mantém-na certa: põe-na enquanto `phase !== "open"`, incluindo uma navegação do router para a home sem reload; tira-a quando a página é entregue ou quando a home sai.
- **Impacto:** alto. **Risco visual:** nenhum (a tranca é idêntica, desde o primeiro frame). **Esforço:** baixo.

### P2 — A "fusão" das gotas repinta a página inteira em todos os frames
- **Onde:** `src/app/globals.css:1146–1167` (`.cta-drop::before`) e `1180–1203` (`@keyframes cta-melt`); filtro em `src/components/cta-glass.tsx`. Usado em 7 componentes, 14 sítios. A gota branca do bar está **sempre** no ecrã.
- **Causa:** a fusão anima `background-position` e `background-size` de três gradientes, e isso só se anima repintando. O elemento ainda passa por um filtro SVG com 4 desfoques. Resultado em cada frame, sem fim:
  - recálculo de estilo das gotas;
  - **Paint do `#document` inteiro**, mais prepaint e layerize;
  - rasterização de novo do filtro para cada gota, incluindo as que estão fora do ecrã.
- **Evidência:**
  - nos traces, os elementos mais repintados em **todos** os cenários da home, do About e do portefólio são `::before` das `.cta-drop` (~4800 PaintImage em 4 s) e o `#document` (1 por frame, ~2 ms a 4x);
  - a página de serviço não tem gotas: **0 repinturas por segundo**;
  - o Lighthouse marca-as como animações não-compositadas ("Unsupported CSS Properties: background-position-x, background-position-y, background-size");
  - experiência `no-cta-melt.css` (tira só a fusão, mantém inclinação e respiração): How we work parado passa de 84% para 68% ocupado, e o paint de 421 para 221 ms/s.
- **Correção (sem mudar o aspeto):** fazer a fusão no compositor.
  - Os três "pontos" passam de gradientes de fundo de um pseudo-elemento a três `<span>` dentro de um elemento de vidro com o mesmo filtro, o mesmo `inset` e a mesma inclinação e respiração.
  - Cada ponto move-se por `transform` (translate + scale). Os keyframes são calculados a partir dos de `cta-melt`, com os mesmos 11 s, `ease-in-out`, `alternate`, e coincidem exatamente nos keyframes.
  - Com isto, o Chrome anima no compositor e o thread principal não repinta nada.
- **Protótipo testado** (`audit/experiments/compositor-melt.*`, injetado em runtime):
  - as gotas desaparecem da lista de repinturas: em repouso, 2085 → 344 paints em 4 s;
  - com P1: How we work 40 → 52 fps a 6x e chips 464 → 184 ms.
- **Comparação pixel a pixel**, nos mesmos instantes do ciclo (`audit/evidence/compositor-melt-real-vs-prototype.png`, `…-compare.json`):
  - a forma é a mesma em todos os instantes testados (0 s a 14,2 s);
  - a única diferença é **um contorno subpixel na borda** (antialiasing do gradiente rasterizado numa camada), cerca de 3% dos pixels de cada recorte, todos na orla;
  - a olho nu não se distingue.
- **Impacto:** alto. **Risco visual:** baixo (subpixel, a confirmar por ti com os recortes antes/depois). **Esforço:** médio (um componente `<Glass />` partilhado e 14 sítios a usá-lo).

### P3 — Animações infinitas continuam a correr fora do ecrã
- **Onde (`src/app/globals.css`):**
  - gotas (P2);
  - brilho do "Get your free proposal" do índice, `.idx-lead::after` em 320–333 (`background-position`);
  - respiração e brilho dos dois botões do índice, `.idx-ask::before/::after` em 366–392;
  - brilho do "See our work", `.svc-folio::after` em 429–438;
  - chamada dos botões "n" dos serviços, `svc-beckon` em 1398–1415 (anima `color`, `background-color` e `box-shadow` com desfoque de 26 px, tudo repintura);
  - marcador da comparação, `cmp-marker` em 2028 (`clip-path`);
  - abanar das caras no estúdio, `std-faces-shake` em 1585 (transform, barato).
- **Causa:** correm na mesma quando a secção já saiu do ecrã: o segundo ecrã continua na página depois de o estúdio o tapar, e a comparação continua a correr no rodapé. As que animam `background-position`, cores ou sombras mantêm a página em repintura contínua.
- **Evidência:**
  - no "How we work", os botões do índice (`idx-link idx-ask`) e os `::after` aparecem repintados ~20 vezes por segundo, embora estejam fora do ecrã;
  - experiência `all-paused.css` (limite superior: tudo parado), a 6x: How we work scroll 87% → 43% ocupado, parado 84% → 35%, About 66% → 25%;
  - com P1 por cima: How we work **60 fps**, 38%.
- **Correção:** um pequeno "governador" no layout.
  - Um IntersectionObserver vigia os elementos animados (por classe) e marca os que estão fora do ecrã com `data-offscreen`.
  - Esse atributo põe as animações em `animation-play-state: paused`.
  - Os elementos que montam mais tarde são apanhados por MutationObserver.
- **Impacto:** alto (somado a P1+P2). **Risco visual:** nenhum, porque só pára o que não se vê. Ao voltar ao ecrã, a animação retoma de onde parou e não de onde "estaria"; nestes ciclos orgânicos isso é imperceptível. **Esforço:** baixo.
- **Extra opcional:** os três brilhos (`idx-lead`, `idx-ask`, `svc-folio`) podem passar a `transform` de uma faixa com o mesmo gradiente. É matematicamente igual, porque o tamanho do fundo é constante. Mas obriga a um recorte (`overflow`/`clip-path`) que mexe no contorno de foco. Fica fora por defeito, porque o ganho é pequeno depois de P3.

### P4 — Re-renders em cascata do React
- **a) A abertura re-renderiza a página toda.**
  - Onde: `src/components/home.tsx:153` (estado `phase`), `:247` (`setPhase("running")` no toque) e `:459–503` (filhos).
  - Causa: nenhuma secção usa `memo`. Mudar a fase re-renderiza estúdio, serviços, How we work, comparação, formulários e rodapé no instante em que a marca começa a voar.
  - Evidência: a 4x, o toque que dispara a abertura tem 264 ms de latência e 486 ms de long tasks durante a abertura. Uma boa parte é P1, mas o render de toda a árvore soma-se.
  - Correção: `React.memo` em `Studio`, `Services`, `Process`, `Comparison`, `WorkTogether`, `Footer` e `StatementScreen`. As props já são estáveis (booleans e MotionValues).
- **b) O "How we work" re-renderiza todos os passos.**
  - Onde: `src/components/process.tsx:548–553` (`reached`), `:429–432` (`phasesIn` refeito em cada render) e `:663–674`.
  - Causa: cada vez que a barra passa um ponto, ou que um chip muda, todos os `StepCard` e `PhaseHead` voltam a renderizar.
  - Correção: `useMemo` para as fases; `memo` em `StepCard`/`PhaseHead`; o `data-on` de cada ponto escrito por ref a partir da MotionValue, sem estado.
- **c) A troca de fotos do "Let's work together" re-renderiza os formulários.**
  - Onde: `src/components/work-together.tsx:64–68` e `146–163`.
  - Causa: o `setInterval` muda o estado no topo de `WorkTogether`, por isso os dois formulários re-renderizam a cada troca de foto, mesmo com a secção fora do ecrã.
  - Correção: as fotos passam a um componente próprio, que só corre o intervalo enquanto a secção está no ecrã.
- **Impacto:** médio. **Risco visual:** nenhum. **Esforço:** baixo a médio.

### P5 — Listener `touchmove` não-passivo em `window` durante toda a visita
- **Onde:** `src/components/gateway.ts:187` e `237–240` (também `wheel`).
- **Causa:** o gateway só atua entre o segundo ecrã e o estúdio, mas o listener fica ligado em toda a página com `passive: false`. Com um listener bloqueante em `window`, o browser tem de esperar pelo thread principal antes de cada passo do scroll por toque. Com o thread a 85–95% ocupado, o scroll começa tarde e dá soluços em toda a home, mesmo onde o gateway não faz nada: nessas zonas o handler sai logo, sem `preventDefault`.
- **Evidência:** é técnica. Não é mensurável aqui (§1.2, ponto 3): a experiência `passive-touchmove.js` não mostrou diferença nos gestos sintéticos.
- **Correção:** ligar os listeners só enquanto a página está a menos de ~1,5 ecrãs do fim do gateway, e desligá-los abaixo disso. Um listener passivo de `scroll` volta a ligá-los quando se sobe. Como nenhum gesto de dedo percorre 1,5 ecrãs, todo o gesto que possa chegar ao gateway começa com o listener ligado: o comportamento fica idêntico.
- **Impacto:** médio (a confirmar no telemóvel). **Risco visual:** nenhum. **Esforço:** baixo.

### P6 — WebGL: água, lente do rodapé, valores do About
- **Onde:** `src/components/jelly-field.tsx` (DPR até 1,5: `:154`; loop: `:1296–1323`), `src/components/liquid-lens.tsx` (rodapé, em todas as páginas) e `src/components/values-water.ts` (About).
- **O que já está bem:** os três param fora do ecrã ou quando tapados (`covered`), limitam o DPR e passam o passo das molas a tempo fixo.
- **O que custa:**
  - um shader de ecrã inteiro com até 16 gotas;
  - a simulação de ~6000 molas em JS a 120 passos/s;
  - um `texImage2D` (Float32 → R16F, convertido no CPU) em cada frame.
- **Evidência:** não mensurável aqui (sem GPU).
- **Proposta:** medir no telemóvel (§1.2). Se a água ficar abaixo de 60 fps, as opções sem mudança visual são poucas: passar a simulação para um Worker é esforço alto. Baixar o DPR muda a nitidez, por isso fica em "Decisões tuas" (D2).
- **Impacto:** desconhecido. **Risco visual:** –. **Esforço:** –.

### P7 — Loop de rAF permanente no About
- **Onde:** `src/components/about-values.tsx:594–610`.
- **Causa:** enquanto há uma "chamada" ativa, um `requestAnimationFrame` corre em todos os frames, mesmo com a secção fora do ecrã. Em cada frame faz `getBoundingClientRect` (pode forçar layout) e escreve atributos SVG (repintura).
- **Correção:** parar o loop quando a secção sai do ecrã (IntersectionObserver).
- **Impacto:** baixo/médio. **Risco visual:** nenhum. **Esforço:** baixo.

### P8 — Leitura de layout em cada frame de scroll no bar
- **Onde:** `src/components/floating-nav.tsx:169–174`.
- **Causa:** em cada mudança de `scrollY`, lê `getBoundingClientRect()` do rodapé e o `offsetTop` do bar.
- **Correção:** guardar o topo do rodapé (com ResizeObserver) e comparar com `scrollY`, sem ler layout por frame.
- **Impacto:** baixo. **Risco visual:** nenhum. **Esforço:** baixo.

### P9 — A tinta do manifesto do estúdio
- **Onde:** `src/components/studio.tsx:180–268`.
- **Causa:** cada palavra tem a sua cor ligada ao scroll, e o traço sob "a completely different approach." é uma variável CSS por frame. Isto custa estilo e paint enquanto se faz scroll no estúdio.
- **Proposta:** é o próprio efeito; não há forma compositada de animar a cor do texto sem mudar o resultado. **Fica como está** (informativo).

### P10 — JavaScript inicial
- **Onde:** dependências partilhadas e componentes.
- **Causa:**
  - `motion` é importado na versão completa (49 KB gzip);
  - o fluxo da proposta (`proposal-flow`, `proposal-steps`, 1500 linhas, com `questions`/`pricing`) e o `ProposalOverlay` vão no bundle inicial, embora o formulário só abra num clique (no "Let's work together" é inline, por isso aí é preciso).
- **Evidência:** Lighthouse: TBT 155 ms (home) e 307 ms (About); bootup 0,9 s; ~46 KB de JS não usado.
- **Correção:**
  - `LazyMotion` + `m` com `domAnimation`, a carregar `domMax` só onde houver `layout`;
  - `next/dynamic` para o `ProposalOverlay`.
- **Impacto:** baixo para a fluidez, médio para o arranque. **Risco visual:** baixo (as funcionalidades do Motion têm de ser revistas uma a uma). **Esforço:** médio.

### P11 — Fotos de 2400 px servidas a telemóveis
- **Onde:**
  - `src/components/about-hero.tsx:66–76`: `folds-2400.webp`, **1,24 MB**;
  - `src/components/work-together.tsx:154–162`: `sand-2400.webp` (576 KB) e `water-2400.webp` (273 KB).
- **Causa:** o `srcset` só tem 1280w e 2400w com `sizes="100vw"`. Um telemóvel com DPR 3 e ≥427 px de largura (iPhone Pro Max, muitos Android) precisa de mais de 1280 px e salta para a de 2400.
- **Correção:** acrescentar variantes de 1600w e 1920w (os originais ficam). O browser já reduz a de 2400 para o tamanho do ecrã; uma de 1920 reduzida fica igual a olho nu.
- **Impacto:** médio no About (LCP 4,8 s; 1,2 MB a menos em 4G). **Risco visual:** nenhum/baixo. **Esforço:** baixo. Gerar as webp exige uma ferramenta: o ImageMagick deste ambiente serve; peço confirmação antes de acrescentar ficheiros.

### P12 — O portefólio fica em branco até o JS arrancar
- **Onde:** `src/components/portfolio.tsx:148–149` e `326–327`.
- **Causa:** tudo vem do servidor com `opacity:0` (e `blur`), à espera da animação de entrada. Num telemóvel lento, o ecrã fica preto até a hidratação acabar, e o Lighthouse nem consegue medir (`NO_FCP`).
- **Proposta:** corrigir isto muda a entrada, por isso fica em "Decisões tuas" (D4).

### Formatação responsiva

Verificadas as larguras 320, 360, 390, 414, 768, 1024, 1280, 1440, 1920 e 2560, mais 568×320 e 844×390 em horizontal, em seis páginas (`/`, `/pt`, `/about`, `/services/seo`, `/services/visual-identity`, `/portfolio`). Em cada uma: paragem no topo de cada secção e ao longo das secções altas, screenshot e verificações automáticas (`audit/screens/responsive/report.json`, não versionado por ser pesado).

**O que está bem:**
- **zero overflow horizontal** em todos os tamanhos e páginas;
- zero imagens deformadas;
- nenhuma utilização de `100vh`: tudo em `svh`;
- as fontes usam `next/font` com `display: swap` e métricas de fallback, por isso o CLS é 0;
- `prefers-reduced-motion` está bem coberto (versões estáticas da água, do rodapé, das gotas, do índice, das caras e do marcador).

**Fontes.** Não há "Agrandir" no projeto. As fontes carregadas são:
- Satoshi (variável, 42 KB, local);
- Instrument Sans e Geist Mono (Google, subconjunto latin com preload).

O Raleway em `fonts/` não é carregado.

#### R1 — O ecrã fixo do "How we work" não cabe em ecrãs baixos
- **Onde:** `src/components/process.tsx:576` (`sticky top-0 h-[100svh] … overflow-hidden`, conteúdo centrado) e `globals.css:2383–2426`.
- **Evidência** (`audit/fit-check.mjs`, px cortados no topo, por baixo do bar / em baixo):

| Ecrã | 320×568 | 360×640 | 375×667 | 360×740 e acima | 568×320 | 667×375 | 844×390 | 932×430 | 1024×600 | 1280×720 e acima |
|---|---|---|---|---|---|---|---|---|---|---|
| How we work | **84 / 75** | **41 / 30** | 8 / 0 | 0 / 0 | **124 / 116** | **97 / 88** | **211 / 189** | **182 / 160** | **43 / 21** | 0 / 0 |

- **O que se vê:** o título "How we work. / The whole process, in detail." fica por baixo do bar, e o fim do texto dos passos e o link "Partner with us" ficam cortados (`audit/evidence/home-320x568.jpg`, `landscape-*.jpg`). Como o ecrã está fixo, **não há maneira de lá chegar**.
- **Correção para telemóveis pequenos na vertical e 1024×600** (só formatação): por `@media (max-height: …)`, apertar os espaçamentos verticais do ecrã fixo e reduzir um pouco o título e a altura mínima das colunas. Valores com `svh`, para caber em ≥360×640 sem tirar nenhuma palavra.
- **Telemóveis na horizontal:** com 320–430 px de altura, título, chips e uma linha de passos não cabem juntos sem cortar conteúdo. Isso exige uma escolha de design (D1).
- **Impacto:** alto nesses ecrãs. **Risco visual:** médio, mas só nesses tamanhos, que hoje estão partidos. **Esforço:** médio.

#### R2 — O segundo ecrã corta o índice e as leituras
- **Onde:** `src/components/home.tsx:443–448` (o ecrã é `h-[100svh] overflow-hidden`) e `src/components/statement-screen.tsx:63`.
- **Evidência:**
  - 320×568: 49 px cortados (as leituras "Porto / hora / estado");
  - horizontal: **153–244 px**. Só se vê "Get your free proposal": "Partner with us", "Our projects", "About us", "Our services" e as leituras ficam inacessíveis;
  - 1024×600: 15 px.
- **Correção para 320×568 e 1024×600:** apertar o padding de topo (`pt-[7.25rem]`) e o espaço entre as linhas do índice por `max-height`.
- **Telemóveis na horizontal:** ver D1.
- **Impacto:** alto nesses ecrãs. **Risco visual:** médio, só nesses tamanhos. **Esforço:** baixo/médio.

#### R3 — Alvos de toque abaixo de 24 px (WCAG 2.2 AA)
- **Onde e medidas:**
  - wordmark do bar (link para a home): 98×**22**;
  - rodapé: "Copy" 32×**20**, "Português"/"English" **20** de altura, "Pause motion" **20**, "Back to top" **20** (`.ftr-meta`);
  - "Clear answers" do formulário: 94×**16** (`.prop-close`);
  - cápsula das caras no estúdio a 320 px: 38×**22**.
- **Correção:** aumentar a área de toque com um `::after` invisível (ou padding com margem negativa), sem mudar nada do que se vê.
- **Impacto:** médio (usabilidade). **Risco visual:** nenhum. **Esforço:** baixo.

#### R4 — Texto abaixo de 12 px
- **Onde:** `.mono-label` (0,6875 rem = 11 px, 11,5 px a partir de 1280) em todas as legendas mono; os números do bar "01/02/03" (10 px); os expoentes dos serviços (11 px).
- **Proposta:** é o sistema tipográfico do site. Mudar isto muda o design, por isso fica em D3.

#### R5 — Ecrãs muito largos (2560)
- O conteúdo fica numa coluna (`--shell`) centrada, com margens muito largas e texto pequeno em relação ao ecrã. É coerente com o design e não está partido. Fica em D5, como opção.

---

## 3. Plano de execução

Um lote = um commit, numa branch nova (ex.: `perf/smooth-mobile`). Depois de cada lote: screenshots e comparação com as referências, e de novo `measure.mjs` (CPU 4x e 6x) com a evolução antes → depois. Se aparecer diferença visual, o lote é revertido e eu digo-te.

| # | Lote | Problemas | Impacto | Risco visual | Esforço | Ganho medido/esperado |
|---|---|---|---|---|---|---|
| 1 | Trocar `html:has([data-opening])` por classe em `<html>` | P1 | **alto** | nenhum | baixo | long tasks −90 a −100%; chips 464 → ~230 ms |
| 2 | Pausar animações infinitas fora do ecrã | P3 | **alto** | nenhum | baixo | grande parte do ganho de `all-paused` |
| 3 | Conter re-renders (memo, How we work, fotos do Let's work together) | P4 | médio | nenhum | baixo/médio | abertura e toques mais leves |
| 4 | Listeners do gateway só perto do gateway | P5 | médio (telemóvel) | nenhum | baixo | scroll por toque deixa de esperar pelo thread principal |
| 5 | Fusão das gotas no compositor (`<Glass />`) | P2 | **alto** | **baixo** (subpixel, aprovação tua com recortes) | médio | paints da página −80%; How we work → ~60 fps a 6x com 1+2 |
| 6 | Loop do About e leitura do bar | P7, P8 | baixo | nenhum | baixo | menos trabalho em repouso no About |
| 7 | Áreas de toque | R3 | médio (usabilidade) | nenhum | baixo | – |
| 8 | Variantes de 1600w/1920w das fotos | P11 | médio (About) | nenhum/baixo | baixo | até −1,2 MB no About em telemóveis DPR 3 |
| 9 | Ecrãs baixos na vertical (≥360×640) e 1024×600: R1+R2 compactos | R1, R2 | alto nesses ecrãs | médio (só nesses tamanhos) | médio | fim dos cortes até 360×640 |
| 10 | JS inicial (LazyMotion, proposta lazy) | P10 | baixo/médio | baixo | médio | −20 a −30 KB gzip, TBT menor |

**Ordem recomendada:** 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10.
- Os lotes 1 e 2 sozinhos já devem tirar a maior parte do encravar.
- O 5 é o que leva o "How we work" aos 60 fps.
- O 9 fecha os cortes, menos em telemóveis na horizontal (D1).
- O 10 é o menos importante para a fluidez.

**Referência do potencial:** a experiência combinada (P1 + todas as animações sem custo) é o teto destes lotes. A 6x dá How we work 60 fps / 38%, chips 160 ms, comparação 59 fps / 0 ms de bloqueio. Com os lotes 1, 2 e 5 espero chegar perto disso. O que fica acima de "tudo parado" são as animações visíveis no ecrã, que continuam a correr, agora no compositor.

---

## 4. Decisões tuas

Nada disto entra por defeito: cada ponto muda algo visível.

- **D1 — Telemóveis na horizontal (R1, R2).** Com 320–430 px de altura, o segundo ecrã e o "How we work" não cabem num ecrã fixo sem cortar conteúdo. Opções:
  - **(a, recomendada)** abaixo de ~500 px de altura, o segundo ecrã deixa de estar preso à altura do ecrã (cresce o necessário e o estúdio fecha por cima na mesma), e o "How we work" deixa de estar fixo: a linha de passos desliza na horizontal com o dedo, como já acontece com movimento reduzido;
  - (b) manter fixo e reduzir tipos e espaçamentos até caber (fica muito pequeno a 320 px de altura);
  - (c) deixar como está.
- **D2 — Nitidez da água no telemóvel (P6).** Só se a medição no teu telemóvel mostrar a água abaixo dos 60 fps: baixar o DPR máximo de 1,5 para 1,25 (ou 1,0) em ecrãs pequenos. A água fica ligeiramente mais suave; na prática é uma imagem de água, já desfocada.
- **D3 — Legendas mono a 11 px (R4).** Subir para 12 px só em telemóveis (`.mono-label` e os números do bar). Melhora a leitura, muda o tom do sistema de legendas.
- **D4 — Entrada do portefólio (P12).** Hoje tudo nasce invisível e entra com fade/blur depois do JS. Opções:
  - (a) servir já visível e animar só os pormenores;
  - (b) manter a entrada, mas com um tempo máximo (por exemplo, aparece aos 600 ms mesmo sem JS);
  - (c) deixar como está.
- **D5 — Ecrãs ≥2560 (R5).** Escalar a coluna e os tipos acima de 1920 px, para o site não ficar "pequeno" num monitor grande. Opcional.
- **D6 — Se o lote 5 não te convencer.** Se, ao comparares os recortes antes/depois, notares a orla das gotas, as alternativas são:
  - (a) manter a fusão como hoje e aceitar o custo (os lotes 1–3 resolvem grande parte);
  - (b) fusão a 30 fps em vez de 60 (é muito lenta: 11 s por ciclo, quase não se nota);
  - (c) sem fusão em telemóveis (mantêm a inclinação e a respiração).
- **D7 — Chamada dos botões "n" dos serviços (`svc-beckon`).** Hoje anima cor, fundo e sombra (repintura). Pode passar a duas camadas sobrepostas com `opacity` cruzada. Os estados de início e fim ficam iguais; os frames intermédios ficam ligeiramente diferentes. Com o lote 2 só corre com a secção visível, por isso o ganho é pequeno. Recomendo deixar como está.

---

## 5. Plano de validação

### 5.1 Que nada mudou visualmente
1. **Referências antes de tocar no código:** `node audit/screens.mjs --out audit/screens/before`, em 6 viewports (360, 390, 844×390, 768, 1440, 1920).
   - Capta a abertura em vários instantes, o segundo ecrã, o estúdio, os serviços, o "How we work" no início/meio/fim, a comparação, o Let's work together, o rodapé, o About, o SEO, o portefólio e o About em PT.
   - O relógio da página fica congelado e avança à mão (Date, timers, rAF, `performance.now`).
   - As animações CSS/Web Animations ficam paradas num instante fixo: as infinitas num tempo marcado, as finitas no fim.
2. **Depois de cada lote:** o mesmo script para `audit/screens/after-N` e depois `--compare`. Compara pixel a pixel e escreve uma imagem de diferença por cada screenshot que mude.
3. **Estado atual do método, com honestidade:** duas corridas sobre o mesmo build dão **22 de 31 screenshots idênticos**. Os frames da abertura e dois do estúdio/serviços ainda variam entre corridas: o relógio falso não controla tudo o que o Motion e o Lenis usam. O primeiro passo da Fase 2 é fechar isso com o tempo virtual do Chrome (`Emulation.setVirtualTimePolicy`), que também congela as animações do compositor. Se não ficar 100% determinístico, cada screenshot instável é tirado 3 vezes por versão e compara-se contra a variação entre corridas, que fica registada.
4. **Lote 5 (gotas):** além dos screenshots, `audit/experiments/compare-melt.mjs` (adaptado ao código real) recorta cada gota em 6 instantes do ciclo, antes e depois. Os recortes lado a lado vão para ti, para aprovares.
5. **Comportamento:** verificação manual guiada pelos screenshots e por gravações curtas (Playwright, vídeo):
   - abertura por scroll, toque e clique;
   - gateway;
   - "How we work" de ida e volta, com a ligação `/#process-<passo>` da FAQ;
   - "Exit portfolio" e regresso ao sítio;
   - formulário da proposta;
   - versão com movimento reduzido.

### 5.2 Repetir a medição
- `measure.mjs --cpu 4 --runs 2` e `--cpu 6 --runs 2` com os mesmos cenários e gestos; `summarise.mjs baseline-cpu6.json loteN-cpu6.json` para a tabela antes → depois.
- `lighthouse.mjs --label loteN` no fim (e depois dos lotes 8 e 10, que mexem na carga).
- `fit-check.mjs` depois do lote 9.
- No teu telemóvel, antes e depois (§1.2): Frame Rendering Stats no "How we work" e no segundo ecrã, e Paint flashing em repouso.

---

## 6. Ficheiros desta fase

```
audit/
  PERFORMANCE-AUDIT.md        este relatório
  lib.mjs, stand-in.mjs       utilitários partilhados
  measure.mjs                 medição de fps / thread principal / INP
  summarise.mjs               tabelas e comparações
  lighthouse.mjs              Lighthouse mobile
  responsive.mjs              verificação responsiva com screenshots
  fit-check.mjs               cortes dos ecrãs fixos
  screens.mjs                 screenshots determinísticos e comparação
  experiments/                experiências "e se" (CSS/JS injetados em runtime)
  results/                    resultados JSON e logs
  evidence/                   provas visuais usadas neste relatório
```

`audit/screens/` (centenas de screenshots) e os traces brutos ficam fora do git (`audit/.gitignore`); voltam a gerar-se com os scripts.
