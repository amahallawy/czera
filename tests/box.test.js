import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  emptyBox, normalizeBox, pieceCount, boxPrice, validateBox, boxKey, boxItemsText, boxLabel, boxSpecText,
  sizeAllowed, towelsForColour, towelId, TOWEL_COLOURS, BOX_TOWELS, BOX_ROBES, towelCount, robeCount, groupFull,
} from '../js/lib/box.js';

// A box built from counts, e.g. withItems({ 'white-face': 2 }).
const withItems = extra => ({ ...emptyBox(), items: { ...emptyBox().items, ...extra } });
const sample = () => withItems({ 'white-face': 2, 'white-hand': 1, 'white-bath': 1, 'white-sheet': 1 });

test('each towel is one colour and one size: four white sizes and two striped beach towels', () => {
  assert.deepEqual(BOX_TOWELS.map(t => t.id),
    ['white-face', 'white-hand', 'white-bath', 'white-sheet', 'blue-beach', 'yellow-beach']);
  assert.deepEqual(BOX_TOWELS.map(t => t.slug),
    ['face-towel', 'hand-towel', 'bath-towel', 'bath-sheet', 'blue-stripe-beach-towel', 'yellow-stripe-beach-towel']);
  assert.deepEqual(TOWEL_COLOURS, ['white', 'blue', 'yellow']);
  assert.equal(towelId('white', 'bath'), 'white-bath');
});

test('a colour shows only its own towels', () => {
  assert.deepEqual(towelsForColour('white').map(t => t.size), ['face', 'hand', 'bath', 'sheet']);
  assert.deepEqual(towelsForColour('blue').map(t => t.id), ['blue-beach']);
  assert.deepEqual(towelsForColour('yellow').map(t => t.id), ['yellow-beach']);
  assert.equal(sizeAllowed({ colour: 'white' }, 'beach'), false);
  assert.equal(sizeAllowed({ colour: 'blue' }, 'beach'), true);
});

test('defaults: white selected, everything at 0, no box colour or ribbon', () => {
  const b = emptyBox();
  assert.equal(b.colour, 'white');
  assert.equal(pieceCount(b), 0);
  for (const id of [...BOX_TOWELS, ...BOX_ROBES].map(x => x.id)) assert.equal(b.items[id], 0);
  assert.equal('box' in b, false);
  assert.equal('ribbon' in b, false);
});

test('price is the sum of the chosen pieces; the box is free', () => {
  assert.equal(boxPrice(sample()), 1450);
  assert.equal(pieceCount(sample()), 5);
});

test('one box can mix towel colours, as on WordPress', () => {
  const sel = withItems({ 'white-bath': 2, 'blue-beach': 1, 'yellow-beach': 1 });
  assert.deepEqual(validateBox(sel), { ok: true, reason: null });
  assert.equal(towelCount(sel), 4);
  assert.equal(boxPrice(sel), 2 * 470 + 850 + 850);
});

test('the selected colour is only a filter: it does not change the box', () => {
  const a = { ...withItems({ 'white-bath': 2 }), colour: 'white' };
  const b = { ...withItems({ 'white-bath': 2 }), colour: 'yellow' };
  assert.equal(validateBox(b).ok, true);
  assert.equal(boxKey(a), boxKey(b));
  assert.equal(boxLabel(a), boxLabel(b));
});

test('needs at least two pieces', () => {
  assert.deepEqual(validateBox(emptyBox()), { ok: false, reason: 'Choose at least 2 pieces.' });
  assert.equal(validateBox(withItems({ 'white-face': 1 })).ok, false);
});

test('holds at most six towels across all colours, and two bathrobes', () => {
  assert.deepEqual(validateBox(withItems({ 'white-face': 4, 'blue-beach': 3 })), { ok: false, reason: 'Towels: up to 6 per box.' });
  assert.equal(validateBox(withItems({ 'white-bath': 4, 'yellow-beach': 2, robeWhite: 1, robeBlack: 1 })).ok, true);
  assert.deepEqual(validateBox(withItems({ robeWhite: 2, robeBlack: 1 })), { ok: false, reason: 'Bathrobes: up to 2 per box.' });
});

test('a group is full at its limit, counting every colour', () => {
  assert.equal(groupFull(withItems({ 'white-bath': 5 }), 'towels'), false);
  assert.equal(groupFull(withItems({ 'white-bath': 4, 'blue-beach': 2 }), 'towels'), true);
  assert.equal(groupFull(withItems({ robeWhite: 1 }), 'robes'), false);
  assert.equal(groupFull(withItems({ robeWhite: 1, robeBlack: 1 }), 'robes'), true);
});

test('bathrobes count as pieces and are priced', () => {
  const sel = withItems({ 'white-bath': 2, robeBlack: 1 });
  assert.equal(pieceCount(sel), 3);
  assert.equal(robeCount(sel), 1);
  assert.equal(boxPrice(sel), 1940);
  assert.equal(validateBox(withItems({ robeWhite: 1, robeBlack: 1 })).ok, true);   // bathrobes alone
});

test('rejects bad quantities and towels that do not exist', () => {
  assert.equal(validateBox(withItems({ 'white-face': 2, robeBlack: -1 })).ok, false);
  assert.equal(validateBox(withItems({ 'white-face': 1.5, 'white-bath': 1 })).ok, false);
  assert.equal(validateBox(withItems({ 'white-beach': 2 })).ok, false);   // no white beach towel
  assert.equal(validateBox(null).ok, false);
});

test('box colour and ribbon fields from an older bag are ignored', () => {
  assert.equal(validateBox({ ...sample(), ribbon: 'gold', box: 'beige' }).ok, true);
  assert.equal(boxKey({ ...sample(), box: 'black' }), boxKey({ ...sample(), box: 'beige' }));
});

test('an older one-colour box (counts per size) becomes the same towels in that colour', () => {
  const old = { colour: 'white', items: { face: 2, hand: 0, bath: 1, sheet: 0, beach: 0, robeBlack: 1 } };
  const now = normalizeBox(old);
  assert.equal(now.items['white-face'], 2);
  assert.equal(now.items['white-bath'], 1);
  assert.equal(now.items.robeBlack, 1);
  assert.equal('face' in now.items, false);
  assert.deepEqual(validateBox(now), { ok: true, reason: null });
  assert.equal(normalizeBox({ colour: 'yellow', items: { face: 0, hand: 0, bath: 0, sheet: 0, beach: 2 } }).items['yellow-beach'], 2);
  // The old rules never allowed a white beach towel; such a box stays invalid.
  assert.equal(validateBox(normalizeBox({ colour: 'white', items: { beach: 2 } })).ok, false);
  // A box already in the new shape keeps its towels; zero counts are dropped.
  assert.deepEqual(normalizeBox(sample()).items, { 'white-face': 2, 'white-hand': 1, 'white-bath': 1, 'white-sheet': 1 });
  // An old size key and its new towel id add up rather than one replacing the other.
  assert.equal(normalizeBox({ colour: 'white', items: { face: 2, 'white-face': 1 } }).items['white-face'], 3);
});

test('an old saved box of bathrobes only loads, whatever towel colour it recorded', () => {
  assert.equal(validateBox(normalizeBox({ colour: 'black', items: { face: 0, robeWhite: 1, robeBlack: 1 } })).ok, true);
});

test('key, label and spec list each towel with its colour, then the bathrobes', () => {
  const sel = withItems({ 'white-bath': 2, 'blue-beach': 1, robeBlack: 1 });
  assert.equal(boxKey(sel), 'white-bath:2,blue-beach:1,robeBlack:1');
  assert.equal(boxItemsText(sel), '2 × Bath (white), 1 × Beach (blue stripe)');
  assert.equal(boxLabel(sel), 'Custom box: 2 × Bath (white), 1 × Beach (blue stripe); 1 × Black bathrobe');
  assert.equal(boxSpecText(sel), '2 × Bath (white), 1 × Beach (blue stripe) · 1 × Black bathrobe');
  assert.equal(boxLabel(withItems({ robeWhite: 1, robeBlack: 1 })), 'Custom box: 1 × White bathrobe, 1 × Black bathrobe');
});
