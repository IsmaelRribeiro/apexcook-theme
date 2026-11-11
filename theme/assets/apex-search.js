/**
 * ApexCook search results (Samsung style).
 * <apex-search-results>: tab counts, auto-submitting filters, mobile filter drawer, "View more".
 * <apex-search-card>: option chips swap the variant (price, SKU, Buy now, Learn more link).
 */

const DESKTOP = window.matchMedia('(min-width: 990px)');

class ApexSearchResults extends HTMLElement {
  connectedCallback() {
    // Searches from links without a type mix products, recipes and pages: default to the Products tab.
    const url = new URL(window.location.href);
    if (url.searchParams.get('q') && !url.searchParams.get('type')) {
      url.searchParams.set('type', 'product');
      window.location.replace(url.toString());
      return;
    }

    this.form = this.querySelector('[data-filters-form]');
    this.drawer = this.querySelector('#ApexSearchFilters');

    this.addEventListener('change', (event) => this.onChange(event));

    // Collection filter pills: one dropdown open at a time, closed by an outside click or Escape.
    this.addEventListener(
      'toggle',
      (event) => {
        const pill = event.target;
        if (!(pill instanceof HTMLDetailsElement) || !pill.matches('[data-pill]') || !pill.open || !DESKTOP.matches) return;
        this.querySelectorAll('[data-pill][open]').forEach((other) => {
          if (other !== pill) other.removeAttribute('open');
        });
      },
      true
    );
    document.addEventListener('click', (event) => {
      if (!DESKTOP.matches) return;
      const inside = event.target instanceof Element && event.target.closest('[data-pill]');
      this.querySelectorAll('[data-pill][open]').forEach((pill) => {
        if (pill !== inside) pill.removeAttribute('open');
      });
    });
    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return;
      this.querySelectorAll('[data-pill][open]').forEach((pill) => pill.removeAttribute('open'));
    });
    this.addEventListener('click', (event) => this.onClick(event));
    this.form?.addEventListener('submit', () => this.cleanForm());
    this.drawer?.addEventListener('click', (event) => {
      if (event.target === this.drawer && this.drawer.open) this.drawer.close();
    });
    DESKTOP.addEventListener('change', () => {
      if (DESKTOP.matches && this.drawer?.open) this.drawer.close();
    });

    this.loadCounts();
  }

  /** @param {Event} event */
  onChange(event) {
    const target = /** @type {HTMLElement} */ (event.target);
    if (target.matches('[data-autosubmit]') && this.form) {
      this.form.requestSubmit();
    }
  }

  /** @param {MouseEvent} event */
  onClick(event) {
    const target = /** @type {HTMLElement} */ (event.target);

    if (target.closest('[data-open-filters]') && this.drawer && !DESKTOP.matches) {
      this.drawer.showModal();
      return;
    }

    if (target.closest('[data-close-filters]') && this.drawer?.open) {
      this.drawer.close();
      return;
    }

    const more = target.closest('[data-view-more]');
    if (more) {
      const list = more.previousElementSibling;
      const expanded = more.getAttribute('aria-expanded') === 'true';
      list?.querySelectorAll('[data-extra]').forEach((item) => {
        item.hidden = expanded;
      });
      more.setAttribute('aria-expanded', String(!expanded));
      more.querySelector('[data-more-label]')?.toggleAttribute('hidden', !expanded);
      more.querySelector('[data-less-label]')?.toggleAttribute('hidden', expanded);
    }
  }

  /** Drop empty price fields so the URL stays clean. */
  cleanForm() {
    if (!this.form) return;
    for (const element of Array.from(this.form.elements)) {
      if (element instanceof HTMLInputElement && element.type === 'number') {
        element.disabled = element.value === '';
      }
    }
  }

  async loadCounts() {
    const terms = new URL(window.location.href).searchParams.get('q');
    if (!terms) return;
    const active = this.dataset.activeType;
    const slots = this.querySelectorAll('[data-count]');

    await Promise.all(
      Array.from(slots).map(async (slot) => {
        const type = /** @type {HTMLElement} */ (slot).dataset.count;
        if (!type || type === active) return;
        try {
          const url = new URL(window.Shopify?.routes?.root ? `${window.Shopify.routes.root}search` : '/search', window.location.origin);
          url.searchParams.set('q', terms);
          url.searchParams.set('type', type);
          url.searchParams.set('options[prefix]', 'last');
          url.searchParams.set('section_id', 'apex-search-count');
          const response = await fetch(url.toString());
          if (!response.ok) return;
          const html = await response.text();
          const count = new DOMParser().parseFromString(html, 'text/html').querySelector('[data-search-count]');
          if (count) slot.textContent = `(${count.textContent?.trim()})`;
        } catch {
          // Counts are a nicety; the tabs still work without them.
        }
      })
    );
  }
}

class ApexSearchCard extends HTMLElement {
  connectedCallback() {
    this.addEventListener('click', (event) => {
      const chip = /** @type {HTMLElement} */ (event.target).closest('.apex-sr__chip');
      if (!chip) return;
      const fieldset = chip.closest('fieldset');
      fieldset?.querySelectorAll('.apex-sr__chip').forEach((other) => {
        other.setAttribute('aria-pressed', String(other === chip));
      });
      const colourName = fieldset?.querySelector('[data-colour-name]');
      if (colourName) colourName.textContent = chip.dataset.value || '';
      this.update();
    });
    this.addEventListener('change', (event) => {
      if (/** @type {HTMLElement} */ (event.target).matches('[data-option-select]')) this.update();
    });
  }

  update() {
    const selected = Array.from(this.querySelectorAll('fieldset[data-option-index]')).map(
      (fieldset) =>
        /** @type {HTMLElement | null} */ (fieldset.querySelector('[aria-pressed="true"]'))?.dataset.value ??
        /** @type {HTMLSelectElement | null} */ (fieldset.querySelector('[data-option-select]'))?.value
    );
    const key = selected.join('|');
    const template = Array.from(this.querySelectorAll('template[data-variant]')).find(
      (item) => /** @type {HTMLTemplateElement} */ (item).dataset.options === key
    );
    if (!(template instanceof HTMLTemplateElement)) return;

    const { variant, available, sku, url } = template.dataset;
    const price = this.querySelector('[data-price]');
    if (price) price.replaceChildren(template.content.cloneNode(true));

    const skuEl = /** @type {HTMLElement | null} */ (this.querySelector('[data-sku]'));
    if (skuEl) {
      skuEl.textContent = sku || '';
      skuEl.hidden = !sku;
    }

    const idInput = /** @type {HTMLInputElement | null} */ (this.querySelector('[data-variant-id]'));
    if (idInput && variant) idInput.value = variant;

    const returnTo = /** @type {HTMLInputElement | null} */ (this.querySelector('[data-return-to]'));
    if (returnTo && variant && this.dataset.upsellUrl) returnTo.value = `${this.dataset.upsellUrl}?added=${variant}`;

    const buy = /** @type {HTMLButtonElement | null} */ (this.querySelector('[data-buy]'));
    if (buy) {
      const isAvailable = available === 'true';
      buy.disabled = !isAvailable;
      buy.textContent = isAvailable ? buy.dataset.labelBuy || buy.textContent : buy.dataset.labelSoldOut || buy.textContent;
    }

    const learn = /** @type {HTMLAnchorElement | null} */ (this.querySelector('[data-learn]'));
    if (learn && url) learn.href = url;
  }
}

if (!customElements.get('apex-search-results')) customElements.define('apex-search-results', ApexSearchResults);
if (!customElements.get('apex-search-card')) customElements.define('apex-search-card', ApexSearchCard);
