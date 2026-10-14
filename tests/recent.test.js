import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readRecent, pushRecent, RECENT_KEY } from '../js/lib/recent.js';

const mem = (init = {}) => { const d = { ...init }; return { getItem: k => d[k] ?? null, setItem: (k, v) => { d[k] = v; } }; };

test('keeps the latest four unique slugs, newest first', () => {
  const s = mem();
  for (const slug of ['a-1', 'b-1', 'c-1', 'a-1', 'd-1', 'e-1']) pushRecent(s, slug);
  assert.deepEqual(readRecent(s), ['e-1', 'd-1', 'a-1', 'c-1']);
});

test('bad stored data or throwing storage reads as empty', () => {
  assert.deepEqual(readRecent(mem({ [RECENT_KEY]: 'oops' })), []);
  assert.deepEqual(readRecent({ getItem() { throw new Error('x'); } }), []);
  assert.deepEqual(readRecent(null), []);
});
