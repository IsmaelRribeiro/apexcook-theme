/**
 * Reveals `[data-apex-reveal]` elements as they enter the viewport.
 * Does nothing when the visitor prefers reduced motion (the CSS keeps everything visible then).
 */
const SELECTOR = '[data-apex-reveal]:not(.is-revealed)';

function init() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!('IntersectionObserver' in window)) {
    for (const el of document.querySelectorAll(SELECTOR)) el.classList.add('is-revealed');
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -10% 0px' }
  );

  const observeAll = () => {
    for (const el of document.querySelectorAll(SELECTOR)) observer.observe(el);
  };
  observeAll();
  // Theme editor re-renders sections in place.
  document.addEventListener('shopify:section:load', observeAll);
}

if (!window.__apexRevealReady) {
  window.__apexRevealReady = true;
  init();
}
