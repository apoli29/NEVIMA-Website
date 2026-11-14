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
  const N_H = 3.4; // altura do "n" no verso, em mm

  const logoPaths = () =>
    window.MARCA.logo
      .map((p) => `<path transform="translate(${p.x} ${p.y})" d="${p.d}"/>`)
      .join("");

  /* O ™ (utilizador, 2026-11-14): a seguir ao "a", com o topo na altura de x
     do wordmark, em unidades do logótipo. */
  const TM = { x: LOGO.x0 + LOGO.w + 14, base: LOGO.base - 189.45 + 31, size: 44 };
  const tm = () =>
    `<text x="${TM.x}" y="${TM.base}" font-family="Satoshi, sans-serif" font-weight="500" font-size="${TM.size}" letter-spacing="2">TM</text>`;

  /* O deboss. As letras são branco puro, sem sombra nem textura por cima
     (utilizador, 2026-11-14): o relevo lê-se só no papel à volta delas, que
     desce para a letra. A luz vem de cima e da direita (como na fotografia
     da Antora): o rebordo de cima e da direita fica mais escuro, o de baixo
     e da esquerda apanha um brilho mínimo. */
  const DEBOSS_FILTER = `
    <filter id="deboss" x="-4%" y="-25%" width="108%" height="150%" color-interpolation-filters="sRGB">
      <feGaussianBlur in="SourceAlpha" stdDeviation="0.24" result="ab"/>
      <feOffset in="ab" dx="0.18" dy="-0.18" result="ab1"/>
      <feComposite in="ab1" in2="SourceAlpha" operator="out" result="rebordoEscA"/>
      <feFlood flood-color="#000" flood-opacity="0.95"/>
      <feComposite in2="rebordoEscA" operator="in" result="rebordoEsc"/>
      <feOffset in="ab" dx="-0.16" dy="0.16" result="ab2"/>
      <feComposite in="ab2" in2="SourceAlpha" operator="out" result="rebordoLuzA"/>
      <feFlood flood-color="#fff" flood-opacity="0.16"/>
      <feComposite in2="rebordoLuzA" operator="in" result="rebordoLuz"/>
      <feMerge>
        <feMergeNode in="rebordoEsc"/>
        <feMergeNode in="rebordoLuz"/>
        <feMergeNode in="SourceGraphic"/>
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
      <g ${filtro}><g transform="${LOGO_T}" fill="${tinta}">${logoPaths()}${tm()}</g></g>
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
    const NOME = 10.5 * PT, CARGO = 7.5 * PT, CORPO = 6.2 * PT;
    const CAP = 0.7; // altura das maiúsculas da Satoshi, em fração do corpo
    const t = (y, s, corpo, cor, peso, ls) =>
      `<text x="${M}" y="${y}" font-size="${corpo}" fill="${cor}" font-weight="${peso}" letter-spacing="${ls}">${s.toUpperCase()}</text>`;
    const nomeY = M + NOME * CAP;
    const cargoY = nomeY + CARGO * 1.75;
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
    const texto = t(nomeY, p.nome, NOME, "#000", 700, 0.02) + t(cargoY, p.cargo, CARGO, "#000", 500, 0.06) + contactos;
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
