import { test } from 'node:test';
import assert from 'node:assert/strict';
import { socialLinksHtml } from '../js/ui/social.js';

const accounts = [
  { label: 'Instagram', handle: '@czera_maison', url: 'https://www.instagram.com/czera_maison' },
  { label: 'Facebook', handle: 'CzeraMaison', url: 'https://www.facebook.com/CzeraMaison' },
  { label: 'TikTok', handle: '@czera23', url: 'https://www.tiktok.com/@czera23' },
];

test('each account is an icon link with the same accessible name the text link had', () => {
  const html = socialLinksHtml(accounts);
  for (const a of accounts) {
    assert.match(html, new RegExp(`href="${a.url}"`));
    assert.match(html, new RegExp(`aria-label="${a.label} ${a.handle} \\(opens in a new tab\\)"`));
  }
  assert.equal((html.match(/<svg /g) || []).length, 3);
  assert.equal((html.match(/aria-hidden="true"/g) || []).length, 3);   // the drawing is decorative
  assert.doesNotMatch(html, />Instagram @czera_maison</);               // no visible text label
});

test('a network without a drawing falls back to a text link', () => {
  const html = socialLinksHtml([{ label: 'Pinterest', handle: 'czera', url: 'https://pinterest.com/czera' }]);
  assert.match(html, />Pinterest czera</);
  assert.doesNotMatch(html, /<svg /);
});

test('labels and links are escaped', () => {
  const html = socialLinksHtml([{ label: 'Instagram', handle: '"><b>', url: 'https://x.test/"onmouseover="' }]);
  assert.doesNotMatch(html, /"><b>/);
  assert.doesNotMatch(html, /"onmouseover="/);
});
