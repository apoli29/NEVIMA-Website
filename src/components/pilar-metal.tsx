"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/* ==================================================================
   Pilar's symbol in white metal, rendered (the Advanced page's opening,
   sbs-advanced.tsx).

   The CSS version (a stack of flat layers) read as a prototype (user,
   2026-11-17: "o 3d está muito fraco"). This is the symbol as an object:
   its own outline from the brand guide, extruded with a rounded bevel on
   every edge, in a physical metal (metalness 1, a fine roughness, a
   clear coat), lit by a photographer's studio built for it: a soft
   lavender room, the hero photograph's sky, with long white softboxes
   above and to each side and a strip light behind, so the bevels catch
   long clean highlights. The studio turns very slowly, so light moves
   across the metal while the symbol stays face on.

   It plays on the page's own loop (sbs-a-scroll), read every frame: the
   symbol turning in one continuous move from a tilt to face on, with the
   light moving (0-7%); the camera then flies along the
   line to the square of the P and through it (7-14.5%); the CSS
   fade over it reveals the website. It draws only while the opening can
   be seen (before 18% and after 96% of a lap) and only on screen; a
   paused or seeked loop is drawn where it stands.
   ================================================================== */

/** The symbol's outline, in the guide's 100-unit box (y down, as SVG). */
function symbolShapes() {
  const flip = (y: number) => 50 - y; // centred, y up
  const x = (v: number) => v - 50;

  // the stem: a 30 x 100 rectangle with corners of 8
  const stem = new THREE.Shape();
  const r = 8;
  stem.moveTo(x(r), flip(0));
  stem.lineTo(x(30 - r), flip(0));
  stem.absarc(x(30 - r), flip(r), r, Math.PI / 2, 0, true);
  stem.lineTo(x(30), flip(100 - r));
  stem.absarc(x(30 - r), flip(100 - r), r, 0, -Math.PI / 2, true);
  stem.lineTo(x(r), flip(100));
  stem.absarc(x(r), flip(100 - r), r, -Math.PI / 2, -Math.PI, true);
  stem.lineTo(x(0), flip(r));
  stem.absarc(x(r), flip(r), r, Math.PI, Math.PI / 2, true);

  // the bowl: M44 0 H76 A24 24 0 0 1 100 24 V42 A24 24 0 0 1 76 66 H44
  // A6 6 0 0 1 38 60 V6 A6 6 0 0 1 44 0 Z, with the square M59 23 H79 V43 H59 Z
  const bowl = new THREE.Shape();
  bowl.moveTo(x(44), flip(0));
  bowl.lineTo(x(76), flip(0));
  bowl.absarc(x(76), flip(24), 24, Math.PI / 2, 0, true);
  bowl.lineTo(x(100), flip(42));
  bowl.absarc(x(76), flip(42), 24, 0, -Math.PI / 2, true);
  bowl.lineTo(x(44), flip(66));
  bowl.absarc(x(44), flip(60), 6, -Math.PI / 2, -Math.PI, true);
  bowl.lineTo(x(38), flip(6));
  bowl.absarc(x(44), flip(6), 6, Math.PI, Math.PI / 2, true);
  const square = new THREE.Path();
  square.moveTo(x(59), flip(23));
  square.lineTo(x(59), flip(43));
  square.lineTo(x(79), flip(43));
  square.lineTo(x(79), flip(23));
  square.lineTo(x(59), flip(23));
  bowl.holes.push(square);

  return [stem, bowl];
}

/** The square of the P, its centre in the symbol's own units. */
/** The symbol's size in the opening (user, 2026-11-17: twice as large,
    every part of the move in proportion). */
const SIZE = 2;
const HOLE = new THREE.Vector3(69 - 50, 50 - 33, 0).multiplyScalar(SIZE);

/** A photographer's studio for the metal: a lavender room (the hero's
    sky), long softboxes and a strip light, all emissive, baked into an
    environment map. */
function studio(renderer: THREE.WebGLRenderer) {
  const scene = new THREE.Scene();
  // the room: dark below, a violet grey at the horizon, lighter above,
  // so the metal holds deep shade as well as light (a flat room reads
  // as grey plastic)
  const sky = document.createElement("canvas");
  sky.width = 4;
  sky.height = 256;
  const g = sky.getContext("2d")!;
  const grad = g.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, "#d6d7e2");
  grad.addColorStop(0.42, "#8e90a8");
  grad.addColorStop(0.55, "#3b3854");
  grad.addColorStop(1, "#121020");
  g.fillStyle = grad;
  g.fillRect(0, 0, 4, 256);
  const skyTex = new THREE.CanvasTexture(sky);
  skyTex.colorSpace = THREE.SRGBColorSpace;
  const room = new THREE.Mesh(new THREE.SphereGeometry(60, 64, 32), new THREE.MeshBasicMaterial({ map: skyTex, side: THREE.BackSide }));
  scene.add(room);

  // softboxes: emissive panels, brighter than white, with soft edges
  const soft = document.createElement("canvas");
  soft.width = 128;
  soft.height = 128;
  const sg = soft.getContext("2d")!;
  const rg = sg.createRadialGradient(64, 64, 10, 64, 64, 64);
  rg.addColorStop(0, "#ffffff");
  rg.addColorStop(0.7, "#ffffff");
  rg.addColorStop(1, "rgba(255,255,255,0)");
  sg.fillStyle = rg;
  sg.fillRect(0, 0, 128, 128);
  const softTex = new THREE.CanvasTexture(soft);
  const box = (w: number, h: number, intensity: number, pos: [number, number, number]) => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(1, 1, 1).multiplyScalar(intensity),
        map: softTex,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    );
    m.position.set(...pos);
    m.lookAt(0, 0, 0);
    scene.add(m);
  };
  box(46, 10, 9, [0, 30, 14]); // overhead strip, a long highlight on the top bevels
  box(12, 40, 6, [-34, 6, 16]); // left softbox
  box(12, 40, 4.5, [34, 4, 12]); // right softbox
  box(40, 6, 4, [0, 4, -36]); // strip behind, rims
  box(84, 46, 1.7, [0, 10, 44]); // the big front panel the face mirrors: white metal, not grey
  box(84, 20, 0.75, [0, -24, 44]); // a dimmer lower card, so the face falls off gently downwards

  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(scene, 0.015).texture;
  pmrem.dispose();
  skyTex.dispose();
  softTex.dispose();
  return env;
}

/** A fine brushed grain for the metal's roughness: horizontal strokes. */
function brushed() {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 512;
  const g = c.getContext("2d")!;
  g.fillStyle = "rgb(150,150,150)";
  g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 2600; i++) {
    const y = Math.random() * 512;
    const v = 120 + Math.random() * 70;
    g.strokeStyle = `rgba(${v},${v},${v},0.5)`;
    g.lineWidth = Math.random() * 1.2 + 0.2;
    g.beginPath();
    const x0 = Math.random() * 512;
    g.moveTo(x0, y);
    g.lineTo(x0 + 60 + Math.random() * 260, y + (Math.random() - 0.5) * 0.6);
    g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(0.012, 0.012);
  return t;
}

const inOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export function PilarMetal({ className }: { className?: string }) {
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.82;
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    box.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const env = studio(renderer);
    scene.environment = env;

    const grain = brushed();
    const material = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#f6f6fa"),
      metalness: 1,
      roughness: 0.14,
      roughnessMap: grain,
      // brushed: highlights drawn out along the grain, as on real
      // satin-finished aluminium
      anisotropy: 0.55,
      anisotropyRotation: 0,
      clearcoat: 0.55,
      clearcoatRoughness: 0.08,
      envMapIntensity: 1.15,
    });
    const geometry = new THREE.ExtrudeGeometry(symbolShapes(), {
      depth: 14,
      bevelEnabled: true,
      bevelThickness: 2.4,
      bevelSize: 1.8,
      bevelOffset: -1.8,
      bevelSegments: 10,
      curveSegments: 48,
    });
    geometry.translate(0, 0, -7);
    geometry.computeVertexNormals();
    const symbol = new THREE.Mesh(geometry, material);
    symbol.scale.setScalar(SIZE);
    // one key light for a crisp specular on top of the studio
    const key = new THREE.DirectionalLight(0xffffff, 0.6);
    key.position.set(-40, 60, 80);
    scene.add(key, symbol);

    const camera = new THREE.PerspectiveCamera(26, 1, 0.5, 2000);
    const START = 940; // the symbol about a quarter of the opening's height, as before

    let width = 0;
    let height = 0;
    const resize = () => {
      const r = box.getBoundingClientRect();
      // drawn at the size it is seen (the page is scaled into its plate)
      width = Math.max(1, Math.round(r.width));
      height = Math.max(1, Math.round(r.height));
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    resize();
    const size = new ResizeObserver(resize);
    size.observe(box);

    const lapOf = () => {
      const page = box.closest<HTMLElement>(".sbs-mini");
      const run = page?.getAnimations().find((a) => (a as CSSAnimation).animationName === "sbs-a-scroll");
      return run?.effect?.getComputedTiming().progress ?? 0;
    };

    let seen = true;
    const watch = new IntersectionObserver(([e]) => (seen = !!e?.isIntersecting));
    watch.observe(box);

    let frame = 0;
    let last = -1;
    const t0 = performance.now();
    const draw = () => {
      frame = requestAnimationFrame(draw);
      if (!seen) return;
      const p = lapOf();
      const live = p < 0.18 || p > 0.96;
      if (!live && last >= 0) return;
      last = p;

      // the studio turns slowly, so light travels across the metal
      const time = (performance.now() - t0) / 1000;
      scene.environmentRotation.set(0.04 * Math.sin(time * 0.35), 0.16 * Math.sin(time * 0.22), 0);
      key.position.set(-40 + 30 * Math.sin(time * 0.3), 60, 80);

      // held (0-7% of the lap): one continuous move, read off the loop and
      // not off the clock, so it is the same every time: the symbol comes
      // in tilted and turns, without a pause or a change of pace, to face
      // on, arriving there as the flight begins (user, 2026-11-17: the
      // settling had been abrupt)
      const turn = p > 0.96 ? 0 : 0.5 - 0.5 * Math.cos(Math.PI * Math.min(1, p / 0.07));
      symbol.rotation.y = 0.26 * (1 - turn);
      symbol.rotation.x = -0.08 * (1 - turn);
      symbol.position.y = 1.6 * SIZE * (1 - turn);

      // the flight (7-14.5%): the camera moves along the line from where it
      // stands to the square of the P and on through it, still looking
      // straight ahead, so the symbol stays where it is and the square
      // grows in its own place until it fills the view
      const f = p > 0.96 ? 0 : Math.min(1, Math.max(0, (p - 0.07) / 0.075));
      const along = inOut(f) * ((START + 40 * SIZE) / START);
      camera.position.set(HOLE.x * along, HOLE.y * along, START + (HOLE.z - START) * along);
      camera.lookAt(camera.position.x, camera.position.y, camera.position.z - 100);
      renderer.render(scene, camera);
    };
    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      size.disconnect();
      watch.disconnect();
      geometry.dispose();
      material.dispose();
      grain.dispose();
      env.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={boxRef} className={className} aria-hidden="true" />;
}
