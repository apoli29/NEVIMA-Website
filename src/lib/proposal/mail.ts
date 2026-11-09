import type { Lang } from "../i18n";

/* ==================================================================
   The look the studio's emails share

   Black, as the site's footer (user, 2026-10-29): white type, ash for
   what is secondary, dark hairlines. The footer's drifting light is
   held still in two wide pictures (scripts/email-light.mjs) laid on
   the email's whole black background, not inside its 600px column
   (user, 2026-10-30): the column is transparent, so the light reaches
   out on both sides of it and fades into the black before any edge,
   and nothing shows where a block ends. One is behind the top (the
   wordmark, a mono label in a hairline box, the greeting), one behind
   the foot, where the wordmark, with a glow of its own, sits in it.
   The light is kept low behind the words, as on the site; the letter
   between is read on plain black. A mail app that blocks images, or
   draws no background images (Outlook on Windows), shows plain black.

   On black the bar's crate is turned inside out, as it turns when it
   is pointed at on the site: a white button, the arrow in a black key.
   Phones are boxed mono chips that call.

   Built as table markup with inline styles, because mail apps ignore
   most of what a web page can do: no SVG, no layout but tables, and in
   Gmail no web fonts. Satoshi, Instrument Sans and Geist Mono are asked
   for; the apps that load web fonts (Apple Mail, iOS) show them, the
   others fall back to Helvetica and the system's monospace.

   Black that holds in dark mode (user, 2026-11-09). Gmail on the iPhone
   rewrites a dark email in dark mode: plain black backgrounds turn
   light and white type turns dark, but pictures are left as they are.
   A pasted email came out in three bands, black where the light's
   pictures were and white between them. So:
   - every black surface outside the words is also painted as a picture
     (a one-colour gradient), which Gmail leaves alone; the light's
     pictures lie on it with no colour of their own;
   - the words sit in two wrappers (keep) that blend Gmail's rewrite
     back: what it turned light becomes black again and the dark type
     white. Elsewhere the two blends change nothing. They are inline,
     not in a <style>, because Gmail drops the <style> of a pasted
     email, and the pasted email is how most are sent;
   - pictures stay out of the wrappers (the blend would turn them into
     negatives), and the wordmarks carry their own black, so they never
     vanish on an app that lightens the background anyway.
   Rows hold nothing wider than a phone: the phones wrap one under the
   other on a narrow screen.

   Pure strings, so the studio's composer can draw the same email in
   the browser that the server sends.
   ================================================================== */

export const STUDIO_EMAIL = "ola@nevima.studio";

/** The two partners' phones, in the order the studio gave them. */
export const PHONES = [
  { label: "+351 910 555 780", tel: "+351910555780" },
  { label: "+351 917 861 347", tel: "+351917861347" },
];

/** Who can sign the emails the studio writes. */
export const SIGNERS = ["António Policarpo", "Emanuel Costa"];

const INK = "#000000";
const PAPER = "#ffffff";
/** Ash, lifted for black: what is secondary. */
const ASH = "#9a9893";
/** Ash on the white buttons. */
const ASH_ON_WHITE = "#55534f";
const HAIR = "#2e2d2b";
const HAIR_STRONG = "#4a4945";

const TITLE = "Satoshi,'Helvetica Neue',Helvetica,Arial,sans-serif";
const READ = "'Instrument Sans','Helvetica Neue',Helvetica,Arial,sans-serif";
const MONO = "'Geist Mono','SFMono-Regular',Menlo,Consolas,'Liberation Mono',monospace";

export const escapeHtml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const PAD = "32px";

/** Black painted as a picture too: Gmail's dark mode turns a plain black
    background light, but leaves a picture, a gradient included, alone. */
const BLACK = `background-color:${INK};background-image:linear-gradient(${INK},${INK});`;

/** The words, kept as they are in Gmail's dark mode. Gmail turns the
    two black backgrounds light and the type dark; the first wrapper's
    blend lets only what is lighter than black through, the second's
    turns what is inside back the other way round. Where nothing is
    rewritten both leave everything as it is. No pictures inside. */
const keep = (inner: string, display = "block") =>
  `<div style="display:${display};background-color:${INK};mix-blend-mode:screen;"><div style="background-color:${INK};mix-blend-mode:difference;">${inner}</div></div>`;

/** A row of the column: transparent, so the background's light shows,
    with its words kept. */
const row = (inner: string, padding = `0 ${PAD}`) =>
  `<tr><td class="nv-pad" style="padding:${padding};">${keep(inner)}</td></tr>`;

const P = `margin:0 0 18px;font-family:${READ};font-size:16px;line-height:1.6;color:${PAPER};`;

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
const label = (words: string, color = ASH) =>
  `<span style="font-family:${MONO};font-size:11px;line-height:1.45;letter-spacing:0.06em;text-transform:uppercase;color:${color};">${escapeHtml(words)}</span>`;

/** One of the times for the call: the crate, inside out, full width. */
export function slotButton(href: string, day: string, time: string) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 10px;">
  <tr><td bgcolor="${PAPER}" style="background:${PAPER};">
    <a href="${escapeHtml(href)}" target="_blank" style="display:block;text-decoration:none;color:${INK};">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
        <td style="padding:14px 0 14px 20px;vertical-align:middle;">
          ${label(day, ASH_ON_WHITE)}<br>
          <span style="font-family:${TITLE};font-size:24px;line-height:1.25;font-weight:500;letter-spacing:-0.01em;color:${INK};">${escapeHtml(time)}</span>
        </td>
        <td width="44" style="padding:10px 10px 10px 0;vertical-align:middle;">
          <table role="presentation" width="44" cellpadding="0" cellspacing="0"><tr>
            <td width="44" height="44" align="center" bgcolor="${INK}" style="background:${INK};width:44px;height:44px;font-family:${READ};font-size:20px;line-height:44px;color:${PAPER};text-align:center;">&rarr;</td>
          </tr></table>
        </td>
      </tr></table>
    </a>
  </td></tr>
</table>`;
}

/** A block of slot buttons with its caption under them. */
export const slotBlock = (buttons: string, caption: string) =>
  row(`${buttons}<p style="margin:4px 0 26px;">${caption ? label(caption) : ""}</p>`);

/** The phones, each a box to tap that calls it. Side by side where they
    fit, one under the other on a narrow phone: each is a table of its
    own, aligned left, which every mail app wraps. The cell around them
    holds them, so the wrappers reach round both. */
export function phoneChips() {
  const chips = PHONES.map(
    (phone) => `<table role="presentation" align="left" cellpadding="0" cellspacing="0"><tr><td style="padding:0 8px 8px 0;">
      <a href="tel:${phone.tel}" style="display:inline-block;padding:9px 12px;border:1px solid ${PAPER};font-family:${MONO};font-size:13px;line-height:1;letter-spacing:0.04em;color:${PAPER};text-decoration:none;white-space:nowrap;">${phone.label}</a>
    </td></tr></table>`,
  ).join("");
  return row(
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:-4px 0 18px;"><tr><td>${chips}</td></tr></table>`,
  );
}

/** A figure with its label above and a note under it: the final value. */
export function figure(caption: string, value: string, extra: string, note: string) {
  return row(
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:6px 0 26px;border-top:1px solid ${PAPER};border-bottom:1px solid ${HAIR};">
      <tr><td style="padding:16px 0 18px;">
        ${label(caption)}<br>
        <span style="font-family:${TITLE};font-size:40px;line-height:1.2;font-weight:500;letter-spacing:-0.03em;color:${PAPER};">${escapeHtml(value)}</span>${
          extra
            ? `<span style="font-family:${TITLE};font-size:20px;line-height:1.2;font-weight:400;letter-spacing:-0.01em;color:${ASH};">&nbsp;&nbsp;${escapeHtml(extra)}</span>`
            : ""
        }${note ? `<br><span style="font-family:${READ};font-size:13px;line-height:1.5;color:${ASH};">${escapeHtml(note)}</span>` : ""}
      </td></tr>
    </table>`,
  );
}

/** The attachment, named, so it is looked for. */
export function attachment(caption: string, name: string, kind = "PDF") {
  return row(
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 26px;"><tr>
      <td style="padding:14px 16px;border:1px solid ${PAPER};">
        ${caption ? `${label(caption)}<br>` : ""}<span style="font-family:${MONO};font-size:14px;line-height:1.5;color:${PAPER};">${escapeHtml(name)}</span>
      </td>
      <td width="60" align="center" bgcolor="${PAPER}" style="background:${PAPER};width:60px;">${label(kind, INK)}</td>
    </tr></table>`,
  );
}

/** What the studio wrote for this client, in a hairline box, which keeps
    its room when nothing is written yet. */
export function boxed(text: string) {
  return row(
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:-4px 0 26px;"><tr>
      <td height="96" valign="top" style="height:96px;padding:14px 16px;border:1px solid ${HAIR_STRONG};font-family:${READ};font-size:15px;line-height:1.6;color:${PAPER};">${escapeHtml(text.trim()).replace(/\n/g, "<br>") || "&nbsp;"}</td>
    </tr></table>`,
  );
}

/** The wordmark on its own black, so it never vanishes. */
const wordmark = (siteUrl: string, width: number) =>
  `<img src="${siteUrl}/email/wordmark-on-black.png" width="${width}" alt="nevima" style="display:block;border:0;width:${width}px;height:auto;">`;

/** The closing, who signs it when a person does, and the wordmark (out
    of the wrappers, as every picture). */
export function signoff(words: string, siteUrl: string, signer = "") {
  return `<tr><td class="nv-pad" style="padding:0 ${PAD} 8px;">
    ${keep(`<p style="margin:8px 0 14px;font-family:${READ};font-size:16px;line-height:1.6;color:${PAPER};">${escapeHtml(words)}${signer ? `<br>${escapeHtml(signer)}` : ""}</p>`)}
    ${wordmark(siteUrl, 96)}
  </td></tr>`;
}

type Shell = {
  lang: Lang;
  subject: string;
  /** What the inbox shows beside the subject. */
  preheader: string;
  /** The mono label at the top. */
  tag: string;
  /** "Olá, Marta": set large, in the lit top. */
  greeting: string;
  /** Rows made with the helpers above. */
  body: string;
  /** Why the reader is getting it, small in the foot. */
  why: string;
  siteUrl: string;
};

/** A full-width band of the page with one of the light pictures behind
    it, centred on the column at its real size (1600px), and the column
    inside. Plain black where background images are not drawn. */
const band = (image: string, position: string, column: string) =>
  `<tr><td align="center" bgcolor="${INK}" style="padding:0;${BLACK}">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
      <td align="center" background="${image}" style="padding:0;background-image:url('${image}');background-repeat:no-repeat;background-position:${position};background-size:1600px auto;">
        <!--[if mso]><table role="presentation" width="600" align="center" cellpadding="0" cellspacing="0"><tr><td><![endif]-->
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;">${column}</table>
        <!--[if mso]></td></tr></table><![endif]-->
      </td>
    </tr></table>
  </td></tr>`;

export function shell({ lang, subject, preheader, tag, greeting, body, why, siteUrl }: Shell) {
  const site = siteUrl.replace(/^https?:\/\//, "");
  // Built by hand, not with row: the wordmark stays out of the wrappers.
  const top = `<tr><td class="nv-pad" style="padding:30px ${PAD} 42px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
          <td style="vertical-align:middle;">${wordmark(siteUrl, 104)}</td>
          <td align="right" style="vertical-align:middle;">
            ${keep(`<span style="display:inline-block;padding:6px 9px;border:1px solid ${HAIR_STRONG};">${label(tag, PAPER)}</span>`, "inline-block")}
          </td>
        </tr></table>
        ${keep(`<h1 style="margin:128px 0 0;font-family:${TITLE};font-size:34px;line-height:1.12;font-weight:500;letter-spacing:-0.025em;color:${PAPER};">${escapeHtml(greeting)}</h1>`)}
      </td></tr>`;
  // The mark's picture carries its glow round it, 32px on each side and
  // fading to nothing at its edge, so it fills the column and the letters
  // line up with the text above.
  const foot = `<tr><td style="padding:96px 0 0;font-size:0;line-height:0;">
        <img src="${siteUrl}/email/wordmark-glow.png" width="600" alt="nevima" style="display:block;border:0;width:100%;max-width:600px;height:auto;">
      </td></tr>
      ${row(
        `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid ${HAIR_STRONG};"><tr>
          <td style="padding-top:14px;vertical-align:top;">
            <a href="mailto:${STUDIO_EMAIL}" style="text-decoration:none;">${label(STUDIO_EMAIL, PAPER)}</a>
          </td>
          <td align="right" style="padding-top:14px;vertical-align:top;">
            <a href="${siteUrl}${lang === "pt" ? "/pt" : ""}" style="text-decoration:none;">${label(site, PAPER)}</a>
          </td>
        </tr></table>
        <p style="margin:14px 0 0;font-family:${READ};font-size:12px;line-height:1.5;color:${ASH};">${escapeHtml(why)}</p>`,
        `2px ${PAD} 30px`,
      )}`;
  return `<!doctype html>
<html lang="${lang === "pt" ? "pt-PT" : "en"}" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="dark">
<meta name="supported-color-schemes" content="dark">
<meta name="x-apple-disable-message-reformatting">
<title>${escapeHtml(subject)}</title>
<link href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400&family=Instrument+Sans:wght@400;500&display=swap" rel="stylesheet">
<style>
  :root { color-scheme: dark; supported-color-schemes: dark; }
  @font-face { font-family: Satoshi; src: url(${siteUrl}/email/Satoshi-Variable.woff2) format("woff2"); font-weight: 300 900; }
  body { margin: 0; padding: 0; -webkit-text-size-adjust: 100%; background: ${INK}; }
  a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; }
  @media (max-width: 480px) {
    .nv-pad { padding-left: 22px !important; padding-right: 22px !important; }
  }
</style>
</head>
<body bgcolor="${INK}" style="margin:0;padding:0;background:${INK};">
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:${INK};">${escapeHtml(preheader)}&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="${INK}" style="${BLACK}">
  ${band(`${siteUrl}/email/light-head.jpg`, "center top", top + body)}
  ${band(`${siteUrl}/email/light-foot.jpg`, "center top", foot)}
</table>
</body>
</html>`;
}

/** The plain-text version that goes with every email. */
export const plain = (lines: (string | false | null | undefined)[]) =>
  lines.filter((line) => line !== false && line !== null && line !== undefined).join("\n");
