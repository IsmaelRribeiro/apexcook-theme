import { filterReviews, sortReviews, ratingSummary, paginate } from '@theme/apex-reviews';

/**
 * <apex-reviews-list>: renders the distribution bars and the filtered, sorted, paginated review list
 * from the JSON emitted by sections/apex-reviews.liquid.
 */
class ApexReviewsList extends HTMLElement {
  /** @type {import('./apex-reviews.js').Review[]} */
  #reviews = [];
  #page = 1;
  #controller = new AbortController();

  connectedCallback() {
    const data = this.querySelector('script[data-apex-reviews]');
    if (!data) return;
    try {
      this.#reviews = JSON.parse(data.textContent || '[]');
    } catch {
      this.#reviews = [];
    }
    const { signal } = this.#controller;
    this.addEventListener('change', () => this.#update(1), { signal });
    this.addEventListener('click', this.#onClick, { signal });
    this.#renderBars();
    this.#update(1, false);
  }

  disconnectedCallback() {
    this.#controller.abort();
    this.#controller = new AbortController();
  }

  /** @param {string} key @param {Record<string, string|number>} values */
  #t(key, values) {
    let text = this.dataset[key] ?? '';
    for (const [name, value] of Object.entries(values)) text = text.replace(`__${name}__`, () => String(value));
    return text;
  }

  /** @param {MouseEvent} event */
  #onClick = (event) => {
    const button = event.target instanceof Element ? event.target.closest('[data-page]') : null;
    if (!(button instanceof HTMLButtonElement)) return;
    this.#update(this.#page + (button.dataset.page === 'next' ? 1 : -1));
  };

  #renderBars() {
    const bars = this.querySelector('[data-apex-bars]');
    if (!bars) return;
    const { distribution, count } = ratingSummary(this.#reviews);
    bars.replaceChildren(
      ...[5, 4, 3, 2, 1].map((stars) => {
        const n = distribution[/** @type {1|2|3|4|5} */ (stars)];
        const li = document.createElement('li');
        li.className = 'apex-reviews__bar';
        li.innerHTML = `<span>${stars}★</span><span class="apex-reviews__bar-track"><span class="apex-reviews__bar-fill"></span></span><span>${n}</span>`;
        /** @type {HTMLElement} */ (li.querySelector('.apex-reviews__bar-fill')).style.width = `${count ? (n / count) * 100 : 0}%`;
        return li;
      })
    );
  }

  /** @param {number} page @param {boolean} [announce] */
  #update(page, announce = true) {
    const value = (/** @type {string} */ selector) =>
      /** @type {HTMLSelectElement | null} */ (this.querySelector(selector))?.value ?? '';
    const photos = /** @type {HTMLInputElement | null} */ (this.querySelector('[data-filter="photos"]'));
    const filtered = filterReviews(this.#reviews, {
      rating: Number(value('[data-filter="rating"]')) || undefined,
      size: value('[data-filter="size"]') || undefined,
      withPhotos: Boolean(photos?.checked),
    });
    const sorted = sortReviews(filtered, /** @type {'newest'|'highest'|'lowest'} */ (value('[data-sort]') || 'newest'));
    const result = paginate(sorted, page, Number(this.dataset.perPage) || 10);
    this.#page = result.page;

    const list = this.querySelector('[data-apex-list]');
    list?.replaceChildren(...result.items.map((review) => this.#item(review)));

    const pager = /** @type {HTMLElement | null} */ (this.querySelector('[data-apex-pager]'));
    if (pager) {
      pager.hidden = result.totalPages <= 1;
      /** @type {HTMLElement} */ (pager.querySelector('[data-apex-page]')).textContent = this.#t('tPage', {
        PAGE: result.page,
        TOTAL: result.totalPages,
      });
      /** @type {HTMLButtonElement} */ (pager.querySelector('[data-page="prev"]')).disabled = result.page <= 1;
      /** @type {HTMLButtonElement} */ (pager.querySelector('[data-page="next"]')).disabled = result.page >= result.totalPages;
    }

    const status = this.querySelector('[data-apex-status]');
    if (status && announce) {
      status.textContent = filtered.length === 1 ? this.dataset.tResultsOne ?? '' : this.#t('tResults', { COUNT: filtered.length });
    }
  }

  /** @param {import('./apex-reviews.js').Review & {displayDate?: string}} review */
  #item(review) {
    const li = document.createElement('li');
    li.className = 'apex-reviews__item';

    const aside = document.createElement('div');
    const stars = document.createElement('span');
    stars.className = 'apex-stars';
    stars.setAttribute('role', 'img');
    stars.setAttribute('aria-label', this.#t('tRating', { RATING: review.rating }));
    const fill = document.createElement('span');
    fill.className = 'apex-stars__fill';
    fill.setAttribute('aria-hidden', 'true');
    fill.textContent = '★★★★★';
    fill.style.setProperty('--apex-stars', `${review.rating * 20}%`);
    stars.append(fill);
    const author = document.createElement('p');
    author.textContent = review.author;
    const meta = document.createElement('p');
    meta.className = 'apex-reviews__meta';
    meta.textContent = this.#t('tSourceDate', { SOURCE: review.source, DATE: review.displayDate || review.date });
    aside.append(stars, author, meta);

    const main = document.createElement('div');
    if (review.title) {
      const title = document.createElement('h3');
      title.className = 'apex-reviews__title';
      title.textContent = review.title;
      main.append(title);
    }
    if (review.size) {
      const size = document.createElement('p');
      size.className = 'apex-reviews__meta';
      size.textContent = review.size;
      main.append(size);
    }
    const body = document.createElement('p');
    body.className = 'apex-reviews__body';
    body.textContent = review.body;
    main.append(body);
    if (review.photos?.length) {
      const photos = document.createElement('div');
      photos.className = 'apex-reviews__photos';
      for (const src of review.photos) {
        const img = document.createElement('img');
        img.src = src;
        img.alt = '';
        img.loading = 'lazy';
        photos.append(img);
      }
      main.append(photos);
    }

    li.append(aside, main);
    return li;
  }
}

if (!customElements.get('apex-reviews-list')) customElements.define('apex-reviews-list', ApexReviewsList);
