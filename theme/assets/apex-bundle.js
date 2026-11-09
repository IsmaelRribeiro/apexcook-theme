/**
 * Pure helpers for the PDP add-ons buy box. Money is in integer pence.
 * @typedef {{priceCents: number, selected: boolean, available: boolean}} PricedAddon
 * @typedef {{variantId: number, selected: boolean, available: boolean}} AddonChoice
 */

/** @param {AddonChoice | PricedAddon} addon */
const counts = (addon) => addon.selected && addon.available;

/**
 * @param {number} baseCents
 * @param {PricedAddon[]} addons
 * @returns {number}
 */
export function bundleTotal(baseCents, addons) {
  return addons.filter(counts).reduce((sum, a) => sum + a.priceCents, baseCents);
}

/**
 * Payload for POST /cart/add.js: main item first, each add-on once with quantity 1.
 * @param {{variantId: number, quantity: number}} main
 * @param {AddonChoice[]} addons
 * @returns {{items: {id: number, quantity: number}[]}}
 */
export function cartAddItems(main, addons) {
  const seen = new Set([main.variantId]);
  const items = [{ id: main.variantId, quantity: main.quantity }];
  for (const addon of addons) {
    if (!counts(addon) || seen.has(addon.variantId)) continue;
    seen.add(addon.variantId);
    items.push({ id: addon.variantId, quantity: 1 });
  }
  return { items };
}

/**
 * State of the "Add to basket" button. `busy` covers both an in-flight request and the
 * navigation to /cart after success, so a second tap cannot post the items twice.
 * @param {{available: boolean, busy: boolean}} state
 * @returns {{disabled: boolean, label: 'add'|'soldOut'|'adding'}}
 */
export function submitState({ available, busy }) {
  if (busy) return { disabled: true, label: 'adding' };
  if (!available) return { disabled: true, label: 'soldOut' };
  return { disabled: false, label: 'add' };
}
