/* ==================================================================
   The services, in one place. Web Design is the studio's main service;
   Visual Identity is sold only with it, so it is shown inside it; the
   back-end features, SEO & GEO and the photo shoot are additional
   services. SEO and GEO became one service on 2026-11-11 (user), under
   the slug "seo" (/services/geo redirects there), as in the free-proposal
   form; the back-end features joined the list the same day.

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
    body: "Web design is Nevima’s main service for a reason: it is where we achieve our best results. We deliver websites that reflect the essence of each business and catch the attention of the potential clients and other stakeholders of our partners.",
    included: {
      title: "Also included",
      items: [
        "Free hosting, with everything set up for your website to go live without a hitch",
        "Basic SEO, to make sure your website shows up in search results",
        "A free call once part of the project is built. The goal? To make changes to your taste and understand the direction the project should take, so nothing needs changing at the end",
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
    body: "Many businesses that need a new website also have an identity with weaknesses, which convey little credibility and professionalism to their clients. A client’s first impression always rests on the core of an organizational identity: the logo and/or the symbol. That’s why we offer this service as a complement to our web design: to solve that problem and guarantee an identity that lives up to the quality of our websites.",
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
    slug: "back-end-features",
    title: "Back-end Features",
    tier: "additional",
    body: "Forms, newsletter sign-ups, calendar and reservations: what a website does with what its visitors send. We set them up on reliable platforms, in the client’s own name, and look after them every month, so requests, sign-ups and bookings reach the business with no worries about the technical side.",
    aura: "92 196 140",
    // Waiting for the studio's three Unsplash links.
    photos: [],
  },
  {
    slug: "seo",
    title: "SEO & GEO",
    tier: "additional",
    full: "Search & Generative Engine Optimization",
    body: "SEO puts a website in the top positions of the searches its audience makes: poorly worked, it goes unnoticed among the last pages of results; personalized, it has a much better chance of reaching the first ones. GEO does the same in AI tools, which more and more people turn to for businesses that solve their problems: it raises the chances of a business being recommended.",
    aura: "218 158 86",
    photos: [
      photo("1614849963640-9cc74b2a826f"),
      photo("1544383835-bda2bc66a55d"),
      photo("1518065896235-a4c93e088e7a"),
    ],
  },
  {
    slug: "photo-shoot",
    title: "Photo Shoot",
    tier: "additional",
    body: "We provide this service within mainland Portugal, as a solution for businesses that want a highly personalized website but have no photos of their business, their premises or their products and/or services. A website is only personalized when it reflects the essence of the business, and that includes visual elements that portray it.",
    aura: "120 120 120",
    // Waiting for the studio's three Unsplash links.
    photos: [],
  },
];

/** What each service says in Portuguese; everything else is shared. */
const PT: Record<string, Pick<Service, "title" | "body" | "included">> = {
  "web-design": {
    title: "Web Design",
    body: "O web design é o serviço principal da Nevima, e não é por acaso: é no web design que obtemos os melhores resultados. Entregamos websites que refletem a essência do negócio e que captam a atenção de potenciais clientes e de outros stakeholders dos nossos parceiros.",
    included: {
      title: "Também incluído",
      items: [
        "Alojamento gratuito, com todas as configurações necessárias para o website ir para o ar sem problemas",
        "SEO básico, para assegurar que o website aparece nos resultados de pesquisa",
        "Uma chamada gratuita quando parte do projeto estiver construída. O objetivo? Aplicar alterações ao gosto do cliente e compreender a direção que o projeto deve tomar, para evitar a necessidade de alterações no final",
      ],
    },
  },
  "visual-identity": {
    title: "Identidade Visual",
    body: "Muitos negócios que precisam de um website novo têm também uma identidade com debilidades, que transmitem pouca credibilidade e profissionalismo aos seus clientes. A primeira impressão de um cliente assenta sempre no núcleo de uma identidade organizacional: o logótipo e/ou o símbolo. É por isso que oferecemos este serviço como complemento do nosso web design: para resolver esse problema e garantir uma identidade à altura da qualidade dos nossos websites.",
    included: {
      title: "Incluído",
      items: ["Logótipo", "Símbolo (se aplicável)"],
    },
  },
  "back-end-features": {
    title: "Funcionalidades de Back End",
    body: "Formulários, inscrições na newsletter, calendário e reservas: o que o website faz com o que os visitantes lhe enviam. Configuramo-los em plataformas fiáveis, em nome do cliente, e mantemo-los todos os meses, para que pedidos, inscrições e marcações cheguem ao negócio sem preocupações com a parte técnica.",
  },
  seo: {
    title: "SEO e GEO",
    body: "O SEO coloca um website nas melhores posições das pesquisas do seu público: mal trabalhado, passa despercebido nas últimas páginas; personalizado, tem muito mais hipóteses de chegar às primeiras. O GEO faz o mesmo nas ferramentas de IA, a que cada vez mais pessoas recorrem para encontrar negócios que resolvam os seus problemas: aumenta a probabilidade de um negócio ser recomendado.",
  },
  "photo-shoot": {
    title: "Sessão Fotográfica",
    body: "Fornecemos este serviço em Portugal continental, como solução para os negócios que querem um website altamente personalizado, mas que não têm fotografias do seu negócio, do seu estabelecimento ou dos seus produtos e/ou serviços. Um website só é personalizado quando reflete a essência do negócio, o que inclui a presença de elementos visuais que o retratem.",
  },
};

/** The services, in a language. */
export const servicesIn = (lang: Lang): Service[] =>
  lang === "pt" ? SERVICES.map((service) => ({ ...service, ...PT[service.slug] })) : SERVICES;

export const servicePath = (slug: string) => `/services/${slug}`;

export const findService = (slug: string, lang: Lang = "en") =>
  servicesIn(lang).find((service) => service.slug === slug);
