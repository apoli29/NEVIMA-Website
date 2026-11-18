"use client";

import { SlideIn } from "./enter";
import { ProposalAsk } from "./about-faq";
import { CostBars, ToolFlow } from "./back-end-charts";
import { TO_FILL } from "@/lib/work";
import type { T } from "./sbs-shared";

/* ==================================================================
   "How it is built" - kept, not thrown away

   This was the last section of the back-end page until 2026-11-18,
   when the user took it off that page: it says nothing the rest of the
   page does not already say, and the new pricing section covers the
   monthly figure. The user asked for the code to be kept (and it is
   the better-looking thing on the page), so here it is, whole and
   ready to be dropped into a page with a single <HowItIsBuilt t={t} />.

   What it carries: the dark room, the flow of tools with the data
   running along the wires (ToolFlow), the three rows the studio has
   still to fill in, the cost of a month (CostBars) and the free
   proposal at the foot. Its styles (.be-made-*, .bef-flow, .bef-cost)
   are still in globals.css.

   Where it could go, in order of how well it fits:

   1. The side-by-side page, under "our" website - it is the only
      drawing on the site that shows what is behind a website of ours,
      and that page is exactly the argument for it.
   2. The about page, as how the studio works: few people, the right
      tools, tied together.
   3. Back on this page, if the studio ever gives the tool names: with
      real names in the nodes the diagram stops being a shape and
      starts being information.
   ================================================================== */

export function HowItIsBuilt({ t }: { t: T }) {
  /* The tools, how they are tied and what the month costs are the
     studio's to give (asked for on 2026-11-16 and 2026-11-17). Until
     they come, they read as everything unfilled on this site does. */
  const tools = [TO_FILL, TO_FILL, TO_FILL];

  return (
    <section aria-labelledby="be-made-title" data-tone="dark" className="relative text-paper">
      <div className="shell ps-sec" data-tone-body>
        <SlideIn ready>
          <p className="mono-label text-paper/55">{t("How it is built", "Como é feito")}</p>
          <h2 id="be-made-title" className="display ps-title">
            <span className="font-light sm:block">{t("Simple, efficient,", "Simples, eficientes,")}</span>{" "}
            <span className="font-medium sm:block">{t("and made for a small company.", "e feitas para uma empresa pequena.")}</span>
          </h2>
        </SlideIn>

        <SlideIn ready distance={0} delay={0.08}>
          <p className="ps-lede ps-lede-dark">
            {t(
              "What we set out to offer is a back end a small or medium company can actually afford, with no excessive costs, that answers more than well to what it needs and to the context it works in.",
              "O objetivo é apresentar às pequenas e médias empresas uma alternativa de back end acessível, sem custos excessivos, que responde mais do que bem às suas necessidades e ao seu contexto.",
            )}
          </p>
        </SlideIn>

        {/* The tools tied to the website and to the client, with the
            data running along the wires (n8n's canvas, in our black and
            white). The names come from above, so they fill themselves
            in when the studio gives them. */}
        <ToolFlow t={t} names={tools} />

        <div className="be-made-rows">
          {[
            { head: t("The tools", "As ferramentas"), body: TO_FILL },
            { head: t("How they are tied together", "Como as interligamos"), body: TO_FILL },
            {
              head: t("The monthly service", "O serviço mensal"),
              body: t(
                `${TO_FILL} a month. It costs little by design: the skeleton we build is thought out so that the upkeep it needs is low.`,
                `${TO_FILL} por mês. O valor é simbólico de propósito: o esqueleto que construímos já é pensado para que a manutenção necessária seja baixa.`,
              ),
            },
          ].map((row) => (
            <SlideIn key={row.head} ready distance={0} delay={0.14}>
              <div className="be-made-row">
                <h3 className="mono-label be-made-head">{row.head}</h3>
                <p className="be-made-body">{row.body}</p>
              </div>
            </SlideIn>
          ))}
        </div>

        <CostBars t={t} />

        <SlideIn ready distance={0} delay={0.22}>
          <div className="be-made-foot">
            <p className="mono-label">
              {t(
                "The tools, how they are tied and the monthly figure are the studio's to set; the form works an estimate out meanwhile.",
                "As ferramentas, a forma de as interligar e o valor mensal são definidos pelo estúdio; entretanto, o formulário calcula uma estimativa.",
              )}
            </p>
            <ProposalAsk label={t("Get your free proposal", "Pedir proposta gratuita")} />
          </div>
        </SlideIn>
      </div>
    </section>
  );
}
