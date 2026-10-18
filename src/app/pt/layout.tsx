import type { Metadata } from "next";

/* The Portuguese pages (see src/lib/i18n.ts): the same pages as the
   English ones, under /pt, with the site's title and description in
   Portuguese. The words on each page follow its address. */

export const metadata: Metadata = {
  // Absolute: the root layout's template would otherwise be put on it.
  title: {
    absolute: "nevima — websites e identidade visual",
    template: "%s · nevima",
  },
  description:
    "Duas pessoas, as ferramentas certas: websites e identidade visual ao nível de agências muito maiores, sem a burocracia que costuma vir com esse tamanho.",
  openGraph: {
    title: "nevima — menos estrutura, mais alcance",
    description:
      "Estúdio de websites e identidade visual. Duas pessoas, zero intermediários, resultados de agência grande.",
    type: "website",
    locale: "pt_PT",
    alternateLocale: ["en_US"],
  },
};

export default function PortugueseLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
