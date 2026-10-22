// js/lib/filters.js
import { CATEGORIES } from '../data/products.js';
import { currentPrice, isOnSale } from './pricing.js';

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
// One option: products whose sale price counts (#123). The Sale menu item opens the collection with it ticked.
export const SALE_OPTIONS = [{ id: 'on-sale', label: 'On sale' }];

export function emptyFilters() {
  return { sale: new Set(), categories: new Set(), prices: new Set(), colours: new Set() };
}

const FACETS = {
  sale: (p, sel) => sel.size === 0 || (sel.has('on-sale') && isOnSale(p)),
  category: (p, sel) => sel.size === 0 || sel.has(p.category),
  price: (p, sel) => sel.size === 0 || PRICE_BANDS.some(b => sel.has(b.id) && b.test(currentPrice(p))),
  colour: (p, sel) => sel.size === 0 || p.colours.some(c => sel.has(c)),
};
const SELECTION = { sale: 'sale', category: 'categories', price: 'prices', colour: 'colours' };

function matches(p, state, ignore) {
  return Object.keys(FACETS).every(f => f === ignore || FACETS[f](p, state[SELECTION[f]]));
}

// The collection's order (owner, #89): white towels, striped beach towels, bathrobes, then gift boxes.
// The sort is stable, so each group keeps the data order (towels by size, gift sets as listed).
const COLLECTION_ORDER = ['towels', 'beach', 'bathrobes', 'gift-sets'];
const rank = p => { const i = COLLECTION_ORDER.indexOf(p.category); return i < 0 ? COLLECTION_ORDER.length : i; };

// The Category filter lists the categories in the grid's order (#91). CATEGORIES itself keeps the
// menu and footer order, so it is sorted here rather than changed.
export function collectionCategories() {
  return [...CATEGORIES].sort((a, b) => rank({ category: a.id }) - rank({ category: b.id }));
}

// The grid's items: every product card, then the Build-your-box band (full width) after the last one,
// whatever the count (#91). With no matches the band stands alone.
export function gridItems(cards, band) {
  return [...cards, band];
}

export function filterProducts(products, state) {
  return products.filter(p => matches(p, state)).sort((a, b) => rank(a) - rank(b));
}

export function facetCounts(products, state) {
  const count = (facet, test) => products.filter(p => matches(p, state, facet) && test(p)).length;
  return {
    sale: { 'on-sale': count('sale', isOnSale) },
    category: Object.fromEntries(CATEGORIES.map(c => [c.id, count('category', p => p.category === c.id)])),
    price: Object.fromEntries(PRICE_BANDS.map(b => [b.id, count('price', p => b.test(currentPrice(p)))])),
    colour: Object.fromEntries(COLOURS.map(c => [c.id, count('colour', p => p.colours.includes(c.id))])),
  };
}
