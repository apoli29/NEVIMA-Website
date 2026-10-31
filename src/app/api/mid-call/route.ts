import { sendEmail, studioInbox } from "@/lib/proposal/deliver";
import { allow, clientIp, json, readJson } from "@/lib/proposal/guard";
import { readMidCall } from "@/lib/proposal/meeting";
import { addAlert, getRequest, prop, updatePage } from "@/lib/proposal/notion";

/* The client's answer about the call midway through the project, confirmed
   on the page the final proposal's buttons lead to. The request's page in
   Notion gets it, and the studio a notice. Answering again changes it: the
   last answer holds, and the studio is told each time. */

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!allow(`mid-call:${clientIp(request)}`, 10, 15 * 60_000)) return json({ error: "rate_limited" }, 429);
  const body = (await readJson(request)) as { t?: unknown; a?: unknown } | null;
  const token = readMidCall(body?.t);
  if (!token) return json({ error: "invalid" }, 400);
  const yes = body?.a === "yes";
  const answer = yes ? "Sim" : "Não";

  const page = await getRequest(token.page);
  if (!page) return json({ error: "not_found" }, 404);
  if (page.midCall === answer) return json({ ok: true });

  const saved = await updatePage(token.page, { "Reunião a meio": prop.select(answer) });
  const told = await sendEmail({
    to: studioInbox(),
    reply_to: page.email || undefined,
    subject: `Chamada a meio do projeto: ${answer.toLowerCase()} (${page.name}${page.company ? `, ${page.company}` : ""})`,
    text: [
      yes
        ? `${page.name} quer a chamada a meio do projeto. Falta enviar um email para marcar a data.`
        : `${page.name} não quer a chamada a meio do projeto.`,
      "",
      `Email: ${page.email}`,
      `Idioma: ${page.lang}`,
      saved ? "" : "O Notion não foi atualizado: fazê-lo à mão.",
      page.url ? `No Notion: ${page.url}` : "",
    ].join("\n"),
  });
  if (!saved && !told) return json({ error: "not_configured" }, 503);
  if (!told) await addAlert(token.page, page.alerts, `Aviso não enviado: chamada a meio, ${answer.toLowerCase()}`);
  return json({ ok: true });
}
