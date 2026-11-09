/* ==================================================================
   The studio's email look, as a page to write a free email in

   Draws scripts/email-template.html: a page with the fields of the
   studio's emails (label, greeting, text, closing, signer) and the
   email itself beside them, drawn by the very code the server sends
   with (src/lib/proposal/mail.ts, embedded here as it is today). A
   button copies it to paste into a new Gmail message, as the
   composer's "Copiar para o Gmail" does.

   Run again after changing mail.ts: node scripts/email-template.mjs
   ================================================================== */

import { readFileSync, writeFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";

const SITE = "https://nevima-website.vercel.app";

const source = readFileSync(new URL("../src/lib/proposal/mail.ts", import.meta.url), "utf8");
const js = stripTypeScriptTypes(source, { mode: "strip" });

const page = `<!doctype html>
<html lang="pt-PT">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>nevima · email livre</title>
<!-- Gerado por scripts/email-template.mjs. Não editar à mão. -->
<style>
  * { box-sizing: border-box; }
  body { margin: 0; font-family: system-ui, sans-serif; color: #111; background: #f2f1ee; }
  .wrap { display: grid; grid-template-columns: 340px 1fr; min-height: 100vh; }
  form { padding: 24px; border-right: 1px solid #d8d6d1; background: #fff; display: grid; gap: 14px; align-content: start; }
  label { display: grid; gap: 4px; font-size: 12px; text-transform: uppercase; letter-spacing: .06em; color: #55534f; }
  input, textarea, select { font: 15px/1.4 system-ui, sans-serif; padding: 8px 10px; border: 1px solid #b9b7b2; background: #fff; color: #111; text-transform: none; letter-spacing: 0; }
  textarea { min-height: 220px; resize: vertical; }
  button { font: inherit; padding: 11px 16px; border: 0; background: #000; color: #fff; cursor: pointer; }
  #state { font-size: 13px; color: #55534f; min-height: 2.6em; }
  iframe { width: 100%; height: 100vh; border: 0; background: #000; }
  @media (max-width: 860px) { .wrap { grid-template-columns: 1fr; } iframe { height: 80vh; } }
</style>
</head>
<body>
<div class="wrap">
  <form id="f" onsubmit="return false">
    <label>Assunto (só para o Gmail)<input id="subject" value=""></label>
    <label>Etiqueta (canto superior direito)<input id="tag" value="Nevima"></label>
    <label>Saudação (título grande)<input id="greeting" value="Olá, "></label>
    <label>Texto (linha em branco = novo parágrafo)<textarea id="body"></textarea></label>
    <label>Ficheiros em anexo (um nome por linha)<textarea id="files" style="min-height:80px" placeholder="proposta-nevima.pdf"></textarea></label>
    <label>Título da caixa dos ficheiros<input id="filesCaption" value="Em anexo"></label>
    <label>Fecho<input id="closing" value="Cumprimentos,"></label>
    <label>Assina
      <select id="signer"><option value="">A nevima (sem nome)</option></select>
    </label>
    <label>Email no rodapé
      <input id="email" value="antonio@nevima.studio">
    </label>
    <label>Língua do endereço no rodapé
      <select id="lang"><option value="pt">Português</option><option value="en">English</option></select>
    </label>
    <label>Nota pequena no rodapé<textarea id="why" style="min-height:70px"></textarea></label>
    <button id="copy" type="button">Copiar para o Gmail</button>
    <div id="state"></div>
  </form>
  <iframe id="view" title="Pré-visualização do email"></iframe>
</div>

<script id="mail-source" type="text/plain">${js.replace(/<\/script>/g, "<\\/script>")}</script>
<script type="module">
  const SITE = ${JSON.stringify(SITE)};
  const src = document.getElementById("mail-source").textContent;
  const mail = await import(URL.createObjectURL(new Blob([src], { type: "text/javascript" })));
  const $ = (id) => document.getElementById(id);

  for (const name of mail.SIGNERS) $("signer").add(new Option(name, name));

  // The footer shows and links the address the images load from; the
  // brand's own address goes there instead.
  const fixSite = (html) =>
    html
      .split(mail.STUDIO_EMAIL).join($("email").value.trim() || mail.STUDIO_EMAIL)
      .replace(/href="https:\\/\\/nevima-website\\.vercel\\.app(\\/pt)?"/g, (_, pt) => 'href="https://nevima.studio' + (pt ?? "") + '"')
      .replace(/>nevima-website\\.vercel\\.app</g, ">nevima.studio<");

  function build() {
    const files = $("files").value.split("\\n").map((f) => f.trim()).filter(Boolean);
    const kindOf = (name) => {
      const ext = name.includes(".") ? name.split(".").pop().toUpperCase() : "";
      return ext && ext.length <= 4 ? ext : "FILE";
    };
    const attached = files.map((name, i) => mail.attachment(i === 0 ? $("filesCaption").value : "", name, kindOf(name))).join("");
    const body = [mail.prose($("body").value), attached, mail.signoff($("closing").value, SITE, $("signer").value)].join("");
    const html = fixSite(
      mail.shell({
        lang: $("lang").value,
        subject: $("subject").value || "nevima",
        preheader: "",
        tag: $("tag").value,
        greeting: $("greeting").value,
        body,
        why: $("why").value,
        siteUrl: SITE,
      }),
    );
    const text = mail.plain([$("greeting").value, "", $("body").value, "", ...(files.length ? [$("filesCaption").value + ": " + files.join(", "), ""] : []), $("closing").value, $("signer").value || "nevima", $("email").value.trim() || mail.STUDIO_EMAIL, "", $("why").value]);
    return { html, text };
  }

  const draw = () => ($("view").srcdoc = build().html);
  $("f").addEventListener("input", draw);
  draw();

  $("copy").addEventListener("click", async () => {
    const { html, text } = build();
    // From a file on the disk the browser often refuses the clipboard
    // API; the old way, a copy event that carries the email, still works.
    const viaEvent = () => {
      const hold = document.createElement("textarea");
      hold.value = "nevima";
      hold.style.cssText = "position:fixed;left:-9999px;top:0;opacity:0;";
      document.body.appendChild(hold);
      hold.select();
      const put = (e) => {
        e.clipboardData.setData("text/html", html);
        e.clipboardData.setData("text/plain", text);
        e.preventDefault();
      };
      document.addEventListener("copy", put, { once: true });
      const done = document.execCommand("copy");
      document.removeEventListener("copy", put);
      hold.remove();
      return done;
    };
    let ok = false;
    try {
      await navigator.clipboard.write([
        new ClipboardItem({ "text/html": new Blob([html], { type: "text/html" }), "text/plain": new Blob([text], { type: "text/plain" }) }),
      ]);
      ok = true;
    } catch {
      ok = viaEvent();
    }
    $("state").textContent = ok
      ? 'Copiado. No Gmail: nova mensagem, colar no corpo (Ctrl+V)' + ($("subject").value ? ', assunto "' + $("subject").value + '"' : "") + "."
      : "O browser não deixou copiar. Clica na pré-visualização, carrega em Ctrl+A e depois Ctrl+C.";
  });
</script>
</body>
</html>
`;

writeFileSync(new URL("./email-template.html", import.meta.url), page);
console.log("scripts/email-template.html");
