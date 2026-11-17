import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { basePath, localize, translator, type Lang } from "@/lib/i18n";
import { pageMetadata, serviceGraph } from "@/lib/seo";
import { SERVICES, findService, servicePath, servicesIn } from "@/lib/services";
import { JsonLd } from "./json-ld";
import { Footer } from "./footer";
import { ProposalHost } from "./proposal-host";
import { FloatingNav } from "./floating-nav";
import { Included } from "./services";
import { ServiceDepth, ServiceHero } from "./service-depth";
import { ShootSections } from "./shoot-sections";
import { WorkTogether } from "./work-together";
import { SeoGeo } from "./seo-geo";
import { seoPriceTable } from "@/lib/proposal/seo-table";

/* ==================================================================
   One page per service.

   A landing place for the card's button, set from the same record the
   card is: title, what the acronym stands for, the description, the
   other three services and a way to get in touch. Nothing here is
   written twice, so filling these pages out later means adding to them
   rather than keeping two copies of the same sentence in step.

   The same page serves both languages: /services/<slug> and, with the
   words of its address in Portuguese, /pt/servicos/<slug> (see
   src/app and PT_PATHS in src/lib/i18n.ts). The code names a service
   by its English slug; slugFrom() reads it from the address.
   ================================================================== */

/** Web design has no page (the user had its own page taken down,
    2026-10-11); its work moves to the portfolio. */
const OWN_PAGE = new Set(["web-design"]);

/** The last word of a service's address, in a language. */
const addressSlug = (slug: string, lang: Lang) => localize(servicePath(slug), lang).split("/").pop()!;

/** The service a page's address names, by its English slug. */
export function slugFrom(param: string, lang: Lang): string {
  if (lang === "en") return param;
  return basePath(`/pt/servicos/${param}`).split("/").pop()!;
}

export function serviceParams(lang: Lang) {
  return SERVICES.filter((service) => !OWN_PAGE.has(service.slug)).map((service) => ({
    slug: addressSlug(service.slug, lang),
  }));
}

export function serviceMetadata(slug: string, lang: Lang): Metadata {
  const service = findService(slug, lang);
  if (!service || OWN_PAGE.has(service.slug)) return {};
  return pageMetadata(servicePath(service.slug), lang);
}

export function ServicePage({ slug, lang }: { slug: string; lang: Lang }) {
  const service = findService(slug, lang);
  if (!service || OWN_PAGE.has(service.slug)) notFound();
  const t = translator(lang);
  const href = (path: string) => localize(path, lang);

  const others = servicesIn(lang).filter(
    (other) => other.slug !== service.slug && !OWN_PAGE.has(other.slug),
  );

  /* SEO & GEO has a page of its own (seo-geo.tsx; user, 2026-11-16):
     nothing of the template below is used there. */
  if (service.slug === "seo") {
    return (
      <ProposalHost>
        <JsonLd data={serviceGraph(service.slug, lang)} />
        <FloatingNav />
        <main id="top" className="relative bg-paper">
          <SeoGeo prices={seoPriceTable()} />
        </main>
        <WorkTogether />
        <Footer />
      </ProposalHost>
    );
  }

  return (
    <ProposalHost>
      <JsonLd data={serviceGraph(service.slug, lang)} />
      {/* The bar the rest of the site carries, as it is everywhere else
          (user, 2026-11-16: the bar is not to change on the way into a
          service). It replaced a black strip of this page's own, which
          held the mark and a way back to the services. */}
      <FloatingNav />
      <main id="top" className="relative min-h-[100svh] bg-paper">
        {/* The photograph first, before anything is read (user,
            2026-11-16), with the service's name laid over it: it is the
            page's title. A service the studio has not written a plate
            for keeps the title block the page had. */}
        {/* Clear of the bar and no more: the photograph is the first
            thing on the page. */}
        <div className="shell pt-[5.75rem] md:pt-[calc(var(--section-gap)+3rem)]">
          <ServiceHero slug={service.slug} name={service.title} ask={t("Get your free proposal", "Pedir proposta gratuita")} />
        </div>

        <div className="shell pt-12 pb-28 md:pt-16 md:pb-40">
          <p className="text-[0.875rem] leading-snug text-ash">
            {service.full ?? t("Service", "Serviço")}
          </p>

          <p className="mt-6 max-w-[54ch] text-[clamp(1.125rem,1.5vw,1.375rem)] leading-[1.45] tracking-[-0.012em] text-ink">
            {service.body}
          </p>

          {service.included && (
            <Included included={service.included} play={false} className="mt-10 max-w-[54ch] md:mt-12" />
          )}

          {/* What the studio has to say about this service, in full
              (service-depth.tsx). Only the services it has written for
              carry one. */}
          <ServiceDepth slug={service.slug} />

          {/* The photo shoot has three more sections of its own
              (shoot-sections.tsx), written from the studio's brief of
              2026-11-17. */}
          {service.slug === "photo-shoot" && <ShootSections />}


          <div className="mt-11 flex flex-wrap items-center gap-3 md:mt-14">
            <a
              href="mailto:ola@nevima.studio"
              className="btn-neu rounded-[8px] px-5 py-3 text-[0.9375rem] leading-none"
            >
              <span className="btn-neu-face">{t("Get in touch", "Contactar")}</span>
            </a>
            <Link
              href={href("/")}
              className="rounded-[8px] px-5 py-3 text-[0.9375rem] leading-none text-ash transition-colors duration-300 hover:text-ink"
            >
              {t("Back to nevima", "Voltar à página inicial")}
            </Link>
          </div>

          <nav aria-label={t("Other services", "Outros serviços")} className="mt-20 border-t border-hair pt-8 md:mt-28">
            <p className="text-[0.875rem] leading-snug text-ash">{t("The rest of what we do", "Mais serviços")}</p>
            <ul className="mt-5 flex flex-wrap gap-x-8 gap-y-3">
              {others.map((other) => (
                <li key={other.slug}>
                  <Link
                    href={href(servicePath(other.slug))}
                    className="display text-[clamp(1.5rem,2.4vw,2.25rem)] leading-[1.1] tracking-[-0.02em] text-ink/55 transition-colors duration-300 hover:text-ink"
                  >
                    {other.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </main>
      <WorkTogether />
      <Footer />
    </ProposalHost>
  );
}
