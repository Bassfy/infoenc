/* ============================================================
   GSAP-ANIMATIONS.JS — All GSAP + ScrollTrigger animations
   ============================================================ */

export function initAnimations() {
  if (typeof gsap === 'undefined') return;

  /* ── Register plugins ── */
  gsap.registerPlugin(ScrollTrigger);

  /* ── Global defaults ── */
  gsap.defaults({ ease: 'power4.out', duration: 1 });

  /* Run init sequences */
  _initTextReveals();
  _initFadeReveals();
  _initStatCounters();
  _initImageReveals();
  _initProcessSteps();
  _initHorizontalGallery();
  _initSectionPins();
  _initParallax();
  _initWorkCards();
  _initServiceCards();
}

/* ── Text Reveals (SplitType) ── */
function _initTextReveals() {
  if (typeof SplitType === 'undefined') return;

  document.querySelectorAll('[data-split]').forEach(el => {
    const type = el.dataset.split || 'lines';
    const split = new SplitType(el, { types: type });
    const targets = type.includes('chars')
      ? split.chars
      : type.includes('words')
        ? split.words
        : split.lines;

    if (!targets?.length) return;

    gsap.from(targets, {
      scrollTrigger: {
        trigger: el,
        start:   'top 88%',
        once:    true,
      },
      yPercent:  110,
      opacity:   type.includes('lines') ? 1 : 0,
      duration:  1.1,
      ease:      'power4.out',
      stagger:   0.04,
    });
  });
}

/* ── Fade / Slide Reveals ── */
function _initFadeReveals() {
  const elMap = {
    '[data-reveal]':       { y: 50, opacity: 0 },
    '[data-reveal="left"]':{ x: -50, opacity: 0 },
    '[data-reveal="right"]':{ x: 50, opacity: 0 },
    '[data-reveal="scale"]':{ scale: 0.88, opacity: 0 },
    '.fade-up':            { y: 60, opacity: 0 },
    '.fade-in':            { opacity: 0 },
  };

  Object.entries(elMap).forEach(([sel, from]) => {
    document.querySelectorAll(sel).forEach(el => {
      if (el.dataset.revealHandled) return;
      el.dataset.revealHandled = '1';
      gsap.from(el, {
        scrollTrigger: {
          trigger: el,
          start:   'top 90%',
          once:    true,
        },
        ...from,
        duration: 1,
        ease:     'power4.out',
      });
    });
  });

  /* Stagger children */
  document.querySelectorAll('.stagger-children').forEach(parent => {
    gsap.from(parent.children, {
      scrollTrigger: {
        trigger: parent,
        start:   'top 85%',
        once:    true,
      },
      y:        50,
      opacity:  0,
      duration: 0.9,
      stagger:  0.12,
      ease:     'power4.out',
    });
  });
}

/* ── Stat Counters ── */
function _initStatCounters() {
  document.querySelectorAll('[data-count]').forEach(el => {
    const end     = parseFloat(el.dataset.count);
    const suffix  = el.dataset.suffix || '';
    const prefix  = el.dataset.prefix || '';
    const decimals = el.dataset.decimals ? parseInt(el.dataset.decimals) : 0;

    gsap.from({ val: 0 }, {
      scrollTrigger: {
        trigger: el,
        start:   'top 90%',
        once:    true,
      },
      val:      end,
      duration: 2.5,
      ease:     'power2.out',
      onUpdate() {
        el.textContent = prefix + this.targets()[0].val.toFixed(decimals) + suffix;
      },
      onComplete() {
        el.textContent = prefix + end.toFixed(decimals) + suffix;
      },
    });
  });
}

/* ── Image Reveals ── */
function _initImageReveals() {
  document.querySelectorAll('.img-reveal-wrap').forEach(wrap => {
    const inner = wrap.querySelector('img, .img-inner, video');
    if (!inner) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: wrap,
        start:   'top 85%',
        once:    true,
      },
    });

    tl.from(wrap, {
      clipPath: 'inset(100% 0 0 0)',
      duration: 1.2,
      ease:     'power4.inOut',
    }).from(inner, {
      scale:    1.25,
      duration: 1.4,
      ease:     'power4.out',
    }, 0);
  });
}

/* ── Process Steps ── */
function _initProcessSteps() {
  document.querySelectorAll('.process-step').forEach((step, i) => {
    gsap.from(step, {
      scrollTrigger: {
        trigger: step,
        start:   'top 88%',
        once:    true,
      },
      opacity:  0,
      x:        -30,
      duration: 0.8,
      delay:    i * 0.1,
      ease:     'power3.out',
    });
  });
}

/* ── Horizontal Scroll Gallery ── */
export function initHorizontalGallery(sectionId) {
  const section = document.getElementById(sectionId);
  if (!section) return;

  const inner = section.querySelector('.h-scroll-inner');
  if (!inner) return;

  const totalWidth = inner.scrollWidth - section.offsetWidth;

  gsap.to(inner, {
    x: -totalWidth,
    ease: 'none',
    scrollTrigger: {
      trigger: section,
      start:   'top top',
      end:     `+=${totalWidth + 400}`,
      pin:     true,
      scrub:   1,
      anticipatePin: 1,
    },
  });
}

/* ── Section Pins ── */
function _initSectionPins() {
  /* Hero section — subtle parallax with pin */
  const heroText = document.querySelector('.hero-text-wrap');
  if (heroText) {
    gsap.to(heroText, {
      y:           -100,
      opacity:     0,
      ease:        'none',
      scrollTrigger: {
        trigger:  '#hero',
        start:    'top top',
        end:      'bottom top',
        scrub:    true,
      },
    });
  }
}

/* ── Parallax ── */
function _initParallax() {
  document.querySelectorAll('[data-parallax]').forEach(el => {
    const speed = parseFloat(el.dataset.parallax) || 0.3;
    gsap.to(el, {
      y:    () => el.offsetHeight * speed * -1,
      ease: 'none',
      scrollTrigger: {
        trigger: el.parentElement,
        start:   'top bottom',
        end:     'bottom top',
        scrub:   true,
      },
    });
  });
}

/* ── Work Cards Hover Timeline ── */
function _initWorkCards() {
  document.querySelectorAll('.work-card').forEach(card => {
    const media = card.querySelector('.work-card__media');
    if (!media) return;

    card.addEventListener('mouseenter', () => {
      gsap.to(media, { scale: 1.06, duration: 0.8, ease: 'power3.out' });
    });
    card.addEventListener('mouseleave', () => {
      gsap.to(media, { scale: 1,    duration: 0.8, ease: 'power3.out' });
    });
  });
}

/* ── Service Cards entrance ── */
function _initServiceCards() {
  const cards = document.querySelectorAll('.service-card');
  if (!cards.length) return;

  gsap.from(cards, {
    scrollTrigger: {
      trigger: cards[0].parentElement,
      start:   'top 80%',
      once:    true,
    },
    y:        60,
    opacity:  0,
    duration: 0.9,
    stagger:  0.1,
    ease:     'power4.out',
  });
}

/* ── Hero entrance timeline (called after preloader) ── */
export function playHeroEntrance() {
  const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

  const heroWords = document.querySelectorAll('.hero-word span');
  const heroSub   = document.querySelector('.hero-subtitle');
  const heroCta   = document.querySelector('.hero-cta');
  const heroScroll= document.querySelector('.scroll-indicator');
  const badge     = document.querySelector('.hero-badge');

  if (heroWords.length) {
    tl.from(heroWords, {
      yPercent:  110,
      duration:  1.2,
      stagger:   0.06,
    }, 0.2);
  }

  if (heroSub) {
    tl.from(heroSub, { y: 30, opacity: 0, duration: 1 }, 0.7);
  }

  if (badge) {
    tl.from(badge, { y: 20, opacity: 0, duration: 0.8 }, 0.5);
  }

  if (heroCta) {
    tl.from(heroCta, { y: 20, opacity: 0, duration: 0.9 }, 0.9);
  }

  if (heroScroll) {
    tl.from(heroScroll, { y: 20, opacity: 0, duration: 0.8 }, 1.1);
  }

  return tl;
}

/* ── Refresh ScrollTrigger on route change ── */
export function refreshScrollTrigger() {
  ScrollTrigger.refresh();
}
