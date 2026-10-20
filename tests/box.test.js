import { test } from 'node:test';
import assert from 'node:assert/strict';
import { emptyBox, pieceCount, boxPrice, validateBox, boxKey, boxItemsText, boxLabel, sizeAllowed, TOWEL_COLOURS, colourConflicts, colourBlockReason, allowedColours } from '../js/lib/box.js';

const sample = () => ({ ...emptyBox(), items: { face: 2, hand: 1, bath: 1, sheet: 1, beach: 0 } });

test('price is the sum of the chosen towels; the box is free', () => {
  assert.equal(boxPrice(sample()), 1450);
  assert.equal(pieceCount(sample()), 5);
});

test('defaults: white, no pieces, and no box colour or ribbon choice', () => {
  const b = emptyBox();
  assert.equal(b.colour, 'white');
  assert.equal('box' in b, false);
  assert.equal('ribbon' in b, false);
  assert.equal(pieceCount(b), 0);
});

test('box colour and ribbon fields from an older bag are ignored, not required', () => {
  assert.equal(validateBox({ ...sample(), ribbon: 'gold' }).ok, true);
  assert.equal(validateBox({ ...sample(), box: 'beige' }).ok, true);
  assert.equal(validateBox(sample()).ok, true);
  assert.equal(boxKey({ ...sample(), ribbon: 'gold' }), boxKey(sample()));
  assert.equal(boxKey({ ...sample(), box: 'black' }), boxKey({ ...sample(), box: 'beige' }));
});

test('needs at least two pieces', () => {
  assert.deepEqual(validateBox(emptyBox()), { ok: false, reason: 'Choose at least 2 pieces.' });
  assert.equal(validateBox({ ...emptyBox(), items: { ...emptyBox().items, face: 1 } }).ok, false);
});

test('holds at most six pieces', () => {
  const sel = { ...emptyBox(), items: { face: 7, hand: 0, bath: 0, sheet: 0, beach: 0 } };
  assert.deepEqual(validateBox(sel), { ok: false, reason: 'A box holds up to 6 pieces.' });
});

test('white comes in face, hand, bath and sheet, never beach', () => {
  const sel = { ...emptyBox(), colour: 'white', items: { face: 0, hand: 0, bath: 0, sheet: 0, beach: 2 } };
  assert.equal(sizeAllowed(sel, 'beach'), false);
  assert.equal(sizeAllowed(sel, 'sheet'), true);
  assert.deepEqual(validateBox(sel), { ok: false, reason: 'Beach towels come in blue or yellow stripes only.' });
  assert.equal(validateBox(sample()).ok, true);
});

test('striped colours come in the beach size only', () => {
  const sel = { ...sample(), colour: 'blue' };
  assert.deepEqual(validateBox(sel), { ok: false, reason: 'Striped towels come in the beach size only.' });
  assert.equal(validateBox({ ...emptyBox(), colour: 'blue', items: { face: 2, hand: 0, bath: 0, sheet: 0, beach: 0 } }).ok, false);
  assert.equal(sizeAllowed(sel, 'face'), false);
  assert.equal(sizeAllowed(sel, 'beach'), true);
  const beachOnly = { ...emptyBox(), colour: 'yellow', items: { face: 0, hand: 0, bath: 0, sheet: 0, beach: 2 } };
  assert.deepEqual(validateBox(beachOnly), { ok: true, reason: null });
});

test('black is not a towel colour', () => {
  assert.deepEqual(TOWEL_COLOURS, ['white', 'blue', 'yellow']);
  assert.equal(validateBox({ ...sample(), colour: 'black' }).ok, false);
});

test('rejects unknown choices and bad quantities', () => {
  assert.equal(validateBox({ ...sample(), colour: 'gold' }).ok, false);
  assert.equal(validateBox({ ...sample(), items: { ...sample().items, face: -1 } }).ok, false);
  assert.equal(validateBox({ ...sample(), items: { ...sample().items, face: 1.5 } }).ok, false);
  assert.equal(validateBox(null).ok, false);
});

test('key, items text and label are stable and readable', () => {
  assert.equal(boxKey(sample()), 'white|face:2,hand:1,bath:1,sheet:1');
  assert.equal(boxItemsText(sample()), '2 × Face, 1 × Hand, 1 × Bath, 1 × Bath sheet');
  assert.equal(boxLabel(sample()), 'Custom box: 2 × Face, 1 × Hand, 1 × Bath, 1 × Bath sheet, white');
});

const none = () => emptyBox().items;
const withItems = extra => ({ ...none(), ...extra });

test('an empty box can take any towel colour', () => {
  assert.deepEqual(allowedColours(none()), ['white', 'blue', 'yellow']);
  for (const c of TOWEL_COLOURS) assert.equal(colourBlockReason(c, none()), null);
});

test('white towels in the box rule out the striped colours, with a reason naming them', () => {
  const items = withItems({ face: 2, sheet: 1 });
  assert.deepEqual(allowedColours(items), ['white']);
  assert.deepEqual(colourConflicts('blue', items), ['face', 'sheet']);
  assert.equal(colourBlockReason('white', items), null);
  assert.equal(colourBlockReason('blue', items), 'Stripes come in the beach size only. Remove the face towels and bath sheets first.');
  assert.equal(colourBlockReason('yellow', withItems({ face: 1, hand: 1, bath: 1 })),
    'Stripes come in the beach size only. Remove the face towels, hand towels and bath towels first.');
});

test('beach towels in the box rule out white, but not the other stripe', () => {
  const items = withItems({ beach: 2 });
  assert.deepEqual(allowedColours(items), ['blue', 'yellow']);
  assert.deepEqual(colourConflicts('white', items), ['beach']);
  assert.equal(colourBlockReason('white', items), 'No beach size in white. Remove the beach towels first.');
  assert.equal(colourBlockReason('yellow', items), null);
});

test('colour checks tolerate missing items and unknown colours', () => {
  assert.deepEqual(colourConflicts('white', undefined), []);
  assert.equal(colourBlockReason('black', none()), 'Not available.');
});
