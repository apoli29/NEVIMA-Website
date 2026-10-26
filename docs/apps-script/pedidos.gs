/* ==================================================================
   Pedidos NEVIMA: the Google Sheet's script

   Receives what /api/proposal and /api/partner send (src/lib/proposal/
   deliver.ts), adds a row to the right tab ("Pedidos" for a proposal
   request, "Parceiros" for a partner) and mails the studio.

   Setup (Extensions > Apps Script, in the sheet):
   1. Paste this file and save.
   2. Project settings > Script properties, add:
      TOKEN      a long random phrase, the same as APPS_SCRIPT_TOKEN in Vercel
      NOTIFY_TO  where the notices go, e.g. ola@nevima.studio
                 (several: separated by commas)
   3. Deploy > New deployment > Web app: execute as "Me", access
      "Anyone". Copy the /exec address into APPS_SCRIPT_URL in Vercel.
   After changing this file: Deploy > Manage deployments > edit (pencil)
   > Version: New version > Deploy. The address stays the same.

   Anyone may call the address, but a call without the TOKEN is refused
   and writes nothing.
   ================================================================== */

const TABS = {
  proposal: {
    name: "Pedidos",
    headers: [
      "Recebido", "Origem", "Estado", "Nome", "Email", "Telefone", "Empresa",
      "Serviços", "Setor", "País", "Estimativa (€)", "Mensal (€)", "Prazo",
      "Mensagem", "Idioma", "Respostas (JSON)",
    ],
    row: (d) => [
      d.at, d.origin, "Novo", d.name, d.email, d.phone, d.company,
      d.services, d.sector, d.country, d.estimate, d.monthly, d.timeline,
      d.message, d.lang, d.answers,
    ],
    subject: (d) => "Novo pedido: " + (d.name || "sem nome") + (d.company ? " (" + d.company + ")" : ""),
    body: (d) => [
      "Nome: " + d.name,
      "Email: " + d.email,
      "Telefone: " + d.phone,
      "Empresa: " + d.company,
      "",
      "Serviços: " + d.services,
      "Setor: " + d.sector + " · País: " + d.country,
      "Estimativa: " + d.estimate + " €" + (d.monthly ? " + " + d.monthly + " €/mês" : ""),
      "Prazo: " + d.timeline,
      "Origem: " + d.origin + " · Idioma: " + d.lang,
      "",
      "Mensagem:",
      d.message || "(sem mensagem)",
    ],
  },
  partner: {
    name: "Parceiros",
    headers: [
      "Recebido", "Estado", "Nome", "Email", "Telefone", "Empresa",
      "Projeto", "Ecrãs", "Ecrãs (estimativa)", "Inspiração", "Link",
      "Início", "Entrega", "Modelo", "Crédito", "NDA",
      "Mensagem", "Idioma", "Respostas (JSON)",
    ],
    row: (d) => [
      d.at, "Novo", d.name, d.email, d.phone, d.company,
      d.project, d.screens, d.screensEstimate, d.inspiration, d.inspirationLink,
      d.start, d.delivery, d.model, d.credit, d.nda,
      d.message, d.lang, d.answers,
    ],
    subject: (d) => "Novo parceiro: " + (d.company || d.name || "sem nome"),
    body: (d) => [
      "Nome: " + d.name,
      "Email: " + d.email,
      "Telefone: " + d.phone,
      "Empresa: " + d.company,
      "",
      "Projeto: " + d.project + " · Ecrãs: " + d.screens + (d.screensEstimate ? " (" + d.screensEstimate + ")" : ""),
      "Início: " + d.start + " · Entrega: " + d.delivery,
      "Modelo: " + d.model + " · Crédito: " + d.credit + " · NDA: " + d.nda,
      "Inspiração: " + d.inspiration + (d.inspirationLink ? " (" + d.inspirationLink + ")" : ""),
      "Idioma: " + d.lang,
      "",
      "Mensagem:",
      d.message || "(sem mensagem)",
    ],
  },
};

function doPost(e) {
  let data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return reply({ ok: false, error: "bad_json" });
  }

  const props = PropertiesService.getScriptProperties();
  if (!data.token || data.token !== props.getProperty("TOKEN")) {
    return reply({ ok: false, error: "unauthorized" });
  }
  const tab = TABS[data.kind];
  if (!tab) return reply({ ok: false, error: "unknown_kind" });

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const book = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = book.getSheetByName(tab.name);
    if (!sheet) sheet = book.insertSheet(tab.name);
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(tab.headers);
      sheet.setFrozenRows(1);
      sheet.getRange(1, 1, 1, tab.headers.length).setFontWeight("bold");
    }
    sheet.appendRow(tab.row(data).map(safe));
  } finally {
    lock.releaseLock();
  }

  const to = props.getProperty("NOTIFY_TO");
  if (to) {
    MailApp.sendEmail({
      to: to,
      replyTo: data.email,
      subject: tab.subject(data),
      body: tab.body(data).join("\n"),
    });
  }
  return reply({ ok: true });
}

// Text starting with = + - @ would be read as a formula in the sheet.
function safe(value) {
  const text = value === undefined || value === null ? "" : String(value);
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function reply(body) {
  return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(ContentService.MimeType.JSON);
}
