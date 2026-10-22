import { test } from 'node:test';
import assert from 'node:assert/strict';
import { promoDismissed, dismissPromo } from '../js/lib/discount.js';

function memoryStorage(initial = {}) {
  const data = { ...initial };
  return {
    getItem: k => (k in data ? data[k] : null),
    setItem: (k, v) => { data[k] = String(v); },
    removeItem: k => { delete data[k]; },
  };
}
const throwing = {
  getItem() { throw new Error('denied'); },
  setItem() { throw new Error('denied'); },
  removeItem() { throw new Error('denied'); },
};

test('the top line is not dismissed initially', () => {
  assert.equal(promoDismissed(memoryStorage(), 'WELCOME10'), false);
});

test('dismissing remembers that code only', () => {
  const s = memoryStorage();
  dismissPromo(s, 'WELCOME10');
  assert.equal(promoDismissed(s, 'WELCOME10'), true);
  assert.equal(promoDismissed(s, 'SPRING15'), false);
});

test('null and throwing storage never throw and read as not dismissed', () => {
  assert.equal(promoDismissed(null, 'WELCOME10'), false);
  assert.doesNotThrow(() => dismissPromo(null, 'WELCOME10'));
  assert.equal(promoDismissed(throwing, 'WELCOME10'), false);
  assert.doesNotThrow(() => dismissPromo(throwing, 'WELCOME10'));
});
