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
    this.#update(this.#page + (button.dataset.page === 'next' ? 1 : -1), false);
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
        const pct = count ? Math.round((n / count) * 100) : 0;
        li.innerHTML = `<span>${stars}.0</span><span class="apex-reviews__bar-track"><span class="apex-reviews__bar-fill"></span></span><span class="apex-reviews__bar-pct"><strong>${pct}%</strong> (${n})</span>`;
        /** @type {HTMLElement} */ (li.querySelector('.apex-reviews__bar-fill')).style.width = `${pct}%`;
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
    const perPage = Number(this.dataset.perPage) || 10;
    const result = paginate(sorted, page, perPage);
    this.#page = result.page;

    // "View more": show every page up to the current one (Samsung-style list that grows).
    const shown = sorted.slice(0, result.page * perPage);
    const list = this.querySelector('[data-apex-list]');
    list?.replaceChildren(...shown.map((review) => this.#item(review)));

    const pager = /** @type {HTMLElement | null} */ (this.querySelector('[data-apex-pager]'));
    if (pager) pager.hidden = result.page >= result.totalPages;

    const status = this.querySelector('[data-apex-status]');
    if (status && announce) {
      status.textContent = filtered.length === 1 ? this.dataset.tResultsOne ?? '' : this.#t('tResults', { COUNT: filtered.length });
    }
  }

  /** @param {import('./apex-reviews.js').Review & {displayDate?: string, example?: boolean}} review */
  #item(review) {
    const li = document.createElement('li');
    li.className = 'apex-reviews__item';

    const aside = document.createElement('div');
    const author = document.createElement('p');
    author.className = 'apex-reviews__author';
    const avatar = document.createElement('span');
    avatar.className = 'apex-reviews__avatar';
    avatar.setAttribute('aria-hidden', 'true');
    avatar.innerHTML =
      '<svg width="16" height="16" viewBox="0 0 256 256" fill="currentColor"><path d="M230.92 212c-15.23-26.33-38.7-45.21-66.09-54.16a72 72 0 1 0-73.66 0C63.78 166.78 40.31 185.66 25.08 212a8 8 0 1 0 13.85 8c18.84-32.56 52.14-52 89.07-52s70.23 19.44 89.07 52a8 8 0 1 0 13.85-8ZM72 96a56 56 0 1 1 56 56 56.06 56.06 0 0 1-56-56Z"/></svg>';
    author.append(avatar, document.createTextNode(review.author));
    const date = document.createElement('p');
    date.className = 'apex-reviews__meta';
    date.textContent = review.displayDate || review.date;
    aside.append(author, date);
    if (review.size) {
      const size = document.createElement('p');
      size.className = 'apex-reviews__variant';
      size.textContent = review.size;
      aside.append(size);
    }

    const main = document.createElement('div');
    const rating = document.createElement('p');
    rating.className = 'apex-reviews__rating';
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
    const number = document.createElement('span');
    number.setAttribute('aria-hidden', 'true');
    number.textContent = String(review.rating);
    rating.append(stars, number);
    if (review.example) {
      const badge = document.createElement('span');
      badge.className = 'apex-reviews__badge';
      badge.textContent = this.dataset.tExample ?? 'Example';
      rating.append(badge);
    }
    main.append(rating);

    if (review.title) {
      const title = document.createElement('h3');
      title.className = 'apex-reviews__title';
      title.textContent = review.title;
      main.append(title);
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
    const source = document.createElement('p');
    source.className = 'apex-reviews__source';
    source.textContent = this.#t('tSourceDate', { SOURCE: review.source });
    main.append(source);

    li.append(aside, main);
    return li;
  }
}

if (!customElements.get('apex-reviews-list')) customElements.define('apex-reviews-list', ApexReviewsList);
