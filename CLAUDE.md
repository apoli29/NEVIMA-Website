# NEVIMA website

The original brief is imported below. Parts of it were written before the build started; where it and this file disagree, this file is newer and wins.

@claude.md.nevima.md

## Settled since the brief

- Site copy is English (`lang="en"`). The metadata/OG text in `src/app/layout.tsx` is still Portuguese and untranslated.
- Titles are set in Satoshi (self-hosted in `fonts/Satoshi/`, via `--f-title`); mono labels in Geist Mono (`--font-mono`, `.mono-label`).
- The default branch is `main`. Work on a branch and merge back through a pull request.
- The full history of homepage decisions, section by section, is in `docs/homepage-decisions.md`; the about page's is in `docs/about-decisions.md`. Read the part about a section before changing it.

## Working with the user

- The user writes in European Portuguese. Reply in it.
- Before building a section, raise every doubt and every change you would make (copy fixes, language, layout reading, photo quality) in one batch, with a recommended option first and concrete previews. Then build the finished section, not a prototype.
- Read free-text answers closely: they may rewrite the brief rather than pick an option. When the user delegates a choice, decide and say what you chose.

## The opening

- It is fired by scroll, not driven by it. The first scroll gesture (or a left click on the black) is a one-shot trigger; the run owns its own clock from start to finish, the page is locked for its duration and handed back with the second screen already on it. Do not reintroduce scrub.
- Drive everything from one clock MotionValue that `animate()` runs, not from `useScroll`.
- Outgoing and incoming states must overlap. No frame may be left with nothing on screen.
- One continuous move beats an effect: reach for a single deliberate gesture before particles or clever behaviour.

## Copy and imagery

- Fix the studio's copy (grammar, spelling) but keep its voice. Shorten only if every piece of information survives; otherwise keep the information and accept the length. Never cut a clause to make a layout or animation fit; make the layout fit the copy.
- Photos are in colour and never generic stock (no handshake, laptop or lightbulb clichés). Prefer close-up, single-subject, metaphorical shots with a strong colour.
- Present image candidates (source, photographer, size) before downloading anything. Unsplash results include paid Unsplash+ images; only use ones whose page says free.

## Do not break

- `AeroShards.jsx` is vendored third-party code with props the user supplied verbatim. Do not edit it or its prop values.
- Old, unused section components stay in `src/components/`. Ask before removing any of them.
- Navbar and footer labels (Work / Services / Studio / Get in touch) are placeholder scaffolding, not settled structure.
- Lenis owns the scroll lock through `useSmoothScroll(locked)` in `src/components/smooth-scroll.ts`. Do not move `stop()`/`start()` back into callers.
- Any Motion `layout` element below the opening must carry `layoutDependency`, or the jump when the opening releases the page gets animated.
- No numbers on titles. No boomerang pass on CTAs. No inner highlight inside the drop-shaped CTAs. Pixel looks are modern, never retro/CRT.
