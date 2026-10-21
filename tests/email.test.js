import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join, extname } from 'node:path';
import {
  buildOrderMessage, mailtoLink, orderMailto, bulkMailto, isLongMailto,
  ORDER_SUBJECT, BULK_SUBJECT, BULK_MESSAGE, MAILTO_SAFE_LENGTH,
} from '../js/lib/email.js';
import { CONFIG } from '../js/config.js';
import { emptyBox } from '../js/lib/box.js';

const lines = [
  { type: 'product', slug: 'complete-czera-set', qty: 1 },
  { type: 'product', slug: 'black-bathrobe', qty: 1 },
  { type: 'box', box: { ...emptyBox(), items: { ...emptyBox().items, 'white-face': 2, 'white-bath': 1 } }, qty: 1 },
];
const details = { name: 'Sara', phone: '0100 123 4567', address: '12 Street', city: 'Cairo', note: 'Gift, please add a card' };

// Split a mailto: link into its address and its decoded query fields.
function parseMailto(link) {
  assert.ok(link.startsWith('mailto:'), link);
  const [address, query = ''] = link.slice('mailto:'.length).split('?');
  const fields = {};
  for (const pair of query ? query.split('&') : []) {
    const [k, v] = pair.split('=');
    fields[k] = decodeURIComponent(v);
  }
  return { address, fields };
}

test('the contact address is the support mailbox and the WhatsApp settings are gone', () => {
  assert.equal(CONFIG.contactEmail, 'support@czeramaison.com');
  assert.ok(!('whatsappNumber' in CONFIG));
  assert.ok(!('whatsappDisplay' in CONFIG));
});

test('message matches the spec format with details', () => {
  assert.equal(buildOrderMessage(lines, details), [
    "Hello Czera, I'd like to order:",
    '• 1 × The Complete Czera Set: 1,160 EGP',
    '• 1 × Black Bathrobe: 1,000 EGP',
    '• 1 × Custom box: 2 × Face (white), 1 × Bath (white): 570 EGP',
    'Total: 2,730 EGP',
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

test('mailtoLink with nothing else is the bare address', () => {
  assert.equal(mailtoLink(), 'mailto:support@czeramaison.com');
});

test('mailtoLink encodes &, #, ?, line breaks and Arabic so the email arrives intact', () => {
  const body = 'A & B #1?\nسارة\n100% cotton';
  const link = mailtoLink({ subject: 'Q&A #2', body });
  const { address, fields } = parseMailto(link);
  assert.equal(address, 'support@czeramaison.com');
  assert.equal(fields.subject, 'Q&A #2');
  // Line breaks travel as CRLF (%0D%0A), the form RFC 6068 asks for in a mailto body.
  assert.ok(link.includes('%0D%0A'));
  assert.equal(fields.body, body.replace(/\n/g, '\r\n'));
  assert.ok(!link.includes('#'));
  assert.equal(link.split('&').length, 2);   // only the separator between subject and body
  assert.equal(link.split('?').length, 2);   // only the start of the query
  assert.ok(!link.includes(' '));            // spaces are %20, never "+" or raw
});

test('orderMailto addresses the order to support with the order subject and the message as body', () => {
  const message = buildOrderMessage(lines, details);
  const { address, fields } = parseMailto(orderMailto(message));
  assert.equal(address, 'support@czeramaison.com');
  assert.equal(fields.subject, ORDER_SUBJECT);
  assert.equal(ORDER_SUBJECT, 'Order from czeramaison.com');
  assert.equal(fields.body.replace(/\r\n/g, '\n'), message);
});

test('bulkMailto asks about a bulk order under its own subject', () => {
  const { address, fields } = parseMailto(bulkMailto());
  assert.equal(address, 'support@czeramaison.com');
  assert.equal(fields.subject, BULK_SUBJECT);
  assert.equal(BULK_SUBJECT, 'Bulk or corporate order');
  assert.equal(fields.body, BULK_MESSAGE);
});

test('isLongMailto flags links past the length some email apps cut off', () => {
  assert.equal(MAILTO_SAFE_LENGTH, 2000);
  assert.equal(isLongMailto(orderMailto(buildOrderMessage(lines, details))), false);
  const many = Array.from({ length: 30 }, () => lines[2]);
  assert.equal(isLongMailto(orderMailto(buildOrderMessage(many, details))), true);
});

// The owner retired WhatsApp (#84): nothing the site ships may mention it or link to wa.me.
test('no shipped page, script or stylesheet mentions WhatsApp', () => {
  const root = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
  const shipped = [
    ...readdirSync(root).filter(f => f.endsWith('.html')),
    ...readdirSync(join(root, 'js'), { recursive: true }).map(f => join('js', f)),
    ...readdirSync(join(root, 'css'), { recursive: true }).map(f => join('css', f)),
  ].filter(f => ['.html', '.js', '.css'].includes(extname(f)));
  assert.ok(shipped.length > 10);
  const hits = shipped.filter(f => /whatsapp|wa\.me/i.test(readFileSync(join(root, f), 'utf8')));
  assert.deepEqual(hits, []);
});
