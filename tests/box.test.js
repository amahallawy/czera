import { test } from 'node:test';
import assert from 'node:assert/strict';
import { emptyBox, pieceCount, boxPrice, validateBox, boxKey, boxItemsText, boxLabel, sizeAllowed, TOWEL_COLOURS, colourConflicts, colourBlockReason, allowedColours, BOX_ROBES, towelCount, robeCount, groupFull } from '../js/lib/box.js';

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

test('holds at most six towels', () => {
  const sel = { ...emptyBox(), items: { face: 7, hand: 0, bath: 0, sheet: 0, beach: 0 } };
  assert.deepEqual(validateBox(sel), { ok: false, reason: 'Towels: up to 6 per box.' });
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

// Bathrobes (#107), as on the WordPress builder: a second group beside the towels.
const robes = extra => ({ ...emptyBox(), items: { ...emptyBox().items, ...extra } });

test('a new box has both bathrobes at 0', () => {
  assert.deepEqual(BOX_ROBES.map(r => [r.id, r.label, r.slug]), [
    ['robeWhite', 'White bathrobe', 'white-bathrobe'],
    ['robeBlack', 'Black bathrobe', 'black-bathrobe'],
  ]);
  assert.equal(emptyBox().items.robeWhite, 0);
  assert.equal(emptyBox().items.robeBlack, 0);
});

test('bathrobes count as pieces and are priced', () => {
  const sel = robes({ bath: 2, robeBlack: 1 });
  assert.equal(pieceCount(sel), 3);
  assert.equal(towelCount(sel), 2);
  assert.equal(robeCount(sel), 1);
  assert.equal(boxPrice(sel), 1940);
  assert.deepEqual(validateBox(sel), { ok: true, reason: null });
});

test('towels and bathrobes have their own limits: 6 towels and 2 bathrobes fit together', () => {
  assert.equal(validateBox(robes({ bath: 6, robeWhite: 1, robeBlack: 1 })).ok, true);
  assert.deepEqual(validateBox(robes({ robeWhite: 2, robeBlack: 1 })), { ok: false, reason: 'Bathrobes: up to 2 per box.' });
});

test('a group is full at its limit', () => {
  assert.equal(groupFull(robes({ bath: 5 }), 'towels'), false);
  assert.equal(groupFull(robes({ bath: 4, face: 2 }), 'towels'), true);
  assert.equal(groupFull(robes({ robeWhite: 1 }), 'robes'), false);
  assert.equal(groupFull(robes({ robeWhite: 1, robeBlack: 1 }), 'robes'), true);
});

test('a box of bathrobes alone is valid in any towel colour', () => {
  assert.equal(validateBox({ ...robes({ robeWhite: 1, robeBlack: 1 }), colour: 'blue' }).ok, true);
  assert.equal(validateBox(robes({ robeWhite: 1 })).ok, false);   // still at least 2 pieces
});

test('bathrobes do not change which towel colours are allowed', () => {
  assert.deepEqual(allowedColours(robes({ robeBlack: 2 }).items), ['white', 'blue', 'yellow']);
});

test('bad bathrobe quantities are rejected', () => {
  assert.equal(validateBox(robes({ bath: 2, robeBlack: -1 })).ok, false);
  assert.equal(validateBox(robes({ bath: 2, robeBlack: 0.5 })).ok, false);
});

test('a box saved before bathrobes (no robe keys) is still valid and keeps its key', () => {
  const old = { colour: 'white', items: { face: 2, hand: 0, bath: 1, sheet: 0, beach: 0 } };
  assert.equal(validateBox(old).ok, true);
  assert.equal(pieceCount(old), 3);
  assert.equal(boxKey(old), 'white|face:2,bath:1');
});

test('key, items text and label name the bathrobes after the towels', () => {
  const sel = robes({ bath: 2, robeBlack: 1 });
  assert.equal(boxKey(sel), 'white|bath:2,robeBlack:1');
  assert.equal(boxItemsText(sel), '2 × Bath');
  assert.equal(boxLabel(sel), 'Custom box: 2 × Bath, white; 1 × Black bathrobe');
  assert.equal(boxLabel(robes({ robeWhite: 1, robeBlack: 1 })), 'Custom box: 1 × White bathrobe, 1 × Black bathrobe');
});
