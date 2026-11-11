/**
 * Sticky product bar behaviour:
 * - keeps the bar's price in step with the selected size (copies it from the re-rendered page);
 * - adds `is-compact` once the content scrolls under the bar (hides promo + rating);
 * - publishes the bar's bottom edge as --apex-nav-bottom so the gallery can stick beneath it;
 * - on phones, sets the offsets that keep only the tab row pinned under the header.
 */
const SELECT = 'shopify:product:select';
const PRICE = '[data-apex-nav-price]';

/** @param {Event} event */
async function onSelect(event) {
  const promise = /** @type {any} */ (event).promise;
  if (!promise) return;
  try {
    const { detail } = await promise;
    const fresh = detail?.html?.querySelector?.(PRICE);
    const current = document.querySelector(PRICE);
    if (fresh && current) current.replaceChildren(...fresh.cloneNode(true).childNodes);
  } catch (error) {
    if (/** @type {Error} */ (error)?.name !== 'AbortError') console.warn('[apex-nav-price]', error);
  }
}

let frame = 0;
function update() {
  frame = 0;
  const nav = document.querySelector('.apex-anchor-nav');
  const next = nav?.closest('.shopify-section')?.nextElementSibling;
  if (!nav || !next) return;
  // Hysteresis (60px) so the bar does not flicker when it shrinks.
  // Phones: pin only the tab row. The section sticks at (header bottom − height above the tabs).
  const section = nav.closest('.shopify-section');
  const links = nav.querySelector('.apex-anchor-nav__links');
  if (section && links) {
    const header = document.querySelector('#header-component');
    const headerSection = header?.closest('.header-section');
    const stickyHeader = headerSection && getComputedStyle(headerSection).position === 'sticky';
    const headerBottom = stickyHeader ? Math.max(0, Math.round(header.getBoundingClientRect().bottom) - 1) : 0;
    section.style.setProperty('--apex-nav-sticky-top', `${headerBottom}px`);
    section.style.setProperty('--apex-nav-links-top', `${links.offsetTop}px`);
  }
  const gap = next.getBoundingClientRect().top - nav.getBoundingClientRect().bottom;
  if (gap < -60) nav.classList.add('is-compact');
  else if (gap >= -1) nav.classList.remove('is-compact');
  document.documentElement.style.setProperty('--apex-nav-bottom', `${Math.round(nav.getBoundingClientRect().bottom)}px`);
}
const schedule = () => {
  if (!frame) frame = requestAnimationFrame(update);
};

if (!window.__apexNavPriceReady) {
  window.__apexNavPriceReady = true;
  document.addEventListener(SELECT, onSelect);
  // Horizon may scroll .page-wrapper instead of the window, so listen in the capture phase.
  document.addEventListener('scroll', schedule, { capture: true, passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  document.addEventListener('shopify:section:load', schedule);
  schedule();
}
