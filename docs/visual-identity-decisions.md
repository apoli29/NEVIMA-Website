# Visual Identity — decisions

The service's own page: `/services/visual-identity`,
`/pt/servicos/identidade-visual`, in `src/components/visual-identity.tsx`,
styled `.vi-*` (and on the photo shoot's `.ps-*` for everything the two
share). Written from the studio's brief of 2026-11-17.

## Coherence with the other service pages

Asked for first, and done by using the same pieces rather than copying
their look:

- The **header is the photo shoot's**, which is the side-by-side page's:
  `data-tone="dark"`, `.ps-head`, the mono label "Additional service",
  the name as `h1` in `display` light, the studio's sentence in two
  lines (light then medium), three facts under a hairline, and the
  free-proposal drop. The same four `SlideIn`s at the same delays.
- One **`ToneRoom`**: header (dark), opening (light), the proposal
  (dark), who it is for (light), then "Let's work together" in ink.
- The **leading line** at the head of every section is `.ps-lede`, the
  same one the photo shoot uses, and the sections keep `.ps-sec`'s
  rhythm.
- The **before and after** is `BeforeAfter` from `project-report.tsx`,
  the slider the reports and the photo shoot already carry: the same
  follow, the same handle, the same keys.
- The **words that change in place** in "who it is for" are the photo
  shoot's dials, rebuilt on one clock (2.8s) with the longest case
  holding the line open so nothing under it moves.

## The two sections

1. **The proposal.** Three things seen rather than described: the old
   mark against the new one on the slider; the symbol on the guides a
   mark is built on, which draw themselves as the section is reached;
   and the two applied to the website they were made with. The grid is
   ours and generic — the square, its halves, its diagonals and two
   circles — not any client's geometry.
2. **Does it make sense for every business?** Answered "No." in display
   size, with the condition beside it, and then the cases that do make
   sense cycling in place. It ends on the doubt the studio wrote and
   the free-proposal drop.

## Places for the work

Named and empty under `public/visual-identity/` (its README says which
file goes where): the old logo and the new one (3:2, the pair must share
their frame), the symbol (1:1, centred with margin), and the website
with the identity applied (16:10). A missing file leaves its place
saying what belongs in it and holding its shape, so dropping the real
work in is the whole of the work.

## References

Through Inspo: Orpetron (the mark shown as a seal with its construction
in view) and Feathericons (the mark as a specimen in a ruled cell).
Their colour and type stay with them; this is the site's own black,
white and light grey, Satoshi and Geist Mono.

## Changed since

- 2026-11-17 (user): the page carries **no free-proposal drop of its
  own**, in the header or at the foot of "who it is for". The bar has
  one all the way down the page and the page ends on "Let's work
  together"; a third was one too many.

## Open

- The real work: four images.
- A price, if the studio ever wants one on the page. Today the
  free-proposal drop stands in its place, as on every other service.
