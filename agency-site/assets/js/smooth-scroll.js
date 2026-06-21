/* ============================================================
   SMOOTH-SCROLL.JS — Lenis smooth scroll integration
   ============================================================ */

export class SmoothScroll {
  constructor() {
    this.lenis  = null;
    this.raf    = null;
    this._init();
  }

  _init() {
    if (typeof Lenis === 'undefined') return;

    this.lenis = new Lenis({
      duration:        1.2,
      easing:          t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction:       'vertical',
      gestureDirection:'vertical',
      smooth:          true,
      smoothTouch:     false,
      touchMultiplier: 2,
    });

    /* Feed Lenis into GSAP ScrollTrigger */
    if (typeof gsap !== 'undefined' && gsap.ticker) {
      gsap.ticker.add(time => {
        this.lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    } else {
      this._fallbackLoop();
    }

    /* Scroll progress indicator */
    this.lenis.on('scroll', ({ progress }) => {
      const bar = document.getElementById('scroll-progress');
      if (bar) bar.style.width = `${progress * 100}%`;

      const navbar = document.getElementById('navbar');
      if (navbar) {
        navbar.classList.toggle('scrolled', this.lenis.scroll > 60);
      }
    });
  }

  _fallbackLoop() {
    const raf = (time) => {
      this.lenis.raf(time);
      this.raf = requestAnimationFrame(raf);
    };
    this.raf = requestAnimationFrame(raf);
  }

  scrollTo(target, options = {}) {
    if (!this.lenis) return;
    this.lenis.scrollTo(target, { duration: 1.2, ...options });
  }

  stop()  { this.lenis?.stop(); }
  start() { this.lenis?.start(); }

  destroy() {
    cancelAnimationFrame(this.raf);
    this.lenis?.destroy();
  }

  get instance() { return this.lenis; }
}
