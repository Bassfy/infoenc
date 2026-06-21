/* ============================================================
   MAIN.JS — App entry point
   ============================================================ */

import { Cursor, initMagneticButtons }  from './cursor.js';
import { SmoothScroll }                 from './smooth-scroll.js';
import { WebGLScene }                   from './webgl-scene.js';
import { initAnimations, playHeroEntrance } from './gsap-animations.js';
import { initPageTransitions }          from './page-transitions.js';

/* ── App State ── */
const App = {
  cursor:      null,
  scroll:      null,
  webgl:       null,
  soundOn:     false,
  initialized: false,
};

/* ── Preloader ── */
async function runPreloader() {
  const preloader = document.getElementById('preloader');
  if (!preloader) return;

  document.body.classList.add('is-loading');

  const counter = document.getElementById('preloader-counter');
  const bar     = document.getElementById('preloader-bar');

  let progress = 0;

  await new Promise(resolve => {
    const tick = () => {
      progress += Math.random() * 6 + 2;
      if (progress >= 100) {
        progress = 100;
        if (counter) counter.textContent = '100';
        if (bar)     bar.style.width     = '100%';
        setTimeout(resolve, 300);
        return;
      }
      if (counter) counter.textContent = Math.floor(progress);
      if (bar)     bar.style.width     = `${progress}%`;
      const delay = progress < 70 ? 60 : 30;
      setTimeout(tick, delay);
    };
    setTimeout(tick, 100);
  });

  /* Exit preloader */
  await new Promise(resolve => {
    if (typeof gsap !== 'undefined') {
      gsap.timeline()
        .to(preloader, {
          clipPath: 'inset(0 0 100% 0)',
          duration: 0.9,
          ease:     'power4.inOut',
          onComplete() {
            preloader.style.display = 'none';
            document.body.classList.remove('is-loading');
            resolve();
          },
        });
    } else {
      preloader.style.display = 'none';
      document.body.classList.remove('is-loading');
      resolve();
    }
  });
}

/* ── Navbar Logic ── */
function initNavbar() {
  const hamburger   = document.querySelector('.nav-hamburger');
  const mobileMenu  = document.getElementById('mobile-menu');
  const mobileLinks = document.querySelectorAll('.mobile-menu__link');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const open = hamburger.classList.toggle('is-open');
      mobileMenu.classList.toggle('is-open', open);
      document.body.style.overflow = open ? 'hidden' : '';
      if (open) App.scroll?.stop();
      else      App.scroll?.start();
    });

    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('is-open');
        mobileMenu.classList.remove('is-open');
        document.body.style.overflow = '';
        App.scroll?.start();
      });
    });
  }

  /* Active link highlight */
  const path = window.location.pathname;
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href') || '';
    const base = href.replace('.html', '').replace(/^\//, '');
    const current = path.replace('.html', '').replace(/^\//, '');
    const isHome = (current === '' || current === 'index') && (base === '' || base === 'index');
    const isActive = isHome || (base && current.includes(base));
    link.classList.toggle('active', isActive);
  });
}

/* ── Sound Toggle ── */
function initSoundToggle() {
  const btn = document.querySelector('.sound-toggle');
  if (!btn) return;

  btn.addEventListener('click', () => {
    App.soundOn = !App.soundOn;
    btn.setAttribute('aria-label', App.soundOn ? 'Mute' : 'Unmute');
    /* Visual feedback */
    btn.style.borderColor = App.soundOn ? 'var(--clr-accent)' : '';
    btn.style.color       = App.soundOn ? 'var(--clr-accent)' : '';
  });
}

/* ── Anchor smooth scroll ── */
function initAnchorScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      App.scroll?.scrollTo(target, { offset: -80 });
    });
  });
}

/* ── Filter Tabs (work page) ── */
function initFilterTabs() {
  const tabs  = document.querySelectorAll('.filter-tab');
  const cards = document.querySelectorAll('.work-card-wrap');
  if (!tabs.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filter = tab.dataset.filter;
      cards.forEach(card => {
        const cat    = card.dataset.category || '';
        const show   = filter === 'all' || cat.includes(filter);
        if (typeof gsap !== 'undefined') {
          gsap.to(card, {
            opacity:  show ? 1 : 0.2,
            scale:    show ? 1 : 0.95,
            duration: 0.4,
            ease:     'power2.out',
          });
        } else {
          card.style.opacity = show ? '1' : '0.2';
        }
      });
    });
  });
}

/* ── Marquee duplicator ── */
function initMarquees() {
  document.querySelectorAll('.marquee__inner').forEach(inner => {
    /* Clone content for seamless loop */
    const clone = inner.cloneNode(true);
    inner.parentElement.appendChild(clone);
  });
}

/* ── Contact form ── */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('[type="submit"]');
    if (!btn) return;

    btn.disabled = true;
    btn.textContent = 'Sending…';

    await new Promise(r => setTimeout(r, 1500));

    btn.textContent = 'Message Sent ✓';
    btn.style.background = '#10b981';

    setTimeout(() => {
      btn.disabled    = false;
      btn.textContent = 'Send Message';
      btn.style.background = '';
      form.reset();
    }, 4000);
  });
}

/* ── Ripple effect on buttons ── */
function initRipple() {
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const rect   = btn.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      const size   = Math.max(rect.width, rect.height);
      ripple.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        left: ${e.clientX - rect.left - size / 2}px;
        top: ${e.clientY - rect.top - size / 2}px;
      `;
      btn.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    });
  });
}

/* ── Main Init ── */
async function init() {
  if (App.initialized) return;
  App.initialized = true;

  /* 1. Preloader */
  await runPreloader();

  /* 2. Core systems */
  App.cursor = new Cursor();
  App.scroll = new SmoothScroll();

  /* 3. Animations */
  initAnimations();

  /* 4. Page transitions */
  initPageTransitions(App.scroll, App.cursor);

  /* 5. UI components */
  initNavbar();
  initSoundToggle();
  initAnchorScroll();
  initFilterTabs();
  initMarquees();
  initContactForm();
  initMagneticButtons();
  initRipple();

  /* 6. WebGL — only on home page */
  const heroCanvas = document.getElementById('hero-webgl');
  if (heroCanvas) {
    App.webgl = new WebGLScene('hero-webgl');
    playHeroEntrance();
  }
}

/* ── Boot ── */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
