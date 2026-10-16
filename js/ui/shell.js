import { CATEGORIES } from '../data/products.js';
import { CONFIG } from '../config.js';
import { createBag } from '../lib/bag.js';
import { findProduct } from '../lib/products.js';
import { escapeHtml } from '../lib/escape.js';
import { initMenu } from './menu.js';
import { initReveal, initHeaderScroll } from './reveal.js';
import { initBagPanel } from './bag-panel.js';

const BAG_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 8h14l-1 12H6z"/><path d="M9 8V6a3 3 0 016 0v2"/></svg>';

function navLinks(cls) {
  const a = (href, text) => `<a class="${cls}" href="${href}">${escapeHtml(text)}</a>`;
  return CATEGORIES.map(c => a(`catalog.html?category=${c.id}`, c.navLabel)).join('')
    + a('build-your-box.html', 'Build your box') + a('about.html', 'About');
}

// Menu button left, wordmark centred, bag right, on every screen size. The
// primary nav lives only in the slide-in menu, so the page has one "Primary".
function headerHtml() {
  return `
  <header class="site-header">
    <div class="container site-header__inner">
      <button class="menu-toggle" type="button" data-menu-toggle aria-label="Open menu" aria-expanded="false" aria-controls="site-menu">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" aria-hidden="true"><path d="M4 8h16M4 12h9M4 16h16"/></svg><span class="menu-toggle__label">Menu</span>
      </button>
      <a href="index.html" class="brand-mark" aria-label="Czera, home">
        <img class="brand-mark__img brand-mark__img--default" src="assets/logo/czera-wordmark-alt.png" alt="Czera" />
        <img class="brand-mark__img brand-mark__img--gold" src="assets/logo/czera-wordmark-gold.png" alt="" aria-hidden="true" />
      </a>
      <button class="bag-button" type="button" data-bag-open aria-label="Open your bag">
        ${BAG_ICON}<span class="bag-button__label">Bag</span><span class="bag-button__count" data-bag-count>0</span>
      </button>
    </div>
  </header>
  <div class="site-menu-backdrop" data-menu-backdrop aria-hidden="true" hidden></div>
  <div id="site-menu" class="site-menu" data-site-menu role="dialog" aria-modal="true" aria-label="Menu" aria-hidden="true" hidden>
    <div class="site-menu__head"><button class="site-menu__close" type="button" data-menu-close aria-label="Close menu">×</button></div>
    <nav class="site-menu__nav" aria-label="Primary">${navLinks('site-menu__link')}</nav>
  </div>`;
}

function footerHtml() {
  const shop = CATEGORIES.map(c => `<li><a href="catalog.html?category=${c.id}">${escapeHtml(c.label)}</a></li>`).join('');
  return `
  <footer class="site-footer" id="contact">
    <div class="container footer-grid">
      <div><p class="footer__mark">CZERA</p><p class="footer__tag">Luxury towels &amp; bath essentials</p>
        <p class="footer__about">100% cotton towels, bathrobes and gift sets. Every detail feels like home.</p></div>
      <div><h4 class="footer__heading">Shop</h4><ul class="footer__list">${shop}<li><a href="build-your-box.html">Build your box</a></li></ul></div>
      <div><h4 class="footer__heading">Help</h4><ul class="footer__list">
        <li><a href="index.html#how-to-order">How to order</a></li><li><a href="about.html#sizes">Sizes &amp; care</a></li>
        <li><a href="about.html#delivery">Delivery</a></li><li><a href="about.html">About Czera</a></li></ul></div>
      <div><h4 class="footer__heading">Contact</h4><ul class="footer__list">
        <li><a href="https://wa.me/${CONFIG.whatsappNumber}" target="_blank" rel="noopener" aria-label="${escapeHtml(`WhatsApp ${CONFIG.whatsappDisplay} (opens in a new tab)`)}">WhatsApp ${escapeHtml(CONFIG.whatsappDisplay)}</a></li>
        ${CONFIG.social.map(s => `<li><a href="${escapeHtml(s.url)}" target="_blank" rel="noopener" aria-label="${escapeHtml(`${s.label} ${s.handle} (opens in a new tab)`)}">${escapeHtml(s.label)} ${escapeHtml(s.handle)}</a></li>`).join('')}</ul>
        <a class="btn btn--outline-gold" href="https://wa.me/${CONFIG.whatsappNumber}" target="_blank" rel="noopener">Order on WhatsApp</a></div>
    </div>
    <div class="container footer__bottom"><span>© <span data-current-year></span> Czera</span><span>English · <span lang="ar">العربية</span></span></div>
  </footer>`;
}

let toastTimer;
export function showToast(text) {
  const el = document.querySelector('[data-toast]');
  if (!el) return;
  el.querySelector('[data-toast-text]').textContent = text;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.hidden = true; }, 3500);
}

function replacePlaceholder(selector, html) {
  const el = document.querySelector(selector);
  if (el) el.outerHTML = html;
}

export function initShell({ hasHero = false } = {}) {
  replacePlaceholder('[data-shell-header]', headerHtml());
  replacePlaceholder('[data-shell-footer]', footerHtml());
  document.body.insertAdjacentHTML('beforeend',
    '<div class="toast" data-toast role="status" hidden><span data-toast-text></span> <button type="button" class="toast__link" data-bag-open>View bag ›</button></div>');
  const year = document.querySelector('[data-current-year]');
  if (year) year.textContent = String(new Date().getFullYear());

  let storage = null;
  try { storage = window.localStorage; } catch { storage = null; }
  const bag = createBag(storage);
  const refresh = () => {
    const el = document.querySelector('[data-bag-count]');
    if (el) el.textContent = String(bag.count());
  };
  bag.subscribe(refresh);
  refresh();

  document.addEventListener('click', e => {
    const add = e.target.closest('[data-add-to-bag]');
    if (!add) return;
    const product = findProduct(add.dataset.addToBag);
    if (!product) return;
    bag.add({ type: 'product', slug: product.slug, qty: Number(add.dataset.qty || 1) });
    showToast(`${product.name} added to your bag`);
  });

  initBagPanel(bag);
  initMenu();
  if (hasHero) initHeaderScroll();
  initReveal();
  return { bag };
}
