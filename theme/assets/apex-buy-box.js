import { bundleTotal, cartAddItems, submitState } from '@theme/apex-bundle';
import { formatMoney } from '@theme/money-formatting';

const PRODUCT_SELECT = 'shopify:product:select';

/**
 * @typedef {{variantId: number, priceCents: number, title: string, selected: boolean, available: boolean}} Addon
 */

/**
 * <apex-buy-box>: keeps the selected size and add-ons in sync with the summary lines and total,
 * and adds everything to the basket in one request before going to /cart.
 */
class ApexBuyBox extends HTMLElement {
  /** @type {Map<number, Addon>} */
  #addons = new Map();
  #controller = new AbortController();
  /** @type {AbortController | null} */
  #request = null;
  #navigating = false;

  connectedCallback() {
    const { signal } = this.#controller;
    const scope = this.closest('.shopify-section') ?? document;
    scope.addEventListener('click', this.#onScopeClick, { signal });
    scope.addEventListener(PRODUCT_SELECT, this.#onProductSelect, { signal });
    this.addEventListener('submit', this.#onSubmit, { signal });
    // Back/forward cache restores the page mid-navigation: re-enable the button.
    window.addEventListener('pageshow', () => {
      this.#navigating = false;
      this.#render();
    }, { signal });
    this.#render();
  }

  disconnectedCallback() {
    this.#controller.abort();
    this.#controller = new AbortController();
    this.#request?.abort();
  }

  get #main() {
    const el = /** @type {HTMLElement} */ (this.querySelector('[data-apex-main]'));
    return {
      el,
      variantId: Number(el.dataset.variantId),
      priceCents: Number(el.dataset.price),
      available: el.dataset.available === 'true',
    };
  }

  /** @param {number} cents */
  #money(cents) {
    return formatMoney(cents, this.dataset.moneyFormat ?? '£{{amount}}', this.dataset.currency ?? 'GBP');
  }

  /** @param {Event} event */
  #onScopeClick = (event) => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;

    const toggle = target.closest('.apex-addons__toggle');
    if (toggle instanceof HTMLButtonElement && !toggle.disabled) {
      const id = Number(toggle.dataset.variantId);
      const selected = toggle.getAttribute('aria-pressed') !== 'true';
      this.#addons.set(id, {
        variantId: id,
        priceCents: Number(toggle.dataset.price),
        title: toggle.dataset.title ?? '',
        available: toggle.dataset.available === 'true',
        selected,
      });
      this.#render();
      return;
    }

    const more = target.closest('[data-apex-addons-more]');
    if (more) {
      for (const item of more.parentElement?.querySelectorAll('.apex-addons__item--extra') ?? []) {
        item.removeAttribute('hidden');
      }
      more.remove();
      return;
    }

    if (target.closest('[data-apex-clear]')) {
      for (const addon of this.#addons.values()) addon.selected = false;
      this.#render();
    }
  };

  /** Re-reads the server-rendered main line after a size change. @param {Event} event */
  #onProductSelect = async (event) => {
    const promise = /** @type {any} */ (event).promise;
    if (!promise) return;
    try {
      const { detail } = await promise;
      const html = detail?.html;
      const fresh = html?.querySelector?.(`#${CSS.escape(this.id)} [data-apex-main]`);
      if (fresh) this.#main.el.replaceWith(fresh);
      this.#render();
    } catch (error) {
      if (/** @type {Error} */ (error)?.name !== 'AbortError') console.warn('[apex-buy-box]', error);
    }
  };

  #render() {
    const main = this.#main;
    const addons = [...this.#addons.values()];

    for (const toggle of (this.closest('.shopify-section') ?? document).querySelectorAll('.apex-addons__toggle')) {
      if (!(toggle instanceof HTMLButtonElement)) continue;
      const state = this.#addons.get(Number(toggle.dataset.variantId));
      const on = Boolean(state?.selected);
      toggle.setAttribute('aria-pressed', String(on));
      if (!toggle.disabled) toggle.textContent = on ? toggle.dataset.labelAdded ?? '' : toggle.dataset.labelAdd ?? '';
    }

    const lines = /** @type {HTMLElement} */ (this.querySelector('[data-apex-lines]'));
    const template = /** @type {HTMLTemplateElement} */ (this.querySelector('[data-apex-line-template]'));
    const chosen = addons.filter((a) => a.selected && a.available);
    lines.replaceChildren(
      ...chosen.map((addon) => {
        const li = /** @type {DocumentFragment} */ (template.content.cloneNode(true));
        /** @type {HTMLElement} */ (li.querySelector('[data-name]')).textContent = addon.title;
        /** @type {HTMLElement} */ (li.querySelector('[data-price]')).textContent = this.#money(addon.priceCents);
        return li;
      })
    );

    const hasAddons = chosen.length > 0;
    lines.hidden = !hasAddons;
    /** @type {HTMLElement} */ (this.querySelector('[data-apex-total-row]')).hidden = !hasAddons;
    /** @type {HTMLElement} */ (this.querySelector('[data-apex-clear]')).hidden = !hasAddons;
    /** @type {HTMLElement} */ (this.querySelector('[data-apex-vat]')).hidden = hasAddons;
    /** @type {HTMLElement} */ (this.querySelector('[data-apex-total]')).textContent = this.#money(
      bundleTotal(main.priceCents, addons)
    );

    const submit = /** @type {HTMLButtonElement} */ (this.querySelector('[data-apex-submit]'));
    const state = submitState({ available: main.available, busy: Boolean(this.#request) || this.#navigating });
    const labels = { add: submit.dataset.labelAdd, soldOut: submit.dataset.labelSoldOut, adding: submit.dataset.labelAdding };
    submit.disabled = state.disabled;
    submit.textContent = labels[state.label] ?? '';
  }

  /** @param {SubmitEvent} event */
  #onSubmit = async (event) => {
    event.preventDefault();
    const main = this.#main;
    if (!main.available || this.#request || this.#navigating) return;

    const error = /** @type {HTMLElement} */ (this.querySelector('[data-apex-error]'));
    error.textContent = '';

    this.#request?.abort();
    const request = new AbortController();
    this.#request = request;
    this.#render();

    try {
      const response = await fetch(this.dataset.cartAddUrl ?? '/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(cartAddItems({ variantId: main.variantId, quantity: 1 }, [...this.#addons.values()])),
        signal: request.signal,
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.description || body.message || '');
      }
      this.#navigating = true;
      // Go to the "Complete your order" page when one is set, otherwise straight to the basket.
      if (this.dataset.upsellUrl) {
        const next = new URL(this.dataset.upsellUrl, window.location.origin);
        next.searchParams.set('added', String(main.variantId));
        window.location.assign(next.toString());
      } else {
        window.location.assign(this.dataset.cartUrl ?? '/cart');
      }
    } catch (err) {
      if (/** @type {Error} */ (err)?.name === 'AbortError') return;
      error.textContent = /** @type {Error} */ (err)?.message || this.dataset.errorGeneric || '';
    } finally {
      if (this.#request === request) this.#request = null;
      this.#render();
    }
  };
}

if (!customElements.get('apex-buy-box')) customElements.define('apex-buy-box', ApexBuyBox);
