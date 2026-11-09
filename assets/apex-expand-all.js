/**
 * <apex-expand-all>: wraps a list of <details> and a button[data-expand-all] that opens or
 * closes all of them. Button text swaps between data-label-expand / data-label-collapse.
 */
class ApexExpandAll extends HTMLElement {
  #controller = new AbortController();

  connectedCallback() {
    const { signal } = this.#controller;
    this.addEventListener('click', this.#onClick, { signal });
    this.addEventListener('toggle', () => this.#sync(), { capture: true, signal });
    this.#sync();
  }

  disconnectedCallback() {
    this.#controller.abort();
    this.#controller = new AbortController();
  }

  get #items() {
    return [...this.querySelectorAll('details')];
  }

  get #button() {
    return this.querySelector('button[data-expand-all]');
  }

  /** @param {MouseEvent} event */
  #onClick = (event) => {
    const button = this.#button;
    if (!button || !(event.target instanceof Node) || !button.contains(event.target)) return;
    const open = !this.#items.every((d) => d.open);
    for (const details of this.#items) details.open = open;
    this.#sync();
  };

  #sync() {
    const button = this.#button;
    if (!button) return;
    const allOpen = this.#items.length > 0 && this.#items.every((d) => d.open);
    button.textContent = allOpen ? button.dataset.labelCollapse ?? '' : button.dataset.labelExpand ?? '';
    button.setAttribute('aria-expanded', String(allOpen));
  }
}

if (!customElements.get('apex-expand-all')) customElements.define('apex-expand-all', ApexExpandAll);
