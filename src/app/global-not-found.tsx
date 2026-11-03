import type { Metadata } from "next";
import { NOT_FOUND_LANG_SCRIPT, NotFoundSwitch } from "@/components/not-found-switch";
import { SiteRoot } from "@/components/site-root";

/* Any address the site does not have, in either language. Each language
   has its own root layout, so the missing page sits above both, as its
   own document (Next's global-not-found), and follows the address it was
   asked for in the browser (not-found-switch.tsx). The response is a 404
   and the page is closed to search engines. */

export const metadata: Metadata = {
  title: "Page not found · nevima",
  robots: { index: false, follow: true },
};

export default function GlobalNotFound() {
  return (
    <SiteRoot lang="en" head={<script dangerouslySetInnerHTML={{ __html: NOT_FOUND_LANG_SCRIPT }} />}>
      <NotFoundSwitch />
    </SiteRoot>
  );
}
