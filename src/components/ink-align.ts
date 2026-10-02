"use client";

import { useEffect, type RefObject } from "react";

/* ==================================================================
   Ink alignment

   A section's subtitle stands beside its title with the top of its first
   line level with the top of the last letter on the title's first line:
   the "t" of "that", the "s" of "websites". Level by what is seen, the
   ink, not by the boxes the two are set in. The boxes cannot do it: the
   letters stand at different heights in them (an "s" only reaches the
   x-height, a "t" a little above it, the subtitle's capitals and tall
   letters higher still), and title and subtitle are different faces at
   sizes that change with the screen.

   So it is measured on the page. For the last letter of the title's
   first line, and for every letter of the subtitle's first line, the
   baseline is read off the page and the top of the ink is read off a
   canvas, scanned pixel by pixel (a canvas's own text measurements are
   rounded and were found to mislead). The subtitle is then moved, by a
   translate of its own, until its highest ink meets the title letter's.
   Measured again whenever either box changes size and once the fonts
   are in; left alone whenever the subtitle is not beside the title.
   ================================================================== */

/** Where the ink of a letter reaches above its baseline, as a share of
    the font size, by font and letter. The faces never change once
    loaded, so a letter is only ever scanned once. */
const inkCache = new Map<string, number>();

/** The scale the letters are drawn at for scanning, in CSS pixels. */
const SCAN = 240;

const fontOf = (style: CSSStyleDeclaration, size: number) =>
  `${style.fontStyle} ${style.fontWeight} ${size}px ${style.fontFamily}`;

/** How far a letter's ink rises above the baseline, as a share of the
    font size: drawn large, scanned from the top for the first row that is
    more than half inked. */
function inkAscent(style: CSSStyleDeclaration, ch: string) {
  const key = `${fontOf(style, SCAN)}|${ch}`;
  const known = inkCache.get(key);
  if (known !== undefined) return known;
  const canvas = document.createElement("canvas");
  canvas.width = SCAN * 2;
  canvas.height = SCAN * 2;
  const pen = canvas.getContext("2d", { willReadFrequently: true });
  if (!pen) return 0;
  pen.font = fontOf(style, SCAN);
  pen.textBaseline = "alphabetic";
  pen.fillStyle = "#000";
  const base = Math.round(SCAN * 1.5);
  pen.fillText(ch, SCAN * 0.25, base);
  const { data } = pen.getImageData(0, 0, canvas.width, base);
  let top = base;
  scan: for (let y = 0; y < base; y++) {
    for (let x = 0; x < canvas.width; x++) {
      if (data[(y * canvas.width + x) * 4 + 3] > 127) {
        top = y;
        break scan;
      }
    }
  }
  const share = (base - top) / SCAN;
  inkCache.set(key, share);
  return share;
}

type Letter = { ch: string; parent: HTMLElement; style: CSSStyleDeclaration };

/** The letters of an element's first line, in order, with the element
    each is set in. */
function firstLine(root: HTMLElement): Letter[] {
  const letters: Letter[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let first: DOMRect | null = null;
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const parent = node.parentElement;
    if (!parent || parent.closest(".sr-only")) continue;
    const style = getComputedStyle(parent);
    if (style.visibility === "hidden" || style.opacity === "0") continue;
    const text = node.textContent ?? "";
    for (let i = 0; i < text.length; i++) {
      const range = document.createRange();
      range.setStart(node, i);
      range.setEnd(node, i + 1);
      const rect = range.getBoundingClientRect();
      if (!rect.width && !rect.height) continue;
      if (!first) first = rect;
      // Past the first line: anything that starts well below where it
      // starts. Not below where it ends: a title is set tighter than its
      // letters' boxes are tall, so the next line begins inside them.
      else if (Math.abs(rect.top - first.top) > first.height * 0.4) return letters;
      letters.push({ ch: text[i], parent, style });
    }
  }
  return letters;
}

/** The baseline of an element's first line, in viewport pixels: where a
    zero-sized block set on it stands. The block is put in and taken out
    again before anything is drawn. A letter's own box will not do: in a
    title set tighter than its letters are tall, where the baseline falls
    in that box was found to be a few pixels out, and not by the same
    amount every time. */
function baselineOf(el: HTMLElement, seen: Map<HTMLElement, number>) {
  const known = seen.get(el);
  if (known !== undefined) return known;
  const mark = document.createElement("span");
  mark.style.cssText = "display:inline-block;width:0;height:0;vertical-align:baseline";
  el.prepend(mark);
  const y = mark.getBoundingClientRect().top;
  mark.remove();
  seen.set(el, y);
  return y;
}

/** The top of a letter's ink, in viewport pixels. */
function inkTop(letter: Letter, seen: Map<HTMLElement, number>) {
  const size = parseFloat(letter.style.fontSize);
  return baselineOf(letter.parent, seen) - inkAscent(letter.style, letter.ch) * size;
}

export function useInkAlign(
  title: RefObject<HTMLElement | null>,
  subtitle: RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    const t = title.current;
    const s = subtitle.current;
    if (!t || !s) return;
    let frame = 0;

    const align = () => {
      frame = 0;
      s.style.translate = "";
      const tb = t.getBoundingClientRect();
      const sb = s.getBoundingClientRect();
      // Only where the subtitle stands beside the title, not under it.
      const beside = sb.left >= tb.right - 1 && sb.top < tb.bottom;
      if (!beside) return;
      const line = firstLine(t).filter((l) => l.ch.trim());
      const last = line[line.length - 1];
      const own = firstLine(s).filter((l) => l.ch.trim());
      if (!last || !own.length) return;
      const seen = new Map<HTMLElement, number>();
      const target = inkTop(last, seen);
      const highest = Math.min(...own.map((l) => inkTop(l, seen)));
      s.style.translate = `0 ${Math.round((target - highest) * 2) / 2}px`;
    };
    const queue = () => {
      if (!frame) frame = requestAnimationFrame(align);
    };

    queue();
    document.fonts.ready.then(queue);
    const watch = new ResizeObserver(queue);
    watch.observe(t);
    watch.observe(s);
    window.addEventListener("resize", queue);
    return () => {
      cancelAnimationFrame(frame);
      watch.disconnect();
      window.removeEventListener("resize", queue);
    };
  }, [title, subtitle]);
}
