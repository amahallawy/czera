import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PRODUCTS } from '../js/data/products.js';
import { emptyFilters, filterProducts, facetCounts } from '../js/lib/filters.js';

test('no filters returns all 16 in data order', () => {
  assert.deepEqual(filterProducts(PRODUCTS, emptyFilters()).map(p => p.slug), PRODUCTS.map(p => p.slug));
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
