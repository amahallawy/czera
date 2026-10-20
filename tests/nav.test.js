import { test } from 'node:test';
import assert from 'node:assert/strict';
import { menuItems } from '../js/lib/nav.js';
import { CATEGORIES } from '../js/data/products.js';

test('the menu lists the client order (#101)', () => {
  assert.deepEqual(menuItems().map(i => [i.label, i.href]), [
    ['Shop all', 'catalog.html'],
    ['The towel collection', 'catalog.html?category=towels'],
    ['Bathrobes', 'catalog.html?category=bathrobes'],
    ['Beach towels', 'catalog.html?category=beach'],
    ['Gift sets', 'catalog.html?category=gift-sets'],
    ['Build Your Own Box', 'build-your-box.html'],
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
