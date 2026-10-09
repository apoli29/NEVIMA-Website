"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { SlideIn } from "./enter";
import { FloatingNav } from "./floating-nav";
import { Footer } from "./footer";
import { useSmoothScroll } from "./smooth-scroll";
import { STATUS_LABEL, TO_FILL, previewPath, shown, type Project } from "@/lib/work";

/* ==================================================================
   A project's page

   One section, in the same closed frame as the plate it was opened
   from: the project's image on the left; on the right what it is, laid
   out across in a grid of fields (company, sector, the identity's
   style, what was made, the year, where it stands), then a few words
   about the website and two ways on: to the website, and to the
   project's full report (user).

   "Go to the website" opens our preview of it where the site lets
   itself be framed, and the site itself, in a new tab, where it does
   not. What is not there yet (a site still in production, an address
   or a report the studio has not given) is shown as a button at rest,
   with a line under the two saying why.
   ================================================================== */

export function ProjectPage({ project, framable }: { project: Project; framable: boolean }) {
  useSmoothScroll(false);
  const live = project.status === "live";

  const fields = [
    { name: "Company", value: project.name },
    { name: "Sector", value: shown(project.sector) },
    { name: "Identity", value: shown(project.identity) },
    { name: "Scope", value: shown(project.scope) },
    { name: "Year", value: shown(project.year) },
    { name: "Status", value: STATUS_LABEL[project.status], quiet: !live },
  ];

  const notes = [
    !live ? "Website in production" : !project.url ? `Website address ${TO_FILL}` : null,
    !project.report ? `Report ${TO_FILL}` : null,
  ].filter(Boolean);

  return (
    <>
      <FloatingNav />
      <main id="top" className="relative bg-paper pt-[calc(var(--section-gap)+2.5rem)] pb-28 md:pb-40">
        <article aria-labelledby="project-title" className="shell">
          <SlideIn ready distance={0}>
            <Link href="/services/web-design#work" className="mono-label wk-back text-ash-2">
              Back to web design
            </Link>
          </SlideIn>
          <SlideIn ready>
            <h1
              id="project-title"
              className="display mt-5 text-[clamp(2.75rem,6.5vw,6rem)] font-light text-ink md:mt-6"
            >
              {project.name}
            </h1>
          </SlideIn>

          <div className="wk-frame mt-10 md:mt-14">
            <div className="wk-bar">
              <p className="mono-label">
                <span className="idx-title">Project</span>
              </p>
              <p className="mono-label text-ash-2">{STATUS_LABEL[project.status]}</p>
            </div>

            <div className="wk-plates wk-project">
              <div className="wk-cell wk-change">
                {/* Left empty until the studio has the project's images. */}
                <div className="wk-image" aria-hidden="true">
                  <span className="mono-label wk-fig">Fig. 01</span>
                </div>
              </div>

              <div className="wk-cell wk-change flex flex-col">
                <dl className="wk-specs">
                  {fields.map((field) => (
                    <div key={field.name} className="wk-spec">
                      <dt className="mono-label text-ash-2">{field.name}</dt>
                      <dd className={`mt-2 ${field.quiet ? "text-ash" : "text-ink"}`}>{field.value}</dd>
                    </div>
                  ))}
                </dl>

                <div className="mt-8 md:mt-10">
                  <p className="mono-label text-ash-2">About the website</p>
                  <p className="mt-4 max-w-[60ch] text-[clamp(1.0625rem,1.25vw,1.25rem)] leading-[1.45] tracking-[-0.012em] text-ink">
                    {shown(project.about)}
                  </p>
                </div>

                <div className="mt-auto pt-10 md:pt-12">
                  <div className="flex flex-wrap items-center gap-x-8 gap-y-6 px-[0.85em]">
                    <Visit project={project} framable={framable} />
                    <Action href={project.report} external light>
                      View the full project report
                    </Action>
                  </div>
                  {notes.length > 0 && (
                    <p className="mono-label mt-6 text-ash-2">{notes.join(" / ")}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}

function Visit({ project, framable }: { project: Project; framable: boolean }) {
  const url = project.status === "live" ? project.url : null;
  if (url && framable) {
    return (
      <Action href={previewPath(project.slug)} arrow={"→"}>
        Go to the website
      </Action>
    );
  }
  return (
    <Action href={url} external arrow={"↗"}>
      Go to the website
    </Action>
  );
}

/** A call to action, or the same button at rest while it has nowhere to go. */
function Action({
  href,
  external = false,
  light = false,
  arrow,
  children,
}: {
  href: string | null;
  external?: boolean;
  light?: boolean;
  arrow?: string;
  children: ReactNode;
}) {
  const className = `cta-drop inline-flex shrink-0 text-[1rem] leading-none ${light ? "cta-drop-light" : ""}`;
  const face = (
    <span className="btn-neu-face">
      {children}
      {arrow && (
        <span aria-hidden="true" className="ml-2.5 inline-block">
          {arrow}
        </span>
      )}
    </span>
  );
  if (!href) {
    return (
      <span aria-disabled="true" className={`${className} wk-rest`}>
        {face}
      </span>
    );
  }
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener" className={className}>
        {face}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {face}
    </Link>
  );
}
