"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";
import { useInView, type T } from "./sbs-shared";

/* ==================================================================
   The photo shoot, as a short film (user, 2026-11-21)

   The header's card, made the way the visual identity page's film is
   (Glance in visual-identity.tsx): a white line on the about page's
   folds, one camera moved by transform, words typed in as they are
   said, and a foot that says what is happening. It reuses that film's
   frame (.vi-mg, .vi-mg-say, .vi-mg-foot) and draws its own scenes
   (.psf-*).

   The plot, as the user set it:
   - the product: António sets the scene (the cup on the plinth, the
     light turned on it), Emanuel photographs it, António looks at the
     photograph and says what it is missing, Emanuel moves the light
     and shoots again, and the second one is approved;
   - the shop: António opens the blinds and puts the plant in its
     place, Emanuel photographs the room, and it is approved;
   - the result: the client opens the website with the photographs in
     it - they shine in their frames - and gives the feedback that
     counts.
   Emanuel is the one with the camera (the studio's advanced
   photography); António plans the places and judges how the
   photograph feels.

   Every scene is drawn in one 800 by 500 field, so the camera's
   numbers are percentages of it. The scenes cross-fade into one
   another, so no frame is ever empty. With less motion the film holds
   on its last shot: the client, delighted, and what they say.
   ================================================================== */

type Scene = "product" | "shop" | "site";
type Shot = "wide" | "photo" | "face" | "screen";
type Mood = "none" | "bad" | "good" | "wow";

type Beat = {
  scene: Scene;
  shot: Shot;
  ms: number;
  /** what the scene is doing in this beat */
  step: string;
  /** the camera fires at the end of this beat */
  flash?: boolean;
  /** which photograph the print shows */
  photo?: "flat" | "lit" | "shop";
  mood?: Mood;
};

const BEATS: Beat[] = [
  { scene: "product", shot: "wide", ms: 1900, step: "set" },
  { scene: "product", shot: "wide", ms: 1300, step: "aim", flash: true },
  { scene: "product", shot: "photo", ms: 2200, step: "aim", photo: "flat" },
  { scene: "product", shot: "face", ms: 2700, step: "aim", mood: "bad" },
  { scene: "product", shot: "wide", ms: 1700, step: "relight", flash: true },
  { scene: "product", shot: "photo", ms: 2200, step: "relight", photo: "lit" },
  { scene: "product", shot: "face", ms: 2500, step: "relight", mood: "good" },
  { scene: "shop", shot: "wide", ms: 2000, step: "set" },
  { scene: "shop", shot: "wide", ms: 1300, step: "aim", flash: true },
  { scene: "shop", shot: "photo", ms: 2200, step: "aim", photo: "shop" },
  { scene: "shop", shot: "face", ms: 2500, step: "aim", mood: "good" },
  { scene: "site", shot: "wide", ms: 1400, step: "look" },
  { scene: "site", shot: "screen", ms: 3000, step: "look" },
  { scene: "site", shot: "face", ms: 3400, step: "look", mood: "wow" },
];

/** Where each scene's speaker stands: António in the product and the
    shop, the client at the website. */
const FACE: Record<Scene, { x: number; y: number }> = {
  product: { x: 140, y: 150 },
  shop: { x: 330, y: 150 },
  site: { x: 230, y: 150 },
};

/** The camera, in percent of the field, and how close. */
function camera(beat: Beat) {
  if (beat.shot === "face") {
    const f = FACE[beat.scene];
    return { x: f.x / 8, y: (f.y - 6) / 5, s: 2.3 };
  }
  // into the laptop's screen, at (460, 288)
  if (beat.shot === "screen") return { x: 57.5, y: 57.6, s: 4.6 };
  return { x: 50, y: 50, s: 1 };
}

/** The words typed in as they are said, as the call types them. */
function useTyped(text: string, on: boolean, still: boolean) {
  const [n, setN] = useState(still ? text.length : 0);
  useEffect(() => {
    if (still) {
      setN(text.length);
      return;
    }
    if (!on) {
      setN(0);
      return;
    }
    setN(0);
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setN(i);
      if (i >= text.length) window.clearInterval(id);
    }, 40);
    return () => window.clearInterval(id);
  }, [text, on, still]);
  return text.slice(0, n);
}

/* ---- the drawing's pieces ---------------------------------------- */

/** A standing figure, the visual identity film's, at cx. */
function Figure({ cx, mood }: { cx: number; mood: Mood }) {
  const cy = 150;
  return (
    <>
      <path d={`M${cx - 72} 440 C${cx - 68} 310 ${cx - 40} 206 ${cx} 206 C${cx + 40} 206 ${cx + 68} 310 ${cx + 72} 440`} className="psf-line" />
      <circle cx={cx} cy={cy} r="34" className="psf-line" />
      <g className="psf-face" data-mood={mood}>
        <circle cx={cx - 12} cy={cy - 6} r="3.2" className="psf-dot" />
        <circle cx={cx + 12} cy={cy - 6} r="3.2" className="psf-dot" />
        <path d={`M${cx - 23} ${cy - 20}l12 4M${cx + 23} ${cy - 20}l-12 4`} className="psf-feel" data-for="bad" />
        <path d={`M${cx - 12} ${cy + 19}q12 -8 24 0`} className="psf-feel" data-for="bad" />
        <path d={`M${cx - 14} ${cy + 12}q14 12 28 0`} className="psf-feel" data-for="good" />
        <path d={`M${cx - 22} ${cy - 22}q8 -6 16 0M${cx + 6} ${cy - 22}q8 -6 16 0`} className="psf-feel" data-for="wow" />
        <path d={`M${cx - 15} ${cy + 9}q15 24 30 0z`} className="psf-feel psf-mouth" data-for="wow" />
        <path d={`M${cx - 11} ${cy + 16}h22`} className="psf-feel" data-for="none" />
      </g>
    </>
  );
}

/** Emanuel and the camera: held at the chest, then up to the eye. */
function Photographer({ cx, up }: { cx: number; up: boolean }) {
  return (
    <>
      <Figure cx={cx} mood="none" />
      <g className="psf-cam" data-up={up || undefined}>
        <path d={`M${cx - 34} 240 Q${cx - 50} 200 ${cx - 46} 170`} className="psf-line" />
        <path d={`M${cx + 34} 240 Q${cx + 10} 200 ${cx - 20} 170`} className="psf-line" />
        <rect x={cx - 66} y="136" width="46" height="32" rx="4" className="psf-body" />
        <rect x={cx - 80} y="142" width="14" height="20" rx="2" className="psf-body" />
        <rect x={cx - 54} y="130" width="14" height="6" rx="1.5" className="psf-body" />
      </g>
    </>
  );
}

function ProductScene({ beat, on }: { beat: Beat; on: boolean }) {
  const mood = on && beat.shot === "face" ? beat.mood ?? "none" : "none";
  return (
    <g className="psf-scene" data-on={on || undefined} data-step={on ? beat.step : undefined}>
      <line x1="40" y1="440" x2="760" y2="440" className="psf-floor" />
      {/* the backdrop's sweep */}
      <path d="M330 440 V200 Q330 180 350 180 H470 Q490 180 490 200 V440" className="psf-faint" />
      {/* the plinth and the cup on it */}
      <rect x="355" y="340" width="80" height="100" className="psf-line" />
      <g className="psf-cup">
        <path d="M377 300 h36 v24 a14 14 0 0 1 -14 14 h-8 a14 14 0 0 1 -14 -14 z" className="psf-line" />
        <path d="M413 306 q13 0 13 10 q0 10 -13 10" className="psf-line" />
        <path d="M388 290 q-5 -8 0 -16 M400 290 q-5 -8 0 -16" className="psf-line psf-steam" />
      </g>
      {/* the light: its stand, its head turned on the cup, its beam */}
      <path d="M246 440 L270 400 L294 440 M270 440 V258" className="psf-line" />
      <g className="psf-lamp">
        <path d="M262 238 L304 222 L304 294 L262 278 Z" className="psf-line psf-box" />
        <path d="M304 222 L430 296 L430 340 L304 294 Z" className="psf-beam" />
      </g>
      {/* António, the hand on the light */}
      <Figure cx={140} mood={mood} />
      <path d="M176 240 Q214 272 252 256" className="psf-line psf-reach" />
      {/* Emanuel */}
      <Photographer cx={640} up={on && beat.step !== "set"} />
    </g>
  );
}

function ShopScene({ beat, on }: { beat: Beat; on: boolean }) {
  const mood = on && beat.shot === "face" ? beat.mood ?? "none" : "none";
  return (
    <g className="psf-scene" data-on={on || undefined} data-step={on ? beat.step : undefined}>
      <line x1="40" y1="440" x2="760" y2="440" className="psf-floor" />
      {/* the window and its blinds, which open */}
      <rect x="70" y="130" width="170" height="200" className="psf-line" />
      <g className="psf-blinds">
        {Array.from({ length: 9 }, (_, i) => (
          <line key={i} x1="74" x2="236" y1={140 + i * 21} y2={140 + i * 21} className="psf-slat" />
        ))}
      </g>
      <path d="M240 150 L420 440 L560 440 L240 300 Z" className="psf-beam psf-sun" />
      {/* the shelves, with the shop's things on them */}
      <path d="M430 440 V200 M590 440 V200 M430 260 H590 M430 330 H590 M430 400 H590" className="psf-line" />
      <rect x="446" y="226" width="22" height="34" rx="3" className="psf-line" />
      <rect x="476" y="236" width="18" height="24" rx="3" className="psf-line" />
      <rect x="450" y="300" width="30" height="30" rx="2" className="psf-line" />
      <rect x="488" y="306" width="30" height="24" rx="2" className="psf-line" />
      <rect x="452" y="372" width="54" height="28" rx="2" className="psf-line" />
      <g className="psf-plant">
        <path d="M540 260 l-6 -24 h28 l-6 24 z" className="psf-line" />
        <path d="M548 236 q-14 -22 -4 -40 M548 236 q10 -26 24 -30 M548 236 q-2 -30 6 -44" className="psf-line" />
      </g>
      {/* António, the hand to the shelf */}
      <Figure cx={330} mood={mood} />
      <path d="M366 240 Q400 270 436 258" className="psf-line psf-reach" />
      {/* Emanuel, further back */}
      <Photographer cx={690} up={on && beat.step !== "set"} />
    </g>
  );
}

function SiteScene({ beat, on }: { beat: Beat; on: boolean }) {
  const mood = on && beat.shot === "face" ? beat.mood ?? "none" : "none";
  return (
    <g className="psf-scene" data-on={on || undefined}>
      <line x1="40" y1="440" x2="760" y2="440" className="psf-floor" />
      {/* the desk and the laptop on it */}
      <path d="M340 330 H600 M360 330 V440 M580 330 V440" className="psf-line" />
      <path d="M398 330 H522 L514 324 H406 Z" className="psf-line" />
      <rect x="410" y="250" width="100" height="74" rx="3" className="psf-line" />
      <rect x="415" y="255" width="90" height="64" rx="1.5" className="psf-glow" />
      {/* the client, leaning in */}
      <Figure cx={230} mood={mood} />
      <path d="M266 240 Q320 300 398 318" className="psf-line" />
    </g>
  );
}

/* ---- the photographs, crisp, over the drawing -------------------- */

/** The cup, as each photograph took it: first flat, under the
    camera's own flash; then lit from the side, with its shadow. */
function CupPhoto({ lit }: { lit: boolean }) {
  return (
    <svg viewBox="0 0 300 200" className="psf-pic" aria-hidden="true">
      <defs>
        <linearGradient id={lit ? "psf-side" : "psf-flat"} x1="0" x2="1">
          <stop offset="0" stopColor={lit ? "#d8d8d8" : "#8d8d8d"} />
          <stop offset="1" stopColor={lit ? "#3a3a3a" : "#868686"} />
        </linearGradient>
      </defs>
      <rect width="300" height="200" fill={`url(#${lit ? "psf-side" : "psf-flat"})`} />
      {lit ? (
        <g>
          <ellipse cx="190" cy="160" rx="62" ry="9" fill="rgb(0 0 0 / 0.35)" />
          <path d="M140 92 h62 v42 a24 24 0 0 1 -24 24 h-14 a24 24 0 0 1 -24 -24 z" fill="#f2f2f2" />
          <path d="M140 92 h18 v66 h-0 a24 24 0 0 1 -18 -24 z" fill="#ffffff" />
          <path d="M202 102 q22 0 22 17 q0 17 -22 17" fill="none" stroke="#e6e6e6" strokeWidth="7" />
          <path d="M140 92 h62" stroke="#5a5a5a" strokeWidth="2" />
          <path d="M160 82 q-8 -14 0 -28 M180 82 q-8 -14 0 -28" fill="none" stroke="rgb(255 255 255 / 0.7)" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      ) : (
        <g transform="rotate(-7 110 120)">
          <path d="M88 104 h40 v26 a16 16 0 0 1 -16 16 h-8 a16 16 0 0 1 -16 -16 z" fill="#c9c9c9" />
          <path d="M128 110 q14 0 14 11 q0 11 -14 11" fill="none" stroke="#c0c0c0" strokeWidth="5" />
          <ellipse cx="104" cy="114" rx="9" ry="6" fill="#ffffff" />
        </g>
      )}
    </svg>
  );
}

function ShopPhoto() {
  return (
    <svg viewBox="0 0 300 200" className="psf-pic" aria-hidden="true">
      <defs>
        <linearGradient id="psf-room" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#bdbdbd" />
          <stop offset="1" stopColor="#262626" />
        </linearGradient>
      </defs>
      <rect width="300" height="200" fill="url(#psf-room)" />
      <path d="M0 0 L90 0 L230 200 L120 200 Z" fill="rgb(255 255 255 / 0.22)" />
      <path d="M150 40 V200 M270 40 V200 M150 84 H270 M150 132 H270 M150 176 H270" stroke="#f0f0f0" strokeWidth="3" />
      <rect x="162" y="58" width="16" height="26" rx="2" fill="#f5f5f5" />
      <rect x="184" y="66" width="13" height="18" rx="2" fill="#dcdcdc" />
      <rect x="164" y="106" width="22" height="26" rx="2" fill="#e8e8e8" />
      <rect x="194" y="112" width="22" height="20" rx="2" fill="#cfcfcf" />
      <path d="M236 84 l-4 -16 h20 l-4 16 z" fill="#f2f2f2" />
      <path d="M242 68 q-10 -16 -3 -30 M242 68 q7 -19 18 -22" fill="none" stroke="#f2f2f2" strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="80" cy="186" rx="60" ry="6" fill="rgb(0 0 0 / 0.25)" />
    </svg>
  );
}

/** The print that comes out of the camera, full in the frame. */
function Print({ t, photo, on }: { t: T; photo: NonNullable<Beat["photo"]>; on: boolean }) {
  return (
    <span className="psf-print" data-on={on || undefined}>
      {photo === "shop" ? <ShopPhoto /> : <CupPhoto lit={photo === "lit"} />}
      <span className="mono-label psf-print-cap">
        {photo === "flat" ? t("Take 1", "Foto 1") : photo === "lit" ? t("Take 2", "Foto 2") : t("The shop", "A loja")}
      </span>
    </span>
  );
}

/** What the laptop shows: the website, with the session's photographs
    in its frames, shining. */
function Website({ t, on }: { t: T; on: boolean }) {
  return (
    <span className="psf-site" data-on={on || undefined}>
      <span className="psf-site-bar">
        <i />
        <i />
        <i />
      </span>
      <span className="psf-site-head">
        <span className="psf-site-name" />
        <span className="psf-site-rule" />
      </span>
      <span className="psf-site-grid">
        <span className="psf-frame" style={{ ["--i" as string]: 0 }}>
          <CupPhoto lit />
        </span>
        <span className="psf-frame" style={{ ["--i" as string]: 1 }}>
          <ShopPhoto />
        </span>
        <span className="psf-frame" style={{ ["--i" as string]: 2 }}>
          <CupPhoto lit />
        </span>
      </span>
      {/* the sparkle over the frames */}
      {[
        { x: 22, y: 38, d: 0 },
        { x: 52, y: 30, d: 0.5 },
        { x: 84, y: 44, d: 1 },
        { x: 36, y: 86, d: 1.4 },
        { x: 70, y: 90, d: 0.8 },
      ].map((s, i) => (
        <svg
          key={i}
          viewBox="0 0 20 20"
          className="psf-spark"
          style={{ left: `${s.x}%`, top: `${s.y}%`, ["--d" as string]: `${s.d}s` }}
          aria-hidden="true"
        >
          <path d="M10 0 Q11 9 20 10 Q11 11 10 20 Q9 11 0 10 Q9 9 10 0 Z" />
        </svg>
      ))}
    </span>
  );
}

/* ---- the film ---------------------------------------------------- */

export function ShootFilm({ t }: { t: T }) {
  const reduce = useReducedMotion() ?? false;
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const still = reduce || !mounted;
  const [ref, inView] = useInView<HTMLDivElement>(0.45);
  const [at, setAt] = useState(0);

  useEffect(() => {
    if (still || !inView) return;
    const id = window.setTimeout(() => setAt((n) => (n + 1) % BEATS.length), BEATS[at]!.ms);
    return () => window.clearTimeout(id);
  }, [at, inView, still]);

  const beat = still ? BEATS[BEATS.length - 1]! : BEATS[at]!;
  const cam = camera(beat);
  const camStyle = { transform: `translate(${50 - cam.s * cam.x}%, ${50 - cam.s * cam.y}%) scale(${cam.s})` };

  const words: Record<string, string> = {
    "product:bad": t("It needs light from the side.", "Falta luz de lado."),
    "product:good": t("Now you can feel the warmth.", "Agora sente-se o calor."),
    "shop:good": t("Inviting. That’s the one.", "Acolhedora. Fica esta."),
    "site:wow": t("Incredible. My shop has never looked this good.", "Incrível. A minha loja nunca pareceu tão bem."),
  };
  const mood = beat.shot === "face" ? beat.mood ?? "none" : "none";
  const said = words[`${beat.scene}:${mood}`] ?? "";
  const typed = useTyped(said, said !== "", still);

  const caption = (() => {
    const b = beat;
    if (b.scene === "product") {
      if (b.step === "set") return t("António sets the scene", "António prepara o ambiente");
      if (b.shot === "wide" && b.step === "aim") return t("Emanuel takes the photograph", "Emanuel fotografa");
      if (b.shot === "wide") return t("Emanuel moves the light and shoots again", "Emanuel ajusta a luz e repete");
      if (b.shot === "photo") return b.photo === "flat" ? t("The first photograph", "A primeira fotografia") : t("The second", "A segunda");
      return b.mood === "bad" ? t("António says what it is missing", "António diz o que lhe falta") : t("Approved", "Aprovada");
    }
    if (b.scene === "shop") {
      if (b.step === "set") return t("In the shop, António sets the space", "Na loja, António prepara o espaço");
      if (b.shot === "wide") return t("Emanuel photographs the room", "Emanuel fotografa o espaço");
      if (b.shot === "photo") return t("The shop, photographed", "A loja, fotografada");
      return t("Approved", "Aprovada");
    }
    if (b.shot === "wide") return t("The client opens the website", "O cliente abre o website");
    if (b.shot === "screen") return t("With the photographs from the session", "Com as fotografias da sessão");
    return t("The feedback that counts", "O feedback que conta");
  })();

  const scenes: Scene[] = ["product", "shop", "site"];
  const sceneAt = scenes.indexOf(beat.scene);
  // which print is up: the last one taken, while the camera is on it
  const printOn = beat.shot === "photo";
  const lastPhoto = beat.photo ?? (beat.scene === "shop" ? "shop" : beat.step === "relight" ? "lit" : "flat");

  return (
    <div
      ref={ref}
      className="vi-mg psf"
      data-shot={beat.shot}
      data-still={still || undefined}
      role="img"
      aria-label={t(
        "A short film of a session: António sets the scene and Emanuel photographs a product and then a shop; António says what each photograph needs until it is right, and the client, seeing the website with the photographs in it, is delighted.",
        "Um pequeno filme de uma sessão: o António prepara o ambiente e o Emanuel fotografa um produto e depois uma loja; o António diz o que falta a cada fotografia até ficar certa, e o cliente, ao ver o website com as fotografias, fica encantado.",
      )}
    >
      <div className="vi-mg-stage" aria-hidden="true">
        <div className="vi-mg-cam" style={camStyle}>
          <svg viewBox="0 0 800 500" className="vi-mg-art">
            <ProductScene beat={beat} on={beat.scene === "product"} />
            <ShopScene beat={beat} on={beat.scene === "shop"} />
            <SiteScene beat={beat} on={beat.scene === "site"} />
          </svg>
        </div>

        {/* the flash, at the end of each beat that fires */}
        {!still && beat.flash && <span key={`f${at}`} className="psf-flash" style={{ ["--ms" as string]: `${beat.ms}ms` }} />}

        {/* the print, crisp, over the drawing */}
        <span className="psf-prints" data-on={printOn || undefined}>
          <Print t={t} photo="flat" on={printOn && lastPhoto === "flat"} />
          <Print t={t} photo="lit" on={printOn && lastPhoto === "lit"} />
          <Print t={t} photo="shop" on={printOn && lastPhoto === "shop"} />
        </span>

        {/* the website, once the camera is in the laptop */}
        <div className="psf-screen" data-on={beat.shot === "screen" || undefined}>
          <Website t={t} on={beat.shot === "screen"} />
        </div>

        {/* what the face says, beside it */}
        <div className="vi-mg-say" data-on={said !== "" || undefined}>
          <span className="vi-mg-say-text">
            {typed}
            {!still && typed.length < said.length && <span className="sbc-caret" />}
          </span>
        </div>
      </div>

      <div className="vi-mg-foot">
        <span className="vi-mg-steps" aria-hidden="true">
          {scenes.map((s, n) => (
            <i key={s} data-on={n === sceneAt || undefined} />
          ))}
        </span>
        <span className="mono-label vi-mg-cap psf-cap">
          <b>{beat.scene === "product" ? t("Product", "Produto") : beat.scene === "shop" ? t("Shop", "Loja física") : t("The result", "O resultado")}</b>
          {caption}
        </span>
      </div>
    </div>
  );
}
