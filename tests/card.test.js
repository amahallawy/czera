import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderProductCard } from '../js/ui/card.js';
import { findProduct } from '../js/lib/products.js';

test('card shows name, spec, price, link and add-to-bag control', () => {
  const html = renderProductCard(findProduct('hand-and-bath-sheet-set'));
  assert.match(html, /href="product\.html\?slug=hand-and-bath-sheet-set"/);
  assert.match(html, /Hand &amp; Bath Sheet Set/);
  assert.match(html, /1,760 EGP/);
  assert.match(html, /data-add-to-bag="hand-and-bath-sheet-set"/);
  assert.match(html, /alt="Hand &amp; Bath Sheet Set"/);
});

test('second photo is included for hover when the product has one', () => {
  assert.match(renderProductCard(findProduct('bath-sheet')), /card__img--alt/);
  assert.doesNotMatch(renderProductCard(findProduct('beach-towel-set')), /card__img--alt/);
});
