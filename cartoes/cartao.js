/* As duas faces do cartão, desenhadas em milímetros (SVG com viewBox em mm),
   para que a prova para a gráfica e os mockups usem exatamente o mesmo
   desenho. Precisa de marca.js e grao.js carregados antes.

   Cartão: 85 × 55 mm (o formato corrente em Portugal), margens de 5 mm.
   Frente: preta, o wordmark branco, à esquerda e em baixo, quase de lado a
   lado (a referência "martillo"), prensado para dentro do papel (deboss).
   Verso: branco com o grão; nome em cima à esquerda, contactos em baixo à
   esquerda e o "n" em baixo à direita (a referência Antora). */
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
  const LOGO_W = W - 2 * M; // 75 mm
  const LOGO_S = LOGO_W / LOGO.w;
  const LOGO_T = `translate(${M} ${H - M}) scale(${LOGO_S}) translate(${-LOGO.x0} ${-LOGO.base})`;

  /* O "n": caixa justa dentro do ícone de 512. */
  const N = { x0: 138.24, y0: 124.2, w: 235.52, h: 258.48 };
  const N_H = 3.4; // altura do "n" no verso, em mm

  const logoPaths = () =>
    window.MARCA.logo
      .map((p) => `<path transform="translate(${p.x} ${p.y})" d="${p.d}"/>`)
      .join("");

  /* O deboss, com a luz a vir de cima e da direita (como na fotografia da
     Antora): as paredes de cima e da direita de cada letra ficam na sombra,
     as de baixo e da esquerda apanham luz; à volta, o papel desce para a
     letra, mais escuro do lado da luz e com um brilho mínimo do outro. */
  const DEBOSS_FILTER = `
    <filter id="deboss" x="-4%" y="-25%" width="108%" height="150%" color-interpolation-filters="sRGB">
      <feComponentTransfer in="SourceAlpha" result="fora"><feFuncA type="table" tableValues="1 0"/></feComponentTransfer>

      <feOffset in="fora" dx="-0.42" dy="0.46" result="f1"/>
      <feGaussianBlur in="f1" stdDeviation="0.2" result="f1b"/>
      <feComposite in="f1b" in2="SourceAlpha" operator="in" result="sombraA"/>
      <feFlood flood-color="#000" flood-opacity="0.9"/>
      <feComposite in2="sombraA" operator="in" result="sombra"/>

      <feOffset in="fora" dx="0.1" dy="-0.1" result="f2"/>
      <feGaussianBlur in="f2" stdDeviation="0.07" result="f2b"/>
      <feComposite in="f2b" in2="SourceAlpha" operator="in" result="luzA"/>
      <feFlood flood-color="#fff" flood-opacity="0.9"/>
      <feComposite in2="luzA" operator="in" result="luz"/>

      <feGaussianBlur in="SourceAlpha" stdDeviation="0.22" result="ab"/>
      <feOffset in="ab" dx="0.16" dy="-0.16" result="ab1"/>
      <feComposite in="ab1" in2="SourceAlpha" operator="out" result="rebordoEscA"/>
      <feFlood flood-color="#000" flood-opacity="0.9"/>
      <feComposite in2="rebordoEscA" operator="in" result="rebordoEsc"/>
      <feOffset in="ab" dx="-0.14" dy="0.14" result="ab2"/>
      <feComposite in="ab2" in2="SourceAlpha" operator="out" result="rebordoLuzA"/>
      <feFlood flood-color="#fff" flood-opacity="0.11"/>
      <feComposite in2="rebordoLuzA" operator="in" result="rebordoLuz"/>

      <feTurbulence type="fractalNoise" baseFrequency="0.35" numOctaves="2" seed="4" result="t"/>
      <feColorMatrix in="t" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -0.2 0.11" result="manchas"/>
      <feComposite in="manchas" in2="SourceAlpha" operator="in" result="tinta"/>

      <feMerge>
        <feMergeNode in="rebordoEsc"/>
        <feMergeNode in="rebordoLuz"/>
        <feMergeNode in="SourceGraphic"/>
        <feMergeNode in="tinta"/>
        <feMergeNode in="luz"/>
        <feMergeNode in="sombra"/>
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
    const tinta = o.chapa ? "#000" : o.relevo ? "#e9e7e1" : "#fff";
    const filtro = o.relevo ? `filter="url(#deboss)"` : "";
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-b} ${-b} ${W + 2 * b} ${H + 2 * b}" width="100%" height="100%" preserveAspectRatio="none">
      ${o.relevo ? `<defs>${DEBOSS_FILTER}</defs>` : ""}
      <rect x="${-b}" y="${-b}" width="${W + 2 * b}" height="${H + 2 * b}" fill="${fundo}"/>
      <g ${filtro}><g transform="${LOGO_T}" fill="${tinta}">${logoPaths()}</g></g>
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
    const fs = 6.6 * PT; // corpo do texto
    const lh = fs * 1.42;
    const cap = fs * 0.7; // altura das maiúsculas da Satoshi
    const t = (x, y, s, cor, peso) =>
      `<text x="${x}" y="${y}" fill="${cor}" font-weight="${peso}" letter-spacing="0.04">${s.toUpperCase()}</text>`;
    // Bloco de baixo: a última linha assenta a 5 mm do corte.
    const base = H - M;
    // De baixo para cima: a morada do site, um intervalo, e os contactos.
    const gap = lh * 0.65;
    const linhas = [
      [p.cargo, "#000", base - 4 * lh - gap],
      [p.email, "#000", base - 3 * lh - gap],
      [p.tel, "#000", base - 2 * lh - gap],
      ["nevima.studio", "#6f6f6f", base - lh],
      ["Portugal", "#6f6f6f", base],
    ];
    const bloco = linhas.map((l) => t(M, l[2], l[0], l[1], 500)).join("");
    const nS = N_H / N.h;
    const nT = `translate(${W - M - N.w * nS} ${base - N_H}) scale(${nS}) translate(${-N.x0} ${-N.y0})`;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-b} ${-b} ${W + 2 * b} ${H + 2 * b}" width="100%" height="100%" preserveAspectRatio="none">
      <image href="${img}" x="${-b}" y="${-b}" width="${W + 2 * b}" height="${H + 2 * b}" preserveAspectRatio="none" style="image-rendering:auto"/>
      <g font-family="Satoshi, sans-serif" font-size="${fs}">
        ${t(M, M + cap, p.nome, "#000", 700)}
        ${bloco}
      </g>
      <path transform="${nT}" d="${window.MARCA.n.d}" fill="#000"/>
    </svg>`;
  }

  window.CARTAO = { W, H, M, PESSOAS, frente, verso };
})();
