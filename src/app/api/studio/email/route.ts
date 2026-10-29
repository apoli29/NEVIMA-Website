import { confirmationHtml, confirmationSubject, confirmationText } from "@/lib/proposal/email";
import { sendEmail, siteUrl, studioInbox } from "@/lib/proposal/deliver";
import { json } from "@/lib/proposal/guard";
import { inviteHtml, inviteSubject, inviteText } from "@/lib/proposal/invite";
import { meetingLink, signMeeting } from "@/lib/proposal/meeting";
import { STUDIO_EMAIL } from "@/lib/proposal/mail";
import { getRequest, prop, updatePage } from "@/lib/proposal/notion";
import { offerHtml, offerSubject, offerText } from "@/lib/proposal/offer";
import { isSlot } from "@/lib/proposal/slots";
import { fromStudio } from "@/lib/proposal/studio";

/* ==================================================================
   The composer's email, drawn or sent (/interno)

   "render" gives back the finished email, links signed, for the studio
   to copy into Gmail. "send" sends it through Resend from the studio's
   address, with a copy to the studio's inbox (so it is in Gmail too,
   where the client's reply lands), and then moves the request on in
   Notion:

   - the invitation: "Contactado", when the request was still "Novo";
   - the proposal: "Proposta enviada", the final value, and "Contrato
     enviado" ticked when a contract went with it.

   The contract comes as a PDF of at most 4 MB: Vercel takes no larger
   request.
   ================================================================== */

export const dynamic = "force-dynamic";

const MAX_FILE = 4 * 1024 * 1024;

type Fields = {
  email: string;
  page: string;
  name: string;
  company: string;
  lang: "en" | "pt";
  slots: [string, string];
  text: string;
  total: string;
  monthly: string;
  note: string;
};

const str = (value: unknown, max = 5000) => (typeof value === "string" ? value.slice(0, max) : "");

function readFields(raw: unknown): Fields | null {
  if (typeof raw !== "string") return null;
  try {
    const f = JSON.parse(raw) as Record<string, unknown>;
    const slots = Array.isArray(f.slots) ? f.slots : [];
    return {
      email: str(f.email, 320).trim(),
      page: str(f.page, 64),
      name: str(f.name, 200).trim(),
      company: str(f.company, 200).trim(),
      lang: f.lang === "pt" ? "pt" : "en",
      slots: [str(slots[0], 16), str(slots[1], 16)],
      text: str(f.text, 8000),
      total: str(f.total, 40),
      monthly: str(f.monthly, 40),
      note: str(f.note, 300),
    };
  } catch {
    return null;
  }
}

/** "2 450,50 €" or "2.450" read as 2450.5 and 2450, for Notion's "Valor final". */
function euros(value: string): number | null {
  const digits = value.replace(/[^\d,.]/g, "");
  const plain = digits.includes(",")
    ? digits.replace(/\./g, "").replace(",", ".")
    : /\.\d{3}$/.test(digits)
      ? digits.replace(/\./g, "")
      : digits;
  const n = Number(plain);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export async function POST(request: Request) {
  if (!fromStudio(request)) return json({ error: "forbidden" }, 403);
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json({ error: "bad_request" }, 400);
  }
  const kind = form.get("kind");
  const mode = form.get("mode") === "send" ? "send" : "render";
  const f = readFields(form.get("fields"));
  if (!f || !f.name) return json({ error: "invalid", field: "name" }, 422);
  const site = siteUrl();

  let subject: string;
  let html: string;
  let text: string;
  let attachments: { filename: string; content: string }[] | undefined;

  if (kind === "invite") {
    if (!f.page) return json({ error: "invalid", field: "page" }, 422);
    if (!f.slots.every(isSlot)) return json({ error: "invalid", field: "slots" }, 422);
    const token = signMeeting({ page: f.page, slots: f.slots, lang: f.lang });
    if (!token) return json({ error: "not_configured", field: "LINKS_SECRET" }, 503);
    const invite = {
      lang: f.lang,
      name: f.name,
      company: f.company,
      slots: f.slots,
      links: [meetingLink(site, token, f.lang, 0), meetingLink(site, token, f.lang, 1)] as [string, string],
      siteUrl: site,
    };
    subject = inviteSubject(f.lang);
    html = inviteHtml(invite);
    text = inviteText(invite);
  } else if (kind === "offer") {
    const file = form.get("file");
    let filename = "";
    if (file instanceof File && file.size > 0) {
      if (file.size > MAX_FILE) return json({ error: "too_large" }, 413);
      if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
        return json({ error: "invalid", field: "file" }, 422);
      }
      filename = file.name.replace(/[^\w.\- ]+/g, "_");
      if (mode === "send") {
        attachments = [{ filename, content: Buffer.from(await file.arrayBuffer()).toString("base64") }];
      }
    }
    const offer = { ...f, file: filename, siteUrl: site };
    subject = offerSubject(f.lang);
    html = offerHtml(offer);
    text = offerText(offer);
  } else if (kind === "confirmation") {
    subject = confirmationSubject(f.lang);
    html = confirmationHtml({ name: f.name }, f.lang, site);
    text = confirmationText({ name: f.name }, f.lang);
  } else {
    return json({ error: "invalid", field: "kind" }, 422);
  }

  if (mode === "render") return json({ ok: true, subject, html, text });

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) return json({ error: "invalid", field: "email" }, 422);
  if (!process.env.RESEND_API_KEY) return json({ error: "not_configured", field: "RESEND_API_KEY" }, 503);
  const sent = await sendEmail({
    to: [f.email],
    bcc: studioInbox(),
    reply_to: STUDIO_EMAIL,
    subject,
    html,
    text,
    attachments,
  });
  if (!sent) return json({ error: "not_sent" }, 502);

  // The email is out; Notion is brought along, and its failing is reported, not fatal.
  let notion: boolean | null = null;
  if (f.page && kind === "invite") {
    const page = await getRequest(f.page);
    notion = page && (page.state === "" || page.state === "Novo") ? await updatePage(f.page, { Estado: prop.select("Contactado") }) : Boolean(page);
  } else if (f.page && kind === "offer") {
    notion = await updatePage(f.page, {
      Estado: prop.select("Proposta enviada"),
      "Valor final": prop.number(euros(f.total)),
      ...(attachments ? { "Contrato enviado": prop.checkbox(true) } : {}),
    });
  }
  return json({ ok: true, notion });
}
