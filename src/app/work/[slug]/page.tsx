import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectPage } from "@/components/project-page";
import { canFrame } from "@/lib/embed";
import { PROJECTS, findProject, workPath } from "@/lib/work";

/* One page per project, opened from its plate on the web design page. */

export function generateStaticParams() {
  return PROJECTS.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const project = findProject((await params).slug);
  if (!project) return {};
  return {
    title: project.name,
    alternates: { canonical: workPath(project.slug) },
    // Its fields and images are still to be filled in.
    robots: { index: false, follow: true },
  };
}

export default async function WorkPage({ params }: { params: Promise<{ slug: string }> }) {
  const project = findProject((await params).slug);
  if (!project) notFound();
  // Shown in our own preview where the site allows it; otherwise the
  // button opens the site itself.
  const framable = project.status === "live" && project.url ? await canFrame(project.url) : false;
  return <ProjectPage project={project} framable={framable} />;
}
