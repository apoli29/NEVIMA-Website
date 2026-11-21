"use client";

import { SlideIn } from "./enter";
import { BeforeAfter } from "./project-report";
import { ToneRoom } from "./tone-veil";
import { Included, Coverage, Tailored } from "./shoot-sections";
import { ProposalAsk } from "./about-faq";
import { useT } from "@/lib/use-lang";
import type { T } from "./sbs-shared";

/* ==================================================================
   The photo shoot

   The service's own page (user, 2026-11-17), set the way SEO & GEO's
   is rather than from the services' template: one room, its sections
   turning from light to dark under the tonal veil (tone-veil.tsx),
   their headings coming in on the same SlideIn the rest of the site
   arrives on, and the free-proposal drop the whole site presses.

   What is here, in order: the photograph and the service's name, an
   opening that says what a session is worth, the same business
   photographed twice (section 1), what the session includes, the
   packages, where we work, and how each session is shaped.

   PLACES FOR PHOTOGRAPHS. Every pair in the comparison is a named,
   empty place under public/photo-shoot/ (see its README). While a file
   is missing, its side of the slider says what belongs there and the
   card keeps its shape, so dropping the real photograph in is the whole
   of the work: no layout changes, no code changes.

   The packages are the studio's to set, and since 2026-11-20 (user)
   the cards carry no price line at all: an empty [a preencher] under
   three names was worse than nothing. What they are is written out -
   photographs, hours, places, days - and the foot of the section says
   where a figure comes from. No price is invented here.

   References through Inspo, turned into this site's own black, white,
   Satoshi and Geist Mono: Works Studio for three examples read side by
   side with their captions under them, Luma's pricing for three plain
   cards with the middle one inverted.
   ================================================================== */

/* ---- the header ------------------------------------------------- */

/** Set exactly as the side-by-side page's is (user, 2026-11-17: the two
    headers are to read as one system): the same dark ground, the same
    room above and below it, the same mono label, the same display size
    and the same two SlideIns. The photograph that stood here, its cut
    corner and its credit are gone. */
function Head({ t }: { t: T }) {
  const facts = [
    { v: t("Mainland Portugal", "Portugal continental"), l: t("Where it is available", "Onde está disponível") },
    { v: t("30 km of Gaia", "30 km de Gaia"), l: t("Travel included within", "Deslocação incluída até") },
    { v: t("The files", "As fotografias"), l: t("Yours once paid for", "Ficam do cliente depois de pagas") },
  ];
  return (
    <section data-tone="dark" className="relative isolate text-paper">
      {/* No button of its own (user, 2026-11-17): the page ends on
          "Let's work together", and the bar carries the proposal all the
          way down. Ranged left, as every other service header is. */}
      <header className="shell ps-head" data-tone-body>
        <SlideIn ready>
          <p className="mono-label text-paper/55">{t("Additional service", "Serviço adicional")}</p>
          <h1 className="display mt-7 max-w-[18ch] text-[clamp(2.5rem,6vw,4.75rem)] leading-[0.98] font-light">
            {t("Photo Shoot", "Sessão Fotográfica")}
          </h1>
        </SlideIn>
        <SlideIn ready distance={0} delay={0.08}>
          <p className="ps-head-say">
            <span className="font-light sm:block">{t("With no visual content worth the name,", "Sem conteúdo visual de qualidade,")}</span>{" "}
            <span className="font-medium sm:block">{t("a website is better left unmade.", "mais vale não ter website.")}</span>
          </p>
        </SlideIn>
        <SlideIn ready distance={0} delay={0.16}>
          <dl className="ps-head-facts">
            {facts.map((f) => (
              <div key={f.l}>
                <dt>{f.v}</dt>
                <dd className="mono-label">{f.l}</dd>
              </div>
            ))}
          </dl>
        </SlideIn>
      </header>
    </section>
  );
}

/* ---- the opening ------------------------------------------------ */

function Opening({ t }: { t: T }) {
  return (
    <section data-tone="light" className="relative">
      <div className="shell ps-open" data-tone-body>
        <SlideIn ready>
          <p className="mono-label text-ash-2">{t("Why it is worth it", "Porque vale a pena")}</p>
          <h2 className="display ps-open-title">
            <span className="font-light sm:block">{t("A website is believed", "Um website acredita-se")}</span>{" "}
            <span className="font-medium sm:block">{t("by its photographs first.", "primeiro pelas fotografias.")}</span>
          </h2>
        </SlideIn>
        <SlideIn ready distance={0} delay={0.08} className="ps-open-say">
          <p>
            {t(
              "A business can have the best product on the street: if the photographs were taken in a hurry, in whatever light there was, that is what a client sees before reading a word.",
              "Um negócio pode ter o melhor produto da rua: se as fotografias foram tiradas à pressa, com a luz que havia, é isso que o cliente vê antes de ler uma palavra.",
            )}
          </p>
          <p>
            {t(
              "A session done properly gives the website pictures of its own — of the place, of the people and of the work — and the same pictures go on serving social media, advertising and whatever comes next.",
              "Uma sessão feita a sério dá ao website imagens que lhe pertencem — do espaço, das pessoas e do trabalho — e essas mesmas imagens continuam a servir as redes sociais, os anúncios e o que vier a seguir.",
            )}
          </p>
        </SlideIn>
      </div>
    </section>
  );
}

/* ---- 1. the same business, photographed twice -------------------- */

/** Each pair is a place under public/photo-shoot/, named after what
    belongs in it, and a shape that does not change when it arrives. */
const PAIRS = [
  { id: "produto", dir: "produto", ratio: "1 / 1", en: "A product", pt: "Um produto" },
  { id: "equipa", dir: "equipa", ratio: "4 / 5", en: "The team", pt: "A equipa" },
  { id: "espaco", dir: "espaco", ratio: "3 / 2", en: "The place", pt: "O espaço" },
] as const;

/** Out of use since 2026-11-20 (user): the three sliders and the
    words over them came off the page. Kept whole, as this project
    keeps its sections, so that putting them back is one line in
    PhotoShoot. */
function Compare({ t }: { t: T }) {
  return (
    <section aria-labelledby="ps-cmp-title" data-tone="dark" className="relative text-paper">
      <div className="shell ps-sec" data-tone-body>
        <SlideIn ready>
          <p className="mono-label text-paper/55">{t("Two ways of photographing the same thing", "Duas maneiras de fotografar a mesma coisa")}</p>
          <h2 id="ps-cmp-title" className="display ps-title">
            <span className="font-light sm:block">{t("The difference is not the camera.", "A diferença não está na câmara.")}</span>{" "}
            <span className="font-medium sm:block">{t("It is the light and the time.", "Está na luz e no tempo.")}</span>
          </h2>
        </SlideIn>

        <SlideIn ready distance={0} delay={0.08}>
          <p className="ps-lede ps-lede-dark">
            {t(
              "Three things every business has to show. On one side the way they usually end up being photographed; on the other, the way they are worth photographing. Move the cut to go from one to the other.",
              "Três coisas que qualquer negócio tem de mostrar. De um lado, a maneira como costumam acabar fotografadas; do outro, a maneira como vale a pena fotografá-las. Mover o corte para ir de uma à outra.",
            )}
          </p>
        </SlideIn>

        <div className="ps-pairs">
          {PAIRS.map((pair, i) => {
            const name = t(pair.en, pair.pt);
            return (
              <SlideIn key={pair.id} ready distance={0} delay={0.1 + i * 0.06}>
                <figure className="ps-pair">
                  <BeforeAfter
                    name={name}
                    ratio={pair.ratio}
                    before={`/photo-shoot/${pair.dir}/antes.webp`}
                    after={`/photo-shoot/${pair.dir}/depois.webp`}
                    says={{
                      before: t(`Photograph: ${pair.en.toLowerCase()} — before`, `Fotografia: ${pair.pt.toLowerCase()} — antes`),
                      after: t(`Photograph: ${pair.en.toLowerCase()} — after`, `Fotografia: ${pair.pt.toLowerCase()} — depois`),
                    }}
                  />
                  <figcaption className="ps-pair-cap">
                    <span className="ps-pair-name">{name}</span>
                    <span className="mono-label ps-pair-shape">{pair.ratio.replace(" / ", ":")}</span>
                  </figcaption>
                </figure>
              </SlideIn>
            );
          })}
        </div>

        {/* These six are licensed photographs, not work of ours (user,
            2026-11-20), and the page says so rather than letting them
            pass for a portfolio. */}
        <SlideIn ready distance={0} delay={0.3}>
          <p className="mono-label ps-pairs-note">
            {t("Example images, not work of ours.", "Imagens de exemplo, não trabalho nosso.")}
          </p>
        </SlideIn>
      </div>
    </section>
  );
}

/* ---- 3. the packages --------------------------------------------- */

/** What tells one package from another (the studio's brief). The values
    wait for the studio, as everything unfilled on this site does. */
function packages(t: T) {
  const rows = [
    t("Photographs delivered", "Fotografias entregues"),
    t("How long the session runs", "Duração da sessão"),
    t("How many places", "Número de locais"),
    t("Delivered in", "Prazo de entrega"),
  ];
  /* What tells the three apart, settled with the user on 2026-11-20:
     the count doubles and then grows less, which is the way these are
     actually bought, and the two first keep the same delivery. The
     names are the studio's ladder in the two languages.

     The cards carry no price at all since 2026-11-20 (user): the
     [a preencher] line came off rather than stand there empty, and
     the foot of the section still says where a figure comes from. */
  return {
    rows,
    cards: [
      {
        id: "a",
        name: t("Essentials", "Essencial"),
        lit: false,
        values: [
          t("15 photographs", "15 fotografias"),
          t("2 hours", "2 horas"),
          t("1 place", "1 local"),
          t("7 days", "7 dias"),
        ],
      },
      {
        id: "b",
        name: t("Complete", "Completo"),
        lit: true,
        values: [
          t("30 photographs", "30 fotografias"),
          t("4 hours", "4 horas"),
          t("Up to 2 places", "Até 2 locais"),
          t("7 days", "7 dias"),
        ],
      },
      {
        id: "c",
        name: t("Extended", "Alargado"),
        lit: false,
        values: [
          t("50 photographs", "50 fotografias"),
          t("A full day", "Um dia inteiro"),
          t("Up to 3 places", "Até 3 locais"),
          t("10 days", "10 dias"),
        ],
      },
    ],
  };
}

function Packages({ t }: { t: T }) {
  const { rows, cards } = packages(t);
  return (
    <section aria-labelledby="ps-pack-title" data-tone="dark" className="relative text-paper">
      <div className="shell ps-sec" data-tone-body>
        <SlideIn ready>
          <p className="mono-label text-paper/55">{t("Packages", "Pacotes")}</p>
          <h2 id="ps-pack-title" className="display ps-title">
            <span className="font-light sm:block">{t("Three ways to do the same thing,", "Três maneiras de fazer o mesmo,")}</span>{" "}
            <span className="font-medium sm:block">{t("by the size of what there is to show.", "conforme o tamanho do que há para mostrar.")}</span>
          </h2>
        </SlideIn>

        <SlideIn ready distance={0} delay={0.08}>
          <p className="ps-lede ps-lede-dark">
            {t(
              "What tells them apart is how many photographs are delivered, how long the session runs, how many places it covers and how soon the files arrive.",
              "O que os distingue é quantas fotografias são entregues, quanto tempo dura a sessão, quantos locais cobre e em quanto tempo chegam os ficheiros.",
            )}
          </p>
        </SlideIn>

        <div className="ps-packs">
          {cards.map((card, i) => (
            <SlideIn key={card.id} ready distance={0} delay={0.1 + i * 0.06}>
              <article className="ps-pack" data-lit={card.lit || undefined}>
                <p className="mono-label ps-pack-kicker">{t(`Package ${i + 1}`, `Pacote ${i + 1}`)}</p>
                <h3 className="ps-pack-name">{card.name}</h3>
                        <dl className="ps-pack-rows">
                  {rows.map((row, r) => (
                    <div key={row}>
                      <dt className="mono-label">{row}</dt>
                      <dd>{card.values[r]}</dd>
                    </div>
                  ))}
                </dl>
              </article>
            </SlideIn>
          ))}
        </div>

        <SlideIn ready distance={0} delay={0.24}>
          <div className="ps-pack-foot">
            <p className="mono-label">
              {t(
                "The prices are the studio's to set; the form works an estimate out meanwhile.",
                "Os preços são definidos pelo estúdio; entretanto, o formulário calcula uma estimativa.",
              )}
            </p>
            <ProposalAsk label={t("Get your free proposal", "Pedir proposta gratuita")} />
          </div>
        </SlideIn>
      </div>
    </section>
  );
}

/* ================================================================== */

export function PhotoShoot() {
  const t = useT();
  return (
    <ToneRoom>
      <Head t={t} />
      <Opening t={t} />
      {/* Compare, the same three things photographed twice, came off
          the page on the user's ask (2026-11-20). It is whole below,
          out of use, and the six photographs it reads are still in
          public/photo-shoot/. */}
      {/* Where we work comes straight after the opening (user,
          2026-11-21), where it used to sit between the packages and
          personalization: whether we even travel to you is settled
          before anything is offered, not after it has been priced. */}
      <Coverage t={t} />
      <Included t={t} />
      <Packages t={t} />
      <Tailored t={t} />
    </ToneRoom>
  );
}
