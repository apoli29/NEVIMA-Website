/* Gera os ficheiros dos cartões a partir de prova.html e mockup.html.
   Correr a partir da raiz do repositório:  node cartoes/gerar.cjs
   Saem em cartoes/: cartao-antonio.pdf, cartao-emanuel.pdf, chapa-deboss.pdf,
   branco-frente.pdf, os mockups em cartoes/mockups/ e, por fim, a ficha para
   a gráfica (ficha-grafica.pdf), que mostra os mockups. */
const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

const DIR = __dirname;
const url = (f, q) => "file://" + path.join(DIR, f) + "?" + q;

(async () => {
  const browser = await chromium.launch();

  const prova = await browser.newPage();
  for (const quem of ["antonio", "emanuel", "chapa", "branco"]) {
    await prova.goto(url("prova.html", "quem=" + quem));
    await prova.waitForSelector("body[data-pronto]");
    const nome = { chapa: "chapa-deboss.pdf", branco: "branco-frente.pdf" }[quem] || `cartao-${quem}.pdf`;
    await prova.pdf({ path: path.join(DIR, nome), width: "91mm", height: "61mm", printBackground: true, preferCSSPageSize: true });
    console.log("✓", nome);
  }

  fs.mkdirSync(path.join(DIR, "mockups"), { recursive: true });
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 1100 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  const cenas = [
    ["cena=par&quem=antonio", "cartao-antonio.jpg"],
    ["cena=par&quem=emanuel", "cartao-emanuel.jpg"],
    ["cena=todos", "cartoes-todos.jpg"],
    ["cena=detalhe", "deboss-detalhe.jpg"],
  ];
  for (const [q, nome] of cenas) {
    await page.goto(url("mockup.html", q));
    await page.waitForSelector("body[data-pronto]");
    await page.locator(".cena").screenshot({ path: path.join(DIR, "mockups", nome), type: "jpeg", quality: 92 });
    console.log("✓ mockups/" + nome);
  }

  const ficha = await browser.newPage();
  await ficha.goto(url("ficha-grafica.html", ""));
  await ficha.waitForSelector("body[data-pronto]");
  await ficha.pdf({ path: path.join(DIR, "ficha-grafica.pdf"), format: "A4", printBackground: true, preferCSSPageSize: true });
  console.log("✓ ficha-grafica.pdf");
  await browser.close();
})();
