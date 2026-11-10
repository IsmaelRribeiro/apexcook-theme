/**
 * <apex-mobile-nav>: Samsung-style full-screen mobile menu.
 * Root view lists top-level links; [data-open] slides in a level view,
 * [data-back] returns, [data-close] closes, [data-search] jumps to the search field.
 */
class ApexMobileNav extends HTMLElement {
  connectedCallback() {
    this.dialog = this.querySelector('dialog');
    this.toggle = this.querySelector('.apex-mnav__toggle');
    if (!this.dialog || !this.toggle) return;

    this.onToggle = () => this.open();
    this.onClick = (event) => this.handleClick(event);
    this.onClose = () => this.reset();
    this.onDesktop = (event) => {
      if (event.matches && this.dialog.open) this.dialog.close();
    };

    this.toggle.addEventListener('click', this.onToggle);
    this.dialog.addEventListener('click', this.onClick);
    this.dialog.addEventListener('close', this.onClose);
    this.desktopQuery = window.matchMedia('(min-width: 990px)');
    this.desktopQuery.addEventListener('change', this.onDesktop);
  }

  disconnectedCallback() {
    this.toggle?.removeEventListener('click', this.onToggle);
    this.dialog?.removeEventListener('click', this.onClick);
    this.dialog?.removeEventListener('close', this.onClose);
    this.desktopQuery?.removeEventListener('change', this.onDesktop);
  }

  open() {
    if (this.dialog.open) return;
    this.dialog.showModal();
    this.toggle.setAttribute('aria-expanded', 'true');
  }

  reset() {
    this.toggle.setAttribute('aria-expanded', 'false');
    this.show(this.root());
    this.toggle.focus();
  }

  root() {
    return this.dialog.querySelector('[data-view="root"]');
  }

  /**
   * @param {HTMLElement} view
   * @param {HTMLElement} [focusTarget]
   */
  show(view, focusTarget) {
    for (const other of this.dialog.querySelectorAll('[data-view]')) {
      const active = other === view;
      other.classList.toggle('is-active', active);
      if (other.dataset.view !== 'root') other.hidden = !active;
    }
    for (const opener of this.dialog.querySelectorAll('[data-open]')) {
      opener.setAttribute('aria-expanded', String(view.id === opener.dataset.open));
    }
    (focusTarget || view.querySelector('button, a, input'))?.focus({ preventScroll: true });
  }

  /** @param {MouseEvent} event */
  handleClick(event) {
    const target = /** @type {HTMLElement} */ (event.target);

    // Click on the backdrop area of the dialog itself
    if (target === this.dialog) {
      this.dialog.close();
      return;
    }

    const control = target.closest('[data-open], [data-back], [data-close], [data-search]');
    if (!control) return;

    if (control.hasAttribute('data-close')) {
      this.dialog.close();
    } else if (control.hasAttribute('data-open')) {
      const panel = this.dialog.querySelector(`#${CSS.escape(control.dataset.open)}`);
      if (panel) this.show(panel);
    } else if (control.hasAttribute('data-back')) {
      const panel = control.closest('[data-view]');
      const opener = this.dialog.querySelector(`[data-open="${panel?.id}"]`);
      this.show(this.root(), opener);
    } else if (control.hasAttribute('data-search')) {
      this.show(this.root(), this.dialog.querySelector('.apex-mnav__search-input'));
    }
  }
}

if (!customElements.get('apex-mobile-nav')) {
  customElements.define('apex-mobile-nav', ApexMobileNav);
}
