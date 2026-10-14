import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createBag, describeLine, bagTotal, lineKey, BAG_KEY, MAX_QTY } from '../js/lib/bag.js';
import { emptyBox } from '../js/lib/box.js';

function memoryStorage(initial = {}) {
  const data = { ...initial };
  return { getItem: k => (k in data ? data[k] : null), setItem: (k, v) => { data[k] = String(v); }, data };
}
const throwingStorage = { getItem() { throw new Error('denied'); }, setItem() { throw new Error('denied'); } };
const box = () => ({ ...emptyBox(), items: { face: 2, hand: 0, bath: 1, sheet: 0, beach: 0 } });

test('adding the same product twice merges quantities and persists', () => {
  const s = memoryStorage();
  const bag = createBag(s);
  bag.add({ type: 'product', slug: 'bath-sheet', qty: 1 });
  bag.add({ type: 'product', slug: 'bath-sheet', qty: 2 });
  assert.equal(bag.count(), 3);
  assert.deepEqual(JSON.parse(s.data[BAG_KEY]), [{ type: 'product', slug: 'bath-sheet', qty: 3 }]);
});

test('a new bag reads what an earlier page saved', () => {
  const s = memoryStorage();
  createBag(s).add({ type: 'product', slug: 'face-towel', qty: 2 });
  assert.equal(createBag(s).count(), 2);
});

test('quantity is clamped to MAX_QTY and setQty below 1 removes the line', () => {
  const bag = createBag(memoryStorage());
  bag.add({ type: 'product', slug: 'face-towel', qty: 99 });
  assert.equal(bag.count(), MAX_QTY);
  bag.setQty('product:face-towel', 0);
  assert.equal(bag.lines().length, 0);
});

test('corrupt or outdated stored data loads as a cleaned bag', () => {
  assert.equal(createBag(memoryStorage({ [BAG_KEY]: '{not json' })).count(), 0);
  assert.equal(createBag(memoryStorage({ [BAG_KEY]: '{"a":1}' })).count(), 0);
  const stored = JSON.stringify([
    { type: 'product', slug: 'gone-product', qty: 1 },
    { type: 'product', slug: 'bath-sheet', qty: -2 },
    { type: 'product', slug: 'bath-towel', qty: 1.5 },
    { type: 'product', slug: 'hand-towel', qty: 2 },
    { type: 'box', box: { box: 'gold' }, qty: 1 },
  ]);
  const bag = createBag(memoryStorage({ [BAG_KEY]: stored }));
  assert.deepEqual(bag.lines(), [{ type: 'product', slug: 'hand-towel', qty: 2 }]);
});

test('storage that throws (or is missing) leaves the bag working in memory', () => {
  for (const storage of [throwingStorage, null]) {
    const bag = createBag(storage);
    bag.add({ type: 'product', slug: 'bath-sheet', qty: 1 });
    assert.equal(bag.count(), 1);
  }
});

test('add ignores unknown products and invalid boxes', () => {
  const bag = createBag(memoryStorage());
  bag.add({ type: 'product', slug: 'nope', qty: 1 });
  bag.add({ type: 'box', box: emptyBox(), qty: 1 });
  assert.equal(bag.count(), 0);
});

test('custom boxes are lines with their own key and price', () => {
  const bag = createBag(memoryStorage());
  bag.add({ type: 'box', box: box(), qty: 1 });
  const [line] = bag.lines();
  assert.equal(lineKey(line), 'box:black|burgundy|white|face:2,bath:1');
  const d = describeLine(line);
  assert.equal(d.total, 570);
  assert.equal(d.messageLabel, 'Custom box (black box, burgundy ribbon): 2 × Face, 1 × Bath, white');
});

test('describeLine and bagTotal compute prices from current data', () => {
  const lines = [
    { type: 'product', slug: 'complete-czera-set', qty: 1 },
    { type: 'product', slug: 'black-bathrobe', qty: 1 },
    { type: 'box', box: box(), qty: 1 },
  ];
  assert.equal(describeLine(lines[0]).total, 1450);
  assert.equal(bagTotal(lines), 3020);
});

test('subscribers hear every change', () => {
  const bag = createBag(memoryStorage());
  let calls = 0;
  const off = bag.subscribe(() => { calls += 1; });
  bag.add({ type: 'product', slug: 'face-towel', qty: 1 });
  bag.remove('product:face-towel');
  off();
  bag.add({ type: 'product', slug: 'face-towel', qty: 1 });
  assert.equal(calls, 2);
});
