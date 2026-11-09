/**
 * <apex-card-cta>: on the basket page, adds single-variant products without leaving the page.
 * Uses Shopify.actions.updateCart so Horizon's cart section refreshes itself; falls back to the
 * native form post (which lands on /cart) when the action is unavailable or fails.
 */
class ApexCardCta extends HTMLElement {
  #controller = new AbortController();

  connectedCallback() {
    this.addEventListener('submit', this.#onSubmit, { signal: this.#controller.signal });
  }

  disconnectedCallback() {
    this.#controller.abort();
    this.#controller = new AbortController();
  }

  /** @param {SubmitEvent} event */
  #onSubmit = async (event) => {
    const updateCart = window.Shopify?.actions?.updateCart;
    const template = document.querySelector('main[data-template]')?.getAttribute('data-template') ?? '';
    if (!template.startsWith('cart') || typeof updateCart !== 'function') return;

    const form = event.target;
    if (!(form instanceof HTMLFormElement)) return;
    event.preventDefault();

    const button = form.querySelector('button[type="submit"]');
    const id = new FormData(form).get('id');
    if (button instanceof HTMLButtonElement) button.disabled = true;

    try {
      const result = await updateCart({ lines: [{ merchandiseId: String(id), quantity: 1 }] });
      if (result?.userErrors?.length) throw new Error(result.userErrors[0].message);
    } catch {
      form.submit();
      return;
    }
    if (button instanceof HTMLButtonElement && button.isConnected) button.disabled = false;
  };
}

if (!customElements.get('apex-card-cta')) customElements.define('apex-card-cta', ApexCardCta);
