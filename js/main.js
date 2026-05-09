// Czera — global behaviour (nav, scroll-reveal, year stamp).
(() => {
  'use strict';

  // Year stamp
  const yearEl = document.querySelector('[data-current-year]');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Mobile menu toggle (header)
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const nav = document.querySelector('[data-site-nav]');
  if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      menuToggle.setAttribute('aria-expanded', String(open));
    });
  }

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
