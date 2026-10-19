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
