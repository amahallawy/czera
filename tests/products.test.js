import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PRODUCTS, CATEGORIES } from '../js/data/products.js';
import { findProduct, byCategory, giftGroup, categoryMeta } from '../js/lib/products.js';

test('there are 16 products with unique slugs', () => {
  assert.equal(PRODUCTS.length, 16);
  assert.equal(new Set(PRODUCTS.map(p => p.slug)).size, 16);
});

test('category counts match the spec', () => {
  assert.equal(byCategory('towels').length, 4);
  assert.equal(byCategory('bathrobes').length, 2);
  assert.equal(byCategory('beach').length, 2);
  assert.equal(byCategory('gift-sets').length, 8);
  assert.deepEqual(CATEGORIES.map(c => c.id), ['towels', 'bathrobes', 'beach', 'gift-sets']);
});

test('every gift set costs the sum of its pieces (box and ribbon free)', () => {
  const unit = {
    'Face towel': 50, 'Hand towel': 230, 'Bath towel': 470, 'Bath sheet': 650,
    'White bathrobe': 1000, 'Black bathrobe': 1000,
    'Blue stripe beach towel': 850, 'Yellow stripe beach towel': 850,
  };
  for (const p of byCategory('gift-sets')) {
    const sum = p.contents.reduce((s, c) => s + c.qty * unit[c.label], 0);
    assert.equal(p.price, sum, p.slug);
  }
});

test('gift groups are two groups of four', () => {
  assert.equal(giftGroup('home').length, 4);
  assert.equal(giftGroup('robes-beach').length, 4);
});

test('findProduct returns null for unknown or missing slugs', () => {
  assert.equal(findProduct('bath-sheet').price, 650);
  assert.equal(findProduct('nope'), null);
  assert.equal(findProduct(null), null);
  assert.equal(findProduct(''), null);
});

test('categoryMeta gives count and lowest price', () => {
  assert.deepEqual(categoryMeta('gift-sets'), { count: 8, minPrice: 1410 });
  assert.deepEqual(categoryMeta('towels'), { count: 4, minPrice: 50 });
});

test('no product copy makes an unsupported claim', () => {
  const banned = /egyptian|nile|by hand|indulge|discover|elevate|bestseller|!/i;
  for (const p of PRODUCTS) {
    assert.ok(!banned.test([p.name, p.description, ...p.features].join(' ')), p.slug);
  }
});

test('every product has at least one image under assets/img', () => {
  for (const p of PRODUCTS) {
    assert.ok(p.images.length >= 1, p.slug);
    for (const src of p.images) assert.match(src, /^assets\/img\/(products|catalogue)\/[a-z0-9-]+\.jpg$/);
  }
});

test('the client photos lead the six towels, the old photos follow (#101)', async () => {
  const { existsSync } = await import('node:fs');
  const old = {
    'face-towel': [2, 3], 'hand-towel': [1, 3], 'bath-towel': [1, 2], 'bath-sheet': [1, 2],
    'blue-stripe-beach-towel': [2, 3], 'yellow-stripe-beach-towel': [1, 2],
  };
  for (const [slug, nums] of Object.entries(old)) {
    const p = findProduct(slug);
    assert.deepEqual(p.images, [
      `assets/img/products/${slug}-main.jpg`,
      ...nums.map(n => `assets/img/products/${slug}-${n}.jpg`),
    ], slug);
    for (const src of p.images) assert.ok(existsSync(new URL(`../${src}`, import.meta.url)), src);
  }
});
