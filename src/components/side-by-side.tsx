"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { SlideIn } from "./enter";
import { FloatingNav } from "./floating-nav";
import { Footer } from "./footer";
import { ProposalHost } from "./proposal-host";
import { WorkTogether } from "./work-together";
import { SbsIncluded, SbsLevels, SbsPersonal } from "./sbs-service";
import { ExploreBar, PlateScreen, SbsPreview, useTapToTakeOver } from "./sbs-explore";
import { usePlateScrub } from "./sbs-scrub";
import { useSeen } from "./use-seen";
import { useT } from "@/lib/use-lang";
import { Ours, useFit } from "./sbs-pilar";

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
   on a slide, a great deal of text, stock photography. One idiom from top to foot (user,
   2026-11-17: it had read as two websites): Arial, navy capitals with
   a short blue rule, icons in pale blue squares, white cards with a
   border, white and pale grey grounds in turn, navy at both ends. Its sections are its own, not ours; each
   carries data-stop so it reaches the top of the plate at the moment
   ours does. */

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
  const offices = [
    [t("Lisbon", "Lisboa"), "Av. da República, 00, 1.º Esq.", "1050-000 Lisboa", "+351 210 000 000", "+351 910 000 000", "lisboa@pilarseguros.example"],
    ["Almada", "Rua Cândido dos Reis, 00", "2800-000 Almada", "+351 212 000 000", "+351 920 000 000", "almada@pilarseguros.example"],
    ["Oeiras", "Av. Dom João I, 00, Loja B", "2780-000 Oeiras", "+351 214 000 000", "+351 930 000 000", "oeiras@pilarseguros.example"],
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

      <div className="sbs-c-visit" data-stop>
        <h4 className="sbs-c-title">{t("WHERE TO FIND US", "ONDE NOS ENCONTRAR")}</h4>
        <div className="sbs-c-offices">
          {offices.map(([town, street, code, tel, cell, mail]) => (
            <div key={town}>
              <span className="sbs-c-ico">
                <CIcon name="pin" />
              </span>
              <b>{town}</b>
              <span>{street}</span>
              <span>{code}</span>
              <span className="sbs-c-a">{tel}</span>
              <em>{fixed}</em>
              <span className="sbs-c-a">{cell}</span>
              <em>{mobile}</em>
              <span className="sbs-c-a">{mail}</span>
            </div>
          ))}
        </div>
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

  // By hand (user, 2026-11-17): the visitor scrolls the two pages, which
  // stay together section for section (sbs-scrub.ts holds both at the same
  // moment of their loop); from the call under them, a tap on either, or
  // a larger window.
  const [manual, setManual] = useState(false);
  const [open, setOpen] = useState(false);
  const pair = useRef<HTMLDivElement>(null);
  usePlateScrub(pair, manual && !open);
  const tap = useTapToTakeOver(manual, () => {
    setRunning(true);
    setManual(true);
  });

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
            <div ref={pair} className="sbs-pair" {...tap}>
              <Plate
                quiet
                running={running}
                label={t("Designs from other professionals", "Design de outros profissionais")}
                address={t("pilar-insurance.example/home", "pilar-seguros.example/inicio")}
                says={t(
                  "The same insurance broker as many web designers deliver it: a home-made logo, a seven-item menu in capitals, a stock photograph of a padlock, insurance and services as line icons, a long text on what to do after a car accident, and the three offices' addresses above a navy footer with the contacts and opening hours.",
                  "A mesma mediadora de seguros como muitos a entregam: um logótipo caseiro, um menu de sete itens em maiúsculas, a fotografia de stock de um cadeado, seguros e serviços em ícones de linha, um texto longo sobre o que fazer num acidente de automóvel, as moradas dos três escritórios sobre um rodapé azul-escuro com os contactos e o horário.",
                )}
              >
                <Template t={t} />
              </Plate>

              <Plate
                running={running}
                label={t("Nevima’s design", "Design da Nevima")}
                address={t("pilarinsurance.example", "pilarseguros.example")}
                says={t(
                  "The same insurance broker as we would build it: one line over a photograph of a pillar says what the broker does, with a way to a quote and to its office, a few of its clients' reviews across the foot, its five kinds of insurance in very large type, a table of three quotes with Pilar's pick and the reason for it, and the four steps of working with it, walked through one at a time, at no cost to the client, above a dark footer.",
                  "A mesma mediadora de seguros como a faríamos: uma linha sobre a fotografia de um pilar diz o que a mediadora faz, com o caminho para uma simulação e para o escritório, algumas opiniões de clientes ao fundo, os cinco tipos de seguro em letra muito grande, um quadro de três propostas com a escolha da Pilar e a razão, e os quatro passos para trabalhar com ela, mostrados um a um, sem custo para o cliente, sobre um rodapé escuro.",
                )}
              >
                <Ours t={t} />
              </Plate>
            </div>

            {!reduce && (
              <ExploreBar
                t={t}
                manual={manual}
                setManual={(on) => {
                  setRunning(true);
                  setManual(on);
                }}
                onOpen={() => setOpen(true)}
              />
            )}

            <SbsPreview t={t} open={open} onClose={() => setOpen(false)} label={t("Side by side", "Lado a lado")} wide>
              <figure className="sbx-prev-plate">
                <figcaption className="mono-label">{t("Designs from other professionals", "Design de outros profissionais")}</figcaption>
                <PlateScreen running className="sbx-prev-screen">
                  <Template t={t} />
                </PlateScreen>
              </figure>
              <figure className="sbx-prev-plate">
                <figcaption className="mono-label">{t("Nevima’s design", "Design da Nevima")}</figcaption>
                <PlateScreen running className="sbx-prev-screen">
                  <Ours t={t} />
                </PlateScreen>
              </figure>
            </SbsPreview>

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
