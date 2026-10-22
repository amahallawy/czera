import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PRODUCTS, CATEGORIES } from '../js/data/products.js';
import { emptyFilters, filterProducts, facetCounts, collectionCategories, gridItems } from '../js/lib/filters.js';

const ORDER = ['towels', 'beach', 'bathrobes', 'gift-sets'];   // white towels, striped, robes, boxes

test('no filters returns all 16: white towels, striped towels, bathrobes, then gift boxes', () => {
  const got = filterProducts(PRODUCTS, emptyFilters());
  assert.equal(got.length, 16);
  const ranks = got.map(p => ORDER.indexOf(p.category));
  assert.deepEqual(ranks, [...ranks].sort((a, b) => a - b));
  assert.deepEqual(got.slice(0, 4).map(p => p.name), ['Face Towel', 'Hand Towel', 'Bath Towel', 'Bath Sheet']);
  assert.equal(got[15].category, 'gift-sets');
});

test('within a group the data order is kept, and filtering keeps the group order', () => {
  const all = filterProducts(PRODUCTS, emptyFilters());
  const gifts = all.filter(p => p.category === 'gift-sets').map(p => p.slug);
  assert.deepEqual(gifts, PRODUCTS.filter(p => p.category === 'gift-sets').map(p => p.slug));
  const white = filterProducts(PRODUCTS, { ...emptyFilters(), colours: new Set(['white']) }).map(p => ORDER.indexOf(p.category));
  assert.deepEqual(white, [...white].sort((a, b) => a - b));
});

test('price bands split 3 / 7 / 6', () => {
  const c = facetCounts(PRODUCTS, emptyFilters());
  assert.deepEqual(c.price, { 'under-500': 3, '500-1500': 7, 'over-1500': 6 });
  assert.deepEqual(c.category, { towels: 4, bathrobes: 2, beach: 2, 'gift-sets': 8 });
});

test('OR within a facet, AND across facets', () => {
  const s = emptyFilters();
  s.categories.add('towels'); s.categories.add('beach');
  assert.equal(filterProducts(PRODUCTS, s).length, 6);
  s.prices.add('under-500');
  assert.deepEqual(filterProducts(PRODUCTS, s).map(p => p.slug), ['face-towel', 'hand-towel', 'bath-towel']);
});

test('counts reflect the other facets, so dead options show 0', () => {
  const s = emptyFilters();
  s.categories.add('bathrobes');
  const c = facetCounts(PRODUCTS, s);
  assert.equal(c.price['under-500'], 0);
  assert.equal(c.colour.striped, 0);
  assert.equal(c.category.towels, 4); // own facet ignores its own selection
});

test('the Sale filter keeps only products on sale, and combines with the other facets (#123)', () => {
  const s = emptyFilters();
  s.sale.add('on-sale');
  assert.deepEqual(filterProducts(PRODUCTS, s).map(p => p.slug).sort(), ['blue-stripe-beach-towel', 'complete-czera-set']);
  s.categories.add('beach');
  assert.deepEqual(filterProducts(PRODUCTS, s).map(p => p.slug), ['blue-stripe-beach-towel']);
});

test('the Sale filter counts products on sale, against the other facets (#123)', () => {
  assert.deepEqual(facetCounts(PRODUCTS, emptyFilters()).sale, { 'on-sale': 2 });
  const s = emptyFilters();
  s.categories.add('bathrobes');
  assert.deepEqual(facetCounts(PRODUCTS, s).sale, { 'on-sale': 0 });
  const noSale = PRODUCTS.map(p => ({ ...p, salePrice: undefined }));
  assert.deepEqual(facetCounts(noSale, emptyFilters()).sale, { 'on-sale': 0 });
});

test('the Category filter lists the grid order: Towels, Beach, Bathrobes, Gift sets (#91)', () => {
  assert.deepEqual(collectionCategories().map(c => c.label), ['Towels', 'Beach', 'Bathrobes', 'Gift sets']);
  // The menu and footer keep CATEGORIES' own order.
  assert.deepEqual(CATEGORIES.map(c => c.id), ['towels', 'bathrobes', 'beach', 'gift-sets']);
});

test('the Build-your-box band follows the last product card, whatever the count (#91)', () => {
  const cards = n => Array.from({ length: n }, (_, i) => `card${i}`);
  for (const n of [16, 4, 3, 1]) {
    const got = gridItems(cards(n), 'BAND');
    assert.equal(got.length, n + 1);
    assert.equal(got.at(-1), 'BAND');
    assert.deepEqual(got.slice(0, n), cards(n));
  }
  assert.deepEqual(gridItems([], 'BAND'), ['BAND']);   // no matches: the band alone still offers a way on
});
