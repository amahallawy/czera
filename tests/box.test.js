import { test } from 'node:test';
import assert from 'node:assert/strict';
import { emptyBox, pieceCount, boxPrice, validateBox, boxKey, boxItemsText, boxLabel, sizeAllowed } from '../js/lib/box.js';

const sample = () => ({ ...emptyBox(), items: { face: 2, hand: 1, bath: 1, sheet: 1, beach: 0 } });

test('price is the sum of the chosen towels; box and ribbon are free', () => {
  assert.equal(boxPrice(sample()), 1450);
  assert.equal(pieceCount(sample()), 5);
});

test('defaults: black box, burgundy ribbon, white, no pieces', () => {
  const b = emptyBox();
  assert.equal(b.box, 'black'); assert.equal(b.ribbon, 'burgundy'); assert.equal(b.colour, 'white');
  assert.equal(pieceCount(b), 0);
});

test('needs at least two pieces', () => {
  assert.deepEqual(validateBox(emptyBox()), { ok: false, reason: 'Choose at least 2 pieces.' });
  assert.equal(validateBox({ ...emptyBox(), items: { ...emptyBox().items, face: 1 } }).ok, false);
});

test('holds at most six pieces', () => {
  const sel = { ...emptyBox(), items: { face: 7, hand: 0, bath: 0, sheet: 0, beach: 0 } };
  assert.deepEqual(validateBox(sel), { ok: false, reason: 'A box holds up to 6 pieces.' });
});

test('striped colours come in the beach size only', () => {
  const sel = { ...sample(), colour: 'blue' };
  assert.deepEqual(validateBox(sel), { ok: false, reason: 'Striped colours come in the beach size only.' });
  assert.equal(sizeAllowed(sel, 'face'), false);
  assert.equal(sizeAllowed(sel, 'beach'), true);
  const beachOnly = { ...emptyBox(), colour: 'yellow', items: { face: 0, hand: 0, bath: 0, sheet: 0, beach: 2 } };
  assert.deepEqual(validateBox(beachOnly), { ok: true, reason: null });
});

test('rejects unknown choices and bad quantities', () => {
  assert.equal(validateBox({ ...sample(), box: 'gold' }).ok, false);
  assert.equal(validateBox({ ...sample(), items: { ...sample().items, face: -1 } }).ok, false);
  assert.equal(validateBox({ ...sample(), items: { ...sample().items, face: 1.5 } }).ok, false);
  assert.equal(validateBox(null).ok, false);
});

test('key, items text and label are stable and readable', () => {
  assert.equal(boxKey(sample()), 'black|burgundy|white|face:2,hand:1,bath:1,sheet:1');
  assert.equal(boxItemsText(sample()), '2 × Face, 1 × Hand, 1 × Bath, 1 × Bath sheet');
  assert.equal(boxLabel(sample()), 'Custom box (black box, burgundy ribbon): 2 × Face, 1 × Hand, 1 × Bath, 1 × Bath sheet, white');
});
