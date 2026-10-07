/* The second screen's index (see statement-screen.tsx), kept here
   because the proposal form carries a copy of it off the screen when it
   opens (see proposal-flow.tsx). Pricing leads, and is the one row kept
   lit (see .idx-lead). */
export const SECTION_LINKS = [
  // A placeholder: there is no pricing section yet.
  { label: "Pricing", href: "#pricing", lead: true },
  { label: "About us", href: "/about", lead: false },
  { label: "Our services", href: "#services", lead: false },
];
