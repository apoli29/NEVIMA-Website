"use client";

import { useRef } from "react";
import { useReducedMotion, motion } from "motion/react";
import Image from "next/image";
import { useLang, useT } from "@/lib/use-lang";
import { Rise, Rule, Uncover, useSeen } from "./exhibit";
import { SlideIn } from "./enter";
import { useInkAlign } from "./ink-align";
import { Illuminated, LIGHT_DELAY_MS } from "./services";

/* ==================================================================
   Co-founders

   Two plates in a catalogue, hung on the page rather than put in
   cards. Nothing has to be opened: each founder's portrait, name,
   words and skills are all out on the wall at once.

   The two plates are the same plate: one row each, on one grid, every
   part of one founder's row in exactly the column the same part of the
   other's is in, so the eye can run down the page and compare them. The
   portrait on the left, the same size for both; then the name, in two
   weights, its first name light and its surname heavy, as the headline
   on the second screen is; then the words; then the skills. Every
   column starts on the same line, under a label of its own.

   Under each portrait, a caption as on a gallery wall: who, and where
   they studied, both taken from their own words.
   ================================================================== */

type Founder = {
  id: "ec" | "ap";
  first: string;
  last: string;
  role: string;
  /** what they studied and where, from the bio, for the wall caption */
  study: string;
  bio: string;
  skills: readonly string[];
  photo: string;
  /** Where to find them elsewhere. An empty href is a link still to come:
      the button is shown, at rest (user, 2026-10-14). */
  links: readonly { label: string; href: string }[];
  /** Where the crop sits across the frame. Emanuel is lit from the side
      and looking off to the left, so his crop leaves room on that side. */  focus?: string;
};

/* Left to right, top to bottom, as they hang. */
const FOUNDERS: Founder[] = [
  {
    id: "ec",
    first: "Emanuel",
    last: "Costa",
    role: "Co-founder",
    study: "Multimedia, ISLA",
    bio: "Emanuel (21) is currently pursuing a degree in Multimedia at ISLA, a historic network of private education institutions in Portugal that stands out in areas such as Management, Finance and Information Technology. Emanuel has freelance experience in professional photo shoots, having already provided that service at weddings, major regional political campaigns and more.",
    skills: [
      "Web structuring and programming",
      "User interface and user experience",
      "Photo and video shooting",
    ],
    photo: "/cofounders/ec.webp",
    links: [
      { label: "LinkedIn", href: "" },
      { label: "Portfolio", href: "" },
    ],
    focus: "44% 50%",
  },
  {
    id: "ap",
    first: "António",
    last: "Policarpo",
    role: "Co-founder",
    study: "Business Communication, ISCAP",
    bio: "António (20) holds a degree in Business Communication from ISCAP, a school recognized as a benchmark in Business Sciences. Freelancing for a real estate company, António was in charge of planning and executing its communication ecosystem, which included the website and social media.",
    skills: [
      "Strategic communication",
      "Corporate identity (brand storytelling)",
      "SEO",
    ],
    photo: "/cofounders/ap.webp",
    links: [{ label: "LinkedIn", href: "" }],
  },
];

/* What each of them says in Portuguese; the rest is shared. */
const PT: Record<Founder["id"], Pick<Founder, "role" | "study" | "bio" | "skills" | "links">> = {
  ec: {
    role: "Cofundador",
    study: "Multimédia, ISLA",
    bio: "O Emanuel (21) está a tirar a licenciatura em Multimédia no ISLA, uma rede histórica de instituições de ensino privado em Portugal que se destaca em áreas como a Gestão, as Finanças e as Tecnologias de Informação. Tem experiência como freelancer em sessões fotográficas profissionais, serviço que já prestou em casamentos, em grandes campanhas políticas regionais e não só.",
    skills: [
      "Estruturação e programação web",
      "Interface e experiência do utilizador",
      "Fotografia e vídeo",
    ],
    links: [
      { label: "LinkedIn", href: "" },
      { label: "Portefólio", href: "" },
    ],
  },
  ap: {
    role: "Cofundador",
    study: "Comunicação Empresarial, ISCAP",
    bio: "O António (20) é licenciado em Comunicação Empresarial pelo ISCAP, uma escola reconhecida como referência nas Ciências Empresariais. Como freelancer numa empresa do setor imobiliário, ficou responsável por planear e executar todo o seu ecossistema de comunicação, que incluía o website e as redes sociais.",
    skills: [
      "Comunicação estratégica",
      "Identidade corporativa (brand storytelling)",
      "SEO",
    ],
    links: [{ label: "LinkedIn", href: "" }],
  },
};

/* ================================================================== */

export function CoFounders({
  ready,
  standalone = false,
}: {
  ready: boolean;
  /** A section of its own (the about page), rather than the studio's
      second half: no lead-in room, and its title is the section's. */
  standalone?: boolean;
}) {
  const Title = standalone ? "h2" : "h3";
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  useInkAlign(titleRef, subRef);
  const t = useT();
  const lang = useLang();
  const founders = lang === "pt" ? FOUNDERS.map((f) => ({ ...f, ...PT[f.id] })) : FOUNDERS;

  return (
    <div
      role="group"
      aria-labelledby="cofounders-title"
      // Its own head room on top of the gap the studio leaves after the
      // statement, so the two together make one section's rhythm.
      className={
        standalone ? undefined : "mt-[calc(var(--section-gap)-2.75rem)] md:mt-[calc(var(--section-gap)-4rem)]"
      }
    >
      {/* Side by side from lg, the subtitle's first line level with the top
          of the title's last letter (see ink-align.ts). */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
        <SlideIn ready={ready} className="flex items-start gap-2 md:gap-3">
          <Title
            ref={titleRef}
            id="cofounders-title"
            className="display cf-title text-[clamp(2.25rem,4.2vw,4.25rem)] font-light"
          >
            {/* White on a black band, as the report's names are (user,
                2026-10-13). */}
            <span>{t("Meet the co-founders", "Conhece os cofundadores")}</span>
          </Title>
        </SlideIn>
        <SlideIn
          ready={ready}
          from="right"
          delay={0.12}
          className="max-w-[17rem] shrink-0 lg:text-right"
        >
          <p ref={subRef} className="text-[0.9375rem] leading-[1.45] text-balance text-ash">
            {t(
              "Two people. Zero intermediaries. The ones who design and build your website are the ones you talk to.",
              "Duas pessoas. Zero intermediários. Quem desenha e constrói o teu website é quem fala contigo.",
            )}
          </p>
        </SlideIn>
      </div>

      <div className="mt-12 md:mt-16">
        {founders.map((founder, i) => (
          <Plate key={founder.id} founder={founder} index={i} ready={ready} />
        ))}
      </div>
    </div>
  );
}

/* ================================================================== */

/* One row of the catalogue, the same for both: a hairline over it, then
   four columns that all start on one line, the top of the portrait. The
   portrait, with its caption; the name, under its number; the words,
   under a label; the skills, under theirs. Each column's label sits on
   that same line, so the row reads across like an entry in a list of
   works: what, who, about, and with what. */
function Plate({
  founder,
  index,
  ready,
}: {
  founder: Founder;
  index: number;
  ready: boolean;
}) {
  const reduce = useReducedMotion() ?? false;
  const t = useT();
  const [ref, seen] = useSeen<HTMLElement>(ready, "0px 0px -22% 0px");
  const on = seen || reduce;
  const fade = (delay: number) => ({
    initial: false as const,
    animate: { opacity: on ? 1 : 0, y: on ? 0 : 14 },
    transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const },
  });

  return (
    <article
      ref={ref}
      aria-labelledby={`founder-${founder.id}`}
      // The last row keeps half its foot: with the mission's head room
      // halved too, the way into the mission is half what it was.
      className="relative grid grid-cols-12 gap-x-4 gap-y-8 pt-8 pb-14 last:pb-7 md:pt-10 md:pb-20 md:last:pb-10 lg:pb-24 lg:last:pb-12"
    >
      <Rule
        shown={seen}
        className={`absolute inset-x-0 top-0 ${index === 0 ? "bg-ink" : "bg-ink/25"}`}
      />

      <figure className="group col-span-9 sm:col-span-6 md:col-span-5 lg:col-span-3">
        <Uncover shown={seen} className="relative aspect-[4/5] bg-ink/5">
          <Image
            src={founder.photo}
            alt={t(`Portrait of ${founder.first} ${founder.last}`, `Retrato de ${founder.first} ${founder.last}`)}
            fill
            sizes="(min-width: 1024px) 24vw, (min-width: 768px) 40vw, 75vw"
            quality={90}
            draggable={false}
            style={founder.focus ? { objectPosition: founder.focus } : undefined}
            className="object-cover select-none transition-transform duration-[1.4s] ease-out-quint group-hover:scale-[1.035] motion-reduce:transition-none"
          />
        </Uncover>
        <motion.figcaption
          {...fade(0.5)}
          className="mono-label mt-3 flex flex-col gap-0.5 text-ash-2"
        >
          <span className="text-ink">
            {founder.first} {founder.last}
          </span>
          <span>{founder.study}</span>
        </motion.figcaption>
      </figure>

      {/* Below lg, the name, words and skills stand beside the portrait
          (md) or under it (phone), one under another; from lg they are
          three columns of the row. */}
      <div className="col-span-12 grid grid-cols-12 gap-x-4 gap-y-8 md:col-span-7 lg:col-span-9 lg:grid-cols-9">
        <div className="col-span-12 lg:col-span-3">
          <motion.p {...fade(0.15)} className="mono-label text-ash-2">
            {founder.role}
          </motion.p>
          <h4
            id={`founder-${founder.id}`}
            className="display mt-3 text-[clamp(2.5rem,3.4vw,3.375rem)] leading-[0.94] tracking-[-0.035em] text-ink"
          >
            <Rise shown={seen} delay={0.2}>
              <span className="font-light">{founder.first}</span>
            </Rise>
            <Rise shown={seen} delay={0.32}>
              <span className="font-medium">{founder.last}</span>
            </Rise>
          </h4>
        </div>

        {/* Justified, as the studio's other copy is, and held off the
            skills on its right by more than a gutter. */}
        <div className="col-span-12 lg:col-span-4 lg:pr-8 xl:pr-12">
          <motion.p {...fade(0.25)} className="mono-label text-ash-2">
            {t("Profile", "Perfil")}
          </motion.p>
          <div className="mt-3">
            {seen && !reduce ? (
              <Illuminated
                text={founder.bio}
                delayMs={LIGHT_DELAY_MS}
                reduce={reduce}
                className="svc-copy std-ink text-[clamp(1rem,1.1vw,1.125rem)] leading-[1.38] tracking-[-0.01em]"
              />
            ) : (
              <p
                data-lit={reduce ? "true" : undefined}
                className="svc-copy std-ink text-[clamp(1rem,1.1vw,1.125rem)] leading-[1.38] tracking-[-0.01em]"
              >
                {founder.bio}
              </p>
            )}
          </div>
        </div>

        <div className="col-span-12 sm:col-span-8 lg:col-span-2">
          <motion.p {...fade(0.35)} className="mono-label text-ash-2">
            {t("Key skills", "Principais competências")}
          </motion.p>
          <ul className="mt-3">
            {founder.skills.map((skill, i) => (
              <motion.li
                key={skill}
                {...fade(0.45 + i * 0.08)}
                className="flex items-baseline gap-2.5 border-t border-ink/20 py-2.5 last:border-b"
              >
                <span aria-hidden="true" className="text-ash-2">
                  +
                </span>
                <span className="display text-[clamp(0.9375rem,1.05vw,1.0625rem)] leading-[1.3] tracking-[-0.01em]">
                  {skill}
                </span>
              </motion.li>
            ))}
          </ul>
          {/* Where to find them: LinkedIn, and Emanuel's own portfolio. */}
          <motion.div {...fade(0.7)} className="mt-6 flex flex-wrap gap-2">
            {founder.links.map((link) =>
              link.href ? (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener"
                  className="cf-link mono-label"
                >
                  {link.label} <span aria-hidden="true">&#8599;</span>
                </a>
              ) : (
                <span
                  key={link.label}
                  aria-disabled="true"
                  title={t("Coming soon", "Em breve")}
                  className="cf-link mono-label"
                  data-rest=""
                >
                  {link.label} <span aria-hidden="true">&#8599;</span>
                </span>
              ),
            )}
          </motion.div>
        </div>
      </div>
    </article>
  );
}
