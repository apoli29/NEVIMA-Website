import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/footer";
import { SERVICES, findService, servicePath } from "@/lib/services";

/* ==================================================================
   One page per service.

   A landing place for the card's button, set from the same record the
   card is: title, what the acronym stands for, the description, the
   other three services and a way to get in touch. Nothing here is
   written twice, so filling these pages out later means adding to them
   rather than keeping two copies of the same sentence in step.
   ================================================================== */

export function generateStaticParams() {
  return SERVICES.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const service = findService((await params).slug);
  if (!service) return {};
  return {
    title: service.title,
    description: service.body,
    alternates: { canonical: servicePath(service.slug) },
    openGraph: {
      title: `${service.title} · nevima`,
      description: service.body,
      type: "article",
    },
  };
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const service = findService((await params).slug);
  if (!service) notFound();

  const others = SERVICES.filter((other) => other.slug !== service.slug);

  return (
    <>
      <main id="top" className="relative min-h-[100svh] bg-paper">
        {/* The same black strip the home page floats, holding the same mark. */}
        <header className="pt-4 md:pt-6">
          <div className="shell">
            <div className="-mx-3 flex items-center justify-between gap-4 rounded-[16px] bg-ink px-3 py-2.5 md:-mx-5 md:gap-8 md:px-5 md:py-3 xl:-mx-8 xl:px-8">
              <Link href="/" aria-label="nevima, home" className="flex shrink-0 items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/nevima-wordmark-white.svg"
                  alt="nevima"
                  className="block h-[1.35rem] w-auto md:h-[1.55rem]"
                />
              </Link>
              <Link
                href="/#services"
                className="btn-neu rounded-[8px] px-5 py-2.5 text-[0.9375rem] leading-none"
              >
                <span className="btn-neu-face">All services</span>
              </Link>
            </div>
          </div>
        </header>

        <div className="shell pt-(--section-gap) pb-28 md:pb-40">
          <p className="text-[0.875rem] leading-snug text-ash">
            {service.full ?? "Service"}
          </p>

          <h1 className="display mt-3 text-[clamp(2.75rem,7vw,5.5rem)] font-light text-ink">
            {service.title}
          </h1>

          <p className="mt-9 max-w-[54ch] text-[clamp(1.125rem,1.5vw,1.375rem)] leading-[1.45] tracking-[-0.012em] text-ink md:mt-12">
            {service.body}
          </p>

          <div className="mt-11 flex flex-wrap items-center gap-3 md:mt-14">
            <a
              href="mailto:ola@nevima.pt"
              className="btn-neu rounded-[8px] px-5 py-3 text-[0.9375rem] leading-none"
            >
              <span className="btn-neu-face">Get in touch</span>
            </a>
            <Link
              href="/"
              className="rounded-[8px] px-5 py-3 text-[0.9375rem] leading-none text-ash transition-colors duration-300 hover:text-ink"
            >
              Back to nevima
            </Link>
          </div>

          <nav aria-label="Other services" className="mt-20 border-t border-hair pt-8 md:mt-28">
            <p className="text-[0.875rem] leading-snug text-ash">The rest of what we do</p>
            <ul className="mt-5 flex flex-wrap gap-x-8 gap-y-3">
              {others.map((other) => (
                <li key={other.slug}>
                  <Link
                    href={servicePath(other.slug)}
                    className="display text-[clamp(1.5rem,2.4vw,2.25rem)] leading-[1.1] tracking-[-0.02em] text-ink/35 transition-colors duration-300 hover:text-ink"
                  >
                    {other.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </main>
      <Footer />
    </>
  );
}
