// What-if: the page without the html:has([data-opening]) rule, once the
// opening is over. That rule makes every insertion anywhere in the page
// re-check <html> and recalculate the style of the whole document. Removed
// here through the CSSOM after load (the opening lock itself is not needed
// in the scenarios this is used on: they all start after the opening).
(() => {
  const strip = (rules, owner) => {
    for (let i = rules.length - 1; i >= 0; i--) {
      const r = rules[i];
      if (r.selectorText && r.selectorText.includes(":has([data-opening])")) owner.deleteRule(i);
      else if (r.cssRules) strip(r.cssRules, r);
    }
  };
  const run = () => {
    for (const s of document.styleSheets) {
      try { strip(s.cssRules, s); } catch {}
    }
  };
  window.addEventListener("load", () => setTimeout(run, 0));
})();
// Companion of compositor-melt.css: gives every drop a glass element with
// three spots inside it, for drops already there and drops mounted later.
(() => {
  const dress = (el) => {
    if (el.querySelector(":scope > .nv-glass")) return;
    const g = document.createElement("span");
    g.className = "nv-glass";
    g.setAttribute("aria-hidden", "true");
    for (let i = 0; i < 3; i++) g.appendChild(document.createElement("span")).className = "nv-spot";
    el.prepend(g);
  };
  const sweep = () => document.querySelectorAll(".cta-drop").forEach(dress);
  const start = () => {
    sweep();
    new MutationObserver(sweep).observe(document.body, { childList: true, subtree: true });
  };
  if (document.body) start();
  else document.addEventListener("DOMContentLoaded", start);
})();
