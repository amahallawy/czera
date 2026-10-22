import { CATEGORIES } from '../data/products.js';
import { CONFIG } from '../config.js';
import { createBag } from '../lib/bag.js';
import { promoDismissed, dismissPromo } from '../lib/discount.js';
import { findProduct } from '../lib/products.js';
import { escapeHtml } from '../lib/escape.js';
import { menuItems } from '../lib/nav.js';
import { mailtoLink } from '../lib/email.js';
import { socialLinksHtml } from './social.js';
import { initMenu } from './menu.js';
import { initReveal, initHeaderScroll } from './reveal.js';
import { initBagPanel } from './bag-panel.js';

const BAG_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 8h14l-1 12H6z"/><path d="M9 8V6a3 3 0 016 0v2"/></svg>';

// A line gift box, drawn in gold beside the featured menu item (decorative).
const GIFT_ICON = '<svg class="site-menu__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" aria-hidden="true" focusable="false"><path d="M4 11h16v9H4zM3 7.5h18V11H3zM12 7.5V20"/><path d="M12 7.5C10.5 4.5 7.5 4 7.5 6s2.5 1.5 4.5 1.5zM12 7.5c1.5-3 4.5-3.5 4.5-1.5S14 7.5 12 7.5z"/></svg>';

// One list, one landmark: Build Your Own Box is set apart by style only (#101).
function navLinks() {
  return menuItems().map(({ label, href, featured }) => featured
    ? `<a class="site-menu__link site-menu__link--feature" href="${escapeHtml(href)}"><span>${escapeHtml(label)}</span>${GIFT_ICON}</a>`
    : `<a class="site-menu__link" href="${escapeHtml(href)}">${escapeHtml(label)}</a>`).join('');
}

// Menu button left, wordmark centred, bag right, on every screen size. The
// primary nav lives only in the slide-in menu, so the page has one "Primary".
function promoHtml() {
  const { code, percent } = CONFIG.firstOrder;
  return `<div class="promo-line" data-promo-line>
      <p class="promo-line__text">First order · <b>${escapeHtml(String(percent))}% off</b> with code <b>${escapeHtml(code)}</b></p>
      <button class="promo-line__close" type="button" data-promo-close aria-label="Close offer"><span aria-hidden="true">×</span></button>
    </div>`;
}

function headerHtml(withPromo) {
  return `
  <header class="site-header">
    ${withPromo ? promoHtml() : ''}
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
    <nav class="site-menu__nav" aria-label="Primary">${navLinks()}</nav>
  </div>`;
}

function footerHtml() {
  const shop = CATEGORIES.map(c => `<li><a href="catalog.html?category=${c.id}">${escapeHtml(c.label)}</a></li>`).join('');
  return `
  <footer class="site-footer" id="contact">
    <div class="container footer-grid">
      <div><p class="footer__mark">CZERA</p><p class="footer__tag">Luxury towels &amp; bath essentials</p>
        <p class="footer__about">100% cotton towels, bathrobes and gift sets. Every detail feels like home.</p></div>
      <div><h2 class="footer__heading">Shop</h2><ul class="footer__list">${shop}<li><a href="build-your-box.html">Build Your Own Box</a></li></ul></div>
      <div><h2 class="footer__heading">Help</h2><ul class="footer__list">
        <li><a href="index.html#how-to-order">How to order</a></li><li><a href="about.html#sizes">Sizes &amp; care</a></li>
        <li><a href="about.html#delivery">Delivery</a></li><li><a href="about.html">About Czera</a></li></ul></div>
      <div><h2 class="footer__heading">Contact</h2><ul class="footer__list">
        <li><a href="${escapeHtml(mailtoLink())}">${escapeHtml(CONFIG.contactEmail)}<span class="sr-only"> (opens your email app)</span></a></li>
        </ul>
        <ul class="footer__social" aria-label="CZERA on social media">${socialLinksHtml(CONFIG.social)}</ul>
        <a class="btn btn--outline-gold" href="${escapeHtml(mailtoLink())}">Contact us<span class="sr-only"> by email (opens your email app)</span></a></div>
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
  let storage = null;
  try { storage = window.localStorage; } catch { storage = null; }
  // The top line grows the header by --promo-h; closing it sets that back to 0 (components.css).
  const showPromo = !promoDismissed(storage, CONFIG.firstOrder.code);
  document.documentElement.classList.toggle('has-promo', showPromo);
  replacePlaceholder('[data-shell-header]', headerHtml(showPromo));
  replacePlaceholder('[data-shell-footer]', footerHtml());
  const promoLine = document.querySelector('[data-promo-line]');
  if (promoLine) {
    // The line wraps on narrow screens and at large text sizes, so every offset follows its
    // measured height. A resize event re-runs the sticky fit, which reads the offset.
    const root = document.documentElement;
    const measure = () => {
      const h = Math.ceil(promoLine.getBoundingClientRect().height);
      if (root.style.getPropertyValue('--promo-h') === `${h}px`) return;
      root.style.setProperty('--promo-h', `${h}px`);
      window.dispatchEvent(new Event('resize'));
    };
    const observer = 'ResizeObserver' in window ? new ResizeObserver(measure) : null;
    if (observer) observer.observe(promoLine);
    else window.addEventListener('resize', measure);
    measure();
    promoLine.querySelector('[data-promo-close]').addEventListener('click', () => {
      dismissPromo(storage, CONFIG.firstOrder.code);
      observer?.disconnect();
      window.removeEventListener('resize', measure);
      document.querySelector('[data-menu-toggle]')?.focus();
      promoLine.remove();
      root.classList.remove('has-promo');
      root.style.setProperty('--promo-h', '0px');
      window.dispatchEvent(new Event('resize'));
    });
  }
  document.body.insertAdjacentHTML('beforeend',
    '<div class="toast" data-toast role="status" hidden><span data-toast-text></span> <button type="button" class="toast__link" data-bag-open>View bag ›</button></div>');
  const year = document.querySelector('[data-current-year]');
  if (year) year.textContent = String(new Date().getFullYear());

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
