import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderProductCard, priceHtml } from '../js/ui/card.js';
import { formatEGP } from '../js/lib/format.js';
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

test('a product on sale shows the Sale flag, the struck regular price and the sale price', () => {
  const html = renderProductCard(findProduct('complete-czera-set'));
  assert.match(html, /<span class="card__flag">Sale<\/span>/);
  assert.match(html, /<s class="price__was"><span class="sr-only">Was <\/span>1,450 EGP<\/s>/);
  assert.match(html, /<span class="price__now"><span class="sr-only">, now <\/span>1,160 EGP<\/span>/);
});

test('a product not on sale has no flag and no struck price', () => {
  const html = renderProductCard(findProduct('face-towel'));
  assert.doesNotMatch(html, /card__flag/);
  assert.doesNotMatch(html, /price__was/);
});

test('priceHtml is the plain price when not on sale and the was/now pair when on sale', () => {
  assert.equal(priceHtml(findProduct('face-towel')), formatEGP(findProduct('face-towel').price));
  assert.equal(priceHtml(findProduct('complete-czera-set')),
    '<span class="price"><s class="price__was"><span class="sr-only">Was </span>1,450 EGP</s> <span class="price__now"><span class="sr-only">, now </span>1,160 EGP</span></span>');
});
