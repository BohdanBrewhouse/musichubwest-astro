/* ── Hero Carousel ───────────────────────────────────── */
function initCarousel() {
  const slides = document.querySelectorAll('.hero__slide');
  const dots   = document.querySelectorAll('.hero__dot');
  if (!slides.length) return;

  let current = 0;
  let timer;

  function goTo(n) {
    slides[current].classList.remove('active');
    dots[current]?.classList.remove('active');
    current = (n + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current]?.classList.add('active');
  }

  function next() { goTo(current + 1); }

  function start() { timer = setInterval(next, 5000); }
  function stop()  { clearInterval(timer); }

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => { stop(); goTo(i); start(); });
  });

  // Pause on hover
  const hero = document.querySelector('.hero');
  hero?.addEventListener('mouseenter', stop);
  hero?.addEventListener('mouseleave', start);

  // Touch swipe support
  let touchStartX = 0;
  hero?.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });

  hero?.addEventListener('touchend', e => {
    const delta = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(delta) < 40) return;
    stop();
    delta < 0 ? goTo(current + 1) : goTo(current - 1);
    start();
  }, { passive: true });

  start();
}

/* ── Filter chips (generic active-state + show/hide) ── */
function initFilters() {
  document.querySelectorAll('.filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const bar = chip.closest('.filter-bar');
      if (!bar) return;
      bar.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');

      // Generic show/hide — only on pages without the articles featured block
      if (!document.getElementById('featured-article')) {
        const filter = chip.dataset.filter || 'all';
        document.querySelectorAll('[data-category]').forEach(el => {
          el.style.display = (filter === 'all' || el.dataset.category === filter) ? '' : 'none';
        });
      }
    });
  });
}

/* ── Article page filter (featured block + grid) ────── */
function initArticleFilter() {
  const featured = document.getElementById('featured-article');
  if (!featured) return;

  const cards = Array.from(document.querySelectorAll('.article-card[data-category]'));

  // Snapshot original featured content to restore on "All"
  const orig = {
    badgeClass: featured.querySelector('.badge')?.className,
    badgeText:  featured.querySelector('.badge')?.textContent,
    titleText:  featured.querySelector('.featured-title span')?.textContent,
    metaText:   featured.querySelector('[data-i18n="art.feat.meta"]')?.textContent,
    descText:   featured.querySelector('[data-i18n="art.feat.desc"]')?.textContent,
  };

  function applyFilter(filter) {
    const matching = filter === 'all'
      ? cards
      : cards.filter(c => c.dataset.category === filter);

    if (matching.length === 0) {
      featured.style.display = 'none';
      cards.forEach(c => c.style.display = 'none');
      return;
    }

    featured.style.display = 'block';
    const first = matching[0];

    const badge     = featured.querySelector('.badge');
    const titleSpan = featured.querySelector('.featured-title span');
    const metaEl    = featured.querySelector('[data-i18n="art.feat.meta"]');
    const descSpan  = featured.querySelector('[data-i18n="art.feat.desc"]');

    if (filter === 'all') {
      // Restore original snapshot
      if (badge)     { badge.className = orig.badgeClass; badge.textContent = orig.badgeText; }
      if (titleSpan) titleSpan.textContent = orig.titleText;
      if (metaEl)    metaEl.textContent    = orig.metaText;
      if (descSpan)  descSpan.textContent  = orig.descText;
      cards.forEach(c => c.style.display = '');
    } else {
      // Populate featured from first matching card
      const cardBadge = first.querySelector('.article-card__badge');
      const colorClass = cardBadge?.className.match(/badge--\w+/)?.[0] || '';
      if (badge) {
        badge.className   = `badge ${colorClass}`;
        badge.textContent = cardBadge?.textContent || '';
      }
      if (titleSpan) titleSpan.textContent = first.querySelector('.article-card__title')?.textContent || '';
      if (metaEl)    metaEl.textContent    = first.querySelector('.article-card__meta')?.textContent || '';
      if (descSpan)  descSpan.textContent  = first.querySelector('.article-card__desc')?.textContent || '';

      // First matching card goes into featured → hide from grid; show rest
      cards.forEach(c => {
        c.style.display = (matching.includes(c) && c !== first) ? '' : 'none';
      });
    }
  }

  document.querySelectorAll('.filter-chip[data-filter]').forEach(chip => {
    chip.addEventListener('click', () => applyFilter(chip.dataset.filter));
  });
}

/* ── Active nav link ─────────────────────────────────── */
function initNav() {
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === page || (page === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
}

/* ── Mobile hamburger ────────────────────────────────── */
function initBurger() {
  const burger = document.querySelector('.nav__burger');
  const links  = document.querySelector('.nav__links');
  if (!burger || !links) return;

  burger.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    burger.classList.toggle('active', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });

  // Close menu on link click
  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      links.classList.remove('open');
      burger.classList.remove('active');
      document.body.style.overflow = '';
    });
  });
}

/* ── Page tab navigation ─────────────────────────────── */
function initPageTabs() {
  const tabs = document.querySelectorAll('.page-tab');
  if (!tabs.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;

      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      document.querySelectorAll('.page-panel').forEach(p => p.classList.remove('active'));
      document.getElementById(`tab-${target}`)?.classList.add('active');

      document.querySelector('.page-tabs')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  });
}

/* ── Scroll reveal ──────────────────────────────────── */
function initScrollReveal() {
  const els = document.querySelectorAll(
    '.event-card, .article-card, .team-card, ' +
    '.page-hero__title, .page-hero__subtitle, ' +
    '.project-strip__title, .project-strip__text, .partner-logos, ' +
    '.stats-row > div, ' +
    '.contact-title, .contact-subtitle, .form-block__title, ' +
    '.section__head'
  );

  els.forEach(el => el.classList.add('reveal'));

  // Stagger sibling cards in grid containers
  document.querySelectorAll('.card-grid, .team-grid, .stats-row').forEach(grid => {
    Array.from(grid.children).forEach((child, i) => {
      if (child.classList.contains('reveal')) {
        child.style.transitionDelay = `${i * 0.08}s`;
      }
    });
  });

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal--visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -32px 0px' });

  els.forEach(el => observer.observe(el));
}

/* ── Glitch data-text on hero titles ────────────────── */
function initGlitch() {
  document.querySelectorAll('.hero__title').forEach(el => {
    el.dataset.text = el.textContent;
  });
}

/* ── Stats counter ──────────────────────────────────── */
function initCounters() {
  const els = document.querySelectorAll('.stat__number');
  if (!els.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const raw = el.textContent.trim();
      const num = parseFloat(raw.replace(/[^\d.]/g, ''));
      const prefix = raw.match(/^[^\d]*/)?.[0] || '';
      const suffix = raw.replace(/^[^\d]*[\d.]+/, '');
      if (isNaN(num)) return;

      let t0 = null;
      const duration = 1400;

      (function step(ts) {
        if (!t0) t0 = ts;
        const p = Math.min((ts - t0) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        const val = num * eased;
        el.textContent = prefix + (Number.isInteger(num) ? Math.round(val) : val.toFixed(1)) + suffix;
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = raw;
      })(performance.now());

      observer.unobserve(el);
    });
  }, { threshold: 0.6 });

  els.forEach(el => observer.observe(el));
}

/* ── Card click glitch → navigate ──────────────────── */
function initCardGlitch() {
  const cards = document.querySelectorAll('.event-card[href], .article-card[href]');
  cards.forEach(card => {
    const glitchClass = card.classList.contains('event-card')
      ? 'event-card--glitch'
      : 'article-card--glitch';
    card.addEventListener('click', e => {
      e.preventDefault();
      if (card.classList.contains(glitchClass)) return;
      const dest = card.href;
      card.classList.add(glitchClass);
      const delay = card.classList.contains('article-card') ? 230 : 210;
      setTimeout(() => { window.location.href = dest; }, delay);
    });
  });
}

/* ── Magnetic CTA buttons ───────────────────────────── */
function initMagneticButtons() {
  document.querySelectorAll('.btn--primary').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width  / 2) * 0.22;
      const y = (e.clientY - r.top  - r.height / 2) * 0.30;
      btn.style.transform = `translate(${x}px, ${y}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initCarousel();
  initFilters();
  initArticleFilter();
  initNav();
  initPageTabs();
  initBurger();
  initI18n();
  initScrollReveal();
  initGlitch();
  initCounters();
  initMagneticButtons();
  initCardGlitch();
});
