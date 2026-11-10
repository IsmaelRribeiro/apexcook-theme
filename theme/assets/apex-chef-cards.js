/**
 * <apex-chef-cards>: expanding "+" cards (Samsung Watch Ultra2 style) with dot navigation.
 * Used by the chef cards and feature hero sections.
 */
if (!customElements.get('apex-chef-cards')) {
  customElements.define(
    'apex-chef-cards',
    class extends HTMLElement {
      #frame = 0;

      connectedCallback() {
        this.track = this.querySelector('[data-track]');
        this.cards = [...this.querySelectorAll('.apex-chefs__card')];
        this.dots = [...this.querySelectorAll('.apex-chefs__dot')];
        this.addEventListener('click', this.#onClick);
        this.addEventListener('keydown', this.#onKey);
        this.track?.addEventListener('scroll', this.#schedule, { passive: true });
      }

      disconnectedCallback() {
        this.removeEventListener('click', this.#onClick);
        this.removeEventListener('keydown', this.#onKey);
        this.track?.removeEventListener('scroll', this.#schedule);
      }

      #onClick = (event) => {
        const target = event.target instanceof Element ? event.target : null;
        const toggle = target?.closest('.apex-chefs__toggle');
        if (toggle) {
          const card = toggle.closest('.apex-chefs__card');
          this.#set(card, !card.classList.contains('is-open'));
          return;
        }
        const dot = target?.closest('.apex-chefs__dot');
        if (dot) this.#scrollTo(this.cards[Number(dot.dataset.index)]);
      };

      #onKey = (event) => {
        if (event.key !== 'Escape') return;
        const open = this.querySelector('.apex-chefs__card.is-open');
        if (open) {
          this.#set(open, false);
          open.querySelector('.apex-chefs__toggle')?.focus();
        }
      };

      #set(card, open) {
        this.cards.forEach((other) => {
          if (other !== card && other.classList.contains('is-open')) this.#apply(other, false);
        });
        this.#apply(card, open);
        this.toggleAttribute('data-open', open);
        // Wait for the width transition, then bring the card fully into view.
        window.setTimeout(() => this.#scrollTo(card), open ? 60 : 0);
        window.setTimeout(() => this.#scrollTo(card), 520);
      }

      #apply(card, open) {
        card.classList.toggle('is-open', open);
        const toggle = card.querySelector('.apex-chefs__toggle');
        if (!toggle) return;
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? toggle.dataset.labelClose : toggle.dataset.labelOpen);
      }

      #scrollTo(card) {
        if (!card || !this.track) return;
        const left = card.offsetLeft - this.track.offsetLeft - (this.track.clientWidth - card.offsetWidth) / 2;
        this.track.scrollTo({ left: Math.max(0, left), behavior: 'smooth' });
      }

      #schedule = () => {
        if (this.#frame) return;
        this.#frame = requestAnimationFrame(() => {
          this.#frame = 0;
          const center = this.track.scrollLeft + this.track.clientWidth / 2;
          let best = 0;
          let distance = Infinity;
          this.cards.forEach((card, index) => {
            const d = Math.abs(card.offsetLeft - this.track.offsetLeft + card.offsetWidth / 2 - center);
            if (d < distance) {
              distance = d;
              best = index;
            }
          });
          const atEnd = this.track.scrollLeft >= this.track.scrollWidth - this.track.clientWidth - 2;
          if (atEnd) best = this.cards.length - 1;
          if (this.track.scrollLeft <= 2) best = 0;
          this.dots.forEach((dot, index) => dot.classList.toggle('is-active', index === best));
        });
      };
    }
  );
}
