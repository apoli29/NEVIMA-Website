/**
 * The ground. Deliberately empty for now: flat black, nothing layered on it.
 *
 * This is the hook for background work — washes, clouds, grain, whatever comes
 * next gets layered inside this element, behind everything else on the page.
 * The `.cloud-a/-b/-c`, `.grain-fine` and `.grain-blot` classes are still in
 * globals.css, so bringing any of them back is a matter of dropping a div in
 * here rather than rebuilding it.
 */
export function Atmosphere() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 bg-ink"
      aria-hidden="true"
    />
  );
}
