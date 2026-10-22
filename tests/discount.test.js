import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  normaliseCode, isValidCode, orderTotals, CODE_KEY, readCode, writeCode, clearCode,
} from '../js/lib/discount.js';
import { CONFIG } from '../js/config.js';

const bag = [
  { type: 'product', slug: 'complete-czera-set', qty: 1 },
  { type: 'product', slug: 'bath-towel', qty: 2 },
];

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

test('normaliseCode trims and upper-cases', () => {
  assert.equal(normaliseCode('  welcome10 '), 'WELCOME10');
  assert.equal(normaliseCode(undefined), '');
});

test('isValidCode matches case-insensitively after trimming', () => {
  assert.equal(isValidCode(' welcome10 '), true);
  assert.equal(isValidCode('WELCOME1'), false);
  assert.equal(isValidCode(''), false);
});

test('orderTotals applies the percent to the subtotal after sale prices', () => {
  assert.deepEqual(orderTotals(bag, 'WELCOME10'), { subtotal: 2100, discount: 210, total: 1890 });
});

test('orderTotals gives no discount for an invalid or empty code', () => {
  assert.deepEqual(orderTotals(bag, 'nope'), { subtotal: 2100, discount: 0, total: 2100 });
  assert.equal(orderTotals(bag, '').discount, 0);
});

test('orderTotals rounds the discount to whole EGP (half rounds up)', () => {
  // Demo prices are multiples of 10, so 10% never leaves a fraction; borrow other percents.
  const towel = [{ type: 'product', slug: 'bath-towel', qty: 1 }]; // 470 EGP
  const percent = CONFIG.firstOrder.percent;
  try {
    CONFIG.firstOrder.percent = 15; // 70.5 -> 71
    assert.deepEqual(orderTotals(towel, 'WELCOME10'), { subtotal: 470, discount: 71, total: 399 });
    CONFIG.firstOrder.percent = 13; // 61.1 -> 61
    assert.deepEqual(orderTotals(towel, 'WELCOME10'), { subtotal: 470, discount: 61, total: 409 });
  } finally {
    CONFIG.firstOrder.percent = percent;
  }
});

test('readCode ignores a stored code that is not valid', () => {
  assert.equal(readCode(memoryStorage({ [CODE_KEY]: 'OLD5' })), '');
});

test('writeCode and readCode round-trip, normalised; clearCode empties it', () => {
  const s = memoryStorage();
  writeCode(s, 'welcome10');
  assert.equal(readCode(s), 'WELCOME10');
  clearCode(s);
  assert.equal(readCode(s), '');
});

test('null or throwing storage never throws', () => {
  for (const s of [null, undefined, throwing]) {
    assert.equal(readCode(s), '');
    assert.doesNotThrow(() => writeCode(s, 'WELCOME10'));
    assert.doesNotThrow(() => clearCode(s));
  }
});
