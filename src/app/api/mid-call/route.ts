import { sendEmail, studioInbox } from "@/lib/proposal/deliver";
import { allow, clientIp, json, readJson } from "@/lib/proposal/guard";
import { readMidCall } from "@/lib/proposal/meeting";
import { addAlert, getRequest, prop, setSteps, updatePage } from "@/lib/proposal/notion";
import { PEDIDOS } from "@/lib/proposal/steps";

/* The client's answer about the follow-up call, confirmed
   on the page the final proposal's buttons lead to. The request's page in
   Notion gets it, and the studio a notice. Answering again changes it: the
   last answer holds, and the studio is told each time. The answer also
   goes into "Histórico" (steps.ts); a failure there only reaches the
   log. The column's name is PEDIDOS.followUp in steps.ts (until
   2026-11-09, "Reunião a meio"). */

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

  const saved = await updatePage(token.page, { [PEDIDOS.followUp]: prop.select(answer) });
  if (saved) await setSteps(token.page, page.history, {}, `Chamada de acompanhamento: ${answer.toLowerCase()}`, "cliente");
  const told = await sendEmail({
    to: studioInbox(),
    reply_to: page.email || undefined,
    subject: `Chamada de acompanhamento: ${answer.toLowerCase()} (${page.name}${page.company ? `, ${page.company}` : ""})`,
    text: [
      yes
        ? `${page.name} quer a chamada de acompanhamento. Falta enviar um email para marcar a data.`
        : `${page.name} não quer a chamada de acompanhamento.`,
      "",
      `Email: ${page.email}`,
      `Idioma: ${page.lang}`,
      saved ? "" : "O Notion não foi atualizado: fazê-lo à mão.",
      page.url ? `No Notion: ${page.url}` : "",
    ].join("\n"),
  });
  if (!saved && !told) return json({ error: "not_configured" }, 503);
  if (!told) await addAlert(token.page, page.alerts, `Aviso não enviado: chamada de acompanhamento, ${answer.toLowerCase()}`);
  return json({ ok: true });
}
