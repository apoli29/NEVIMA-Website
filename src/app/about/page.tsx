import type { Metadata } from "next";
import { About } from "@/components/about";

export const metadata: Metadata = {
  title: "About",
  description:
    "Two people, the right tools and nothing in between: the studio's mission, vision and values, how it works, and straight answers to what clients ask first.",
  // A template for now: its copy and figures are stand-ins, so search
  // engines are asked to leave it out until the studio's own words are in.
  robots: { index: false, follow: true },
};

export default function AboutPage() {
  return <About />;
}
