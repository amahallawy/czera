// Czera — catalog page behaviour
// Lightweight client-side filter/sort over the rendered DOM with smooth fade.
(() => {
  'use strict';

  const grid = document.querySelector('[data-product-grid]');
  if (!grid) return;

  const cards = Array.from(grid.querySelectorAll('[data-product-card]'));
  const FADE_MS = 280;

  const state = {
    category: 'all',
    colors: new Set(),
    sort: 'featured',
  };

  // ----- Filter bindings -----
  document.querySelectorAll('[data-filter-category]').forEach(el => {
    el.addEventListener('click', () => {
      const value = el.dataset.filterCategory;
      state.category = value;
      document.querySelectorAll('[data-filter-category]').forEach(n => n.classList.toggle('is-active', n === el));
      apply();
    });
  });

  document.querySelectorAll('[data-filter-color]').forEach(el => {
    el.addEventListener('click', () => {
      const value = el.dataset.filterColor;
      if (state.colors.has(value)) {
        state.colors.delete(value);
        el.classList.remove('is-active');
      } else {
        state.colors.add(value);
        el.classList.add('is-active');
      }
      apply();
    });
  });

  const sortEl = document.querySelector('[data-sort]');
  if (sortEl) sortEl.addEventListener('change', e => { state.sort = e.target.value; apply(); });

  const filterToggle = document.querySelector('[data-filter-toggle]');
  const filterRail = document.querySelector('[data-filter-rail]');
  if (filterToggle && filterRail) {
    filterToggle.addEventListener('click', () => {
      filterRail.classList.toggle('is-open');
    });
  }

  // ----- Apply / sort -----
  function apply() {
    const visible = cards.filter(card => {
      const cat = card.dataset.category || '';
      const colors = (card.dataset.colors || '').split(',').map(s => s.trim()).filter(Boolean);
      const catOk = state.category === 'all' || cat === state.category;
      const colorOk = state.colors.size === 0 || [...state.colors].every(c => colors.includes(c));
      return catOk && colorOk;
    });

    // Sort
    const sorted = [...visible].sort((a, b) => {
      const pa = parseFloat(a.dataset.price) || 0;
      const pb = parseFloat(b.dataset.price) || 0;
      switch (state.sort) {
        case 'price-asc':  return pa - pb;
        case 'price-desc': return pb - pa;
        case 'newest':
          return (parseInt(b.dataset.added) || 0) - (parseInt(a.dataset.added) || 0);
        default: return 0;
      }
    });

    // Fade out, reorder, fade back in
    cards.forEach(c => c.classList.add('is-hidden'));

    setTimeout(() => {
      cards.forEach(c => { c.style.display = 'none'; });
      sorted.forEach(c => { c.style.display = ''; grid.appendChild(c); });
      // Force reflow so transition fires
      void grid.offsetHeight;
      sorted.forEach(c => c.classList.remove('is-hidden'));
    }, FADE_MS);

    const countEl = document.querySelector('[data-result-count]');
    if (countEl) countEl.textContent = String(sorted.length);
  }

  // Initial render — no fade
  cards.forEach(c => c.classList.remove('is-hidden'));
})();
