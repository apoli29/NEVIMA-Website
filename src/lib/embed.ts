import "server-only";

/* ==================================================================
   Can a client's website be shown inside ours?

   The preview frames the live site, which only works where the site
   lets other pages frame it. Sites say no with X-Frame-Options or with
   frame-ancestors in their Content-Security-Policy; either one, or no
   answer at all, means the visitor is sent to the site itself instead.
   Asked again at most once a day.
   ================================================================== */

export async function canFrame(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, {
      redirect: "follow",
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return false;
    const xfo = res.headers.get("x-frame-options")?.toLowerCase() ?? "";
    if (xfo.includes("deny") || xfo.includes("sameorigin")) return false;
    const csp = res.headers.get("content-security-policy")?.toLowerCase() ?? "";
    const ancestors = csp
      .split(";")
      .map((part) => part.trim())
      .find((part) => part.startsWith("frame-ancestors"));
    if (ancestors && !/\s\*(\s|$)/.test(`${ancestors} `) && !ancestors.includes("nevima")) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}
