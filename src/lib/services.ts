/* ==================================================================
   The four services, in one place.

   The section on the home page and each service's own page are set
   from the same record, so a description is written once and the card
   and the page it links to can never drift apart.
   ================================================================== */

export type Service = {
  slug: string;
  title: string;
  /** spelled out under the title where the title is an acronym */
  full?: string;
  body: string;
  /** space-separated RGB, taken from the photos, for the glow the card warms with */
  aura: string;
  /** back to front */
  photos: readonly [string, string, string];
};

const photo = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=320&h=320&fit=crop&auto=format&q=80`;

export const SERVICES: Service[] = [
  {
    slug: "web-design",
    title: "Web Design",
    body: "Nevima designs websites focused on making businesses stand out. That is because attention-grabbing websites are opportunities for businesses since they make clients (and other potentially valuable stakeholders) notice them and reach them.",
    aura: "64 190 214",
    photos: [
      photo("1581291519195-ef11498d1cf2"),
      photo("1636215096587-21982fbf5843"),
      photo("1520445694166-4a2ca1ba362f"),
    ],
  },
  {
    slug: "visual-identity",
    title: "Visual Identity",
    body: "We provide this service exclusively as a bundle with our web design service. This service is essentially targeted to businesses with major flaws in their visual identity (logo, symbols, etc.). An excellent website paired with a poor identity loses part of its value, so we make sure you won’t face this issue.",
    aura: "226 86 70",
    photos: [
      photo("1699662585308-fcb113a0a4ba"),
      photo("1600832331197-ad575931911b"),
      photo("1595142571206-88f8c64a9845"),
    ],
  },
  {
    slug: "seo",
    title: "SEO",
    full: "Search Engine Optimization",
    body: "Regardless of the web design quality behind a website, websites will only reach the right audience with a premium and personalized Search Engine Optimization. Nevima delivers this service both for websites designed by us and for external websites.",
    aura: "218 158 86",
    photos: [
      photo("1614849963640-9cc74b2a826f"),
      photo("1544383835-bda2bc66a55d"),
      photo("1518065896235-a4c93e088e7a"),
    ],
  },
  {
    slug: "geo",
    title: "GEO",
    full: "Generative Engine Optimization",
    body: "SEO practices are no longer the only relevant way to reach an audience, as AI is increasingly used to find companies. GEO focuses on getting your business’s name mentioned as a direct source by AI tools, which presents an opportunity to reach an even wider audience.",
    aura: "84 132 255",
    photos: [
      photo("1708311000280-861d2c89305a"),
      photo("1699500518986-f43f798cde1b"),
      photo("1706257038615-2d80b92587b7"),
    ],
  },
];

export const servicePath = (slug: string) => `/services/${slug}`;

export const findService = (slug: string) =>
  SERVICES.find((service) => service.slug === slug);
