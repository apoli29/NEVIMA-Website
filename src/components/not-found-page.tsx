"use client";

import { useEffect } from "react";
import { HTML_LANG } from "@/lib/i18n";
import { servicePath, servicesIn } from "@/lib/services";
import { useHref, useLang, useT } from "@/lib/use-lang";
import { FloatingNav } from "./floating-nav";
import { Footer } from "./footer";
import { ProposalOverlay, ProposalProvider, useProposalController } from "./proposal-flow";
import { useSmoothScroll } from "./smooth-scroll";
import { WorkTogether } from "./work-together";

/* ==================================================================
   An address the site does not have (404)

   In the language of the address it was asked for (drawn in the browser,
   see not-found-switch.tsx), with the way back laid out rather than
   apologised for: what happened, in one line, then every page there is,
   the site's own on one side and the services on the other. Ends like
   every page, on "Let's work together" and the foot. Search engines are
   told it is missing (the response is a 404 and the page is noindex).
   ================================================================== */

/** The pages of the site, as the bar names them (floating-nav.tsx). */
const PAGES = [
  { en: "Home", pt: "Início", href: "/" },
  { en: "Portfolio", pt: "Portefólio", href: "/portfolio" },
  { en: "About nevima", pt: "Sobre a nevima", href: "/about" },
] as const;

/** Web design has no page of its own (see service-page.tsx). */
const NO_PAGE = new Set(["web-design"]);

export function NotFoundPage() {
  const proposal = useProposalController();
  useSmoothScroll(proposal.present);
  const lang = useLang();
  const t = useT();
  const href = useHref();
  const services = servicesIn(lang).filter((service) => !NO_PAGE.has(service.slug));
  // The document is written once, in English (global-not-found.tsx): its
  // title and language follow the address here.
  useEffect(() => {
    document.title = `${t("Page not found", "Página não encontrada")} · nevima`;
    document.documentElement.lang = HTML_LANG[lang];
  }, [t, lang]);

  return (
    <ProposalProvider value={proposal}>
      <div inert={proposal.present}>
        <FloatingNav />
        <main id="top" className="relative bg-paper">
          <div className="shell nf-page">
            <h1 className="display nf-title">{t("This page doesn’t exist.", "Esta página não existe.")}</h1>
            <p className="nf-lede">
              {t(
                "The address may have a typo, or the page may have moved. These are the pages there are:",
                "O endereço pode ter um erro, ou a página pode ter mudado de lugar. Estas são as páginas que existem:",
              )}
            </p>
            <nav aria-label={t("Pages of the site", "Páginas do site")} className="nf-index">
              <div>
                <h2 className="nf-group">{t("The site", "O site")}</h2>
                <ul>
                  {PAGES.map((page) => (
                    <li key={page.href}>
                      <a href={href(page.href)} className="nf-link">
                        {t(page.en, page.pt)}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h2 className="nf-group">{t("Services", "Serviços")}</h2>
                <ul>
                  {services.map((service) => (
                    <li key={service.slug}>
                      <a href={href(servicePath(service.slug))} className="nf-link">
                        {service.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </nav>
          </div>
        </main>
        <WorkTogether />
        <Footer />
      </div>
      <ProposalOverlay ctl={proposal} />
    </ProposalProvider>
  );
}
