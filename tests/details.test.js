import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DETAILS_KEY, readDetails, writeDetails } from '../js/lib/details.js';

const memory = () => { const m = new Map(); return { getItem: k => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, v), removeItem: k => m.delete(k) }; };
const full = { name: 'Sara', phone: '0100', address: '12 St', city: 'Cairo', note: 'gift' };

test('key is the versioned session key', () => assert.equal(DETAILS_KEY, 'czera.details.v1'));

test('write then read round-trips the five fields', () => {
  const s = memory();
  writeDetails(s, full);
  assert.deepEqual(readDetails(s), full);
});

test('read keeps only known string fields and ignores junk', () => {
  const s = memory();
  s.setItem(DETAILS_KEY, JSON.stringify({ name: 'A', phone: 5, evil: 'x', city: 'C' }));
  assert.deepEqual(readDetails(s), { name: 'A', city: 'C' });
});

test('missing, malformed or throwing storage gives an empty object', () => {
  assert.deepEqual(readDetails(memory()), {});
  const bad = memory(); bad.setItem(DETAILS_KEY, '{nope');
  assert.deepEqual(readDetails(bad), {});
  const boom = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); } };
  assert.deepEqual(readDetails(boom), {});
  assert.doesNotThrow(() => writeDetails(boom, full));
  assert.doesNotThrow(() => readDetails(undefined));
});
