import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateDetails } from '../js/lib/checkout.js';

const ok = { name: 'Sara', phone: '01001234567', address: '12 Street', city: 'Cairo', note: '' };

test('complete details pass', () => {
  assert.deepEqual(validateDetails(ok), { ok: true, errors: {} });
});

test('name, address and city are required (whitespace does not count)', () => {
  const r = validateDetails({ ...ok, name: '  ', address: '', city: undefined });
  assert.equal(r.ok, false);
  assert.deepEqual(Object.keys(r.errors).sort(), ['address', 'city', 'name']);
});

test('phone needs at least 8 digits; spaces, + and dashes are allowed', () => {
  assert.equal(validateDetails({ ...ok, phone: '+20 100-123-4567' }).ok, true);
  assert.equal(validateDetails({ ...ok, phone: '12345' }).errors.phone, 'Enter a phone number we can call.');
});
