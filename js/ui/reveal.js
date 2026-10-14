// Header transparency on hero pages: add solid bg after slight scroll.
// The caller decides whether the page has a hero.
export function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;
  const onScroll = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 24);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

// Scroll-reveal: fade + slide on entry, once per element. Adds .reveal to each
// target, then .is-revealed when it scrolls into view.
export function initReveal(selectors = '.chapter__content, .chapter__heading, .section__head, .reveal-target') {
  const revealTargets = document.querySelectorAll(selectors);
  if (!revealTargets.length) return;

  if ('IntersectionObserver' in window) {
    revealTargets.forEach(el => el.classList.add('reveal'));

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            obs.unobserve(entry.target); // fire once per element
          }
        });
      },
      { threshold: 0.2, rootMargin: '0px 0px -10% 0px' }
    );

    revealTargets.forEach(el => observer.observe(el));

    // Defensive: anything already within the initial viewport is revealed on
    // first paint so screenshots and very-fast scrolls don't flash empty.
    requestAnimationFrame(() => {
      const vh = window.innerHeight;
      revealTargets.forEach(el => {
        if (el.getBoundingClientRect().top < vh * 0.85) {
          el.classList.add('is-revealed');
          observer.unobserve(el);
        }
      });
    });
  } else {
    revealTargets.forEach(el => el.classList.add('is-revealed'));
  }
}
