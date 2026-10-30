"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Lang } from "@/lib/i18n";
import { confirmationHtml, confirmationSubject } from "@/lib/proposal/email";
import { inviteHtml, inviteSubject } from "@/lib/proposal/invite";
import { offerDefaults, offerHtml, offerSubject } from "@/lib/proposal/offer";
import { isSlot, slotSentence } from "@/lib/proposal/slots";
import { StudioGuide } from "./studio-guide";
import { Wordmark } from "./wordmark";

/* ==================================================================
   The studio's composer (/interno)

   Where the partners write the answers to a request, see them as the
   client will, and send them. Portuguese only: it is for the studio.

   The client's email finds the request in Notion and fills in the name,
   the company and the language; the request's page is what the
   invitation's links point at. Everything stays editable. The preview
   on the right is the email itself, drawn here from the same code the
   server sends (links are dummies until it is sent or copied).

   Two ways out: "Enviar", from ola@nevima.studio with a copy to the
   studio, which also moves the request on in Notion; or "Copiar para o
   Gmail", the finished email with its links signed, to paste into a
   new message there (Notion is then updated by hand).

   The first tab, "Como funciona", is the whole process explained
   (studio-guide.tsx): a partner opening this page for the first time
   lands on it; after that, the page opens on the invitation.
   ================================================================== */

type Kind = "invite" | "offer" | "confirmation";

type Found = { id: string; url: string; name: string; company: string; lang: Lang; state: string; received: string };

type View = Kind | "guide";

const KINDS: { id: View; label: string }[] = [
  { id: "guide", label: "Como funciona" },
  { id: "invite", label: "Convite para chamada" },
  { id: "offer", label: "Proposta final" },
  { id: "confirmation", label: "Confirmação automática" },
];

const ERRORS: Record<string, string> = {
  name: "Falta o nome.",
  page: "Falta ligar ao pedido no Notion (procurar pelo email ou colar o link da página).",
  slots: "Faltam os dois horários.",
  email: "O email do cliente não é válido.",
  file: "O contrato tem de ser um PDF.",
  too_large: "O PDF tem mais de 4 MB.",
  LINKS_SECRET: "Falta LINKS_SECRET na Vercel: sem ele os links dos horários não podem ser assinados.",
  RESEND_API_KEY: "Falta RESEND_API_KEY na Vercel.",
  not_sent: "O Resend recusou o envio. Ver os registos na Vercel.",
  forbidden: "A sessão terminou. Recarregar a página e entrar de novo.",
};

/** A sample time for the preview, so it is never empty: the next weekday at a given hour. */
function sampleSlot(daysAhead: number, hour: string) {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + 1);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${hour}`;
}

const pageIdOf = (value: string) => value.replace(/-/g, "").match(/[0-9a-f]{32}/i)?.[0] ?? "";

const field = "mt-2 w-full border border-hair-strong bg-paper px-3 py-2.5 text-[0.9375rem] outline-none focus:border-ink";

function Label({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="mono-label block text-ash">
      {children}
    </label>
  );
}

export function StudioLogin() {
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  async function enter(event: React.FormEvent) {
    event.preventDefault();
    const res = await fetch("/api/studio/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key }),
    });
    if (res.ok) window.location.reload();
    else
      setError(
        res.status === 429
          ? "Demasiadas tentativas. Esperar 1 minuto."
          : res.status === 503
            ? "Este site ainda não tem chave: falta STUDIO_KEY na Vercel (em Production), e publicar de novo depois de a acrescentar."
            : "Chave errada.",
      );
  }
  return (
    <main className="flex min-h-[var(--screen)] flex-col bg-ink text-paper">
      <form onSubmit={enter} className="shell flex flex-1 flex-col justify-center gap-6 py-16">
        <Wordmark className="block h-auto w-40" />
        <p className="mono-label text-paper/60">Interno · só para o estúdio</p>
        <input
          type="password"
          autoComplete="current-password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          aria-label="Chave"
          placeholder="Chave"
          className="w-full max-w-sm border border-paper/30 bg-transparent px-3 py-3 text-paper outline-none placeholder:text-paper/40 focus:border-paper"
        />
        <button type="submit" className="cta-crate inline-flex w-fit items-center text-[0.9375rem] leading-none">
          Entrar
          <span aria-hidden="true" className="cta-crate-key">
            &rarr;
          </span>
        </button>
        {error && <p className="text-paper/70">{error}</p>}
      </form>
    </main>
  );
}

/** Remembers, in this browser, that the guide has been seen. */
const GUIDE_SEEN = "nevima:interno-guide";

export function StudioComposer() {
  const [view, setView] = useState<View>("invite");
  const kind: Kind = view === "guide" ? "invite" : view;
  const [email, setEmail] = useState("");
  const [found, setFound] = useState<Found | null>(null);
  const [pageLink, setPageLink] = useState("");
  const [looking, setLooking] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [lang, setLang] = useState<Lang>("pt");
  const [slots, setSlots] = useState<[string, string]>(["", ""]);
  const [total, setTotal] = useState("");
  const [monthly, setMonthly] = useState("");
  const [note, setNote] = useState<string>(offerDefaults("pt").note);
  const [text, setText] = useState<string>(offerDefaults("pt").text);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<{ tone: "ok" | "error"; words: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [origin, setOrigin] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => setOrigin(window.location.origin), []);

  useEffect(() => {
    try {
      if (!window.localStorage.getItem(GUIDE_SEEN)) {
        setView("guide");
        window.localStorage.setItem(GUIDE_SEEN, "1");
      }
    } catch {
      // No storage: the page opens on the invitation, and the guide is a tab away.
    }
  }, []);

  // The defaults follow the language until the studio writes its own.
  function switchLang(next: Lang) {
    if (text === offerDefaults(lang).text) setText(offerDefaults(next).text);
    if (note === offerDefaults(lang).note) setNote(offerDefaults(next).note);
    setLang(next);
  }

  const page = found?.id ?? pageIdOf(pageLink);

  async function lookUp() {
    setLooking("A procurar…");
    const res = await fetch("/api/studio/lookup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }).catch(() => null);
    const data = res ? ((await res.json().catch(() => ({}))) as { request?: Found; error?: string }) : {};
    if (data.request) {
      const r = data.request;
      setFound(r);
      setName(r.name);
      setCompany(r.company);
      switchLang(r.lang);
      setLooking("");
    } else {
      setFound(null);
      setLooking(
        data.error === "not_found"
          ? "Nenhum pedido com este email."
          : data.error === "not_configured"
            ? "O Notion não está configurado aqui. Colar o link da página abaixo."
            : "Não foi possível procurar.",
      );
    }
  }

  const previewSlots: [string, string] = [
    isSlot(slots[0]) ? slots[0] : sampleSlot(3, "15:00"),
    isSlot(slots[1]) ? slots[1] : sampleSlot(4, "10:30"),
  ];

  const { subject, html } = useMemo(() => {
    const site = origin || "https://nevima.studio";
    const who = name || (lang === "pt" ? "Nome" : "Name");
    if (kind === "invite") {
      return {
        subject: inviteSubject(lang),
        html: inviteHtml({ lang, name: who, company, slots: previewSlots, links: ["#", "#"], siteUrl: site }),
      };
    }
    if (kind === "offer") {
      return {
        subject: offerSubject(lang),
        html: offerHtml({ lang, name: who, text, total, monthly, note, file: file?.name ?? "", siteUrl: site }),
      };
    }
    return { subject: confirmationSubject(lang), html: confirmationHtml({ name: who }, lang, site) };
    // previewSlots is derived from slots, which is listed.
  }, [kind, lang, name, company, slots, total, monthly, note, text, file, origin]);

  function body(mode: "render" | "send") {
    const form = new FormData();
    form.set("kind", kind);
    form.set("mode", mode);
    form.set("fields", JSON.stringify({ email, page, name, company, lang, slots, text, total, monthly, note }));
    if (file && kind === "offer") form.set("file", file);
    return form;
  }

  function fail(data: { error?: string; field?: string }) {
    setStatus({ tone: "error", words: ERRORS[data.field ?? ""] ?? ERRORS[data.error ?? ""] ?? "Algo correu mal." });
  }

  async function send() {
    if (kind === "confirmation") return;
    const who = `${name} <${email}>`;
    if (!window.confirm(`Enviar "${subject}" para ${who}?`)) return;
    setBusy(true);
    setStatus(null);
    const res = await fetch("/api/studio/email", { method: "POST", body: body("send") }).catch(() => null);
    const data = res ? ((await res.json().catch(() => ({}))) as { ok?: boolean; notion?: boolean | null; error?: string; field?: string }) : {};
    setBusy(false);
    if (!data.ok) return fail(data);
    const notion =
      data.notion === true ? " O Notion foi atualizado." : data.notion === false ? " O Notion não foi atualizado: fazê-lo à mão." : "";
    setStatus({ tone: "ok", words: `Enviado para ${email}, com cópia para o estúdio.${notion}` });
  }

  async function copy() {
    setBusy(true);
    setStatus(null);
    const res = await fetch("/api/studio/email", { method: "POST", body: body("render") }).catch(() => null);
    const data = res ? ((await res.json().catch(() => ({}))) as { ok?: boolean; html?: string; text?: string; error?: string; field?: string }) : {};
    setBusy(false);
    if (!data.ok || !data.html) return fail(data);
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/html": new Blob([data.html], { type: "text/html" }),
          "text/plain": new Blob([data.text ?? ""], { type: "text/plain" }),
        }),
      ]);
      setStatus({
        tone: "ok",
        words: `Copiado. No Gmail: nova mensagem, colar no corpo (Ctrl+V), assunto "${subject}"${kind === "offer" ? ", e anexar o contrato" : ""}.`,
      });
    } catch {
      setStatus({ tone: "error", words: "O navegador não deixou copiar. Tentar no Chrome ou no Edge." });
    }
  }

  return (
    <main className="min-h-[var(--screen)] bg-paper text-ink">
      <header className="bg-ink text-paper">
        <div className="shell flex flex-wrap items-center justify-between gap-4 py-5">
          <div className="flex items-center gap-4">
            <Wordmark className="block h-auto w-24" />
            <span className="mono-label border border-paper/30 px-2 py-1">Interno</span>
          </div>
          <nav className="flex flex-wrap gap-1" aria-label="Secções">
            {KINDS.map((k) => (
              <button
                key={k.id}
                type="button"
                onClick={() => {
                  setView(k.id);
                  setStatus(null);
                }}
                aria-pressed={view === k.id}
                className={`mono-label border px-3 py-2 ${view === k.id ? "border-paper bg-paper text-ink" : "border-paper/30 text-paper"}`}
              >
                {k.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {view === "guide" ? (
        <StudioGuide onStart={() => setView("invite")} />
      ) : (
      <div className="shell grid gap-10 py-10 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
        <section className="flex flex-col gap-6">
          {kind === "confirmation" ? (
            <p className="text-ash">
              Este email sai sozinho, assim que um pedido chega ao Notion, na língua em que o site foi usado. Aqui só se vê; para mudar
              o texto, alterar <code className="font-mono text-[0.8125rem]">src/lib/proposal/email.ts</code>.
            </p>
          ) : (
            <>
              <div>
                <Label htmlFor="c-email">Email do cliente</Label>
                <div className="flex gap-2">
                  <input id="c-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={field} />
                  <button
                    type="button"
                    onClick={lookUp}
                    disabled={!email.includes("@")}
                    className="mono-label mt-2 shrink-0 border border-ink px-3 disabled:opacity-40"
                  >
                    Procurar
                  </button>
                </div>
                {found ? (
                  <p className="mt-2 text-[0.875rem] text-ash">
                    Ligado ao pedido de {new Date(found.received).toLocaleDateString("pt-PT")} · {found.state || "sem estado"} ·{" "}
                    <a href={found.url} target="_blank" rel="noreferrer" className="text-ink underline underline-offset-4">
                      abrir no Notion
                    </a>
                  </p>
                ) : (
                  looking && <p className="mt-2 text-[0.875rem] text-ash">{looking}</p>
                )}
              </div>
              {!found && (
                <div>
                  <Label htmlFor="c-page">Ou o link da página no Notion</Label>
                  <input id="c-page" value={pageLink} onChange={(e) => setPageLink(e.target.value)} className={field} />
                </div>
              )}
            </>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="c-name">Nome</Label>
              <input id="c-name" value={name} onChange={(e) => setName(e.target.value)} className={field} />
            </div>
            <div>
              <Label htmlFor="c-company">Empresa</Label>
              <input id="c-company" value={company} onChange={(e) => setCompany(e.target.value)} className={field} />
            </div>
          </div>

          <div>
            <Label>Língua</Label>
            <div className="mt-2 flex">
              {(["pt", "en"] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => switchLang(l)}
                  aria-pressed={lang === l}
                  className={`mono-label border px-4 py-2 first:border-r-0 ${lang === l ? "border-ink bg-ink text-paper" : "border-hair-strong"}`}
                >
                  {l === "pt" ? "Português" : "English"}
                </button>
              ))}
            </div>
          </div>

          {kind === "invite" && (
            <div className="grid gap-4">
              {[0, 1].map((i) => (
                <div key={i}>
                  <Label htmlFor={`c-slot-${i}`}>Horário {i + 1} · hora de Lisboa</Label>
                  <input
                    id={`c-slot-${i}`}
                    type="datetime-local"
                    step={900}
                    value={slots[i]}
                    onChange={(e) => {
                      const next: [string, string] = [...slots];
                      next[i] = e.target.value.slice(0, 16);
                      setSlots(next);
                    }}
                    className={field}
                  />
                  {isSlot(slots[i]) && <p className="mt-1 text-[0.8125rem] text-ash">{slotSentence(slots[i], lang)}</p>}
                </div>
              ))}
            </div>
          )}

          {kind === "offer" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="c-total">Valor final (€)</Label>
                  <input id="c-total" inputMode="decimal" value={total} onChange={(e) => setTotal(e.target.value)} className={field} placeholder="2450" />
                </div>
                <div>
                  <Label htmlFor="c-monthly">Mensal (€, opcional)</Label>
                  <input id="c-monthly" inputMode="decimal" value={monthly} onChange={(e) => setMonthly(e.target.value)} className={field} placeholder="40" />
                </div>
              </div>
              <div>
                <Label htmlFor="c-note">Nota sob o valor</Label>
                <input id="c-note" value={note} onChange={(e) => setNote(e.target.value)} className={field} />
              </div>
              <div>
                <Label htmlFor="c-text">Texto da proposta</Label>
                <textarea id="c-text" rows={9} value={text} onChange={(e) => setText(e.target.value)} className={`${field} leading-relaxed`} />
                <p className="mt-1 text-[0.8125rem] text-ash">Uma linha em branco começa um parágrafo novo.</p>
              </div>
              <div>
                <Label htmlFor="c-file">Contrato (PDF, até 4 MB)</Label>
                <input
                  id="c-file"
                  ref={fileInput}
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  className="mt-2 block w-full text-[0.875rem] file:mr-3 file:border file:border-ink file:bg-paper file:px-3 file:py-2 file:font-mono file:text-[0.75rem] file:uppercase"
                />
              </div>
            </>
          )}

          {kind !== "confirmation" && (
            <div className="flex flex-wrap items-center gap-3 border-t border-hair pt-6">
              <button
                type="button"
                onClick={send}
                disabled={busy}
                className="cta-crate inline-flex items-center whitespace-nowrap text-[0.9375rem] leading-none disabled:opacity-60"
              >
                Enviar
                <span aria-hidden="true" className="cta-crate-key">
                  &rarr;
                </span>
              </button>
              <button type="button" onClick={copy} disabled={busy} className="mono-label border border-ink px-3 py-3 disabled:opacity-40">
                Copiar para o Gmail
              </button>
            </div>
          )}
          {status && (
            <p role="status" className={status.tone === "ok" ? "text-ink" : "text-[#b3261e]"}>
              {status.words}
            </p>
          )}
        </section>

        <section aria-label="Pré-visualização" className="min-w-0">
          <p className="mono-label text-ash">
            Assunto · <span className="normal-case text-ink">{subject}</span>
          </p>
          <iframe title="Pré-visualização do email" srcDoc={html} className="mt-3 h-[min(78rem,calc(var(--screen)*1.4))] w-full border border-hair" />
        </section>
      </div>
      )}
    </main>
  );
}
