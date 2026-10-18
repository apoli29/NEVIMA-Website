import type { Copy } from "@/lib/i18n";

/* The second screen's index (see statement-screen.tsx), kept here
   because the proposal form carries a copy of it off the screen when it
   opens (see proposal-flow.tsx). The index starts with "Get your free
   proposal", which is not a link and is set apart there; it carries the
   green light now (the user took Pricing out and put it first). A row marked lead would be
   kept inked (see .idx-lead); none is. */
export const SECTION_LINKS: { label: Copy; href: string; lead: boolean }[] = [
  // Right under the ask (user, 2026-10-11).
  { label: { en: "Our projects", pt: "Os nossos projetos" }, href: "/portfolio", lead: false },
  { label: { en: "About us", pt: "Sobre nós" }, href: "/about", lead: false },
  { label: { en: "Our services", pt: "Os nossos serviços" }, href: "#services", lead: false },
  // For development companies: the partners' form in "Let's work
  // together" (user, 2026-10-18).
  { label: { en: "Partner with us", pt: "Parcerias" }, href: "#partner", lead: false },
];
