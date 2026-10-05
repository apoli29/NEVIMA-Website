import type { Metadata } from "next";
import { About } from "@/components/about";

export const metadata: Metadata = {
  title: "About",
  description:
    "Two people, the right tools and nothing in between: the studio's mission, vision and values, how it works, and straight answers to what clients ask first.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return <About />;
}
