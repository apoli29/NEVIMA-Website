/* Gera os ficheiros dos cartões a partir de prova.html e mockup.html.
   Correr a partir da raiz do repositório:  node cartoes/gerar.cjs
   Saem em cartoes/: cartao-antonio.pdf, cartao-emanuel.pdf, chapa-deboss.pdf
   e os mockups em cartoes/mockups/. */
const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

const DIR = __dirname;
const url = (f, q) => "file://" + path.join(DIR, f) + "?" + q;

(async () => {
  const browser = await chromium.launch();

  const prova = await browser.newPage();
  for (const quem of ["antonio", "emanuel", "chapa"]) {
    await prova.goto(url("prova.html", "quem=" + quem));
    await prova.waitForSelector("body[data-pronto]");
    const nome = quem === "chapa" ? "chapa-deboss.pdf" : `cartao-${quem}.pdf`;
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
  await browser.close();
})();
