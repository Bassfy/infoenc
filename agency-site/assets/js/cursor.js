/* ============================================================
   CURSOR.JS — Custom cursor + magnetic buttons
   ============================================================ */

export class Cursor {
  constructor() {
    this.dot   = document.getElementById('cursor-dot');
    this.ring  = document.getElementById('cursor-ring');
    if (!this.dot || !this.ring) return;

    this.pos    = { x: -100, y: -100 };
    this.target = { x: -100, y: -100 };
    this.raf    = null;
    this.hidden = false;

    this._init();
  }

  _init() {
    document.addEventListener('mousemove', (e) => {
      this.target.x = e.clientX;
      this.target.y = e.clientY;
      if (this.hidden) this._show();
    });

    document.addEventListener('mouseleave', () => this._hide());
    document.addEventListener('mouseenter', () => this._show());

    document.addEventListener('mousedown', () => {
      this.ring.classList.add('is-clicking');
      this.dot.style.transform = 'translate(-50%, -50%) scale(0.5)';
    });

    document.addEventListener('mouseup', () => {
      this.ring.classList.remove('is-clicking');
      this.dot.style.transform = 'translate(-50%, -50%) scale(1)';
    });

    this._bindHoverables();
    this._loop();
  }

  _bindHoverables() {
    const hoverEls = document.querySelectorAll(
      'a, button, [data-cursor="hover"], .btn, .nav-link, .work-card, .filter-tab, .magnetic'
    );

    hoverEls.forEach(el => {
      el.addEventListener('mouseenter', () => this.ring.classList.add('is-hovering'));
      el.addEventListener('mouseleave', () => this.ring.classList.remove('is-hovering'));
    });

    const textEls = document.querySelectorAll('input, textarea');
    textEls.forEach(el => {
      el.addEventListener('mouseenter', () => this.ring.classList.add('is-text'));
      el.addEventListener('mouseleave', () => this.ring.classList.remove('is-text'));
    });
  }

  refreshHoverables() {
    this.ring.classList.remove('is-hovering', 'is-text');
    this._bindHoverables();
  }

  _hide() {
    this.hidden = true;
    this.dot.style.opacity  = '0';
    this.ring.style.opacity = '0';
  }

  _show() {
    this.hidden = false;
    this.dot.style.opacity  = '1';
    this.ring.style.opacity = '1';
  }

  _loop() {
    /* Dot follows immediately, ring lags slightly */
    this.pos.x += (this.target.x - this.pos.x) * 0.12;
    this.pos.y += (this.target.y - this.pos.y) * 0.12;

    this.dot.style.left = `${this.target.x}px`;
    this.dot.style.top  = `${this.target.y}px`;
    this.ring.style.left = `${this.pos.x}px`;
    this.ring.style.top  = `${this.pos.y}px`;

    this.raf = requestAnimationFrame(() => this._loop());
  }

  destroy() {
    cancelAnimationFrame(this.raf);
  }
}

/* ── Magnetic Buttons ── */
export function initMagneticButtons() {
  const magnetics = document.querySelectorAll('.magnetic');

  magnetics.forEach(el => {
    const inner = el.querySelector('.magnetic-inner') || el;
    let bounds;

    el.addEventListener('mouseenter', () => {
      bounds = el.getBoundingClientRect();
    });

    el.addEventListener('mousemove', (e) => {
      if (!bounds) bounds = el.getBoundingClientRect();
      const cx = bounds.left + bounds.width  / 2;
      const cy = bounds.top  + bounds.height / 2;
      const dx = (e.clientX - cx) * 0.4;
      const dy = (e.clientY - cy) * 0.4;
      inner.style.transform = `translate(${dx}px, ${dy}px)`;
    });

    el.addEventListener('mouseleave', () => {
      inner.style.transform = 'translate(0px, 0px)';
      bounds = null;
    });
  });
}
