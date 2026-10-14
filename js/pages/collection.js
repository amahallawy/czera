import { initShell } from '../ui/shell.js';
import { renderProductCard } from '../ui/card.js';
import { PRODUCTS, CATEGORIES } from '../data/products.js';
import { emptyFilters, filterProducts, facetCounts, PRICE_BANDS, COLOURS } from '../lib/filters.js';
import { escapeHtml } from '../lib/escape.js';

initShell();

const state = emptyFilters();
const preset = new URLSearchParams(location.search).get('category');
if (CATEGORIES.some(c => c.id === preset)) state.categories.add(preset);

const GROUPS = [
  { facet: 'category', key: 'categories', title: 'Category', options: CATEGORIES },
  { facet: 'price', key: 'prices', title: 'Price', options: PRICE_BANDS },
  { facet: 'colour', key: 'colours', title: 'Colour', options: COLOURS },
];
const BAND = `<div class="grid-band band band--dark">
  <div class="band__copy"><span class="eyebrow">Build your own box</span><h2 class="band__title">Can't choose? Make your own.</h2>
  <p>Pick the towels, colour and ribbon. Box and ribbon are included free.</p><a class="btn btn--gold" href="build-your-box.html">Start your box</a></div>
  <img class="band__media" src="assets/img/products/hand-and-bath-sheet-set-1.jpg" alt="" /></div>`;

function render() {
  const counts = facetCounts(PRODUCTS, state);
  document.querySelector('[data-filter-groups]').innerHTML = GROUPS.map(g => `
    <fieldset class="filter-group"><legend>${g.title}</legend>
      ${g.options.map(o => {
        const n = counts[g.facet][o.id];
        const checked = state[g.key].has(o.id);
        const dead = n === 0 && !checked;
        return `<label class="filter-option${dead ? ' is-empty' : ''}">
          <input type="checkbox" data-facet="${g.key}" value="${escapeHtml(o.id)}" ${checked ? 'checked' : ''} ${dead ? 'disabled' : ''} />
          ${escapeHtml(o.label)} <span>(${n})</span></label>`;
      }).join('')}
    </fieldset>`).join('');

  const results = filterProducts(PRODUCTS, state);
  const cards = results.map(renderProductCard);
  if (results.length >= 4) cards.splice(3, 0, BAND);
  document.querySelector('[data-grid]').innerHTML = cards.join('');
  document.querySelector('[data-result-count]').textContent = `${results.length} ${results.length === 1 ? 'product' : 'products'}`;
}

document.addEventListener('change', e => {
  const box = e.target.closest('[data-facet]');
  if (!box) return;
  const set = state[box.dataset.facet];
  if (box.checked) set.add(box.value); else set.delete(box.value);
  render();
});

const toggle = document.querySelector('[data-filters-toggle]');
toggle.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') !== 'true';
  toggle.setAttribute('aria-expanded', String(open));
  document.querySelector('[data-filters]').classList.toggle('is-open', open);
});

render();
