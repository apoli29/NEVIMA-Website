"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { Glass } from "./cta-glass";
import { useOriginFade, useProposal } from "./proposal-flow";
import { useInView, type T } from "./sbs-shared";
import { useHref, useT } from "@/lib/use-lang";

/* ==================================================================
   The other three services, and the one sold inside this one

   After personalization, the services the web design does not already
   carry: the visual identity sold with it, the back-end features, SEO
   and GEO, and the photo shoot. The studio wrote what each had to say
   (the brief of 2026-11-11); the user asked for them here, one after
   another, and for the look of a photographic landing page he sent,
   "about 60%", without letting go of the site's own.

   What is taken from that reference: the plate is a photograph with a
   rounded corner, the service's name laid over it in the dark at its
   foot, a white card that overlaps its edge and carries the first thing
   to say, and a row of three facts under it, set as that page sets its
   figures. What is not taken: its colour, its type and its glass. The
   photographs are the only colour; everything on them and under them is
   the site's black, white, Satoshi and Geist Mono. The plates alternate
   sides, so four of them do not read as a list.

   Nothing here is a figure nobody can stand behind: the row under each
   plate carries facts the site already states, not invented numbers.
   There is no price either (the studio has not set one): in its place,
   the same free-proposal button the rest of the site uses, which opens
   the form that works the estimate out.

   The photographs are the studio's picks (user, 2026-11-16), served
   from Unsplash's CDN as the service cards already are, so nothing is
   downloaded into the repository:
     visual identity  a red wax seal over old letters   Thalia Ruiz
     back end         a watch movement, gold on black   Lukas Tennie
     SEO and GEO      a lighthouse at dusk over water   Evgeni Tcherkasski
     photo shoot      a lens head on, dark              Yael Yañez
   ================================================================== */

const shot = (id: string, w = 1600) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&q=80&auto=format&fit=crop`;

type Fact = { value: string; label: string };
type Part = { head: string; body: string };

type Service = {
  id: string;
  kicker: string;
  /** the title in two lines: the light one, then the medium one */
  title: [string, string];
  lede: string;
  photo: string;
  credit: string;
  alt: string;
  facts: Fact[];
  parts: Part[];
};

function services(t: T): Service[] {
  return [
    {
      id: "identity",
      kicker: t("Sold with the web design", "Vendido com o web design"),
      title: [t("An outdated logo", "Um logótipo antiquado"), t("undoes a first-rate website.", "desfaz um website de topo.")],
      lede: t(
        "A logo that no longer matches what the business has become — or never did — is the first thing a new client sees. The answer is a first-rate website with a professional visual identity beside it.",
        "Um logótipo que já não corresponde ao que o negócio é hoje — ou que nunca correspondeu — é a primeira coisa que um cliente novo vê. A resposta é um website de topo acompanhado de uma identidade visual profissional.",
      ),
      photo: shot("1590966237968-8ef11924362d"),
      credit: "Thalia Ruiz / Unsplash",
      alt: t("A red wax seal on an envelope, among old letters", "Um selo de cera vermelho num envelope, entre cartas antigas"),
      facts: [
        { value: t("Logo", "Logótipo"), label: t("Included", "Incluído") },
        { value: t("Symbol", "Símbolo"), label: t("Where it applies", "Se aplicável") },
        { value: t("The website’s look", "A estética do website"), label: t("What completes it", "O que a completa") },
      ],
      parts: [
        {
          head: t("A mini visual identity", "Uma identidade visual mini"),
          body: t(
            "The logo and the symbol, completed by the look and the feel of the website itself, so the brand reads the same wherever it is met.",
            "O logótipo e o símbolo, completados pela estética e pela aparência do próprio website, para a marca ler igual onde quer que seja encontrada.",
          ),
        },
        {
          head: t("Does it make sense for every business?", "Faz sentido para todos os negócios?"),
          body: t(
            "No. A business already presenting a professional visual identity, coherent with its corporate identity, does not need this service.",
            "Não. Um negócio que já apresente uma identidade visual profissional e coesa com a identidade corporativa da empresa não precisa deste serviço.",
          ),
        },
        {
          head: t("Not sure which it is?", "Em caso de dúvida"),
          body: t(
            "We help pick the best options for the project, including whether a new logo and a new symbol make sense in this case.",
            "Ajudamos a escolher as melhores opções para o projeto, incluindo se faz sentido, nesse caso, um logótipo e um símbolo novos.",
          ),
        },
      ],
    },
    {
      id: "back-end",
      kicker: t("Additional service", "Serviço adicional"),
      title: [t("Even the smallest business", "Até o negócio mais pequeno"), t("gains from this.", "ganha com isto.")],
      lede: t(
        "With the growth of the digital world and of artificial intelligence, no company grows today without using the digital to assist or automate what it does internally.",
        "Com o crescimento do digital e das inteligências artificiais, nenhuma empresa cresce hoje sem usar o digital para assistir ou automatizar os processos internos.",
      ),
      photo: shot("1633451238042-85d93d267866"),
      credit: "Lukas Tennie / Unsplash",
      alt: t("A watch movement in close-up, its gears in gold on black", "Um mecanismo de relógio em grande plano, as engrenagens douradas sobre preto"),
      facts: [
        { value: t("Databases", "Bases de dados"), label: t("Requests and contacts kept", "Pedidos e contactos guardados") },
        { value: t("Calendars", "Calendários"), label: t("The company’s activity", "A atividade da empresa") },
        { value: t("Emails", "E-mails"), label: t("Automatic or pre-written", "Automáticos ou pré-preenchidos") },
      ],
      parts: [
        {
          head: t("What they are", "O que são"),
          body: t(
            "Databases that keep every request and contact received from clients, on their own. Calendars to run the company’s activity, the services given to clients included. Email automation, from automatic emails to pre-written ones with blanks to fill in. And others.",
            "Bases de dados que guardam automaticamente os pedidos e os contactos recebidos de clientes. Calendários para gerir a atividade da empresa, incluindo os serviços prestados a clientes. Automatização de e-mails, desde e-mails automáticos a e-mails pré-fabricados com espaços a preencher. E outras.",
          ),
        },
        {
          head: t("What a company gains", "Como beneficiam a empresa"),
          body: t(
            "Time and activity run in a more organised, more efficient way: at the end of the day, there is time left over, and it can go into the company’s productivity. And what is known about a client is kept in interfaces that give insights back, which help deliver a better experience to that client.",
            "A gestão do tempo e das atividades fica mais organizada e eficiente: ao fim do dia, sobra tempo, que pode ser usado para aumentar a produtividade da empresa. E as informações do cliente ficam guardadas em interfaces que oferecem insights, que ajudam a entregar-lhe uma experiência melhor.",
          ),
        },
        {
          head: t("Simple, efficient, made for small and medium businesses", "Simples, eficientes e focadas nas PME"),
          body: t(
            "What we set out to offer is an affordable back end, with no excessive costs, that answers more than well to what these companies need and to the context they work in. The monthly service costs little by design: the skeleton we build is thought out so that the upkeep it needs is low.",
            "O objetivo é apresentar a estas empresas uma alternativa de back end acessível, sem custos excessivos, que responde mais do que bem às suas necessidades e ao seu contexto. O serviço mensal tem um valor simbólico, porque o esqueleto que construímos já é pensado para que a manutenção necessária seja baixa.",
          ),
        },
      ],
    },
    {
      id: "seo",
      kicker: t("Additional service", "Serviço adicional"),
      title: [t("A search engine only recommends", "O motor de busca só recomenda"), t("websites that speak its language.", "websites que comuniquem na sua língua.")],
      lede: t(
        "SEO (Search Engine Optimization) is a set of practices that put a website in the best possible positions in the searches made by its target audiences. With poorly worked SEO, a website is lost in the last pages of results; with personalized SEO, it has a much better chance of reaching the first pages.",
        "O SEO (Search Engine Optimization) consiste num conjunto de práticas que colocam um website nas melhores posições possíveis das pesquisas efetuadas pelos públicos-alvo. Com um SEO mal trabalhado, um website fica perdido nas últimas páginas de resultados; com um SEO personalizado, tem muito mais hipóteses de alcançar as primeiras páginas.",
      ),
      photo: shot("1536125434175-6c5657605fb0"),
      credit: "Evgeni Tcherkasski / Unsplash",
      alt: t("A lighthouse at dusk, its beam over the water", "Um farol ao crepúsculo, o seu feixe sobre a água"),
      facts: [
        { value: t("Basic SEO", "SEO básico"), label: t("In every website we build", "Em todos os websites que fazemos") },
        { value: t("Before launch", "Antes do lançamento"), label: t("One-off work", "Trabalho pontual") },
        { value: t("Monthly", "Mensal"), label: t("Optional, after the first months", "Opcional, depois dos primeiros meses") },
      ],
      parts: [
        {
          head: t("And now, GEO", "E agora, o GEO"),
          body: t(
            "GEO (Generative Engine Optimization) is a different set of practices with a similar purpose, aimed at Artificial Intelligence instead. More and more of us turn to Artificial Intelligence for suggestions and recommendations, and these practices raise the chances of AI tools recommending a business to their users.",
            "O GEO (Generative Engine Optimization) consiste num conjunto de práticas diferentes, com um propósito semelhante, mas direcionado para a Inteligência Artificial. Todos nós usamos cada vez mais a Inteligência Artificial para obter sugestões e recomendações, e estas práticas aumentam a probabilidade de as ferramentas de Inteligência Artificial recomendarem um negócio aos seus utilizadores.",
          ),
        },
        {
          head: t("What the service adds", "O que o serviço acrescenta"),
          body: t(
            "Every website we build includes basic SEO. The SEO & GEO service goes further: one-off work, applied before launch, and an optional monthly service that keeps the results going after the first few months.",
            "Todos os websites que fazemos incluem SEO básico. O serviço de SEO e GEO vai mais longe: um trabalho pontual, aplicado antes do lançamento, e um serviço mensal opcional, que mantém os resultados depois dos primeiros meses.",
          ),
        },
      ],
    },
    {
      id: "photo",
      kicker: t("Additional service", "Serviço adicional"),
      title: [t("With no visual content worth the name,", "Sem conteúdo visual de qualidade,"), t("a website is better left unmade.", "mais vale não ter website.")],
      lede: t(
        "When a business, especially one with a physical space, has no high-quality visual content on its website — photos, videos and the like — it is better off with no website at all.",
        "Quando um negócio, sobretudo com espaço físico, não tem conteúdo visual de qualidade no website — fotografias, vídeos e afins —, mais vale não ter website.",
      ),
      photo: shot("1608186336271-53313eeaf864"),
      credit: "Yael Yañez / Unsplash",
      alt: t("A camera lens head on, in the dark", "Uma lente de câmara vista de frente, no escuro"),
      facts: [
        { value: t("Mainland Portugal", "Portugal continental"), label: t("Where it is available", "Onde está disponível") },
        { value: t("30 km of Gaia", "30 km de Gaia"), label: t("Travel included within", "Deslocação incluída até") },
        { value: t("The files", "As fotografias"), label: t("Yours once paid for", "Ficam do cliente depois de pagas") },
      ],
      parts: [
        {
          head: t("Where, and what the travel costs", "Onde, e o que custa a deslocação"),
          body: t(
            "The photo shoot is only available in mainland Portugal. Travel within 30 km of Vila Nova de Gaia is included; beyond that it is charged per km, as set in your proposal.",
            "A sessão fotográfica só está disponível em Portugal continental. A deslocação até 30 km de Vila Nova de Gaia está incluída; a partir daí, é cobrada ao km, como fica definido na proposta.",
          ),
        },
        {
          head: t("How it runs", "Como decorre"),
          body: t(
            "We agree a date and, where it applies, the travel fee. Depending on how the shoot goes, we give a date for the final photos and videos, and we only start building the website once they are ready.",
            "Combinamos uma data e, quando se aplique, uma taxa de deslocação. Consoante o andamento da sessão, indicamos uma data de entrega das fotografias e dos vídeos finais, e só começamos a construir o website quando estiverem prontos.",
          ),
        },
        {
          head: t("Whose they are", "De quem ficam"),
          body: t(
            "Once paid for, the photos and videos are entirely the client’s, who can use them in other projects too.",
            "Depois de pagos, as fotografias e os vídeos ficam inteiramente do cliente, que os pode usar também noutros projetos.",
          ),
        },
      ],
    },
  ];
}

/* ---------------------------------------------------------------- */

/** The free-proposal button, as the rest of the page carries it: the
    light drop, growing into the form it opens. */
function ProposalAsk({ label }: { label: string }) {
  const proposal = useProposal();
  const button = useRef<HTMLButtonElement>(null);
  const [launched, setLaunched] = useState(false);
  const present = proposal?.present ?? false;
  const href = useHref();
  useEffect(() => {
    if (!present) setLaunched(false);
  }, [present]);
  useOriginFade(button, proposal?.progress, launched && present);
  const look = "cta-drop cta-drop-light inline-flex text-[0.9375rem] leading-none whitespace-nowrap";
  const face = <span className="btn-neu-face">{label}</span>;
  if (!proposal) {
    return (
      <a href={href("/#proposal")} className={look}>
        <Glass />
        {face}
      </a>
    );
  }
  return (
    <button
      ref={button}
      type="button"
      aria-haspopup="dialog"
      aria-expanded={launched && proposal.open}
      onClick={() => {
        if (!button.current) return;
        setLaunched(true);
        proposal.show(button.current, button.current, false);
      }}
      className={look}
    >
      <Glass />
      {face}
    </button>
  );
}

/** One service: the photograph, its name laid in the dark at its foot,
    the card over its edge, the three facts, and what there is to say. */
function Plate({ s, index, ask, reduce }: { s: Service; index: number; ask: string; reduce: boolean }) {
  const [ref, inView] = useInView<HTMLElement>(0.18);
  const shown = inView || reduce;

  return (
    <article ref={ref} className="sbm-plate" data-side={index % 2 ? "right" : "left"} data-in={shown || undefined}>
      <div className="sbm-shot">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={s.photo} alt={s.alt} draggable={false} loading="lazy" />
        <span aria-hidden="true" className="sbm-scrim" />
        <div className="sbm-name">
          <p className="mono-label sbm-kicker">{s.kicker}</p>
          <h3 id={`sbm-${s.id}`} className="display sbm-title">
            <span className="font-light">{s.title[0]}</span>{" "}
            <span className="font-medium sm:block">{s.title[1]}</span>
          </h3>
        </div>
        <p className="sbm-credit mono-label" aria-hidden="true">
          {s.credit}
        </p>
      </div>

      <div className="sbm-card">
        <p className="sbm-lede">{s.lede}</p>
        <div className="sbm-ask">
          <ProposalAsk label={ask} />
        </div>
      </div>

      <dl className="sbm-facts">
        {s.facts.map((f) => (
          <div key={f.label}>
            <dt className="sbm-fact-value">{f.value}</dt>
            <dd className="sbm-fact-label mono-label">{f.label}</dd>
          </div>
        ))}
      </dl>

      <div className="sbm-parts">
        {s.parts.map((p) => (
          <section key={p.head} className="sbm-part">
            <h4 className="sbm-part-head">{p.head}</h4>
            <p className="sbm-part-body">{p.body}</p>
          </section>
        ))}
      </div>
    </article>
  );
}

export function SbsMore() {
  const t = useT();
  const reduce = useReducedMotion() ?? false;
  const list = services(t);

  return (
    <section aria-labelledby="sbm-title" className="sbm relative bg-paper py-(--section-gap)">
      <div className="shell">
        <div className="sbm-head">
          <div>
            <p className="mono-label text-ash-2">{t("The other services", "Os outros serviços")}</p>
            <h2 id="sbm-title" className="display mt-6 text-balance text-[clamp(2rem,4.6vw,3.75rem)] leading-[1.02]">
              <span className="font-light sm:block">{t("A website is where it starts.", "O website é por onde se começa.")}</span>{" "}
              <span className="font-medium sm:block">{t("It is not where it ends.", "Não é onde se acaba.")}</span>
            </h2>
          </div>
          <p className="sbm-lede-head">
            {t(
              "Four services around the web design: the identity sold inside it, and three that are added when the project asks for them.",
              "Quatro serviços à volta do web design: a identidade que se vende dentro dele, e três que se acrescentam quando o projeto o pede.",
            )}
          </p>
        </div>

        <div className="sbm-plates">
          {list.map((s, i) => (
            <Plate key={s.id} s={s} index={i} reduce={reduce} ask={t("Get your free proposal", "Pedir proposta gratuita")} />
          ))}
        </div>
      </div>
    </section>
  );
}
