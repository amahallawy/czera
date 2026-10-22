import { initShell } from '../ui/shell.js';
import { renderProductCard } from '../ui/card.js';
import { PRODUCTS, CATEGORIES } from '../data/products.js';
import { emptyFilters, filterProducts, facetCounts, collectionCategories, gridItems, PRICE_BANDS, COLOURS, SALE_OPTIONS } from '../lib/filters.js';
import { saleProducts } from '../lib/pricing.js';
import { escapeHtml } from '../lib/escape.js';

initShell();

const state = emptyFilters();
const params = new URLSearchParams(location.search);
const preset = params.get('category');
if (CATEGORIES.some(c => c.id === preset)) state.categories.add(preset);
// Sale is a filter on the collection (#123): the group shows only while something is on sale,
// and the Sale menu item (?sale=1) opens the collection with it ticked.
const hasSale = saleProducts().length > 0;
if (hasSale && params.get('sale') === '1') state.sale.add('on-sale');

// Sale sits under Category (owner, #135).
const GROUPS = [
  { facet: 'category', key: 'categories', title: 'Category', options: collectionCategories() },
  ...(hasSale ? [{ facet: 'sale', key: 'sale', title: 'Sale', options: SALE_OPTIONS }] : []),
  { facet: 'price', key: 'prices', title: 'Price', options: PRICE_BANDS },
  { facet: 'colour', key: 'colours', title: 'Colour', options: COLOURS },
];
const BAND = `<div class="grid-band band band--dark">
  <div class="band__copy"><h2 class="band__title">Build Your Own Box</h2>
  <p class="band__text">Create a gift that feels personal. Choose your towels, select your preferred options, and complete your CZERA experience with our signature gift box.</p><a class="btn btn--gold" href="build-your-box.html">Create your box</a></div>
  <img class="band__media" src="assets/img/products/hand-and-bath-sheet-set-1.jpg" alt="" /></div>`;

function render() {
  const active = document.activeElement;
  const focusKey = active && active.matches && active.matches('[data-facet]')
    ? { facet: active.dataset.facet, value: active.value } : null;
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
  document.querySelector('[data-grid]').innerHTML = gridItems(results.map(renderProductCard), BAND).join('');
  if (focusKey) {
    const next = [...document.querySelectorAll('[data-facet]')]
      .find(i => i.dataset.facet === focusKey.facet && i.value === focusKey.value);
    if (next && !next.disabled) next.focus();
  }
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
