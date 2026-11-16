"use client";

import { useEffect, useRef } from "react";

/* ==================================================================
   Sliding ease: vertical hairlines with short bars that slide between
   two patterns, easing in and out, the pointer stirring the bars near
   it and a press sending a ring through them.

   From a component the user brought (2026-11-17, "SlidingEaseVerticalBars"),
   kept to its drawing and its motion, with four changes for this site:
   - it fills its own box, not the window (it sits inside a section, and
     in the side-by-side page inside a scaled miniature), measured by a
     ResizeObserver, and the pointer is read in the box's own pixels;
   - the two patterns are worked out once per size, not on every frame;
   - it draws only while it is on the screen;
   - for anyone who asks for less motion it draws one still frame.
   The colours are props; on Pilar's page they are its own (Noite,
   Grafite, Névoa).
   ================================================================== */

interface SlidingEaseVerticalBarsProps {
  backgroundColor?: string;
  lineColor?: string;
  barColor?: string;
  lineWidth?: number;
  animationSpeed?: number;
  removeWaveLine?: boolean;
  className?: string;
}

interface Bar {
  y: number;
  height: number;
  width: number;
}

const noise = (x: number, y: number, t: number) => {
  const n = Math.sin(x * 0.02 + t) * Math.cos(y * 0.02 + t) + Math.sin(x * 0.03 - t) * Math.cos(y * 0.01 + t);
  return (n + 1) / 2;
};

function generatePattern(seed: number, width: number, height: number, numLines: number): Bar[][] {
  const pattern: Bar[][] = [];
  const lineSpacing = width / numLines;
  for (let i = 0; i < numLines; i++) {
    const lineBars: Bar[] = [];
    let y = 0;
    while (y < height) {
      const v = noise(i * lineSpacing, y, seed);
      if (v > 0.5) {
        const length = 10 + v * 30;
        lineBars.push({ y: y + length / 2, height: length, width: 2 + v * 3 });
        y += length + 15;
      } else {
        y += 15;
      }
    }
    pattern.push(lineBars);
  }
  return pattern;
}

const rgb = (hex: string) => [1, 3, 5].map((i) => Number.parseInt(hex.slice(i, i + 2), 16)).join(", ");

export default function SlidingEaseVerticalBars({
  backgroundColor = "#F0EEE6",
  lineColor = "#444444",
  barColor = "#5E5D59",
  lineWidth = 1,
  animationSpeed = 0.005,
  removeWaveLine = true,
  className,
}: SlidingEaseVerticalBarsProps) {
  const boxRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const box = boxRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!box || !canvas || !ctx) return;

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const bar = rgb(barColor);
    const mouse = { x: -9999, y: -9999 };
    let bursts: { x: number; y: number; time: number; intensity: number }[] = [];
    let time = 0;
    let frame = 0;
    let seen = false;
    let width = 0;
    let height = 0;
    let numLines = 0;
    let p1: Bar[][] = [];
    let p2: Bar[][] = [];

    const influence = (x: number, y: number) => Math.max(0, 1 - Math.hypot(x - mouse.x, y - mouse.y) / 180);
    const burstInfluence = (x: number, y: number, now: number) => {
      let total = 0;
      for (const b of bursts) {
        const age = now - b.time;
        if (age >= 2500) continue;
        const d = Math.hypot(x - b.x, y - b.y);
        const r = (age / 2500) * 300;
        if (Math.abs(d - r) < 60) total += (1 - age / 2500) * b.intensity * (1 - Math.abs(d - r) / 60);
      }
      return Math.min(total, 1.5);
    };

    // The box in its own (layout) pixels: inside a scaled page the canvas
    // is drawn at the page's size and shrunk with it.
    const resize = () => {
      width = box.clientWidth;
      height = box.clientHeight;
      if (!width || !height) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      numLines = Math.max(1, Math.floor(width / 15));
      p1 = generatePattern(0, width, height, numLines);
      p2 = generatePattern(5, width, height, numLines);
      if (still || !seen) draw();
    };

    const draw = () => {
      if (!width || !height) return;
      const now = Date.now();
      const spacing = width / numLines;
      const cycle = (time % (Math.PI * 2)) + influence(width / 2, height / 2) * 0.5;
      let e: number;
      if (cycle < Math.PI * 0.1) e = 0;
      else if (cycle < Math.PI * 0.9) e = (cycle - Math.PI * 0.1) / (Math.PI * 0.8);
      else if (cycle < Math.PI * 1.1) e = 1;
      else if (cycle < Math.PI * 1.9) e = 1 - (cycle - Math.PI * 1.1) / (Math.PI * 0.8);
      else e = 0;
      const s = e < 0.5 ? 4 * e * e * e : 1 - Math.pow(-2 * e + 2, 3) / 2;

      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < numLines; i++) {
        const x = i * spacing + spacing / 2;
        ctx.beginPath();
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = lineWidth + influence(x, height / 2) * 2;
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();

        const a = p1[i] || [];
        const b = p2[i] || [];
        for (let j = 0; j < Math.max(a.length, b.length); j++) {
          const b1 = a[j] ?? { y: b[j].y - 100, height: 0, width: 0 };
          const b2 = b[j] ?? { y: b1.y + 100, height: 0, width: 0 };
          const m = influence(x, b1.y);
          const k = burstInfluence(x, b1.y, now);
          const wave =
            Math.sin(i * 0.3 + j * 0.5 + time * 2) * 10 * (s * (1 - s) * 4) +
            m * Math.sin(time * 3 + i * 0.2) * 15 +
            k * Math.sin(time * 4 + j * 0.3) * 20;
          const y = b1.y + (b2.y - b1.y) * s + wave;
          const h = b1.height + (b2.height - b1.height) * s + m * 5 + k * 8;
          const w = b1.width + (b2.width - b1.width) * s + m * 2 + k * 3;
          if (h > 0.1 && w > 0.1) {
            ctx.fillStyle = `rgba(${bar}, ${Math.min(1, 0.8 + m * 0.2 + k * 0.3)})`;
            ctx.fillRect(x - w / 2, y - h / 2, w, h);
          }
        }
      }

      if (!removeWaveLine) {
        for (const burst of bursts) {
          const age = now - burst.time;
          if (age >= 2500) continue;
          const p = age / 2500;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(${bar}, ${(1 - p) * 0.2 * burst.intensity})`;
          ctx.lineWidth = 2;
          ctx.arc(burst.x, burst.y, p * 300, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
    };

    const tick = () => {
      time += animationSpeed;
      draw();
      frame = requestAnimationFrame(tick);
    };

    // The pointer in the box's own pixels, whatever it is scaled by.
    const local = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      return { x: ((e.clientX - r.left) * width) / r.width, y: ((e.clientY - r.top) * height) / r.height };
    };
    const move = (e: PointerEvent) => Object.assign(mouse, local(e));
    const leave = () => Object.assign(mouse, { x: -9999, y: -9999 });
    const down = (e: PointerEvent) => {
      const now = Date.now();
      bursts = [...bursts.filter((b) => now - b.time < 2500), { ...local(e), time: now, intensity: 2 }];
    };

    const size = new ResizeObserver(resize);
    size.observe(box);
    resize();

    const watch = new IntersectionObserver(([entry]) => {
      seen = !!entry?.isIntersecting;
      cancelAnimationFrame(frame);
      if (seen && !still) frame = requestAnimationFrame(tick);
    });
    watch.observe(box);

    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerleave", leave);
    canvas.addEventListener("pointerdown", down);

    return () => {
      cancelAnimationFrame(frame);
      size.disconnect();
      watch.disconnect();
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerleave", leave);
      canvas.removeEventListener("pointerdown", down);
    };
  }, [backgroundColor, lineColor, barColor, lineWidth, animationSpeed, removeWaveLine]);

  return (
    <div ref={boxRef} className={className ?? "absolute inset-0 h-full w-full overflow-hidden"} style={{ backgroundColor }}>
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
