/**
 * Keeps the sticky product bar's price in step with the selected size: when Horizon re-renders
 * the product for a new variant, copy the bar's price markup from the fresh page HTML.
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

if (!window.__apexNavPriceReady) {
  window.__apexNavPriceReady = true;
  document.addEventListener(SELECT, onSelect);
}
