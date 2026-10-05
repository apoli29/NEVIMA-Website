"use client";

import { useEffect, useState, type RefObject } from "react";

/* Latched: once a block has been seen, scrolling it back off the screen
   does not unsay it. Off until `ready`, so nothing runs before the page is
   in a state anyone can see. */
export function useSeen(
  ref: RefObject<Element | null>,
  { threshold = 0.3, ready = true }: { threshold?: number; ready?: boolean } = {},
) {
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    if (!ready || seen) return;
    const el = ref.current;
    if (!el) return;
    const watch = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setSeen(true);
      },
      { threshold },
    );
    watch.observe(el);
    return () => watch.disconnect();
  }, [ref, ready, seen, threshold]);

  return seen;
}

/* The page's faces, loaded. Lines read back from the layout (see
   Illuminated) are only right once the type they are set in is in. */
export function useFontsReady() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let live = true;
    document.fonts.ready.then(() => {
      if (live) setReady(true);
    });
    return () => {
      live = false;
    };
  }, []);
  return ready;
}
