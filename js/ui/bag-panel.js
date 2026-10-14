import { describeLine, bagTotal } from '../lib/bag.js';
import { formatEGP } from '../lib/format.js';
import { escapeHtml } from '../lib/escape.js';
import { validateDetails } from '../lib/checkout.js';
import { buildOrderMessage, orderLink } from '../lib/whatsapp.js';
import { CONFIG } from '../config.js';

const FIELDS = [
  { id: 'name', label: 'Full name', autocomplete: 'name', required: true },
  { id: 'phone', label: 'Phone', autocomplete: 'tel', required: true, type: 'tel' },
  { id: 'address', label: 'Address', autocomplete: 'street-address', required: true },
  { id: 'city', label: 'City', autocomplete: 'address-level2', required: true },
  { id: 'note', label: 'Note (optional), e.g. "it\'s a gift"', autocomplete: 'off', required: false },
];

export function initBagPanel(bag) {
  document.body.insertAdjacentHTML('beforeend', `
    <div class="bag-backdrop" data-bag-backdrop aria-hidden="true"></div>
    <aside class="bag-panel" data-bag-panel role="dialog" aria-modal="true" aria-labelledby="bag-title" aria-hidden="true">
      <div class="bag-panel__head"><h2 id="bag-title" class="bag-panel__title" tabindex="-1">Your bag</h2>
        <button type="button" class="bag-panel__close" data-bag-close aria-label="Close bag">×</button></div>
      <div class="bag-panel__body" data-bag-body></div>
    </aside>`);
  const panel = document.querySelector('[data-bag-panel]');
  const backdrop = document.querySelector('[data-bag-backdrop]');
  const body = document.querySelector('[data-bag-body]');
  let step = 1;
  let trigger = null;
  let sent = false;
  let sentLink = '';

  function renderItems() {
    const lines = bag.lines();
    if (!lines.length) {
      body.innerHTML = '<p class="bag-panel__empty">Your bag is empty.</p><a class="btn btn--ink" href="catalog.html">Shop the collection</a>';
      return;
    }
    const rows = lines.map(l => {
      const d = describeLine(l);
      return `<div class="bag-line" data-key="${escapeHtml(d.key)}">
        <img src="${escapeHtml(d.image)}" alt="" class="bag-line__img" />
        <div><p class="bag-line__title">${escapeHtml(d.title)}</p><p class="bag-line__spec">${escapeHtml(d.spec)}</p>
          <div class="qty"><button type="button" data-qty="-1" aria-label="One less">−</button><span>${d.qty}</span><button type="button" data-qty="1" aria-label="One more">+</button></div>
          <button type="button" class="bag-line__remove" data-remove>Remove</button></div>
        <span class="bag-line__price">${formatEGP(d.total)}</span></div>`;
    }).join('');
    body.innerHTML = `<p class="bag-panel__step">Step 1 of 2</p>${rows}
      <div class="bag-total"><span>Total</span><b>${formatEGP(bagTotal(lines))}</b></div>
      <p class="bag-panel__note">Delivery fee confirmed on WhatsApp · ${escapeHtml(CONFIG.paymentText)}</p>
      <button type="button" class="btn btn--ink btn--block" data-continue>Continue ›</button>`;
  }

  function renderDetails(values = {}, errors = {}) {
    const inputs = FIELDS.map(f => `
      <label class="field"><span class="field__label">${escapeHtml(f.label)}${f.required ? ' *' : ''}</span>
        <input name="${f.id}" type="${f.type || 'text'}" autocomplete="${f.autocomplete}" value="${escapeHtml(values[f.id] || '')}" ${f.required ? 'required' : ''} aria-invalid="${errors[f.id] ? 'true' : 'false'}" />
        ${errors[f.id] ? `<span class="field__error">${escapeHtml(errors[f.id])}</span>` : ''}</label>`).join('');
    body.innerHTML = `<p class="bag-panel__step">Step 2 of 2</p><h3 class="bag-panel__sub">Delivery details</h3>
      <form data-details novalidate>${inputs}
        <p class="bag-panel__note">${escapeHtml(CONFIG.deliveryText)}</p>
        <button type="submit" class="btn btn--whatsapp btn--block">Send order on WhatsApp</button>
        <button type="button" class="bag-panel__back" data-back>‹ Back to bag</button></form>
      ${sent ? `<p class="bag-panel__sent">If WhatsApp didn't open, <a href="${escapeHtml(sentLink)}" target="_blank" rel="noopener">tap here to send your order.</a> <button type="button" data-clear>Clear bag</button></p>` : ''}`;
  }

  function render() { if (step === 1) renderItems(); else renderDetails(); }

  const isOpen = () => panel.classList.contains('is-open');
  const lineEl = key => [...body.querySelectorAll('.bag-line')].find(el => el.dataset.key === key);
  // Re-render, then put keyboard focus back where it was (render replaces the whole body).
  function renderKeepingFocus(key, ctl, fallbackKey) {
    render();
    const target = lineEl(key)?.querySelector(ctl) || lineEl(fallbackKey)?.querySelector('[data-remove]')
      || panel.querySelector('#bag-title');
    target?.focus();
  }

  let inerted = [];
  function setBackground(on) {
    if (!on) { inerted.forEach(el => { el.inert = false; }); inerted = []; return; }
    inerted = [...document.body.children].filter(el => el !== panel && el !== backdrop && !el.inert);
    inerted.forEach(el => { el.inert = true; });
  }

  function open(from) {
    trigger = from; step = 1; sent = false; render();
    panel.setAttribute('aria-hidden', 'false');
    panel.classList.add('is-open'); backdrop.classList.add('is-open');
    document.body.classList.add('bag-open');
    setBackground(true);
    panel.querySelector('[data-bag-close]').focus();
  }
  function close() {
    panel.classList.remove('is-open'); backdrop.classList.remove('is-open');
    panel.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('bag-open');
    setBackground(false);
    const back = trigger && trigger.offsetParent !== null ? trigger : document.querySelector('.bag-button');
    back?.focus();
  }

  document.addEventListener('click', e => {
    const opener = e.target.closest('[data-bag-open]');
    if (opener) { e.preventDefault(); open(opener); return; }
    if (e.target.closest('[data-bag-close]') || e.target === backdrop) { close(); return; }
    if (!isOpen()) return;
    const line = e.target.closest('.bag-line');
    if (line && e.target.closest('[data-qty]')) {
      const btn = e.target.closest('[data-qty]');
      const cur = bag.lines().find(l => describeLine(l).key === line.dataset.key);
      if (!cur) return;
      const next = line.nextElementSibling?.dataset?.key || line.previousElementSibling?.dataset?.key;
      bag.setQty(line.dataset.key, cur.qty + Number(btn.dataset.qty));
      renderKeepingFocus(line.dataset.key, `[data-qty="${btn.dataset.qty}"]`, next);
    } else if (line && e.target.closest('[data-remove]')) {
      const next = line.nextElementSibling?.classList.contains('bag-line') ? line.nextElementSibling.dataset.key : null;
      bag.remove(line.dataset.key);
      renderKeepingFocus(next, '[data-remove]', next);
    }
    else if (e.target.closest('[data-continue]')) { step = 2; render(); body.querySelector('input')?.focus(); }
    else if (e.target.closest('[data-back]')) { step = 1; render(); body.querySelector('[data-continue]')?.focus(); }
    else if (e.target.closest('[data-clear]')) { bag.clear(); close(); }
  });

  document.addEventListener('submit', e => {
    if (!e.target.matches('[data-details]')) return;
    e.preventDefault();
    const values = Object.fromEntries(new FormData(e.target));
    const { ok, errors } = validateDetails(values);
    if (!ok) { renderDetails(values, errors); body.querySelector('[aria-invalid="true"]')?.focus(); return; }
    window.open(orderLink(buildOrderMessage(bag.lines(), values)), '_blank', 'noopener');
    sent = true; renderDetails(values); body.querySelector('[type="submit"]')?.focus();
  });

  document.addEventListener('keydown', e => { if (!isOpen()) return;
    if (e.key === 'Escape') { close(); return; }
    if (e.key === 'Tab' && !('inert' in HTMLElement.prototype)) {
      const f = [...panel.querySelectorAll('button, a[href], input')].filter(el => !el.disabled);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (!panel.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
      else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
}
