import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { SitePreview } from "@/components/site-preview";
import { canFrame } from "@/lib/embed";
import { PROJECTS, findProject } from "@/lib/work";

/* A project's live website, framed in ours at desktop, tablet and phone
   widths. A site that does not let itself be framed is opened as itself. */

export function generateStaticParams() {
  return PROJECTS.filter((project) => project.status === "live").map((project) => ({
    slug: project.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const project = findProject((await params).slug);
  if (!project) return {};
  return { title: `${project.name}, preview`, robots: { index: false, follow: false } };
}

export default async function PreviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const project = findProject((await params).slug);
  if (!project || project.status !== "live" || !project.url) notFound();
  if (!(await canFrame(project.url))) redirect(project.url);
  return <SitePreview name={project.name} slug={project.slug} url={project.url} />;
}
