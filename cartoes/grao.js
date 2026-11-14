/* O grão do verso: grãos pretos sobre o branco, leves em todo o cartão,
   mais densos e irregulares no canto superior direito, com uma risca curva
   e subtil nesse canto que o próprio granulado desfoca.

   Tudo é medido em milímetros do cartão (0–85 × 0–55, a partir do canto
   superior esquerdo do corte), por isso o mesmo grão sai igual na prova
   impressa a 600 ppp e nos mockups a qualquer escala: só muda a semente
   se mudar `seed`. */
(function () {
  const W = 85, H = 55;

  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* Ruído de valor 2D, com semente, e a sua soma em oitavas. */
  function makeNoise(seed) {
    const h = (x, y) => {
      let n = (x * 374761393 + y * 668265263 + seed * 2246822519) | 0;
      n = Math.imul(n ^ (n >>> 13), 1274126177);
      return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
    };
    const s = (t) => t * t * (3 - 2 * t);
    const v = (x, y) => {
      const xi = Math.floor(x), yi = Math.floor(y);
      const xf = s(x - xi), yf = s(y - yi);
      const a = h(xi, yi), b = h(xi + 1, yi), c = h(xi, yi + 1), d = h(xi + 1, yi + 1);
      return a + (b - a) * xf + (c - a) * yf + (a - b - c + d) * xf * yf;
    };
    return (x, y) => (v(x, y) * 0.55 + v(x * 2.1 + 17, y * 2.1 + 5) * 0.3 + v(x * 4.3 + 3, y * 4.3 + 29) * 0.15);
  }

  /* A risca: um arco de circunferência que entra pelo bordo de cima e sai
     pelo bordo direito, curvado na direção do canto. */
  const ARC = { cx: 64, cy: 20, r: 21 };

  function density(x, y, fbm) {
    /* Fundo: grão fino e leve, com pequenas variações de mancha. */
    const base = 0.011 * (0.5 + 1.0 * fbm(x / 2.6, y / 2.6));

    /* Canto superior direito: uma nuvem irregular, de borda rasgada. */
    const dc = Math.hypot(x - W, y);
    const reach = 22 * (0.72 + 0.56 * fbm(x / 7 + 40, y / 7 + 11));
    const t = dc / reach;
    const patch = fbm(x / 3.2 + 90, y / 3.2 + 7);
    const corner = 0.42 * Math.exp(-t * t * 2.8) * (0.35 + 1.1 * patch * patch);

    /* A risca, mais nítida perto do canto e a desfazer-se nas pontas. */
    const dd = Math.abs(Math.hypot(x - ARC.cx, y - ARC.cy) - ARC.r);
    const sigma = 0.45 + 1.1 * fbm(x / 4 + 60, y / 4 + 60);
    const taper = Math.exp(-Math.pow(dc / 19, 2));
    const stripe = taper * (0.55 * Math.exp(-Math.pow(dd / sigma, 2)) + 0.08 * Math.exp(-Math.pow(dd / 4.5, 2)));

    /* Canto inferior direito: o grão rareia aos poucos à volta do "n",
       para o símbolo se ler limpo (utilizador, 2026-11-14). */
    const dn = Math.hypot(x - 78.1, y - 48);
    const clareira = 1 - 0.85 * Math.exp(-Math.pow(dn / 15, 2));

    const p = (1 - (1 - base) * (1 - corner) * (1 - stripe)) * clareira;
    return Math.min(p, 0.82);
  }

  /**
   * Desenha o grão num contexto 2D.
   * o.pxPerMm  píxeis por milímetro do cartão
   * o.bleed    milímetros de sangria à volta do corte (o canvas cobre-a)
   * o.seed     semente (o mesmo número dá o mesmo grão)
   * o.ink      cor do grão (preto por omissão)
   */
  window.desenharGrao = function (ctx, o) {
    const k = o.pxPerMm, bleed = o.bleed || 0, seed = o.seed || 7;
    const rand = mulberry32(seed);
    const fbm = makeNoise(seed);
    const g = 0.085; // lado de cada célula, em mm
    ctx.fillStyle = o.ink || "#000";
    for (let y = -bleed; y < H + bleed; y += g) {
      for (let x = -bleed; x < W + bleed; x += g) {
        const p = density(x + g / 2, y + g / 2, fbm);
        if (rand() >= p) continue;
        const px = (x + bleed + rand() * g) * k;
        const py = (y + bleed + rand() * g) * k;
        const r = Math.max(0.45, g * (0.32 + 0.5 * rand()) * k);
        ctx.globalAlpha = 0.72 + 0.28 * rand();
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  };
})();
