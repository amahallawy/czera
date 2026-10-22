import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createBag, describeLine, bagTotal, lineKey, BAG_KEY, MAX_QTY } from '../js/lib/bag.js';
import { emptyBox } from '../js/lib/box.js';

function memoryStorage(initial = {}) {
  const data = { ...initial };
  return { getItem: k => (k in data ? data[k] : null), setItem: (k, v) => { data[k] = String(v); }, data };
}
const throwingStorage = { getItem() { throw new Error('denied'); }, setItem() { throw new Error('denied'); } };
const box = () => ({ ...emptyBox(), items: { ...emptyBox().items, 'white-face': 2, 'white-bath': 1 } });
// A box saved before #113: one towel colour and counts per size.
const oldBox = extra => ({ colour: 'white', items: { face: 2, hand: 0, bath: 1, sheet: 0, beach: 0 }, ...extra });

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
  assert.equal(lineKey(line), 'box:white-face:2,white-bath:1');
  const d = describeLine(line);
  assert.equal(d.total, 570);
  assert.equal(d.messageLabel, 'Custom box: 2 × Face (white), 1 × Bath (white)');
  assert.equal(d.spec, '2 × Face (white), 1 × Bath (white)');
});

test('describeLine and bagTotal compute prices from current data', () => {
  const lines = [
    { type: 'product', slug: 'complete-czera-set', qty: 1 },
    { type: 'product', slug: 'black-bathrobe', qty: 1 },
    { type: 'box', box: box(), qty: 1 },
  ];
  assert.equal(describeLine(lines[0]).total, 1160);
  assert.equal(bagTotal(lines), 2730);
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

test('a box saved with the old box colour and ribbon fields still loads, without them', () => {
  const stored = JSON.stringify([
    { type: 'box', box: oldBox({ box: 'black', ribbon: 'burgundy' }), qty: 1 },
  ]);
  const bag = createBag(memoryStorage({ [BAG_KEY]: stored }));
  const [line] = bag.lines();
  assert.equal(bag.lines().length, 1);
  assert.equal('ribbon' in line.box, false);
  assert.equal('box' in line.box, false);
  assert.equal(line.box.items['white-face'], 2);   // the old counts per size, now white towels
  bag.add({ type: 'box', box: box(), qty: 1 });   // the same box chosen today joins the saved line
  assert.equal(bag.lines().length, 1);
  assert.equal(bag.lines()[0].qty, 2);
});

test('two saved boxes that differed only by box colour or ribbon become one line', () => {
  const old = (box, ribbon) => ({ type: 'box', box: oldBox({ box, ribbon }), qty: 1 });
  const bag = createBag(memoryStorage({ [BAG_KEY]: JSON.stringify([old('black', 'burgundy'), old('beige', 'gold')]) }));
  assert.equal(bag.lines().length, 1);
  assert.equal(bag.lines()[0].qty, 2);
  bag.setQty('box:white-face:2,white-bath:1', 3);   // one press acts on one line
  assert.equal(bag.count(), 3);
});

test('merging saved lines never goes past the per-line limit', () => {
  const line = { type: 'product', slug: 'face-towel', qty: MAX_QTY };
  const bag = createBag(memoryStorage({ [BAG_KEY]: JSON.stringify([line, line]) }));
  assert.equal(bag.lines().length, 1);
  assert.equal(bag.lines()[0].qty, MAX_QTY);
});

test('stored boxes with retired colour rules are dropped', () => {
  const stored = JSON.stringify([
    { type: 'box', box: { box: 'black', ribbon: 'gold', colour: 'black', items: { face: 2, hand: 0, bath: 1, sheet: 0, beach: 0 } }, qty: 1 },
    { type: 'box', box: { box: 'black', ribbon: 'gold', colour: 'white', items: { face: 0, hand: 0, bath: 0, sheet: 0, beach: 2 } }, qty: 1 },
    { type: 'box', box: { box: 'black', ribbon: 'gold', colour: 'yellow', items: { face: 0, hand: 0, bath: 0, sheet: 0, beach: 2 } }, qty: 1 },
  ]);
  assert.equal(createBag(memoryStorage({ [BAG_KEY]: stored })).lines().length, 1);
});

test('a box with bathrobes is one line whose spec names them', () => {
  const bag = createBag(memoryStorage());
  bag.add({ type: 'box', box: { ...emptyBox(), items: { ...emptyBox().items, 'white-bath': 2, robeBlack: 1 } }, qty: 1 });
  const [line] = bag.lines();
  assert.equal(line.box.items.robeBlack, 1);
  const d = describeLine(line);
  assert.equal(d.total, 1940);
  assert.equal(d.spec, '2 × Bath (white) · 1 × Black bathrobe');
  assert.equal(d.messageLabel, 'Custom box: 2 × Bath (white); 1 × Black bathrobe');
});

test('a box of bathrobes alone has no towel colour in its spec', () => {
  const bag = createBag(memoryStorage());
  bag.add({ type: 'box', box: { ...emptyBox(), items: { ...emptyBox().items, robeWhite: 1, robeBlack: 1 } }, qty: 1 });
  assert.equal(describeLine(bag.lines()[0]).spec, '1 × White bathrobe, 1 × Black bathrobe');
});

test('two boxes of the same bathrobes become one line, whatever towel colour was selected', () => {
  const robesOnly = colour => ({ type: 'box', box: { ...emptyBox(), colour, items: { ...emptyBox().items, robeBlack: 2 } }, qty: 1 });
  const bag = createBag(memoryStorage());
  bag.add(robesOnly('blue'));
  bag.add(robesOnly('white'));
  assert.equal(bag.lines().length, 1);
  assert.equal(bag.lines()[0].qty, 2);
  const saved = createBag(memoryStorage({ [BAG_KEY]: JSON.stringify([robesOnly('blue'), robesOnly('yellow')]) }));
  assert.equal(saved.lines().length, 1);
});

test('a box with towels in two colours is one line listing each colour', () => {
  const bag = createBag(memoryStorage());
  const mixed = () => ({ type: 'box', box: { ...emptyBox(), colour: 'yellow', items: { ...emptyBox().items, 'white-bath': 2, 'blue-beach': 1 } }, qty: 1 });
  bag.add(mixed());
  bag.add(mixed());
  assert.equal(bag.lines().length, 1);
  assert.equal(bag.lines()[0].qty, 2);
  const d = describeLine(bag.lines()[0]);
  assert.equal(d.total, 2 * (940 + 680));
  assert.equal(d.messageLabel, 'Custom box: 2 × Bath (white), 1 × Beach (blue stripe)');
});

test('a saved one-colour box and the same towels chosen today become one line', () => {
  const bag = createBag(memoryStorage({ [BAG_KEY]: JSON.stringify([{ type: 'box', box: oldBox(), qty: 1 }]) }));
  bag.add({ type: 'box', box: box(), qty: 1 });
  assert.equal(bag.lines().length, 1);
  assert.equal(bag.lines()[0].qty, 2);
});

test('a product on sale is priced at its sale price in the bag', () => {
  const d = describeLine({ type: 'product', slug: 'complete-czera-set', qty: 2 });
  assert.equal(d.unitPrice, 1160);
  assert.equal(d.total, 2320);
});
