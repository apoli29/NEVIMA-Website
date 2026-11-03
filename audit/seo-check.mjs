// The site's SEO, checked page by page as search engines receive it (the
// HTML from the server, before any script runs). Run against a production
// build, never `next dev`:
//
//   npm run build && npm run start
//   node audit/seo-check.mjs                 # BASE_URL=http://localhost:3000
//
// Every page in the sitemap, and every page of the site those pages link
// to, is fetched once. Errors fail the run (exit 1); warnings are printed
// and do not. No tools to install: Node's own fetch. What each check is
// for is in docs/seo-decisions.md.

const BASE = (process.env.BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const SITE = "https://nevima.studio";
const MAX_DESCRIPTION = 160;

const errors = [];
const warnings = [];
const error = (where, what) => errors.push(`${where}: ${what}`);
const warn = (where, what) => warnings.push(`${where}: ${what}`);

/** A site address as served here: nevima.studio's are read from BASE. */
const local = (url) => (url.startsWith(SITE) ? BASE + url.slice(SITE.length) : url);
/** The path of a site address, without its query or place on the page. */
const pathOf = (url) => new URL(url, BASE).pathname;

const pages = new Map();
async function get(path) {
  if (pages.has(path)) return pages.get(path);
  const response = await fetch(BASE + path, { redirect: "follow" });
  const page = { path, status: response.status, headers: response.headers, html: await response.text() };
  pages.set(path, page);
  return page;
}

const all = (html, re) => [...html.matchAll(re)];
const attr = (tag, name) => tag.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1];
const metaContent = (html, key, value) => {
  const tag = all(html, /<meta\s[^>]*>/g).map((m) => m[0]).find((t) => attr(t, key) === value);
  return tag ? attr(tag, "content") : undefined;
};
const decode = (text) =>
  text.replace(/&amp;/g, "&").replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">");

function read(page) {
  const { html } = page;
  const links = all(html, /<link\s[^>]*>/g).map((m) => m[0]);
  const canonical = links.find((t) => attr(t, "rel") === "canonical");
  const alternates = Object.fromEntries(
    links.filter((t) => attr(t, "rel") === "alternate" && attr(t, "hrefLang")).map((t) => [attr(t, "hrefLang"), attr(t, "href")]),
  );
  return {
    lang: html.match(/<html[^>]*\slang="([^"]*)"/)?.[1],
    title: decode(html.match(/<title>([^<]*)<\/title>/)?.[1] ?? ""),
    description: decode(metaContent(html, "name", "description") ?? ""),
    robots: metaContent(html, "name", "robots") ?? "",
    canonical: canonical ? attr(canonical, "href") : undefined,
    alternates,
    ogImage: metaContent(html, "property", "og:image"),
    h1: all(html, /<h1[\s>]/g).length,
    images: all(html, /<img\s[^>]*>/g).map((m) => m[0]),
    jsonLd: all(html, /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g).map((m) => m[1]),
    hrefs: all(html, /<a\s[^>]*href="([^"]*)"/g).map((m) => decode(m[1])),
  };
}

const expectedLang = (path) => (path === "/pt" || path.startsWith("/pt/") ? "pt-PT" : "en");

/* ---- the sitemap and robots.txt ------------------------------------ */

const robots = await get("/robots.txt");
if (robots.status !== 200) error("/robots.txt", `status ${robots.status}`);
else if (!/Sitemap: https:\/\/nevima\.studio\/sitemap\.xml/.test(robots.html)) error("/robots.txt", "no Sitemap line");
if (/Disallow: \/\s*$/m.test(robots.html)) error("/robots.txt", "the whole site is closed to crawlers");

const sitemap = await get("/sitemap.xml");
const listed = all(sitemap.html, /<loc>([^<]+)<\/loc>/g).map((m) => m[1]);
if (!listed.length) error("/sitemap.xml", "no pages listed");
if (/<lastmod>/.test(sitemap.html)) warn("/sitemap.xml", "lastmod dates: only real ones belong there");

/* ---- every listed page, as search engines receive it --------------- */

const titles = new Map();
const seen = new Set();
const alts = new Map();

async function check(path, inSitemap) {
  if (seen.has(path)) return;
  seen.add(path);
  const page = await get(path);
  if (page.status !== 200) return error(path, `status ${page.status}`);
  const info = read(page);

  if (info.lang !== expectedLang(path)) error(path, `<html lang="${info.lang}">, expected "${expectedLang(path)}"`);
  if (!info.title) error(path, "no title");
  if (info.h1 !== 1) error(path, `${info.h1} <h1> (one per page)`);
  for (const img of info.images) {
    if (attr(img, "alt") === undefined) error(path, `image with no alt: ${attr(img, "src")}`);
  }
  for (const raw of info.jsonLd) {
    try {
      JSON.parse(raw);
    } catch {
      error(path, "structured data that is not valid JSON");
    }
  }
  const noindex = /noindex/.test(info.robots);

  if (inSitemap) {
    if (noindex) error(path, "in the sitemap but closed to search engines (noindex)");
    if (titles.has(info.title)) error(path, `same title as ${titles.get(info.title)}: "${info.title}"`);
    titles.set(info.title, path);
    if (!info.description) error(path, "no description");
    else if (info.description.length > MAX_DESCRIPTION) warn(path, `description ${info.description.length} characters`);
    if (!info.canonical) error(path, "no canonical");
    else if (pathOf(info.canonical) !== path) error(path, `canonical points elsewhere: ${info.canonical}`);
    for (const code of ["en", "pt-PT", "x-default"]) {
      if (!info.alternates[code]) error(path, `no hreflang ${code}`);
    }
    const twin = info.alternates[expectedLang(path) === "en" ? "pt-PT" : "en"];
    if (twin) {
      const other = read(await get(pathOf(twin)));
      if (pathOf(other.alternates[expectedLang(path)] ?? "") !== path) error(path, `hreflang not returned by ${pathOf(twin)}`);
    }
    if (!info.ogImage) error(path, "no og:image");
    else {
      const image = await fetch(local(info.ogImage));
      if (!image.ok || !image.headers.get("content-type")?.startsWith("image/")) error(path, `og:image ${info.ogImage} not served`);
    }
    // Alt text in Portuguese pages, compared with the same page in English.
    const altText = info.images.map((img) => decode(attr(img, "alt") ?? "")).filter(Boolean);
    alts.set(path, { twin: twin && pathOf(twin), altText });
  }

  // Every page of the site it links to, so a link to a page that is not
  // there (an untranslated Portuguese address, say) is caught.
  for (const href of info.hrefs) {
    if (!href.startsWith("/") || href.startsWith("//") || href.startsWith("/api/")) continue;
    const target = pathOf(href);
    if (seen.has(target)) continue;
    const linked = await get(target);
    if (linked.status !== 200) error(path, `links to ${target}, which answers ${linked.status}`);
    else await check(target, false);
  }
}

for (const url of listed) await check(pathOf(url), true);

for (const [path, { twin, altText }] of alts) {
  if (expectedLang(path) !== "pt-PT" || !twin || !alts.has(twin)) continue;
  const english = new Set(alts.get(twin).altText);
  for (const text of altText) if (english.has(text) && text !== "nevima") warn(path, `alt text the same as in English: "${text}"`);
}

/* ---- a page that does not exist ------------------------------------ */

for (const path of ["/no-such-page", "/pt/pagina-que-nao-existe"]) {
  const page = await get(path);
  const info = read(page);
  if (page.status !== 404) error(path, `status ${page.status}, expected 404`);
  if (!/noindex/.test(info.robots)) error(path, "missing page not marked noindex");
  // Drawn once for every language (src/app/global-not-found.tsx): its
  // language is set from the address in the browser, before the first paint.
  if (!page.html.includes('document.documentElement.lang="pt-PT"')) error(path, "missing page does not set its language");
}

/* ---- off nevima.studio, nothing is listed -------------------------- */

const home = await get("/");
if (!new URL(BASE).hostname.endsWith("nevima.studio") && !/noindex/.test(home.headers.get("x-robots-tag") ?? "")) {
  error("/", "served off nevima.studio without X-Robots-Tag: noindex");
}

/* ---- report --------------------------------------------------------- */

console.log(`SEO check, ${BASE}: ${listed.length} pages in the sitemap, ${seen.size} pages read.`);
for (const line of warnings) console.log(`  warning  ${line}`);
for (const line of errors) console.log(`  ERROR    ${line}`);
console.log(errors.length ? `${errors.length} errors.` : "No errors.");
process.exit(errors.length ? 1 : 0);
