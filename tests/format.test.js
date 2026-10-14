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

test('nameHtml escapes a product name and wraps its digits for lining figures', async () => {
  const { nameHtml } = await import('../js/lib/escape.js');
  assert.equal(nameHtml('3 Bath Towels Set'), '<span class="num">3</span> Bath Towels Set');
  assert.equal(nameHtml('100% Cotton & <Co>'), '<span class="num">100%</span> Cotton &amp; &lt;Co&gt;');
  assert.equal(nameHtml('The Complete Czera Set'), 'The Complete Czera Set');
  assert.equal(nameHtml("Mum's 2 Robes"), 'Mum&#39;s <span class="num">2</span> Robes');
  assert.equal(nameHtml('2.5 m, 1,000 GSM'), '<span class="num">2.5</span> m, <span class="num">1,000</span> GSM');
  assert.equal(nameHtml(null), '');
});
