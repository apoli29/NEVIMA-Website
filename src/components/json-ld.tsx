/* Structured data for search engines (see src/lib/seo.ts), written into
   the page as it comes from the server. "<" is escaped so no text in it
   can close the script early. */

export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
