import { test } from 'node:test';
import assert from 'node:assert/strict';
import { menuItems } from '../js/lib/nav.js';
import { PRODUCTS, CATEGORIES } from '../js/data/products.js';

test('the menu lists the client order (#101)', () => {
  assert.deepEqual(menuItems().map(i => [i.label, i.href]), [
    ['Shop all', 'catalog.html'],
    ['The towel collection', 'catalog.html?category=towels'],
    ['Bathrobes', 'catalog.html?category=bathrobes'],
    ['Beach towels', 'catalog.html?category=beach'],
    ['Gift sets', 'catalog.html?category=gift-sets'],
    ['Build Your Own Box', 'build-your-box.html'],
    ['Sale', 'catalog.html?view=sale'],
    ['About CZERA', 'about.html'],
  ]);
});

test('only Build Your Own Box is featured', () => {
  assert.deepEqual(menuItems().filter(i => i.featured).map(i => i.label), ['Build Your Own Box']);
});

test('every category link points at a real category', () => {
  const ids = new Set(CATEGORIES.map(c => c.id));
  for (const { href } of menuItems()) {
    const id = new URL(href, 'https://x.test/').searchParams.get('category');
    if (id !== null) assert.ok(ids.has(id), href);
  }
});

test('the footer and filter labels are unchanged', () => {
  assert.deepEqual(CATEGORIES.map(c => c.label), ['Towels', 'Bathrobes', 'Beach', 'Gift sets']);
});

test('Sale sits after Build Your Own Box, styled like the plain links', () => {
  const items = menuItems();
  assert.deepEqual(items.slice(-3).map(i => i.label), ['Build Your Own Box', 'Sale', 'About CZERA']);
  assert.equal(items.find(i => i.label === 'Sale').featured, undefined);
});

test('no Sale item while nothing is on sale', () => {
  const none = PRODUCTS.map(p => ({ ...p, salePrice: undefined }));
  const items = menuItems(none);
  assert.ok(!items.some(i => i.label === 'Sale'));
  assert.equal(items.filter(i => i.featured).length, 1);
});
