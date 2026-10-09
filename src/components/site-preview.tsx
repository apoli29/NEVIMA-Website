"use client";

import { useState } from "react";
import Link from "next/link";
import { workPath } from "@/lib/work";

/* ==================================================================
   A project's website, previewed

   The live site in a frame the size of a desktop, a tablet or a phone,
   picked from the bar over it. The bar is the site's own black strip;
   the frame carries the site's address in mono, as a browser would, and
   the live site is always one click away.
   ================================================================== */

const DEVICES = [
  { id: "desktop", label: "Desktop", width: null },
  { id: "tablet", label: "Tablet", width: 834 },
  { id: "phone", label: "Phone", width: 390 },
] as const;

type DeviceId = (typeof DEVICES)[number]["id"];

export function SitePreview({ name, slug, url }: { name: string; slug: string; url: string }) {
  const [device, setDevice] = useState<DeviceId>("desktop");
  const width = DEVICES.find((d) => d.id === device)?.width ?? null;
  const host = url.replace(/^https?:\/\//, "").replace(/\/$/, "");

  return (
    <main className="flex h-[100svh] flex-col bg-paper">
      <header className="shrink-0 pt-4 md:pt-6">
        <div className="shell">
          <div className="-mx-3 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 bg-ink px-3 py-2.5 text-paper md:-mx-5 md:px-5 md:py-[0.8125rem] xl:-mx-8 xl:px-8">
            <Link href={workPath(slug)} className="mono-label text-paper/70 transition-colors hover:text-paper">
              Back to {name}
            </Link>
            <div role="group" aria-label="Preview size" className="flex gap-1 max-sm:order-3 max-sm:w-full">
              {DEVICES.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  aria-pressed={device === d.id}
                  onClick={() => setDevice(d.id)}
                  className="pv-key mono-label"
                >
                  {d.label}
                </button>
              ))}
            </div>
            <a
              href={url}
              target="_blank"
              rel="noopener"
              className="mono-label text-paper/70 transition-colors hover:text-paper"
            >
              Open the live site <span aria-hidden="true">{"↗"}</span>
            </a>
          </div>
        </div>
      </header>

      <div className="shell flex min-h-0 flex-1 flex-col py-4 md:py-6">
        <div
          className="mx-auto flex min-h-0 w-full flex-1 flex-col border border-ink transition-[max-width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ maxWidth: width ?? "100%" }}
        >
          <p className="mono-label shrink-0 truncate border-b border-ink px-3 py-2 text-ash-2">{host}</p>
          <iframe
            src={url}
            title={`${name}, live website`}
            className="block min-h-0 w-full flex-1 bg-paper"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
      </div>
    </main>
  );
}
