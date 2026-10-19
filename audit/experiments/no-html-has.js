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
