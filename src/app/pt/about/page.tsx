import type { Metadata } from "next";
import { About } from "@/components/about";
import { alternates } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Sobre",
  description:
    "Duas pessoas, as ferramentas certas e nada pelo meio: a missão, a visão e os valores do estúdio, como trabalha, e respostas diretas ao que os clientes perguntam primeiro.",
  alternates: alternates("/about", "pt"),
  // As the English page: left out of search engines until the studio's
  // own words are in.
  robots: { index: false, follow: true },
};

export default function AboutPage() {
  return <About />;
}
