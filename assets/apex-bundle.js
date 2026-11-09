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
