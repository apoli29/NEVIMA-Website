import type { Lang } from "../i18n";

/* ==================================================================
   The look the studio's emails share

   Built as table markup with inline styles, because mail apps ignore
   most of what a web page can do: no SVG, no layout but tables, and in
   Gmail no web fonts. The site's identity is carried by what survives
   all of them:

   - black and white only, ash for what is secondary, hairlines between;
   - a black band at the top with the wordmark and a mono label in a
     hairline box, as the form's choices are boxed on the site;
   - the greeting set large, as a title;
   - buttons as the bar's crate: black, with the arrow in a white key;
   - a black foot with the wordmark across its whole width, as the
     site's footer ends every page.

   Satoshi, Instrument Sans and Geist Mono are asked for; the apps that
   load web fonts (Apple Mail, iOS) show them, the others fall back to
   Helvetica and the system's monospace.

   Pure strings, so the studio's composer can draw the same email in
   the browser that the server sends.
   ================================================================== */

export const STUDIO_EMAIL = "ola@nevima.studio";

/** The two partners' phones, in the order the studio gave them. */
export const PHONES = [
  { label: "+351 910 555 780", tel: "+351910555780" },
  { label: "+351 917 861 347", tel: "+351917861347" },
];

export const INK = "#000000";
export const ASH = "#55534f";
const ASH_ON_BLACK = "#9a9893";
const HAIR = "#e6e5e2";
const HAIR_ON_BLACK = "#3a3936";

const TITLE = "Satoshi,'Helvetica Neue',Helvetica,Arial,sans-serif";
export const READ = "'Instrument Sans','Helvetica Neue',Helvetica,Arial,sans-serif";
export const MONO = "'Geist Mono','SFMono-Regular',Menlo,Consolas,'Liberation Mono',monospace";

export const escapeHtml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const PAD = "32px";

/** A row of the column. */
const row = (inner: string, padding = `0 ${PAD}`) => `<tr><td class="nv-pad" style="padding:${padding};">${inner}</td></tr>`;

/** The greeting, set as a title. */
export const hello = (words: string) =>
  row(
    `<h1 style="margin:0;font-family:${TITLE};font-size:30px;line-height:1.15;font-weight:500;letter-spacing:-0.02em;color:${INK};">${escapeHtml(words)}</h1>`,
    `40px ${PAD} 24px`,
  );

const P = `margin:0 0 18px;font-family:${READ};font-size:16px;line-height:1.6;color:${INK};`;

/** Paragraphs: a blank line between two starts the next one. */
export function prose(text: string) {
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p style="${P}">${escapeHtml(p).replace(/\n/g, "<br>")}</p>`)
    .join("");
  return row(paragraphs);
}

/** A mono label, in capitals. */
export const label = (words: string, color = ASH) =>
  `<span style="font-family:${MONO};font-size:11px;line-height:1.45;letter-spacing:0.06em;text-transform:uppercase;color:${color};">${escapeHtml(words)}</span>`;

/** A hairline across the column. */
export const rule = () =>
  row(`<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="border-top:1px solid ${HAIR};font-size:0;line-height:0;height:1px;">&nbsp;</td></tr></table>`, `8px ${PAD} 26px`);

/** One of the times for the call: the bar's crate, full width. */
export function slotButton(href: string, day: string, time: string) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 10px;">
  <tr><td bgcolor="${INK}" style="background:${INK};">
    <a href="${escapeHtml(href)}" target="_blank" style="display:block;text-decoration:none;color:#ffffff;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
        <td style="padding:14px 0 14px 20px;vertical-align:middle;">
          ${label(day, ASH_ON_BLACK)}<br>
          <span style="font-family:${TITLE};font-size:24px;line-height:1.25;font-weight:500;letter-spacing:-0.01em;color:#ffffff;">${escapeHtml(time)}</span>
        </td>
        <td width="44" style="padding:10px 10px 10px 0;vertical-align:middle;">
          <table role="presentation" width="44" cellpadding="0" cellspacing="0"><tr>
            <td width="44" height="44" align="center" bgcolor="#ffffff" style="background:#ffffff;width:44px;height:44px;font-family:${READ};font-size:20px;line-height:44px;color:${INK};text-align:center;">&rarr;</td>
          </tr></table>
        </td>
      </tr></table>
    </a>
  </td></tr>
</table>`;
}

/** A block of slot buttons with its caption under them. */
export const slotBlock = (buttons: string, caption: string) =>
  row(`${buttons}<p style="margin:4px 0 26px;">${label(caption)}</p>`);

/** The phones, each a box to tap that calls it. */
export function phoneChips() {
  const chips = PHONES.map(
    (phone) => `<td style="padding:0 8px 8px 0;">
      <a href="tel:${phone.tel}" style="display:inline-block;padding:9px 12px;border:1px solid ${INK};font-family:${MONO};font-size:13px;line-height:1;letter-spacing:0.04em;color:${INK};text-decoration:none;white-space:nowrap;">${phone.label}</a>
    </td>`,
  ).join("");
  return row(`<table role="presentation" cellpadding="0" cellspacing="0" style="margin:-4px 0 18px;"><tr>${chips}</tr></table>`);
}

/** A figure with its label above and a note under it: the final value. */
export function figure(caption: string, value: string, extra: string, note: string) {
  return row(
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:6px 0 26px;border-top:1px solid ${INK};border-bottom:1px solid ${HAIR};">
      <tr><td style="padding:16px 0 18px;">
        ${label(caption)}<br>
        <span style="font-family:${TITLE};font-size:40px;line-height:1.2;font-weight:500;letter-spacing:-0.03em;color:${INK};">${escapeHtml(value)}</span>${
          extra
            ? `<span style="font-family:${TITLE};font-size:20px;line-height:1.2;font-weight:400;letter-spacing:-0.01em;color:${ASH};">&nbsp;&nbsp;${escapeHtml(extra)}</span>`
            : ""
        }${note ? `<br><span style="font-family:${READ};font-size:13px;line-height:1.5;color:${ASH};">${escapeHtml(note)}</span>` : ""}
      </td></tr>
    </table>`,
  );
}

/** The attachment, named, so it is looked for. */
export function attachment(caption: string, name: string) {
  return row(
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 26px;"><tr>
      <td style="padding:14px 16px;border:1px solid ${INK};">
        ${label(caption)}<br>
        <span style="font-family:${MONO};font-size:14px;line-height:1.5;color:${INK};">${escapeHtml(name)}</span>
      </td>
      <td width="60" align="center" bgcolor="${INK}" style="background:${INK};width:60px;">${label("PDF", "#ffffff")}</td>
    </tr></table>`,
  );
}

/** The closing and the black wordmark. */
export function signoff(words: string, siteUrl: string) {
  return row(
    `<p style="margin:8px 0 14px;font-family:${READ};font-size:16px;line-height:1.6;color:${INK};">${escapeHtml(words)}</p>
    <img src="${siteUrl}/email/wordmark-black.png" width="96" height="21" alt="nevima" style="display:block;border:0;width:96px;height:auto;">`,
    `0 ${PAD} 44px`,
  );
}

type Shell = {
  lang: Lang;
  subject: string;
  /** What the inbox shows beside the subject. */
  preheader: string;
  /** The mono label in the top band. */
  tag: string;
  /** Rows made with the helpers above. */
  body: string;
  /** Why the reader is getting it, small in the foot. */
  why: string;
  siteUrl: string;
};

export function shell({ lang, subject, preheader, tag, body, why, siteUrl }: Shell) {
  const site = siteUrl.replace(/^https?:\/\//, "");
  return `<!doctype html>
<html lang="${lang === "pt" ? "pt-PT" : "en"}" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<meta name="x-apple-disable-message-reformatting">
<title>${escapeHtml(subject)}</title>
<link href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400&family=Instrument+Sans:wght@400;500&display=swap" rel="stylesheet">
<style>
  @font-face { font-family: Satoshi; src: url(${siteUrl}/email/Satoshi-Variable.woff2) format("woff2"); font-weight: 300 900; }
  body { margin: 0; padding: 0; -webkit-text-size-adjust: 100%; }
  a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; }
  @media (max-width: 480px) {
    .nv-pad { padding-left: 22px !important; padding-right: 22px !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background:#ffffff;">
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:#ffffff;">${escapeHtml(preheader)}&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#ffffff" style="background:#ffffff;">
  <tr><td align="center" style="padding:24px 10px;">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;">
      <tr><td bgcolor="${INK}" class="nv-pad" style="background:${INK};padding:26px ${PAD};">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
          <td style="vertical-align:middle;"><img src="${siteUrl}/email/wordmark.png" width="112" alt="nevima" style="display:block;border:0;width:112px;height:auto;"></td>
          <td align="right" style="vertical-align:middle;">
            <span style="display:inline-block;padding:6px 9px;border:1px solid ${HAIR_ON_BLACK};">${label(tag, "#ffffff")}</span>
          </td>
        </tr></table>
      </td></tr>
      ${body}
      <tr><td bgcolor="${INK}" class="nv-pad" style="background:${INK};padding:30px ${PAD} 26px;">
        <img src="${siteUrl}/email/wordmark-foot.png" width="536" alt="nevima" style="display:block;border:0;width:100%;max-width:536px;height:auto;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:26px;border-top:1px solid ${HAIR_ON_BLACK};"><tr>
          <td style="padding-top:14px;vertical-align:top;">
            <a href="mailto:${STUDIO_EMAIL}" style="text-decoration:none;">${label(STUDIO_EMAIL, "#ffffff")}</a>
          </td>
          <td align="right" style="padding-top:14px;vertical-align:top;">
            <a href="${siteUrl}${lang === "pt" ? "/pt" : ""}" style="text-decoration:none;">${label(site, "#ffffff")}</a>
          </td>
        </tr></table>
        <p style="margin:14px 0 0;font-family:${READ};font-size:12px;line-height:1.5;color:${ASH_ON_BLACK};">${escapeHtml(why)}</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

/** The plain-text version that goes with every email. */
export const plain = (lines: (string | false | null | undefined)[]) =>
  lines.filter((line) => line !== false && line !== null && line !== undefined).join("\n");
