// js/lib/filters.js
import { CATEGORIES } from '../data/products.js';

export const PRICE_BANDS = [
  { id: 'under-500', label: 'Under 500 EGP', test: p => p < 500 },
  { id: '500-1500', label: '500–1,500 EGP', test: p => p >= 500 && p <= 1500 },
  { id: 'over-1500', label: 'Over 1,500 EGP', test: p => p > 1500 },
];
export const COLOURS = [
  { id: 'white', label: 'White' },
  { id: 'black', label: 'Black' },
  { id: 'striped', label: 'Striped' },
];

export function emptyFilters() {
  return { categories: new Set(), prices: new Set(), colours: new Set() };
}

const FACETS = {
  category: (p, sel) => sel.size === 0 || sel.has(p.category),
  price: (p, sel) => sel.size === 0 || PRICE_BANDS.some(b => sel.has(b.id) && b.test(p.price)),
  colour: (p, sel) => sel.size === 0 || p.colours.some(c => sel.has(c)),
};
const SELECTION = { category: 'categories', price: 'prices', colour: 'colours' };

function matches(p, state, ignore) {
  return Object.keys(FACETS).every(f => f === ignore || FACETS[f](p, state[SELECTION[f]]));
}

export function filterProducts(products, state) {
  return products.filter(p => matches(p, state));
}

export function facetCounts(products, state) {
  const count = (facet, test) => products.filter(p => matches(p, state, facet) && test(p)).length;
  return {
    category: Object.fromEntries(CATEGORIES.map(c => [c.id, count('category', p => p.category === c.id)])),
    price: Object.fromEntries(PRICE_BANDS.map(b => [b.id, count('price', p => b.test(p.price))])),
    colour: Object.fromEntries(COLOURS.map(c => [c.id, count('colour', p => p.colours.includes(c.id))])),
  };
}
