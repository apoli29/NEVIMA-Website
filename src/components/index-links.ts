/* The second screen's index (see statement-screen.tsx), kept here
   because the proposal form carries a copy of it off the screen when it
   opens (see proposal-flow.tsx). The index starts with "Get your free
   proposal", which is not a link and is set apart there; it carries the
   green light now (the user took Pricing out and put it first). A row marked lead would be
   kept inked (see .idx-lead); none is. */
export const SECTION_LINKS: { label: string; href: string; lead: boolean }[] = [
  { label: "About us", href: "/about", lead: false },
  { label: "Our services", href: "#services", lead: false },
];
