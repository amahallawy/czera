import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildOrderMessage, orderLink } from '../js/lib/whatsapp.js';
import { emptyBox } from '../js/lib/box.js';

const lines = [
  { type: 'product', slug: 'complete-czera-set', qty: 1 },
  { type: 'product', slug: 'black-bathrobe', qty: 1 },
  { type: 'box', box: { ...emptyBox(), items: { face: 2, hand: 0, bath: 1, sheet: 0, beach: 0 } }, qty: 1 },
];
const details = { name: 'Sara', phone: '0100 123 4567', address: '12 Street', city: 'Cairo', note: 'Gift, please add a card' };

test('message matches the spec format with details', () => {
  assert.equal(buildOrderMessage(lines, details), [
    "Hello Czera, I'd like to order:",
    '• 1 × The Complete Czera Set: 1,450 EGP',
    '• 1 × Black Bathrobe: 1,000 EGP',
    '• 1 × Custom box (black box, burgundy ribbon): 2 × Face, 1 × Bath, white: 570 EGP',
    'Total: 3,020 EGP',
    '',
    'Name: Sara',
    'Phone: 0100 123 4567',
    'Address: 12 Street, City: Cairo',
    'Note: Gift, please add a card',
  ].join('\n'));
});

test('single-item message has no details block, and an empty note is left out', () => {
  assert.equal(buildOrderMessage([lines[1]]), "Hello Czera, I'd like to order:\n• 1 × Black Bathrobe: 1,000 EGP\nTotal: 1,000 EGP");
  assert.ok(!buildOrderMessage(lines, { ...details, note: '  ' }).includes('Note:'));
});

test('orderLink encodes &, #, line breaks and Arabic so WhatsApp receives them intact', () => {
  const msg = 'A & B #1\nسارة';
  const link = orderLink(msg, '201000000000');
  assert.ok(link.startsWith('https://wa.me/201000000000?text='));
  assert.equal(decodeURIComponent(link.split('?text=')[1]), msg);
  assert.ok(!link.includes('#'));
  assert.ok(!link.includes('&'));
});
