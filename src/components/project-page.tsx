"use client";

import Link from "next/link";
import { SlideIn } from "./enter";
import { FloatingNav } from "./floating-nav";
import { Footer } from "./footer";
import { useSmoothScroll } from "./smooth-scroll";
import { Field } from "./web-design";
import { STATUS_LABEL, TO_FILL, previewPath, shown, type Project } from "@/lib/work";

/* ==================================================================
   A project's page

   One section, in the same closed frame as the plate it was opened
   from: the black label with the project's name, an index of what it
   is (company, sector, the identity's style, what was made, the year,
   where it stands) beside its image, and under them a few words about
   the website with the way to see it.

   "View the website" opens our preview of it where the site lets itself
   be framed, and the site itself, in a new tab, where it does not. A
   project still in production has no site to show, and says so.
   ================================================================== */

export function ProjectPage({ project, framable }: { project: Project; framable: boolean }) {
  useSmoothScroll(false);
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
                <dl className="wk-fields">
                  <Field name="Company" value={project.name} />
                  <Field name="Sector" value={shown(project.sector)} />
                  <Field name="Identity" value={shown(project.identity)} />
                  <Field name="Scope" value={shown(project.scope)} />
                  <Field name="Year" value={shown(project.year)} />
                  <Field
                    name="Status"
                    value={STATUS_LABEL[project.status]}
                    quiet={project.status !== "live"}
                  />
                </dl>
              </div>
              <div className="wk-cell wk-change">
                {/* Left empty until the studio has the project's images. */}
                <div className="wk-image" aria-hidden="true">
                  <span className="mono-label wk-fig">Fig. 01</span>
                </div>
              </div>
            </div>

            <div className="wk-about">
              <div>
                <p className="mono-label text-ash-2">About the website</p>
                <p className="mt-4 max-w-[60ch] text-[clamp(1.0625rem,1.25vw,1.25rem)] leading-[1.45] tracking-[-0.012em] text-ink">
                  {shown(project.about)}
                </p>
              </div>
              <Visit project={project} framable={framable} />
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}

function Visit({ project, framable }: { project: Project; framable: boolean }) {
  const label = (
    <>
      View the website
      <span aria-hidden="true" className="ml-2.5 inline-block">
        {framable ? "→" : "↗"}
      </span>
    </>
  );

  if (project.status !== "live") {
    return <p className="mono-label shrink-0 text-ash">Website in production</p>;
  }
  if (!project.url) {
    return <p className="mono-label shrink-0 text-ash">Website address {TO_FILL}</p>;
  }
  if (framable) {
    return (
      <Link href={previewPath(project.slug)} className="cta-drop inline-flex shrink-0 text-[1rem] leading-none">
        <span className="btn-neu-face">{label}</span>
      </Link>
    );
  }
  return (
    <a
      href={project.url}
      target="_blank"
      rel="noopener"
      className="cta-drop inline-flex shrink-0 text-[1rem] leading-none"
    >
      <span className="btn-neu-face">{label}</span>
    </a>
  );
}
