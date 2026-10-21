import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isOnSale, currentPrice, saleProducts } from '../js/lib/pricing.js';

test('a product with a lower salePrice is on sale and sells at that price', () => {
  const p = { price: 1450, salePrice: 1160 };
  assert.equal(isOnSale(p), true);
  assert.equal(currentPrice(p), 1160);
});

test('without a valid lower salePrice the regular price applies', () => {
  for (const salePrice of [undefined, 'abc', 1450, 1600, 0, -5]) {
    const p = { price: 1450, salePrice };
    assert.equal(isOnSale(p), false, `salePrice ${salePrice}`);
    assert.equal(currentPrice(p), 1450, `salePrice ${salePrice}`);
  }
});

test('saleProducts lists exactly the demo sale products', () => {
  assert.deepEqual(saleProducts().map(p => p.slug), ['complete-czera-set', 'blue-stripe-beach-towel']);
});
