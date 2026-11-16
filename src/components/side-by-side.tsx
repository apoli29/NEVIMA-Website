"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { SlideIn } from "./enter";
import { FloatingNav } from "./floating-nav";
import { Footer } from "./footer";
import { ProposalHost } from "./proposal-host";
import { WorkTogether } from "./work-together";
import { SbsIncluded, SbsLevels, SbsPersonal } from "./sbs-service";
import { useSeen } from "./use-seen";
import { useT } from "@/lib/use-lang";
import { Funnel_Display, IBM_Plex_Mono, Plus_Jakarta_Sans } from "next/font/google";

/* Pilar's own type, loaded for this page only and chosen from its
   identity, not from any reference: Plus Jakarta Sans is the brand's
   (its guide and signature); Funnel Display, for the display lines, has
   the symbol's flat geometry (near-square counters, terminals cut
   straight); IBM Plex Mono sets the small labels. */
const pilarDisplay = Funnel_Display({ subsets: ["latin"], variable: "--f-pilar-display", display: "swap" });
const pilarSans = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--f-pilar-sans", display: "swap" });
const pilarMono = IBM_Plex_Mono({ subsets: ["latin"], weight: "500", variable: "--f-pilar-mono", display: "swap" });

/* ==================================================================
   Side by side

   The same business, built twice. The comparison on the home page says
   the difference in words; this page shows it. Two websites for one
   invented insurance broker stand on the same black surface: one put together
   from an off-the-shelf template, one of ours. They start in the same
   frame and go down the page at the same moments, so the only thing
   that differs is what each of them does with that time.

   Nothing here is a picture of a website. Both are real pages, laid out
   at 1200px and scaled into their plate, so the type inside is type and
   not a grey bar — which is also the argument.

   The loop is CSS, one length (--sbs-loop) shared by every keyframe on
   both sides, and the two sides are given their classes in the same
   render, so they start in the same frame and never drift apart. It is
   held while it is off the screen (.sbs-run is in offscreen-pause.tsx)
   and never runs at all for anyone who has asked for less motion: there
   both pages are simply shown as they end up, the template's mess
   included.

   What the left side does with its twelve seconds is what a template
   does: a loading bar that will not finish, a header that arrives in
   jolts, a banner image that lands late and shoves the whole page down,
   a cookie wall, a carousel nobody asked for, and a badge for the shop
   it was bought from. The right side arrives once, in one move, and
   then holds still.

   The broker is invented and both pages are demonstrations: it says so
   under them, because this page is an argument about honesty.
   ================================================================== */

/** The plate measured when it changes size, never while the loop runs:
    the scale is written on it as a custom property and the browser is
    left to do the rest. The page's own width is read off the page (a
    narrow desktop, and narrower still on a phone, see globals.css), so
    the width is said in one place only. */
function useFit() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fit = () => {
      const page = el.querySelector<HTMLElement>(".sbs-mini");
      const w = el.clientWidth;
      const own = page?.offsetWidth;
      if (!page || !w || !own) return;
      const k = w / own;
      el.style.setProperty("--sbs-k", String(k));
      // A page that marks its sections with data-stop has its stops read
      // off itself (each section's top, never past the page's foot), so
      // a change of copy or of language cannot leave a stop mid-section.
      // A page without marks keeps the stops written in globals.css.
      const marks = page.querySelectorAll<HTMLElement>("[data-stop]");
      const view = el.clientHeight / k;
      const last = page.offsetHeight - view;
      marks.forEach((mark, i) => {
        page.style.setProperty(`--sbs-stop-${i + 1}`, `${-Math.round(Math.min(mark.offsetTop, last))}px`);
      });
    };
    // Measured once more on the next frame, so a page that changes its
    // own width at a breakpoint is read after it has been laid out again.
    let frame = 0;
    const later = () => {
      fit();
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(fit);
    };
    later();
    const size = new ResizeObserver(later);
    size.observe(el);
    const page = el.querySelector<HTMLElement>(".sbs-mini");
    if (page) size.observe(page);
    document.fonts?.ready.then(later);
    window.addEventListener("resize", later);
    return () => {
      cancelAnimationFrame(frame);
      size.disconnect();
      window.removeEventListener("resize", later);
    };
  }, []);

  return ref;
}

/** One plate: the label over it, the address line a browser would carry,
    and the page itself, which is shown to a screen reader as the one
    sentence it is worth. */
function Plate({
  label,
  quiet,
  address,
  says,
  running,
  children,
}: {
  label: string;
  /** the template's label is held back, so ours reads as the answer */
  quiet?: boolean;
  address: string;
  says: string;
  running: boolean;
  children: React.ReactNode;
}) {
  const screen = useFit();
  // The address bar is gone (user, 2026-11-16); the address is kept for whoever reads the page aloud.
  void address;

  return (
    <figure className="sbs-plate">
      <figcaption className="sbs-cap">
        <span className="mono-label" data-quiet={quiet ? "" : undefined}>
          {label}
        </span>
      </figcaption>

      <div className="sbs-sheet">
        <div ref={screen} className="sbs-screen">
          <p className="sr-only">{says}</p>
          <div aria-hidden="true" className={running ? "sbs-run" : undefined}>
            {children}
          </div>
        </div>
      </div>
    </figure>
  );
}

/* ---- the website other professionals deliver --------------------- */

/* The same broker as the websites most insurance brokers are handed:
   a joining of two real ones the user brought (2026-11-17), set down as
   they are, without forcing faults into them. Nothing moves on this
   side but the page going down: no loading bar, no slider turning, no
   cookie wall. What reads as dated is the design itself: a home-made
   logotype, a royal blue and greys, capitals everywhere, line icons as
   on a slide, a great deal of text, stock photography, a contact strip
   before anything is said. One idiom from top to foot (user,
   2026-11-17: it had read as two websites): Arial, navy capitals with
   a short blue rule, icons in pale blue squares, white cards with a
   border, white and pale grey grounds in turn, navy at both ends. Its sections are its own, not ours; each
   carries data-stop so it reaches the top of the plate at the moment
   ours does. The one flaw of structure is the contacts coming first. */

/** Line icons, drawn the way a slide deck draws them. */
const C_ICONS: Record<string, string> = {
  car: "M3.5 15l1.8-5.2A2 2 0 0 1 7.2 8.5h9.6a2 2 0 0 1 1.9 1.3l1.8 5.2v4h-2.8v-2H6.3v2H3.5z M3.5 15h17 M7 13.2h.01 M17 13.2h.01",
  life: "M12 20s-7.5-4.6-7.5-10.2A4.2 4.2 0 0 1 12 7.3a4.2 4.2 0 0 1 7.5 2.5C19.5 15.4 12 20 12 20z M8.5 12h2l1-2 1.5 4 1-2h1.5",
  health: "M8.5 4h7v3h-7z M8.5 5.5H5.5V21h13V5.5h-3 M12 10.5v6 M9 13.5h6",
  home: "M3 11.5 12 4l9 7.5 M5.5 9.8V20h13V9.8 M10 20v-5.5h4V20",
  person: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M4 21c0-4.4 3.6-6.5 8-6.5s8 2.1 8 6.5z",
  doc: "M6 3h8.5L19 7.5V21H6z M14.5 3v4.5H19",
  euro: "M17 6.6A6.5 6.5 0 1 0 17 17.4 M4.5 10.2h8.5 M4.5 13.8h8.5",
  gears:
    "M9.5 7.2a3.6 3.6 0 1 0 0 7.2 3.6 3.6 0 0 0 0-7.2z M9.5 3.5v2 M9.5 16v2 M3.8 10.8h2 M13.2 10.8h2 M5.5 6.8l1.4 1.4 M12.1 13.4l1.4 1.4 M5.5 14.8l1.4-1.4 M12.1 8.2l1.4-1.4 M17.5 13.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z M17.5 11.3v1.2 M17.5 19.5v1.2 M15.3 16h1.2 M19.5 16h1.2",
  phone: "M5 3.5h3.6l1.9 4.8-2.4 1.5a11 11 0 0 0 5.1 5.1l1.5-2.4 4.8 1.9V18a2.5 2.5 0 0 1-2.5 2.5A15.5 15.5 0 0 1 2.5 6 2.5 2.5 0 0 1 5 3.5z",
  mail: "M3 6h18v12H3z M3 6.5l9 6.8 9-6.8",
  pin: "M12 21s-7-6.2-7-11.2a7 7 0 0 1 14 0C19 14.8 12 21 12 21z M12 7.3a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z",
  search: "M10.5 4a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13z M15.2 15.2 20 20",
};

function CIcon({ name, fill }: { name: string; fill?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={fill ? "currentColor" : "none"}
      stroke={fill ? "none" : "currentColor"}
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={C_ICONS[name]} />
    </svg>
  );
}

/** Stock photography, served from Unsplash's CDN as the service cards
    are (free licence, checked on each photo's page). */
const cStock = (id: string, w: number) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&q=75&auto=format&fit=crop`;

/** The broker's logotype as a small firm is often given it: a badge in a
    gradient with an umbrella, the name in an italic serif, the
    descriptor spaced out beside it, the legal name under them. Not
    Pilar's guide, which this website never saw. */
function CLogo({ t }: { t: ReturnType<typeof useT> }) {
  return (
    <span className="sbs-c-logo">
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <defs>
          <linearGradient id="sbs-c-badge" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#5b9be0" />
            <stop offset="1" stopColor="#173f86" />
          </linearGradient>
        </defs>
        <circle cx="24" cy="24" r="22" fill="url(#sbs-c-badge)" stroke="#f39200" strokeWidth="2" />
        <path d="M10 25a14 12 0 0 1 28 0c-2.3-1.8-4.7-1.8-7 0-2.3-1.8-4.7-1.8-7 0-2.3-1.8-4.7-1.8-7 0-2.3-1.8-4.7-1.8-7 0z" fill="#fff" />
        <path d="M24 25v10c0 2.6 3.6 2.6 3.6 0" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <span>
        <span className="sbs-c-logo-name">
          <b>Pilar</b>
          <i>{t("INSURANCE", "SEGUROS")}</i>
        </span>
        <small>{t("Insurance Brokerage, Lda.", "Mediação de Seguros, Lda.")}</small>
      </span>
    </span>
  );
}

function Template({ t }: { t: ReturnType<typeof useT> }) {
  const menu = [
    t("HOME", "INÍCIO"),
    t("ABOUT US", "QUEM SOMOS"),
    t("PERSONAL INSURANCE", "SEGUROS PARTICULARES"),
    t("BUSINESS INSURANCE", "SEGUROS EMPRESAS"),
    t("CLAIMS", "SINISTROS"),
    t("CONTACTS", "CONTACTOS"),
    t("NEWS", "NOTÍCIAS"),
  ];
  const kinds = [
    ["car", t("CAR INSURANCE", "SEGURO AUTOMÓVEL"), t("PROTECTION ON EVERY JOURNEY", "PROTEÇÃO EM TODAS AS DESLOCAÇÕES")],
    ["life", t("LIFE INSURANCE", "SEGURO DE VIDA"), t("PEACE OF MIND FOR THE WHOLE FAMILY", "TRANQUILIDADE PARA TODA A FAMÍLIA")],
    ["health", t("HEALTH INSURANCE", "SEGURO DE SAÚDE"), t("SOLUTIONS ADAPTED TO EVERY NEED", "SOLUÇÕES QUE SE ADAPTAM A CADA NECESSIDADE")],
    ["home", t("HOME INSURANCE", "SEGURO HABITAÇÃO"), t("A SAFE HOME TO LIVE IN PEACE", "CASA SEGURA PARA VIVER EM PAZ")],
  ];
  const services = [
    ["person", t("TAILORED SOLUTIONS", "SOLUÇÕES PERSONALIZADAS")],
    ["doc", t("DOCUMENT MANAGEMENT", "GESTÃO DOCUMENTAL")],
    ["euro", t("PAYMENT MANAGEMENT", "GESTÃO DE COBRANÇAS")],
    ["gears", t("CLAIMS MANAGEMENT", "GESTÃO DE SINISTROS")],
  ];
  const news = [
    [
      "1729838809728-48566c1ef0e9",
      t("INSURANCE BROKER IN LISBON | PILAR INSURANCE | 17 YEARS AT OUR CLIENTS’ SERVICE", "MEDIADOR DE SEGUROS EM LISBOA | PILAR SEGUROS | 17 ANOS AO SERVIÇO DOS CLIENTES"),
    ],
    [
      "1791220154760-43ad2bf459c2",
      t("PARTNERS IN PROTECTION AND FINANCIAL STABILITY: TIPS FOR 2026", "PARCEIROS NA PROTEÇÃO E NA ESTABILIDADE FINANCEIRA: DICAS PARA 2026"),
    ],
    [
      "1758519288905-38b7b00c1023",
      t("THE 5 MOST COMMON MISTAKES WHEN CHOOSING HOME INSURANCE", "OS 5 ERROS MAIS COMUNS AO ESCOLHER UM SEGURO DE CASA"),
    ],
  ];
  const fixed = t("(call to a national landline)", "(chamada para rede fixa nacional)");
  const mobile = t("(call to a national mobile network)", "(chamada para rede móvel nacional)");

  return (
    <div className="sbs-mini sbs-c-page">
      {/* The strip over the header. */}
      <div className="sbs-c-strip">
        <span>{t("Privacy Policy", "Política de Privacidade")}</span>
        <span>|</span>
        <span>{t("Complaints Book", "Livro de Reclamações")}</span>
        <i className="sbs-c-flag" />
      </div>

      <div className="sbs-c-head">
        <CLogo t={t} />
        <nav className="sbs-c-nav">
          {menu.map((item, i) => (
            <span key={item} data-on={i === 0 ? "" : undefined}>
              {item}
            </span>
          ))}
        </nav>
        <span className="sbs-c-tools">
          <CIcon name="search" />
          <b>in</b>
          <b className="sbs-c-ig" />
          <b>f</b>
        </span>
        <span className="sbs-c-burger">
          <i />
          <i />
          <i />
        </span>
      </div>

      {/* The slider, held on its first slide. */}
      <div className="sbs-c-slide">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={cStock("1555529902-5261145633bf", 1100)} alt="" draggable={false} />
        <span className="sbs-c-arrow">‹</span>
        <span className="sbs-c-arrow" data-right="">›</span>
        <div className="sbs-c-slide-copy">
          <h3>{t("SECURITY", "SEGURANÇA")}</h3>
          <span>{t("READ MORE", "VER MAIS")}</span>
        </div>
        <span className="sbs-c-dots">
          <i data-on="" />
          <i />
          <i />
        </span>
      </div>

      {/* The contacts, before anything has been said. */}
      <div className="sbs-c-boxes">
        <div>
          <b>
            <CIcon name="phone" fill /> {t("Call Now", "Ligar Agora")}
          </b>
          <span>+351 210 000 000</span>
        </div>
        <div>
          <b>
            <CIcon name="mail" /> {t("Send an E-mail", "Enviar E-mail")}
          </b>
          <span>geral@pilarseguros.example</span>
        </div>
        <div>
          <b>
            <CIcon name="pin" /> {t("Visit Us", "Visitar-nos")}
          </b>
          <span>{t("Av. da República, Lisbon", "Av. da República, Lisboa")}</span>
        </div>
      </div>

      <div className="sbs-c-advice" data-stop>
        <h4 className="sbs-c-title">{t("THE BEST ADVICE", "O MELHOR ACONSELHAMENTO")}</h4>
        <p>
          {t("At ", "Na ")}
          <span className="sbs-c-a">{t("Pilar Insurance – Insurance Brokerage, Lda.", "Pilar Seguros – Mediação de Seguros, Lda.")}</span>
          {t(
            " we are dedicated to providing the best insurance advice, adapted to the needs of each client, private or business, with rigour, transparency and proximity since 2009.",
            " dedicamo-nos a prestar o melhor aconselhamento em seguros, adaptado às necessidades de cada cliente, particular ou empresa, com rigor, transparência e proximidade desde 2009.",
          )}
        </p>
      </div>

      <div className="sbs-c-kinds">
        <div className="sbs-c-tabs">
          <span data-on="">{t("PERSONAL", "PARTICULARES")}</span>
          <span>{t("BUSINESS", "EMPRESAS")}</span>
        </div>
        <div className="sbs-c-grid">
          {kinds.map(([icon, name, line]) => (
            <div key={name} className="sbs-c-kind">
              <span className="sbs-c-ico">
                <CIcon name={icon} />
              </span>
              <h5>{name}</h5>
              <small>{line}</small>
            </div>
          ))}
        </div>
      </div>

      <div className="sbs-c-services" data-stop>
        <h4 className="sbs-c-title">{t("OUR SERVICES", "OS NOSSOS SERVIÇOS")}</h4>
        <div className="sbs-c-srow">
          {services.map(([icon, name]) => (
            <span key={name}>
              <span className="sbs-c-ico">
                <CIcon name={icon} />
              </span>
              <small>{name}</small>
            </span>
          ))}
        </div>
      </div>

      <div className="sbs-c-text">
        <h4 className="sbs-c-title">{t("CAR ACCIDENT", "ACIDENTE DE AUTOMÓVEL")}</h4>
        <p className="sbs-c-q">{t("What to do in the event of an accident?", "O que fazer em caso de acidente?")}</p>
        <p>
          {t(
            "All measures within reach should be taken to limit the consequences of the claim. The mandatory documents must always be kept in the vehicle: driving licence, green card and vehicle documents.",
            "Devem ser tomadas todas as medidas ao alcance para limitar as consequências do sinistro. Os documentos obrigatórios devem estar sempre no veículo: carta de condução, carta verde e documentos do veículo.",
          )}
        </p>
        <p className="sbs-c-q">{t("What to do if only the vehicles are damaged?", "O que fazer se houver apenas danos nos veículos?")}</p>
        <p>
          {t("Whenever possible, reach an agreement with the other parties by filling in and signing the ", "Sempre que possível, chegar a acordo com os intervenientes, preenchendo e assinando a ")}
          <b>{t("European Accident Statement (DAAA)", "Declaração Amigável de Acidente Automóvel (DAAA)")}</b>
          {t(
            ". Following this procedure makes the settlement of the claim faster. The statement must include:",
            ". Ao adotar este procedimento, a regularização do sinistro torna-se mais rápida. Na DAAA devem constar:",
          )}
        </p>
        <ul>
          <li>{t("Identification of the drivers and policyholders", "Identificação dos condutores e tomadores de seguro")}</li>
          <li>{t("Registration of the vehicles and insurance company", "Matrícula dos veículos e companhia de seguros")}</li>
          <li>{t("Sketch of the accident", "Croqui do acidente")}</li>
          <li>{t("Visible damage", "Danos visíveis")}</li>
          <li>{t("Signature of both drivers", "Assinatura de ambos os condutores")}</li>
        </ul>
        <p className="sbs-c-q">
          {t(
            "What to do if the other party refuses to fill in the DAAA, or does not agree on how the accident happened?",
            "O que fazer se o outro interveniente não quiser preencher a DAAA, ou não estiver de acordo quanto às circunstâncias do acidente?",
          )}
        </p>
        <p>{t("If there is no agreement, or the DAAA cannot be filled in:", "Caso não haja acordo, ou não seja possível o preenchimento da DAAA:")}</p>
        <ul>
          <li>{t("Call the authorities on 112", "Solicitar a presença das autoridades, através do 112")}</li>
          <li>
            {t(
              "Collect the details of those involved: name, address, phone number and driving licence",
              "Recolher os elementos de identificação dos intervenientes: nome, morada, telefone e carta de condução",
            )}
          </li>
          <li>{t("Collect the vehicles’ details: make, registration, insurer and policy number", "Recolher os dados dos veículos: marca, matrícula, companhia de seguros e número da apólice")}</li>
          <li>{t("Collect the identification of any witnesses", "Recolher a identificação das testemunhas")}</li>
        </ul>
        <p className="sbs-c-under">
          {t(
            "Once the authorities have recorded the occurrence, if possible, remove the vehicle from the road to ease traffic.",
            "Assim que as autoridades tiverem tomado conta da ocorrência, se possível retirar o veículo da via, para facilitar o trânsito.",
          )}
        </p>
      </div>

      <div className="sbs-c-about" data-stop>
        <h4 className="sbs-c-title">{t("ABOUT US", "QUEM SOMOS")}</h4>
        <div className="sbs-c-cols">
          <p className="sbs-c-lead">
            {t(
              "Founded in 2009, Pilar Insurance – Insurance Brokerage, Lda. is a family-run company that operates in the market with rigour and professional impartiality.",
              "Fundada em 2009, a Pilar Seguros – Mediação de Seguros, Lda. é uma empresa de cariz familiar, que opera no mercado com rigor e isenção profissional.",
            )}
          </p>
          <p>
            {t(
              "We are a team of available and competent staff, covering the various areas of the insurance business, acting effectively in the market.",
              "Somos uma equipa de colaboradores disponíveis e competentes, abrangendo as diversas áreas da atividade seguradora, intervindo com eficácia no mercado.",
            )}
          </p>
          <p>
            {t(
              "Supporting clients and working with transparency towards the insurers are the values that Pilar and its team defend every day! Valuing the activity of Brokerage.",
              "Acompanhar os clientes e trabalhar com transparência junto das seguradoras são os valores que a Pilar e a sua equipa defendem diariamente! Valorizar a atividade da Mediação.",
            )}
          </p>
        </div>
        <span className="sbs-c-privacy">
          {t("Privacy Policy available ", "Política de Privacidade disponível ")}
          <span className="sbs-c-a">{t("here", "aqui")}</span>
        </span>
      </div>

      <div className="sbs-c-news" data-stop>
        <h4 className="sbs-c-title">{t("LATEST NEWS", "ÚLTIMAS NOTÍCIAS")}</h4>
        <div className="sbs-c-cards">
          {news.map(([id, title]) => (
            <div key={id} className="sbs-c-card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={cStock(id, 520)} alt="" draggable={false} />
              <small>{t("INFORMATION", "INFORMAÇÕES")}</small>
              <h5>{title}</h5>
            </div>
          ))}
        </div>
        <span className="sbs-c-scroll">
          <i />
        </span>
      </div>

      {/* The footer, as such websites have it: four columns on navy, each
          under the same title as the page's own, the contacts among them. */}
      <div className="sbs-c-foot">
        <div>
          <h6>{t("PILAR INSURANCE", "PILAR SEGUROS")}</h6>
          <p>
            {t(
              "Insurance brokerage since 2009. Personal and business insurance, with rigour, transparency and proximity.",
              "Mediação de seguros desde 2009. Seguros particulares e empresas, com rigor, transparência e proximidade.",
            )}
          </p>
          <span className="sbs-c-social">
            <b>f</b>
            <b>in</b>
            <b className="sbs-c-ig" />
          </span>
        </div>
        <div>
          <h6>{t("USEFUL LINKS", "LINKS ÚTEIS")}</h6>
          {[
            t("About Us", "Quem Somos"),
            t("Personal Insurance", "Seguros Particulares"),
            t("Business Insurance", "Seguros Empresas"),
            t("Claims", "Sinistros"),
            t("News", "Notícias"),
          ].map((link) => (
            <span key={link}>» {link}</span>
          ))}
        </div>
        <div>
          <h6>{t("CONTACTS", "CONTACTOS")}</h6>
          <span className="sbs-c-line">
            <CIcon name="pin" /> Av. da República, 00, 1.º Esq., 1050-000 Lisboa
          </span>
          <span className="sbs-c-line">
            <CIcon name="phone" fill /> +351 210 000 000
          </span>
          <em>{fixed}</em>
          <span className="sbs-c-line">
            <CIcon name="phone" fill /> +351 910 000 000
          </span>
          <em>{mobile}</em>
          <span className="sbs-c-line">
            <CIcon name="mail" /> geral@pilarseguros.example
          </span>
        </div>
        <div>
          <h6>{t("OPENING HOURS", "HORÁRIO")}</h6>
          <span>{t("Monday to Friday", "Segunda a Sexta")}</span>
          <span>9h00 – 13h00</span>
          <span>14h30 – 18h30</span>
          <span>{t("Saturdays, Sundays and holidays: closed", "Sábados, Domingos e Feriados: encerrado")}</span>
        </div>
      </div>

      <div className="sbs-c-legal">
        {t(
          "Insurance broker registered with the ASF under no. 000000000. | Complaints handling | Electronic Complaints Book",
          "Mediador de Seguros inscrito na ASF com o n.º 000000000. | Gestão de reclamações | Livro de Reclamações Eletrónico",
        )}
      </div>
      <div className="sbs-c-copy">
        Copyright © {t("PILAR INSURANCE – INSURANCE BROKERAGE, LDA", "PILAR SEGUROS – MEDIAÇÃO DE SEGUROS, LDA")} · {t("Website by: Web Design Lda.", "Desenvolvido por: Web Design Lda.")}
      </div>
    </div>
  );
}

/* ---- the website we would have made ------------------------------ */

/** Pilar's symbol, from its brand guide: the stem, the cut of 8 units
    that is the broker's place between client and insurer, and the empty
    core, which never takes a colour. */
function PilarSymbol({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="currentColor" aria-hidden="true">
      <rect width="30" height="100" rx="8" />
      <path
        fillRule="evenodd"
        d="M44 0H76A24 24 0 0 1 100 24V42A24 24 0 0 1 76 66H44A6 6 0 0 1 38 60V6A6 6 0 0 1 44 0Z M59 23H79V43H59Z"
      />
    </svg>
  );
}

/** The horizontal signature: the name is never translated, only the
    descriptor is ("Pilar Seguros" on the Portuguese page, "Pilar
    Insurance" on the English one), set as the guide sets it. */
function PilarLogo({ t, className }: { t: ReturnType<typeof useT>; className?: string }) {
  return (
    <span className={`sbs-p-logo ${className ?? ""}`}>
      <PilarSymbol />
      <span>{t("Pilar Insurance", "Pilar Seguros")}</span>
    </span>
  );
}

/** The reviews across the foot of the hero: one short, transparent strip
    the whole width of the page, sliding very slowly (a lap a minute) and
    held while the pointer is on it. The clients are invented, as Pilar
    is, so they are given initials, a town and a kind of policy, never a
    face. */
function PilarReviews({ t }: { t: ReturnType<typeof useT> }) {
  const reviews = [
    [
      t("They called the insurer for me the day the flat flooded. All I did was send the photos.", "Ligaram à seguradora por mim no dia da inundação. Só tive de enviar as fotografias."),
      "Marta S.",
      t("Lisbon", "Lisboa"),
      t("Home", "Casa"),
    ],
    [
      t("I was paying €180 a year more for the same cover. The table showed it on one page.", "Pagava mais 180 € por ano pelo mesmo seguro. O quadro mostrou-o numa folha."),
      "Rui C.",
      "Almada",
      t("Car", "Automóvel"),
    ],
    [
      t("They explained the excess before I signed, not after the claim.", "Explicaram-me a franquia antes de assinar, e não depois do sinistro."),
      "Inês M.",
      "Oeiras",
      t("Health", "Saúde"),
    ],
    [
      t("The company’s fleet and liability cover in one place, with one person.", "A frota e a responsabilidade civil da empresa num só sítio, com uma só pessoa."),
      "Paulo F.",
      "Setúbal",
      t("Business", "Empresas"),
    ],
    [
      t("At renewal they called me before I had remembered it.", "Na renovação ligaram-me antes de eu me lembrar dela."),
      "Sofia A.",
      "Sintra",
      t("Life", "Vida"),
    ],
    [
      t("Twenty minutes of conversation and, two days later, three quotes side by side.", "Vinte minutos de conversa e, dois dias depois, três propostas lado a lado."),
      "Tiago R.",
      "Cascais",
      t("Home", "Casa"),
    ],
  ];

  return (
    <div className="sbs-p-reviews">
      {/* Twice over, so the lap closes without a seam. */}
      <div className="sbs-p-track">
        {[...reviews, ...reviews].map(([quote, name, town, kind], i) => (
          <figure key={i} className="sbs-p-rev">
            <blockquote>“{quote}”</blockquote>
            <figcaption>
              <span className="sbs-p-who">
                <i>{name.split(" ").map((w) => w[0]).join("")}</i>
                <span>
                  <b>{name}</b>
                  <small>{town}</small>
                </span>
              </span>
              <span className="sbs-p-kind">{kind}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}

/** The four steps as a stepper: a header with the count, a bar whose
    dark segment sits on the current step with the steps done behind it
    in Névoa, the step names, the step itself, and Back / Continue.
    Inside the plate nobody may be touching it, so while the page holds
    on this section it walks itself from the first step to the last, read
    off the loop's own clock; a click takes over until the page goes back
    to the top. The plate is hidden from assistive technology, so its
    buttons are kept out of the tab order. */
function PilarSteps({ t, steps }: { t: ReturnType<typeof useT>; steps: string[][] }) {
  const [at, setAt] = useState(0);
  const held = useRef(false);
  const box = useRef<HTMLDivElement>(null);
  const last = steps.length - 1;

  useEffect(() => {
    // Where the loop is, as a fraction of a lap: this section's stop is
    // held from 47% to 80% (globals.css, sbs-scroll).
    const marks = [0.55, 0.63, 0.71];
    const id = window.setInterval(() => {
      const page = box.current?.closest<HTMLElement>(".sbs-mini");
      const lap = page
        ?.getAnimations()
        .find((a) => (a as CSSAnimation).animationName === "sbs-scroll");
      const p = lap?.effect?.getComputedTiming().progress;
      if (p == null) return;
      if (p < 0.45) {
        held.current = false;
        setAt(0);
        return;
      }
      if (held.current) return;
      setAt(marks.filter((m) => p >= m).length);
    }, 150);
    return () => window.clearInterval(id);
  }, []);

  const go = (i: number) => {
    held.current = true;
    setAt(Math.max(0, Math.min(last, i)));
  };

  return (
    <div ref={box} className="sbs-p-stepper">
      <div className="sbs-p-step-top">
        <b>{t("How it works", "Como funciona")}</b>
        <span>{t(`Step ${at + 1} of ${steps.length}`, `Passo ${at + 1} de ${steps.length}`)}</span>
      </div>

      <div className="sbs-p-bar2">
        <span className="sbs-p-done" style={{ width: `${(at * 100) / steps.length}%` }} />
        <span
          className="sbs-p-now"
          style={{ width: `${100 / steps.length}%`, transform: `translateX(${at * 100}%)` }}
        />
      </div>

      <div className="sbs-p-names">
        {steps.map(([name], i) => (
          <button
            key={name}
            type="button"
            tabIndex={-1}
            onClick={() => go(i)}
            aria-current={i === at ? "step" : undefined}
            data-past={i < at ? "" : undefined}
          >
            {i < at && (
              <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2 6.5 5 9.5 10 3" />
              </svg>
            )}
            {name}
          </button>
        ))}
      </div>

      <div className="sbs-p-step-body">
        <div key={at}>
          <h5>{steps[at][0]}</h5>
          <p>{steps[at][1]}</p>
        </div>
      </div>

      <div className="sbs-p-step-nav">
        <button type="button" tabIndex={-1} onClick={() => go(at - 1)} disabled={at === 0}>
          <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M7.5 2.5 4 6l3.5 3.5" />
          </svg>
          {t("Back", "Voltar")}
        </button>
        <button type="button" tabIndex={-1} onClick={() => go(at + 1)} disabled={at === last} data-solid="">
          {t("Continue", "Continuar")}
          <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M4.5 2.5 8 6 4.5 9.5" />
          </svg>
        </button>
      </div>
    </div>
  );
}

/* Our side, in Pilar's own colours and type (Funnel Display for the
   display lines, Plus Jakarta Sans, the brand's, for the rest, IBM Plex
   Mono for the small labels). Each section has its own job: the hero
   says what Pilar is, with its clients' reviews sliding slowly across
   its foot, and the index what it insures (both after Wealthsimple's
   home page); the third shows what the client actually
   gets, a table of three quotes with Pilar's pick and why (after Wise,
   which shows its product working beside the title); the fourth says
   how it works and what it costs (a wide-spaced title after Arweave,
   beside the four steps as a stepper the user brought, rebuilt here). All references
   were found through Inspo. */
function Ours({ t }: { t: ReturnType<typeof useT> }) {
  const lines = [
    t("Home", "Casa"),
    t("Car", "Automóvel"),
    t("Health", "Saúde"),
    t("Life", "Vida"),
    t("Business", "Empresas"),
  ];
  const steps = [
    [
      t("Conversation", "Conversa"),
      t("Twenty minutes, by phone or at the office, about what needs protecting.", "Vinte minutos, por telefone ou no escritório, sobre o que há para proteger."),
    ],
    [
      t("Table", "Quadro"),
      t("Within two working days, the quotes side by side and the recommendation.", "Em dois dias úteis, as propostas lado a lado e a recomendação."),
    ],
    [
      t("Signing", "Assinatura"),
      t("Pilar handles the paperwork with the insurer you chose.", "A Pilar trata da papelada com a seguradora escolhida."),
    ],
    [
      t("Every year", "Todos os anos"),
      t("A review before each renewal; when there is a claim, Pilar makes the call.", "Revisão antes de cada renovação; num sinistro, quem liga é a Pilar."),
    ],
  ];

  return (
    <div className={`sbs-mini sbs-p-page ${pilarDisplay.variable} ${pilarSans.variable} ${pilarMono.variable}`}>
      <div className="sbs-p-hero">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/side-by-side/pilar-hero.webp" alt="" draggable={false} className="sbs-p-sky" />

        <div className="sbs-p-bar">
          <PilarLogo t={t} />
          <span className="sbs-p-tools">
            <i className="sbs-p-round">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="7" cy="7" r="4.5" />
                <path d="M10.4 10.4 14 14" />
              </svg>
            </i>
            <span className="sbs-p-pill">{t("Client area", "Área de cliente")}</span>
            <span className="sbs-p-pill sbs-p-solid">{t("Get a quote", "Pedir simulação")}</span>
            <i className="sbs-p-round">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 6h10M3 10h10" />
              </svg>
            </i>
          </span>
        </div>

        <div className="sbs-p-lead">
          <h3>
            <span>{t("Insurance chosen by someone", "Seguros escolhidos por")}</span>{" "}
            <span>{t("who doesn’t sell it.", "quem não os vende.")}</span>
          </h3>
          <p>
            {t(
              "Insurance brokerage. We compare the insurers; you decide with everything in front of you.",
              "Mediação de seguros. Comparamos as seguradoras; o cliente decide com tudo à frente.",
            )}
          </p>
          <span className="sbs-p-pill sbs-p-ghost">{t("Get a quote", "Pedir simulação")}</span>
        </div>

        <PilarReviews t={t} />
      </div>

      <div className="sbs-p-index" data-stop>
        {lines.map((line) => (
          <span key={line}>{line}</span>
        ))}
      </div>

      <div className="sbs-p-sheet" data-stop>
        <div className="sbs-p-sheet-copy">
          <h4>
            {t("Three quotes. One page. One recommendation.", "Três propostas. Uma folha. Uma recomendação.")}
          </h4>
          <p>
            {t(
              "For each policy, Pilar asks several insurers for quotes and sends back one table: what each one covers, what it leaves out and what it costs a year. The cheapest is not always the right choice, and the table says why.",
              "Para cada seguro, a Pilar pede propostas a várias seguradoras e devolve um quadro: o que cada uma cobre, o que deixa de fora e quanto custa por ano. A mais barata nem sempre é a escolha certa, e o quadro diz porquê.",
            )}
          </p>
        </div>

        <div className="sbs-p-card">
          <div className="sbs-p-card-top">
            <span>{t("Home insurance · 3-bed flat, Lisbon", "Seguro Casa · T3, Lisboa")}</span>
            <span className="sbs-p-chip">{t("Valid 30 days", "Válido 30 dias")}</span>
          </div>
          <div className="sbs-p-quote">
            <span>{t("Insurer A", "Seguradora A")}</span>
            <b>{t("€286.40", "286,40 €")}</b>
          </div>
          <div className="sbs-p-quote">
            <span>{t("Insurer C", "Seguradora C")}</span>
            <b>{t("€259.00", "259,00 €")}</b>
          </div>
          <div className="sbs-p-pick">
            <span className="sbs-p-label">{t("Pilar’s pick", "A escolha da Pilar")}</span>
            <div>
              <span>{t("Insurer B", "Seguradora B")}</span>
              <b>{t("€312.90", "312,90 €")}</b>
            </div>
            <small>
              {t(
                "€53.90 a year more than C, and the only one of the three that covers earthquakes.",
                "Mais 53,90 € por ano do que a C, e a única das três que cobre fenómenos sísmicos.",
              )}
            </small>
          </div>
          <div className="sbs-p-note">
            <i>!</i>
            <span>{t("Excess: €150 with B, €250 with A, €500 with C.", "Franquia: 150 € na B, 250 € na A, 500 € na C.")}</span>
          </div>
          <div className="sbs-p-note">
            <i>i</i>
            <span>
              {t(
                "Water damage: all three cover it; only B pays to find the leak.",
                "Danos por água: as três cobrem; só a B inclui a pesquisa da avaria.",
              )}
            </span>
          </div>
          <span className="sbs-p-wide">{t("Get my table", "Pedir o meu quadro")}</span>
        </div>
      </div>

      <div className="sbs-p-how" data-stop>
        <div>
          <h4>
            <span>{t("Four steps.", "Quatro passos.")}</span>{" "}
            <span>{t("No cost to you.", "Nenhum custo para o cliente.")}</span>
          </h4>
          <p>
            {t(
              "Pilar is paid by the insurer you choose. It charges you nothing: not for the conversation, not for the table, not for the years after.",
              "A Pilar é paga pela seguradora que o cliente escolher. Ao cliente não cobra nada, nem pela conversa, nem pelo quadro, nem pelos anos seguintes.",
            )}
          </p>
          <span className="sbs-p-go">{t("Book the conversation", "Marcar a conversa")} →</span>
        </div>
        <PilarSteps t={t} steps={steps} />
      </div>

      {/* The foot: Noite with one matte glow of Grafite, the signature line
          and the way in, then the links, then the legal row (a Portuguese
          business shows its complaints book). */}
      <div className="sbs-p-foot" data-stop>
        <div className="sbs-p-foot-top">
          <h4>{t("One broker. Every insurer.", "Um mediador. Todas as seguradoras.")}</h4>
          <span className="sbs-p-foot-cta">{t("Get a quote", "Pedir simulação")}</span>
        </div>
        <div className="sbs-p-foot-cols">
          <div>
            <b>{t("Insurance", "Seguros")}</b>
            {lines.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </div>
          <div>
            <b>Pilar</b>
            <span>{t("How it works", "Como funciona")}</span>
            <span>{t("Claims", "Sinistros")}</span>
            <span>{t("Client area", "Área de cliente")}</span>
          </div>
          <div>
            <b>{t("Office", "Escritório")}</b>
            <span>{t("Lisbon", "Lisboa")}</span>
            <small>{t("Monday to Friday, 9am to 6pm", "Segunda a sexta, 9h–18h")}</small>
          </div>
          <div>
            <b>{t("Contact", "Contacto")}</b>
            <span>{t("hello@pilarinsurance.example", "ola@pilarseguros.example")}</span>
            <small>{t("A reply the same working day.", "Resposta no mesmo dia útil.")}</small>
          </div>
        </div>
        <div className="sbs-p-foot-legal">
          <span>© 2026 {t("Pilar Insurance · Insurance brokerage", "Pilar Seguros · Mediação de seguros")}</span>
          <span>
            <span>{t("Privacy", "Privacidade")}</span>
            <span>{t("Complaints book", "Livro de Reclamações")}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */

export function SideBySide() {
  const t = useT();
  const reduce = useReducedMotion() ?? false;
  const stage = useRef<HTMLDivElement>(null);
  const seen = useSeen(stage, { threshold: 0.25 });
  // Both sides are given the class in the same render, so the two loops
  // begin in the same frame and stay in step for as long as the page is
  // open.
  const [running, setRunning] = useState(false);
  useEffect(() => {
    if (seen && !reduce) setRunning(true);
  }, [seen, reduce]);

  return (
    <ProposalHost>
      <FloatingNav />
      <main id="top" className="relative bg-paper">
        {/* The comparison, from its title to the note under the two pages, on one dark ground, the stage's own (user, 2026-11-16). */}
        <div className="sbs-top relative isolate text-paper">
          <div aria-hidden="true" className="sbs-ground" />
        <header className="shell pt-[calc(var(--section-gap)+2rem)] pb-[clamp(2.5rem,5vw,4rem)]">
          <SlideIn ready>
            <p className="mono-label text-paper/55">{t("Side by side", "Lado a lado")}</p>
            <h1 className="display mt-7 max-w-[18ch] text-[clamp(2.5rem,6vw,4.75rem)] leading-[0.98]">
              <span className="block font-light">{t("The same business,", "A mesma empresa,")}</span>
              <span className="block font-medium">{t("built twice.", "construída duas vezes.")}</span>
            </h1>
          </SlideIn>
          <SlideIn ready distance={0} delay={0.08}>
            <p className="mt-8 max-w-[46ch] text-[1.0625rem] leading-[1.55] text-paper/70">
              {t(
                "One website put together from an off-the-shelf template, one of ours. Both start in the same frame and go down the page at the same moments. Everything else is the difference.",
                "Um website montado a partir de um modelo pré-feito, outro nosso. Começam no mesmo instante e descem a página ao mesmo tempo. Tudo o resto é a diferença.",
              )}
            </p>
          </SlideIn>
        </header>

        <section
          ref={stage}
          aria-labelledby="side-by-side-title"
          className="sbs-stage relative isolate pt-[clamp(3rem,6vw,5rem)] pb-(--section-gap) text-paper"
        >
          <h2 id="side-by-side-title" className="sr-only">
            {t("The same insurance broker, as two websites", "A mesma mediadora de seguros, em dois websites")}
          </h2>

          <div className="sbs-wide">
            <div className="sbs-pair">
              <Plate
                quiet
                running={running}
                label={t("Designs from other professionals", "Design de outros profissionais")}
                address={t("pilar-insurance.example/home", "pilar-seguros.example/inicio")}
                says={t(
                  "The same insurance broker as many web designers deliver it: a home-made logo, a seven-item menu in capitals, a stock photograph of a padlock, three blue boxes of contacts before anything is said, insurance and services as line icons, a long text on what to do after a car accident, and news with stock photographs above a navy footer with the contacts and opening hours.",
                  "A mesma mediadora de seguros como muitos a entregam: um logótipo caseiro, um menu de sete itens em maiúsculas, a fotografia de stock de um cadeado, três caixas azuis de contactos antes de se dizer o que quer que seja, seguros e serviços em ícones de linha, um texto longo sobre o que fazer num acidente de automóvel, notícias com fotografias de stock sobre um rodapé azul-escuro com os contactos e o horário.",
                )}
              >
                <Template t={t} />
              </Plate>

              <Plate
                running={running}
                label={t("Nevima’s design", "Design da Nevima")}
                address={t("pilarinsurance.example", "pilarseguros.example")}
                says={t(
                  "The same insurance broker as we would build it: one line over a photograph of a pillar says what the broker does, with a few of its clients' reviews across the foot, its five kinds of insurance in very large type, a table of three quotes with Pilar's pick and the reason for it, and the four steps of working with it, walked through one at a time, at no cost to the client, above a dark footer.",
                  "A mesma mediadora de seguros como a faríamos: uma linha sobre a fotografia de um pilar diz o que a mediadora faz, com algumas opiniões de clientes ao fundo, os cinco tipos de seguro em letra muito grande, um quadro de três propostas com a escolha da Pilar e a razão, e os quatro passos para trabalhar com ela, mostrados um a um, sem custo para o cliente, sobre um rodapé escuro.",
                )}
              >
                <Ours t={t} />
              </Plate>
            </div>

            <p className="sbs-note mono-label">
              {t(
                "Both pages are demonstrations built for this page, and the insurance broker is invented.",
                "Ambas as páginas são demonstrações feitas para esta página, e a mediadora de seguros é inventada.",
              )}
            </p>
          </div>
        </section>
        </div>

        <SbsIncluded />
        <SbsLevels />
        <SbsPersonal />
      </main>

      <WorkTogether />
      <Footer />
    </ProposalHost>
  );
}
