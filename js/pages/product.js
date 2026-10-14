import { initShell } from '../ui/shell.js';
import { renderProductCard } from '../ui/card.js';
import { PRODUCTS, CATEGORIES } from '../data/products.js';
import { findProduct } from '../lib/products.js';
import { formatEGP } from '../lib/format.js';
import { escapeHtml, nameHtml } from '../lib/escape.js';
import { fitSticky } from '../ui/sticky-fit.js';
import { buildOrderMessage, orderLink } from '../lib/whatsapp.js';
import { readRecent, pushRecent } from '../lib/recent.js';
import { BOX_SIZES } from '../lib/box.js';
import { CONFIG } from '../config.js';

initShell();
const root = document.querySelector('[data-product-root]');
const p = findProduct(new URLSearchParams(location.search).get('slug'));
let storage = null;
try { storage = window.localStorage; } catch { storage = null; }

if (!p) {
  document.title = 'Product not found — Czera';
  root.innerHTML = `<div class="product__missing"><h1>We couldn't find that product.</h1>
    <p>It may have moved. Everything we make is in the collection.</p><a class="btn btn--ink" href="catalog.html">See the collection</a></div>`;
} else {
  document.title = `${p.name} — Czera`;
  const recent = readRecent(storage).filter(s => s !== p.slug).map(findProduct).filter(Boolean).slice(0, 2);
  pushRecent(storage, p.slug);
  const side = recent.length ? recent : PRODUCTS.filter(x => x.category === 'gift-sets' && x.slug !== p.slug).slice(0, 2);
  const sideTitle = recent.length ? 'Recently viewed' : 'Gift sets';
  const category = CATEGORIES.find(c => c.id === p.category).label;
  const boxSize = BOX_SIZES.find(s => s.slug === p.slug) || (p.category === 'beach' ? BOX_SIZES.find(s => s.id === 'beach') : null);
  const stripe = p.slug === 'blue-stripe-beach-towel' ? '&colour=blue' : p.slug === 'yellow-stripe-beach-towel' ? '&colour=yellow' : '';
  const boxHref = p.boxable && boxSize ? `build-your-box.html?add=${boxSize.id}${stripe}` : 'build-your-box.html';
  const contents = p.contents ? `<div class="pdp__incl"><h2>In the box</h2><ul>${p.contents.map(c =>
    `<li>${c.qty} × ${escapeHtml(c.label)} <span>${escapeHtml(c.spec)}</span></li>`).join('')}</ul></div>` : '';

  root.innerHTML = `
    <div class="pdp">
      <div class="pdp__photos">${p.images.map((src, i) =>
        `<img src="${escapeHtml(src)}" alt="${i === 0 ? escapeHtml(p.name) : ''}" ${i ? 'loading="lazy"' : ''} />`).join('')}</div>
      <div class="pdp__panel">
        <p class="crumb"><a href="catalog.html?category=${escapeHtml(p.category)}">${escapeHtml(category)}</a></p>
        <h1 class="pdp__name">${nameHtml(p.name)}</h1>
        <p class="pdp__price">${formatEGP(p.price)}</p>
        <p class="pdp__lede">${escapeHtml(p.description)}</p>
        ${contents}
        <div class="pdp__buy">
          <div class="qty"><button type="button" data-step="-1" aria-label="One less">−</button><span data-qty-value>1</span><button type="button" data-step="1" aria-label="One more">+</button></div>
          <button type="button" class="btn btn--ink" data-add-to-bag="${escapeHtml(p.slug)}" data-qty="1"><span class="pdp__buy-label">Add to bag</span><span class="pdp__buy-sep" aria-hidden="true">·</span><span class="pdp__buy-total" data-buy-total>${formatEGP(p.price)}</span></button>
        </div>
        <a class="link pdp__wa" data-order-one href="#" target="_blank" rel="noopener">Or order just this on WhatsApp ›</a>
        <p class="pdp__ship">${escapeHtml(CONFIG.deliveryText)} · ${escapeHtml(CONFIG.paymentText)}</p>
        <details class="acc" open><summary>Features</summary><ul>${p.features.map(f => `<li>${escapeHtml(f)}</li>`).join('')}</ul></details>
        <details class="acc"><summary>Sizes &amp; care</summary><p>${escapeHtml(p.spec)}. ${escapeHtml(CONFIG.careText)}.</p></details>
        <details class="acc"><summary>Delivery &amp; payment</summary><p>${escapeHtml(CONFIG.deliveryText)}. ${escapeHtml(CONFIG.paymentText)}.</p></details>
      </div>
    </div>
    <section class="pdp-related">
      <a class="band band--dark pdp-related__box" href="${boxHref}">
        <span class="band__copy"><span class="eyebrow">Build your own box</span>
          <span class="band__title">${p.boxable ? 'Add this to a box of your own.' : 'Make a gift box of your own.'}</span>
          <span class="btn btn--gold">${p.boxable ? 'Start with this item' : 'Start your box'}</span></span>
      </a>
      <div class="pdp-related__side"><h2>${sideTitle}</h2><div class="card-row card-row--2">${side.map(renderProductCard).join('')}</div></div>
    </section>`;

  let qty = 1;
  const addBtn = root.querySelector('.pdp__buy [data-add-to-bag]');
  const sync = () => {
    root.querySelector('[data-qty-value]').textContent = String(qty);
    root.querySelector('[data-buy-total]').textContent = formatEGP(p.price * qty);
    addBtn.dataset.qty = String(qty);
    root.querySelector('[data-order-one]').href = orderLink(buildOrderMessage([{ type: 'product', slug: p.slug, qty }]));
  };
  root.addEventListener('click', e => {
    const step = e.target.closest('[data-step]');
    if (step) { qty = Math.min(20, Math.max(1, qty + Number(step.dataset.step))); sync(); }
  });
  sync();

  fitSticky(root.querySelector('.pdp__panel'));
}
