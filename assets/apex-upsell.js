/**
 * <apex-upsell>: the "Complete your order" page.
 * - Shows the bar line for the item that was just added (?added=<variant id>).
 * - Card "Add" buttons add to the basket in place (no page change), then refresh the
 *   subtotal, item count and the header basket bubble.
 * - Tabs jump to their row and follow the scroll position.
 */
class ApexUpsell extends HTMLElement {
  #controller = new AbortController();

  connectedCallback() {
    const { signal } = this.#controller;
    this.#showAdded();
    this.addEventListener('submit', this.#onSubmit, { signal });
    this.#watchTabs();
  }

  disconnectedCallback() {
    this.#controller.abort();
    this.#controller = new AbortController();
    this.observer?.disconnect();
  }

  #showAdded() {
    const added = new URL(window.location.href).searchParams.get('added');
    if (!added) return;
    const lines = this.querySelectorAll('[data-added-variant]');
    const match = Array.from(lines).find((line) => /** @type {HTMLElement} */ (line).dataset.addedVariant === added);
    if (!match) return;
    lines.forEach((line) => {
      /** @type {HTMLElement} */ (line).hidden = line !== match;
    });
  }

  /** @param {SubmitEvent} event */
  #onSubmit = async (event) => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement) || !form.matches('.apex-sr__actions')) return;
    event.preventDefault();

    const button = /** @type {HTMLButtonElement | null} */ (form.querySelector('[data-buy]'));
    const card = form.closest('apex-search-card');
    const error = /** @type {HTMLElement | null} */ (card?.querySelector('[data-error]') ?? null);
    const id = Number(new FormData(form).get('id'));
    if (!button || !id || button.disabled) return;

    button.disabled = true;
    button.textContent = this.dataset.labelAdding || '…';
    if (error) error.hidden = true;

    try {
      const response = await fetch(this.dataset.cartAddUrl || '/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ items: [{ id, quantity: 1 }] }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.description || body.message || '');
      }
      button.textContent = `${this.dataset.labelAdded || 'Added'} ✓`;
      button.setAttribute('data-added', '');
      this.#announce(`${this.dataset.labelAdded || 'Added'}: ${card?.querySelector('.apex-sr__name')?.textContent?.trim() ?? ''}`);
      await this.#refreshTotals();
    } catch (err) {
      button.disabled = false;
      button.textContent = this.dataset.labelAdd || 'Add';
      if (error) {
        error.textContent = /** @type {Error} */ (err)?.message || 'Something went wrong. Please try again.';
        error.hidden = false;
      }
    }
  };

  async #refreshTotals() {
    try {
      const response = await fetch(this.dataset.cartJsUrl || '/cart.js', { headers: { Accept: 'application/json' } });
      const cart = await response.json();
      const money = new Intl.NumberFormat(document.documentElement.lang || 'en-GB', {
        style: 'currency',
        currency: cart.currency || 'GBP',
      });
      const subtotal = this.querySelector('[data-subtotal]');
      if (subtotal) subtotal.textContent = money.format(cart.total_price / 100);
      const count = this.querySelector('[data-count]');
      if (count) count.textContent = `(${cart.item_count} ${cart.item_count === 1 ? 'item' : 'items'})`;
      const icon = /** @type {any} */ (document.querySelector('cart-icon'));
      if (icon && typeof icon.renderCartBubble === 'function') icon.renderCartBubble(cart.item_count);
    } catch {
      // Totals are refreshed again on the basket page.
    }
  }

  /** @param {string} message */
  #announce(message) {
    const status = this.querySelector('[data-status]');
    if (status) status.textContent = message;
  }

  #watchTabs() {
    const tabs = Array.from(this.querySelectorAll('.apex-up__tab'));
    if (!tabs.length || !('IntersectionObserver' in window)) return;
    this.observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (!visible.length) return;
        const id = visible[0].target.id;
        tabs.forEach((tab) => {
          if (tab.getAttribute('href') === `#${id}`) tab.setAttribute('aria-current', 'true');
          else tab.removeAttribute('aria-current');
        });
      },
      { rootMargin: '-40% 0px -55% 0px' }
    );
    this.querySelectorAll('[data-tab-target]').forEach((row) => this.observer?.observe(row));
  }
}

if (!customElements.get('apex-upsell')) customElements.define('apex-upsell', ApexUpsell);
