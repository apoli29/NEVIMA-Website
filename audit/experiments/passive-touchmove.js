// What-if: window-level touchmove listeners registered passive while the
// page is past the gateway, as the proposed fix would leave them. Applied
// here bluntly (always passive), so only use it on scenarios that start
// below the gateway (How we work and further down), where the gateway's
// handler never calls preventDefault anyway.
(() => {
  const add = EventTarget.prototype.addEventListener;
  EventTarget.prototype.addEventListener = function (type, fn, opts) {
    if (this === window && type === "touchmove" && typeof opts === "object" && opts && opts.passive === false) {
      opts = { ...opts, passive: true };
    }
    return add.call(this, type, fn, opts);
  };
})();
