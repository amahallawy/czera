// Czera — global behaviour (nav, scroll-reveal, year stamp).
(() => {
  'use strict';

  // Year stamp
  const yearEl = document.querySelector('[data-current-year]');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Slide-in menu panel (opens from the right)
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('[data-site-menu]');
  const menuClose = document.querySelector('[data-menu-close]');
  const menuBackdrop = document.querySelector('[data-menu-backdrop]');

  function openMenu() {
    if (!menu || !menuBackdrop) return;
    menu.hidden = false;
    menuBackdrop.hidden = false;
    // Force layout flush so the transition runs from the start position
    void menu.offsetHeight;
    menu.classList.add('is-open');
    menuBackdrop.classList.add('is-open');
    menu.setAttribute('aria-hidden', 'false');
    menuBackdrop.setAttribute('aria-hidden', 'false');
    menuToggle?.setAttribute('aria-expanded', 'true');
    document.body.classList.add('menu-open');
    // Focus the close button so keyboard users land in the panel
    menuClose?.focus();
  }

  function closeMenu() {
    if (!menu || !menuBackdrop) return;
    menu.classList.remove('is-open');
    menuBackdrop.classList.remove('is-open');
    menu.setAttribute('aria-hidden', 'true');
    menuBackdrop.setAttribute('aria-hidden', 'true');
    menuToggle?.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
    // Hide after the transition completes so screen readers skip the panel
    const onEnd = () => {
      if (!menu.classList.contains('is-open')) {
        menu.hidden = true;
        menuBackdrop.hidden = true;
      }
      menu.removeEventListener('transitionend', onEnd);
    };
    menu.addEventListener('transitionend', onEnd);
    menuToggle?.focus();
  }

  if (menuToggle) menuToggle.addEventListener('click', openMenu);
  if (menuClose) menuClose.addEventListener('click', closeMenu);
  if (menuBackdrop) menuBackdrop.addEventListener('click', closeMenu);

  // Close menu via ESC key when open
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu?.classList.contains('is-open')) {
      closeMenu();
    }
  });

  // Close menu when a link inside it is activated (so navigating to an
  // anchor on the same page also closes the panel)
  document.querySelectorAll('.site-menu__link').forEach((link) => {
    link.addEventListener('click', () => {
      if (menu?.classList.contains('is-open')) closeMenu();
    });
  });

  // Header transparency on hero pages: add solid bg after slight scroll
  const header = document.querySelector('.site-header');
  if (header && document.body.classList.contains('has-hero')) {
    const onScroll = () => {
      header.classList.toggle('is-scrolled', window.scrollY > 24);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // Chapter scroll-reveal — fade + slide on entry, once per element.
  // Apply .reveal class to anything that should animate, then this script
  // adds .is-revealed when the element scrolls into view.
  const revealTargets = document.querySelectorAll(
    '.chapter__content, .chapter__split-content, .chapter__heading, .editorial-row'
  );

  if (revealTargets.length && 'IntersectionObserver' in window) {
    revealTargets.forEach(el => el.classList.add('reveal'));

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            obs.unobserve(entry.target);   // fire once per element
          }
        });
      },
      { threshold: 0.2, rootMargin: '0px 0px -10% 0px' }
    );

    revealTargets.forEach(el => observer.observe(el));

    // Defensive: anything already within (or above) the initial viewport gets
    // revealed on first paint, so screenshots and very-fast scrolls don't
    // flash empty content.
    requestAnimationFrame(() => {
      const vh = window.innerHeight;
      revealTargets.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < vh * 0.85) {
          el.classList.add('is-revealed');
          observer.unobserve(el);
        }
      });
    });
  } else {
    // No IntersectionObserver — show everything immediately
    revealTargets.forEach(el => el.classList.add('is-revealed'));
  }
})();
