/* ==================================================================
   The services, in one place. Web Design is the studio's main service;
   Visual Identity is sold only with it, so it is shown inside it; SEO,
   GEO and the photo shoot are additional services.

   The section on the home page and each service's own page are set
   from the same record, so a description is written once and the card
   and the page it links to can never drift apart.

   The Portuguese is kept beside it, by slug (PT): servicesIn() gives the
   list in a page's language.
   ================================================================== */

import type { Lang } from "./i18n";

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

/** What each service says in Portuguese; everything else is shared. */
const PT: Record<string, Pick<Service, "title" | "body" | "included">> = {
  "web-design": {
    title: "Web Design",
    body: "O web design é o principal serviço da Nevima, e não é por acaso: é aqui que alcançamos os melhores resultados. A quem confia em nós, entregamos um website que reflete a essência do negócio e capta a atenção de potenciais clientes e de todas as outras partes interessadas.",
    included: {
      title: "Também incluído",
      items: [
        "Alojamento gratuito, enquanto o website estiver online",
        "SEO básico, sem o qual um website quase não aparece nas pesquisas",
        "Uma chamada gratuita quando parte do website já estiver construída, para o ajustar desde cedo ao gosto do cliente e reduzir ao mínimo as alterações finais",
      ],
    },
  },
  "visual-identity": {
    title: "Identidade Visual",
    body: "Muitos negócios que precisam de um website novo têm também uma identidade de marca fraca, que transmite pouca credibilidade e profissionalismo aos seus clientes. Dificilmente um website de grande qualidade resolve isso sozinho, porque a primeira impressão de um cliente assenta sempre no núcleo de uma identidade: o logótipo e o símbolo. Oferecemos este serviço como complemento do nosso web design, para resolver esse problema e garantir uma identidade à altura da qualidade dos nossos websites.",
    included: {
      title: "Incluído",
      items: ["Logótipo", "Símbolo (se aplicável)"],
    },
  },
  seo: {
    title: "SEO",
    body: "O SEO (Search Engine Optimization) é o que coloca um website nas melhores posições possíveis das pesquisas feitas pelo seu público. Com um SEO mal trabalhado, um website fica perdido nas últimas páginas de resultados; com um SEO personalizado, chega às primeiras.",
  },
  geo: {
    title: "GEO",
    body: "Cada vez mais pessoas recorrem à IA para encontrar negócios. O GEO aumenta a probabilidade de um negócio aparecer nas recomendações e nos resultados de pesquisa das ferramentas de IA.",
  },
  "photo-shoot": {
    title: "Sessão Fotográfica",
    body: "Um website mostra o que tem de melhor quando as imagens são verdadeiramente próprias. A Nevima fotografa o negócio, para que quem o encontra veja quem está realmente por trás dele, e não fotografias de banco de imagens. Só fotografia, ou fotografia e vídeo: a escolha é do cliente. Como todos os nossos serviços adicionais, só está disponível em conjunto com um website desenvolvido por nós, e o preço entra na estimativa.",
  },
};

/** The services, in a language. */
export const servicesIn = (lang: Lang): Service[] =>
  lang === "pt" ? SERVICES.map((service) => ({ ...service, ...PT[service.slug] })) : SERVICES;

export const servicePath = (slug: string) => `/services/${slug}`;

export const findService = (slug: string, lang: Lang = "en") =>
  servicesIn(lang).find((service) => service.slug === slug);
