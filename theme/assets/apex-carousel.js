/**
 * <apex-carousel>: wires the previous/next arrows and the progress bar to a horizontally
 * scrolling `[data-track]`. Scrolling itself is native (touch, trackpad, keyboard).
 */
class ApexCarousel extends HTMLElement {
  #controller = new AbortController();
  #frame = 0;

  connectedCallback() {
    const { signal } = this.#controller;
    this.addEventListener('click', this.#onClick, { signal });
    this.#track?.addEventListener('scroll', this.#schedule, { passive: true, signal });
    window.addEventListener('resize', this.#schedule, { passive: true, signal });
    this.#update();
  }

  disconnectedCallback() {
    this.#controller.abort();
    this.#controller = new AbortController();
    cancelAnimationFrame(this.#frame);
  }

  get #track() {
    return /** @type {HTMLElement | null} */ (this.querySelector('[data-track]'));
  }

  /** @param {MouseEvent} event */
  #onClick = (event) => {
    const target = event.target instanceof Element ? event.target : null;
    const track = this.#track;
    if (!target || !track) return;
    const direction = target.closest('[data-next]') ? 1 : target.closest('[data-prev]') ? -1 : 0;
    if (!direction) return;
    const item = track.firstElementChild;
    const step = item ? item.getBoundingClientRect().width + 12 : track.clientWidth;
    track.scrollBy({ left: direction * step, behavior: 'smooth' });
  };

  #schedule = () => {
    if (!this.#frame) this.#frame = requestAnimationFrame(() => this.#update());
  };

  #update() {
    this.#frame = 0;
    const track = this.#track;
    if (!track) return;
    const max = track.scrollWidth - track.clientWidth;
    const size = track.scrollWidth ? (track.clientWidth / track.scrollWidth) * 100 : 100;
    const offset = max > 0 ? (track.scrollLeft / max) * (100 - size) : 0;
    this.style.setProperty('--apex-progress-size', `${Math.min(100, size)}%`);
    this.style.setProperty('--apex-progress-offset', `${offset}%`);
    const prev = /** @type {HTMLButtonElement | null} */ (this.querySelector('[data-prev]'));
    const next = /** @type {HTMLButtonElement | null} */ (this.querySelector('[data-next]'));
    if (prev) prev.disabled = track.scrollLeft <= 1;
    if (next) next.disabled = track.scrollLeft >= max - 1;
    const controls = /** @type {HTMLElement | null} */ (this.querySelector('.apex-pcarousel__controls'));
    if (controls) controls.hidden = max <= 1;
    // Lets centred carousels centre their cards when everything fits without scrolling.
    this.toggleAttribute('data-fits', max <= 1);
  }
}

if (!customElements.get('apex-carousel')) customElements.define('apex-carousel', ApexCarousel);
