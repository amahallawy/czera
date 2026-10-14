import { test } from 'node:test';
import assert from 'node:assert/strict';
import { summariseLines } from '../js/lib/summary.js';

const lines = n => Array.from({ length: n }, (_, i) => ({ title: `Item ${i + 1}`, qty: i + 1, total: 100 * (i + 1) }));

test('short lists are returned whole with no overflow', () => {
  const r = summariseLines(lines(3));
  assert.equal(r.shown.length, 3);
  assert.equal(r.more, 0);
});

test('long lists collapse to the first 3 and count the rest', () => {
  const r = summariseLines(lines(7));
  assert.deepEqual(r.shown.map(l => l.title), ['Item 1', 'Item 2', 'Item 3']);
  assert.equal(r.more, 4);
});

test('limit is adjustable and an empty list is safe', () => {
  assert.equal(summariseLines(lines(5), 2).more, 3);
  assert.deepEqual(summariseLines([]), { shown: [], more: 0 });
});
