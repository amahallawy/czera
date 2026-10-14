import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatEGP } from '../js/lib/format.js';
import { escapeHtml } from '../js/lib/escape.js';

test('formatEGP groups thousands and appends EGP', () => {
  assert.equal(formatEGP(1450), '1,450 EGP');
  assert.equal(formatEGP(50), '50 EGP');
  assert.equal(formatEGP(12345), '12,345 EGP');
});

test('escapeHtml neutralises markup characters', () => {
  assert.equal(escapeHtml('<b>"A" & \'B\'</b>'), '&lt;b&gt;&quot;A&quot; &amp; &#39;B&#39;&lt;/b&gt;');
  assert.equal(escapeHtml(null), '');
});
