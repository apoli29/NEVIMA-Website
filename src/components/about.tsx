"use client";

import { AboutFaq } from "./about-faq";
import { AboutHero, STONE, SWIRL } from "./about-hero";
import { AboutMission } from "./about-mission";
import { AboutProcess } from "./about-process";
import { AboutValues } from "./about-values";
import { FloatingNav } from "./floating-nav";
import { Footer } from "./footer";
import { useSmoothScroll } from "./smooth-scroll";

/* ==================================================================
   The about page

   No opening here: the mark's flight belongs to the home page, so the
   bar is simply there. The page goes from the statement on stone,
   through what the studio is for (mission, vision, then the values on
   the water), to how it works and what people ask, and closes on the
   same black foot as the home page.
   ================================================================== */

export function About() {
  useSmoothScroll(false);
  return (
    <>
      <FloatingNav />
      <main id="top" className="relative">
        {/* Temporary: the same statement on each of the two photographs
            the studio is choosing between. Keep one. */}
        <AboutHero photo={STONE} />
        <AboutHero photo={SWIRL} first={false} />
        <AboutMission />
        <AboutValues />
        <AboutProcess />
        <AboutFaq />
      </main>
      <Footer />
    </>
  );
}
