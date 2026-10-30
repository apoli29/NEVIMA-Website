import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import type { Lang } from "../i18n";
import { isSlot } from "./slots";

/* ==================================================================
   The links on the invitation's buttons

   Each link carries the request's Notion page and the two times
   offered, signed with LINKS_SECRET, so a link cannot be made for a
   page or a time the studio did not offer. The choice between the two
   (`h`, 0 or 1) is the client's and is not signed. No name, email or
   phone travels in the address: the page is looked up when the time
   is confirmed.

   Changing LINKS_SECRET makes every link already sent stop working.
   ================================================================== */

export type Meeting = { page: string; slots: [string, string]; lang: Lang };

const b64 = (value: Buffer | string) => Buffer.from(value).toString("base64url");

function signature(body: string) {
  const secret = process.env.LINKS_SECRET;
  if (!secret) return null;
  return b64(createHmac("sha256", secret).update(body).digest()).slice(0, 32);
}

/** The token for an invitation, or null when LINKS_SECRET is not set. */
export function signMeeting({ page, slots, lang }: Meeting) {
  const body = b64(JSON.stringify({ p: page, s: slots, l: lang }));
  const sig = signature(body);
  return sig ? `${body}.${sig}` : null;
}

/** What a token stands for, or null when it was not signed by us. */
export function readMeeting(token: unknown): Meeting | null {
  if (typeof token !== "string" || token.length > 600) return null;
  const [body, sig] = token.split(".");
  const expected = body ? signature(body) : null;
  if (!expected || !sig || sig.length !== expected.length) return null;
  if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try {
    const data = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as { p?: unknown; s?: unknown; l?: unknown };
    if (typeof data.p !== "string" || !/^[0-9a-f-]{32,36}$/i.test(data.p)) return null;
    if (!Array.isArray(data.s) || data.s.length !== 2 || !data.s.every(isSlot)) return null;
    return { page: data.p, slots: [data.s[0], data.s[1]], lang: data.l === "pt" ? "pt" : "en" };
  } catch {
    return null;
  }
}

/** The token behind the final proposal's two buttons, about the call
    midway through the project, or null when LINKS_SECRET is not set. */
export function signMidCall(page: string, lang: Lang) {
  const body = b64(JSON.stringify({ k: "mid", p: page, l: lang }));
  const sig = signature(body);
  return sig ? `${body}.${sig}` : null;
}

/** What such a token stands for, or null when it was not signed by us. */
export function readMidCall(token: unknown): { page: string; lang: Lang } | null {
  if (typeof token !== "string" || token.length > 300) return null;
  const [body, sig] = token.split(".");
  const expected = body ? signature(body) : null;
  if (!expected || !sig || sig.length !== expected.length) return null;
  if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try {
    const data = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as { k?: unknown; p?: unknown; l?: unknown };
    if (data.k !== "mid" || typeof data.p !== "string" || !/^[0-9a-f-]{32,36}$/i.test(data.p)) return null;
    return { page: data.p, lang: data.l === "pt" ? "pt" : "en" };
  } catch {
    return null;
  }
}

/** The address of the page that takes the answer. */
export function midCallLink(siteUrl: string, token: string, lang: Lang, answer: "yes" | "no") {
  return `${siteUrl}${lang === "pt" ? "/pt" : ""}/mid-call?t=${token}&a=${answer}`;
}

/** The address of the meeting page for one of the two times. */
export function meetingLink(siteUrl: string, token: string, lang: Lang, choice: 0 | 1) {
  return `${siteUrl}${lang === "pt" ? "/pt" : ""}/meeting?t=${token}&h=${choice}`;
}
