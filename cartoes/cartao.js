/* As duas faces do cartão, desenhadas em milímetros (SVG com viewBox em mm),
   para que a prova para a gráfica e os mockups usem exatamente o mesmo
   desenho. Precisa de marca.js e grao.js carregados antes.

   Cartão: 85 × 55 mm (o formato corrente em Portugal), margens de 5 mm.
   Frente: preta, o wordmark branco com ™, à esquerda e em baixo (a
   referência "martillo"), prensado para dentro do papel (deboss).
   Verso: branco com o grão; nome e cargo em cima à esquerda, contactos em
   baixo à esquerda e o "n" em baixo à direita (a referência Antora). */
(function () {
  const W = 85, H = 55, M = 5;
  const PT = 25.4 / 72; // 1 pt em mm

  const PESSOAS = {
    antonio: {
      nome: "António Policarpo",
      cargo: "Cofundador",
      email: "antonio@nevima.studio",
      tel: "+351 910 555 780",
    },
    emanuel: {
      nome: "Emanuel Costa",
      cargo: "Cofundador",
      email: "emanuel@nevima.studio",
      tel: "+351 917 861 347",
    },
  };

  /* O wordmark: caixa justa medida no navegador a partir de marca.js. */
  const LOGO = { x0: 172.843, base: 836.48, w: 1166.856 };
  const LOGO_W = 62; // mm: mais curto que a largura útil, para se ler alinhado à esquerda
  const LOGO_S = LOGO_W / LOGO.w;
  const LOGO_T = `translate(${M} ${H - M}) scale(${LOGO_S}) translate(${-LOGO.x0} ${-LOGO.base})`;

  /* O "n": caixa justa dentro do ícone de 512. */
  const N = { x0: 138.24, y0: 124.2, w: 235.52, h: 258.48 };
  const N_H = 4.1; // altura do "n" no verso, em mm (3,4 + 20%, utilizador 2026-11-14)

  const logoPaths = () =>
    window.MARCA.logo
      .map((p) => `<path transform="translate(${p.x} ${p.y})" d="${p.d}"/>`)
      .join("");

  /* O ™ (utilizador, 2026-11-14): a seguir ao "a", com o topo na altura de x
     do wordmark, em unidades do logótipo. */
  const TM = { x: LOGO.x0 + LOGO.w + 14, base: LOGO.base - 189.45 + 31, size: 44 };
  const tm = () =>
    `<text x="${TM.x}" y="${TM.base}" font-family="Satoshi, sans-serif" font-weight="500" font-size="${TM.size}" letter-spacing="2">TM</text>`;

  /* A seta (utilizador, 2026-11-15): diagonal, no canto superior direito
     da frente, com as duas hastes da ponta em ângulo reto (uma horizontal e
     outra vertical). A aresta de fora da ponta assenta nas margens de 5 mm.
     É branca e prensada como o logótipo, e vai também na chapa. */
  const SETA = { lado: 3.36, haste: 3.04, traco: 0.64 }; // 20% menor (utilizador, 2026-11-15)
  const seta = (cor) => {
    const h = SETA.traco / 2;
    const x = W - M - h, y = M + h; // a ponta, ao centro do traço
    const x0 = x - SETA.lado + h, y0 = y + SETA.lado - h;
    return `<g fill="none" stroke="${cor}" stroke-width="${SETA.traco}" stroke-linejoin="miter" stroke-linecap="butt">
      <path d="M ${x0} ${y0} L ${x - 0.15} ${y + 0.15}"/>
      <path d="M ${x - SETA.haste} ${y} L ${x} ${y} L ${x} ${y + SETA.haste}"/>
    </g>`;
  };

  /* As notas do topo da frente (utilizador, 2026-11-15, à maneira do menu da
     martillo): no canto superior esquerdo e a começar a meio do cartão, no
     estilo do cargo do verso (Geist Mono, maiúsculas, espaçamento aberto).
     Cada nota tem duas linhas e a altura da seta: o topo das maiúsculas da
     primeira linha alinha com o topo da seta e a base da segunda com a base
     dela. São brancas e impressas, sem deboss (o relevo comeria letra tão
     pequena). */
  const NOTAS = [
    { x: M, linhas: ["Estúdio de web design", "e identidade visual"] },
    { x: W / 2, linhas: ["nevima.studio", "Portugal"] },
  ];
  const MONO_CAP = 0.71; // altura das maiúsculas da Geist Mono (medida)
  const notas = (cor) => {
    const A = SETA.lado;
    const corpo = A / (MONO_CAP + 1.45); // a segunda linha a 1,45 corpos da primeira
    const y1 = M + corpo * MONO_CAP, y2 = M + A;
    return NOTAS.map((n) =>
      `<text font-family="'Geist Mono', monospace" font-weight="500" font-size="${corpo}" letter-spacing="${0.06 * corpo}" fill="${cor}">` +
      `<tspan x="${n.x}" y="${y1}">${n.linhas[0].toUpperCase()}</tspan><tspan x="${n.x}" y="${y2}">${n.linhas[1].toUpperCase()}</tspan></text>`
    ).join("");
  };

  /* O deboss. A face das letras é branco puro (utilizador, 2026-11-14) e o
     relevo tem de se ver (utilizador, 2026-11-15). A luz vem de cima e da
     direita, como na fotografia da Antora:
     - à volta da letra, o papel desce para ela e a rampa do lado de cima e
       da direita escurece (num papel preto quase não se vê);
     - a aresta de baixo e da esquerda, onde o papel dobra, apanha um fio de
       luz nítido;
     - dentro da letra, só o rebordo de cima e da direita leva a sombra fina
       que a parede projeta no fundo; o resto da face fica branco puro. */
  const DEBOSS_FILTER = `
    <filter id="deboss" x="-4%" y="-25%" width="108%" height="150%" color-interpolation-filters="sRGB">
      <feGaussianBlur in="SourceAlpha" stdDeviation="0.16" result="ab"/>
      <feOffset in="ab" dx="-0.12" dy="0.12" result="rampaLuz1"/>
      <feComposite in="rampaLuz1" in2="SourceAlpha" operator="out" result="rampaLuzA"/>
      <feFlood flood-color="#fff" flood-opacity="0.14"/>
      <feComposite in2="rampaLuzA" operator="in" result="rampaLuz"/>
      <feOffset in="ab" dx="0.12" dy="-0.12" result="rampaSomb1"/>
      <feComposite in="rampaSomb1" in2="SourceAlpha" operator="out" result="rampaSombA"/>
      <feFlood flood-color="#000"/>
      <feComposite in2="rampaSombA" operator="in" result="rampaSomb"/>

      <feMorphology in="SourceAlpha" operator="dilate" radius="0.09" result="dil"/>
      <feOffset in="dil" dx="-0.12" dy="0.12" result="dil0"/>
      <feGaussianBlur in="dil0" stdDeviation="0.03" result="dil1"/>
      <feComposite in="dil1" in2="SourceAlpha" operator="out" result="fioA"/>
      <feFlood flood-color="#a6a6a6" flood-opacity="0.8"/>
      <feComposite in2="fioA" operator="in" result="fio"/>

      <feComponentTransfer in="SourceAlpha" result="fora"><feFuncA type="table" tableValues="1 0"/></feComponentTransfer>
      <feOffset in="fora" dx="-0.3" dy="0.32" result="f1"/>
      <feGaussianBlur in="f1" stdDeviation="0.1" result="f1b"/>
      <feComposite in="f1b" in2="SourceAlpha" operator="in" result="paredeA"/>
      <feFlood flood-color="#000" flood-opacity="0.72"/>
      <feComposite in2="paredeA" operator="in" result="parede"/>

      <feMerge>
        <feMergeNode in="rampaSomb"/>
        <feMergeNode in="fio"/>
        <feMergeNode in="SourceGraphic"/>
        <feMergeNode in="parede"/>
      </feMerge>
    </filter>`;

  /**
   * A frente.
   * o.bleed   mm de sangria (0 nos mockups, 3 na prova)
   * o.relevo  true desenha o deboss (mockups); false, a arte plana (prova)
   * o.chapa   true dá a chapa do deboss: o logótipo a preto sobre branco
   */
  function frente(o = {}) {
    const b = o.bleed || 0;
    const fundo = o.chapa ? "#fff" : o.relevo ? "#141414" : "#000";
    const tinta = o.chapa ? "#000" : "#fff";
    const filtro = o.relevo ? `filter="url(#deboss)"` : "";
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-b} ${-b} ${W + 2 * b} ${H + 2 * b}" width="100%" height="100%" preserveAspectRatio="none">
      ${o.relevo ? `<defs>${DEBOSS_FILTER}</defs>` : ""}
      <rect x="${-b}" y="${-b}" width="${W + 2 * b}" height="${H + 2 * b}" fill="${fundo}"/>
      <g ${filtro}><g transform="${LOGO_T}" fill="${tinta}">${logoPaths()}${tm()}</g>${seta(tinta)}</g>
      ${o.chapa ? "" : notas(tinta)}
    </svg>`;
  }

  /** O grão como imagem (data URL), à resolução pedida. */
  function graoURL(pxPerMm, bleed, seed, papel) {
    const c = document.createElement("canvas");
    c.width = Math.round((W + 2 * bleed) * pxPerMm);
    c.height = Math.round((H + 2 * bleed) * pxPerMm);
    const ctx = c.getContext("2d");
    ctx.fillStyle = papel || "#fff";
    ctx.fillRect(0, 0, c.width, c.height);
    window.desenharGrao(ctx, { pxPerMm, bleed, seed });
    return c.toDataURL("image/png");
  }

  /**
   * O verso de uma pessoa.
   * o.bleed, o.pxPerMm (resolução do grão), o.seed, o.papel (cor do branco)
   */
  function verso(quem, o = {}) {
    const p = PESSOAS[quem];
    const b = o.bleed || 0;
    const img = graoURL(o.pxPerMm || 12, b, o.seed || 11, o.papel);
    /* Três níveis (utilizador, 2026-11-14: o nome e o cargo maiores):
       o nome, o cargo logo por baixo, e os contactos, mais pequenos, em baixo. */
    const CORPO = 6.2 * PT;
    const CAP = 0.73; // altura das maiúsculas da Satoshi, em fração do corpo (medida)
    const t = (y, s, corpo, cor, peso, ls) =>
      `<text x="${M}" y="${y}" font-size="${corpo}" fill="${cor}" font-weight="${peso}" letter-spacing="${ls}">${s.toUpperCase()}</text>`;
    /* O nome pode ter outra letra (o.nome, para estudos): família, corpo em
       pt, peso, estilo, maiúsculas ou não, espaçamento e altura das
       maiúsculas em fração do corpo. Por omissão, a Satoshi a 700. */
    /* Escolha do utilizador (2026-11-15, a opção C do estudo): o nome como o
       site o escreve na página About, em Satoshi, primeiro nome Light e
       apelido Medium, 15 pt, espaçamento -0,035 em. */
    const n = Object.assign({ familia: "Satoshi, sans-serif", pt: 15, peso: 500, pesos: [300, 500], estilo: "normal", maiusculas: false, ls: -0.035 * 15 * PT, cap: CAP, depois: 0.5 }, o.nome);
    const nomeCorpo = n.pt * PT;
    const nomeY = M + nomeCorpo * n.cap;
    const nomeTexto = n.maiusculas ? p.nome.toUpperCase() : p.nome;
    /* Com n.pesos = [primeiro, apelido], o primeiro nome e o apelido levam
       pesos diferentes, como o site os escreve na página About. */
    const partes = nomeTexto.split(" ");
    const nomeConteudo = n.pesos
      ? `<tspan font-weight="${n.pesos[0]}">${partes.slice(0, -1).join(" ")} </tspan><tspan font-weight="${n.pesos[1]}">${partes[partes.length - 1]}</tspan>`
      : nomeTexto;
    const nomeSVG = `<text x="${M - (n.recuo || 0)}" y="${nomeY}" font-family="${n.familia}" font-size="${nomeCorpo}" font-weight="${n.peso}" font-style="${n.estilo}" letter-spacing="${n.ls}" fill="#000"${n.extra ? " " + n.extra : ""}>${nomeConteudo}</text>`;
    /* O cargo como os rótulos do site (.mono-label): Geist Mono, maiúsculas,
       espaçamento 0,06 em (utilizador, 2026-11-15, opção C). */
    const c = Object.assign({ familia: "'Geist Mono', monospace", pt: 6.8, peso: 500, ls: 0.06 * 6.8 * PT, gap: 1.75 }, o.cargo);
    const cargoSVG = `<text x="${M}" y="${nomeY + c.pt * PT * c.gap + (n.depois || 0)}" font-family="${c.familia}" font-size="${c.pt * PT}" font-weight="${c.peso}" letter-spacing="${c.ls}" fill="#000">${p.cargo.toUpperCase()}</text>`;
    // Em baixo, a última linha assenta a 5 mm do corte.
    const base = H - M;
    const lh = CORPO * 1.45;
    const gap = lh * 0.7;
    const contactos = [
      [p.email, "#000", base - 3 * lh - gap],
      [p.tel, "#000", base - 2 * lh - gap],
      ["nevima.studio", "#6f6f6f", base - lh],
      ["Portugal", "#6f6f6f", base],
    ].map((l) => t(l[2], l[0], CORPO, l[1], 500, 0.05)).join("");
    const texto = nomeSVG + cargoSVG + contactos;
    const nS = N_H / N.h;
    const nT = `translate(${W - M - N.w * nS} ${base - N_H}) scale(${nS}) translate(${-N.x0} ${-N.y0})`;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-b} ${-b} ${W + 2 * b} ${H + 2 * b}" width="100%" height="100%" preserveAspectRatio="none">
      <image href="${img}" x="${-b}" y="${-b}" width="${W + 2 * b}" height="${H + 2 * b}" preserveAspectRatio="none" style="image-rendering:auto"/>
      <g font-family="Satoshi, sans-serif">${texto}</g>
      <path transform="${nT}" d="${window.MARCA.n.d}" fill="#000"/>
    </svg>`;
  }

  window.CARTAO = { W, H, M, PESSOAS, frente, verso };
})();
