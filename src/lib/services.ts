/* ==================================================================
   The services, in one place. Web Design is the studio's main service;
   Visual Identity is sold only with it, so it is shown inside it; SEO,
   GEO and the photo shoot are additional services.

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
  /** back to front; empty until the studio has chosen them */
  photos: readonly string[];
  /** how the section groups it: the main service, the one sold inside it,
      or one of the additional services */
  tier: "main" | "within" | "additional";
  /** what comes with it, ticked off under the description */
  included?: { title: string; items: readonly string[] };
};

const photo = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=320&h=320&fit=crop&auto=format&q=80`;

export const SERVICES: Service[] = [
  {
    slug: "web-design",
    title: "Web Design",
    tier: "main",
    body: "Web design is Nevima’s main service for a reason: it is where we deliver our best results. To the partners who put their trust in us, we deliver a website that reflects the essence of their business and catches the attention of potential clients and any other stakeholder alike.",
    included: {
      title: "Also included",
      items: [
        "Free hosting, for as long as your website is live",
        "Basic SEO, without which a website barely shows up in searches",
        "A free call once part of the website is built, to tune it to your taste early and keep changes at the end to a minimum",
      ],
    },
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
    tier: "within",
    body: "Many businesses that need a new website also have a weak brand identity, one that conveys little credibility or professionalism to their clients. A high-quality website alone is unlikely to change that, because a client’s first impression always rests on the core of an identity: the logo and the symbol. We offer this service as a complement to our web design, to solve that problem and to match the quality of our websites.",
    included: {
      title: "Included",
      items: ["Logo", "Symbol (if applicable)"],
    },
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
    tier: "additional",
    full: "Search Engine Optimization",
    body: "Search Engine Optimization is what gets a website to the highest positions it can reach in its audience’s searches. A website with poorly worked SEO disappears into the last pages of results, while personalized SEO reaches the first ones.",
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
    tier: "additional",
    full: "Generative Engine Optimization",
    body: "More and more people turn to AI to find businesses. GEO raises the chances of yours appearing in AI recommendations and search results.",
    aura: "84 132 255",
    photos: [
      photo("1708311000280-861d2c89305a"),
      photo("1699500518986-f43f798cde1b"),
      photo("1706257038615-2d80b92587b7"),
    ],
  },
  {
    slug: "photo-shoot",
    title: "Photo Shoot",
    tier: "additional",
    body: "A website shows its best side with images that are truly yours. Nevima photographs your business, so the people who find you see who you really are instead of a stock photo. Photos only, or photos and video: you choose. Like all our additional services, it is offered only together with a website we design, and it is priced in your estimate.",
    aura: "120 120 120",
    // Waiting for the studio's three Unsplash links.
    photos: [],
  },
];

export const servicePath = (slug: string) => `/services/${slug}`;

export const findService = (slug: string) =>
  SERVICES.find((service) => service.slug === slug);
