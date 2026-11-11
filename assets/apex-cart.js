/**
 * <apex-cart>: Samsung-style basket.
 * - Quantity steppers and the bin call /cart/change.js, then swap in the re-rendered section
 *   (the links still work without JavaScript: /cart/change?line=N&quantity=Q redirects to /cart).
 * - "Apply" sends the voucher through Shopify's /discount/<code> route and comes back to the basket.
 * - Keeps the header basket count in step.
 */
class ApexCart extends HTMLElement {
  connectedCallback() {
    this.addEventListener('click', this.#onClick);
    this.addEventListener('keydown', this.#onKey);
  }

  disconnectedCallback() {
    this.removeEventListener('click', this.#onClick);
    this.removeEventListener('keydown', this.#onKey);
  }

  /** @param {KeyboardEvent} event */
  #onKey = (event) => {
    const target = /** @type {HTMLElement} */ (event.target);
    if (event.key === 'Enter' && target.matches?.('.apex-cart__voucher-input')) {
      event.preventDefault();
      this.#applyVoucher();
    }
  };

  /** @param {MouseEvent} event */
  #onClick = (event) => {
    const target = event.target instanceof Element ? event.target : null;
    if (target?.closest('[data-voucher-apply]')) {
      this.#applyVoucher();
      return;
    }
    const link = /** @type {HTMLAnchorElement | null} */ (target?.closest('a[data-change]'));
    if (!link) return;
    const item = link.closest('[data-line]');
    if (!item) return;
    event.preventDefault();
    this.#change(Number(item.getAttribute('data-line')), Number(link.dataset.change));
  };

  #applyVoucher() {
    const input = /** @type {HTMLInputElement | null} */ (this.querySelector('.apex-cart__voucher-input'));
    const code = input?.value.trim();
    if (!code) {
      input?.focus();
      return;
    }
    window.location.href = `/discount/${encodeURIComponent(code)}?redirect=${encodeURIComponent(window.location.pathname)}`;
  }

  /**
   * @param {number} line
   * @param {number} quantity
   */
  async #change(line, quantity) {
    if (this.classList.contains('is-busy')) return;
    this.classList.add('is-busy');
    try {
      const sectionId = this.dataset.sectionId;
      const response = await fetch(`${window.Shopify?.routes?.root || '/'}cart/change.js`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ line, quantity: Math.max(0, quantity), sections: sectionId }),
      });
      if (!response.ok) throw new Error(String(response.status));
      const cart = await response.json();
      const html = cart.sections?.[sectionId ?? ''];
      if (html) {
        const fresh = new DOMParser().parseFromString(html, 'text/html').querySelector('apex-cart');
        if (fresh) {
          this.replaceChildren(...fresh.childNodes);
          this.className = fresh.className;
        }
      } else {
        window.location.reload();
        return;
      }
      const icon = /** @type {any} */ (document.querySelector('cart-icon'));
      if (icon && typeof icon.renderCartBubble === 'function') icon.renderCartBubble(cart.item_count);
    } catch {
      window.location.reload();
    } finally {
      this.classList.remove('is-busy');
    }
  }
}

if (!customElements.get('apex-cart')) customElements.define('apex-cart', ApexCart);
