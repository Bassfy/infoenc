/* ============================================================
   PAGE-TRANSITIONS.JS — Barba.js transitions
   ============================================================ */

import { playHeroEntrance, initAnimations, refreshScrollTrigger } from './gsap-animations.js';
import { WebGLScene } from './webgl-scene.js';
import { initMagneticButtons } from './cursor.js';

let webgl = null;

export function initPageTransitions(smoothScroll, cursor) {
  if (typeof barba === 'undefined') return;

  barba.init({
    debug:         false,
    preventRunning: true,
    transitions: [{
      name:     'slide-transition',
      async:    true,

      async leave(data) {
        smoothScroll?.stop();
        const tl = gsap.timeline();
        tl.to('#page-transition .transition-panel', {
          scaleY:   1,
          duration: 0.6,
          ease:     'power4.inOut',
          stagger:  0.06,
          transformOrigin: 'bottom',
        });
        await tl.then();
      },

      async enter(data) {
        gsap.set('#page-transition .transition-panel', { transformOrigin: 'top' });
        const tl = gsap.timeline();
        tl.to('#page-transition .transition-panel', {
          scaleY:   0,
          duration: 0.6,
          ease:     'power4.inOut',
          stagger:  0.04,
          onComplete() {
            gsap.set('#page-transition .transition-panel', {
              transformOrigin: 'bottom',
              scaleY: 0,
            });
          },
        });
        await tl.then();
      },

      async afterEnter(data) {
        /* Update active nav link */
        _updateNav(data.next.url.path);

        /* Re-init page-specific stuff */
        _teardownWebGL();
        initAnimations();
        refreshScrollTrigger();
        initMagneticButtons();
        cursor?.refreshHoverables();
        smoothScroll?.start();

        /* Hero WebGL only on homepage */
        if (data.next.namespace === 'home') {
          webgl = new WebGLScene('hero-webgl');
          playHeroEntrance();
        }

        /* Scroll to top */
        smoothScroll?.scrollTo(0, { immediate: true });
        window.scrollTo(0, 0);
      },
    }],

    views: [
      {
        namespace: 'home',
        afterEnter() {
          if (document.getElementById('hero-webgl')) {
            webgl = new WebGLScene('hero-webgl');
          }
        },
        beforeLeave() {
          _teardownWebGL();
        },
      },
    ],
  });

  barba.hooks.afterOnce((data) => {
    _updateNav(window.location.pathname);
  });
}

function _teardownWebGL() {
  if (webgl) {
    webgl.destroy();
    webgl = null;
  }
}

function _updateNav(path) {
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    const isActive = href && (
      (path === '/' && href === 'index.html') ||
      path.includes(href.replace('.html', '')) ||
      href === path
    );
    link.classList.toggle('active', isActive);
  });
}
