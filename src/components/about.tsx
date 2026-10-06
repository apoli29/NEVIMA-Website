"use client";

import { AboutFaq } from "./about-faq";
import { AboutHero } from "./about-hero";
import { AboutMission } from "./about-mission";
import { AboutValues } from "./about-values";
import { CoFounders } from "./cofounders";
import { FloatingNav } from "./floating-nav";
import { Footer } from "./footer";
import { useSmoothScroll } from "./smooth-scroll";

/* ==================================================================
   The about page

   No opening here: the mark's flight belongs to the home page, so the
   bar is simply there. The page goes from the statement on stone, to
   who the studio is (the co-founders, moved here from the home page on
   2026-10-06), to what it is for (mission, vision, then the values on
   the water), to what people ask, and closes on the same black foot as
   the home page. How it works moved to the home page, under the
   services (see process.tsx).
   ================================================================== */

export function About() {
  useSmoothScroll(false);
  return (
    <>
      <FloatingNav />
      <main id="top" className="relative">
        <AboutHero />
        <section
          id="founders"
          aria-labelledby="cofounders-title"
          className="relative bg-paper pt-(--section-gap)"
        >
          <div className="shell">
            <CoFounders ready standalone />
          </div>
        </section>
        <AboutMission />
        <AboutValues />
        <AboutFaq />
      </main>
      <Footer />
    </>
  );
}
