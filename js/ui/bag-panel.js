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
    <div class="bag-backdrop" data-bag-backdrop hidden></div>
    <aside class="bag-panel" data-bag-panel role="dialog" aria-modal="true" aria-labelledby="bag-title" hidden>
      <div class="bag-panel__head"><h2 id="bag-title" class="bag-panel__title">Your bag</h2>
        <button type="button" class="bag-panel__close" data-bag-close aria-label="Close bag">×</button></div>
      <div class="bag-panel__body" data-bag-body></div>
    </aside>`);
  const panel = document.querySelector('[data-bag-panel]');
  const backdrop = document.querySelector('[data-bag-backdrop]');
  const body = document.querySelector('[data-bag-body]');
  let step = 1;
  let trigger = null;
  let sent = false;

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
      ${sent ? '<p class="bag-panel__sent">WhatsApp opened with your order. <button type="button" data-clear>Clear bag</button></p>' : ''}`;
  }

  function render() { if (step === 1) renderItems(); else renderDetails(); }

  function open(from) {
    trigger = from; step = 1; sent = false; render();
    panel.hidden = false; backdrop.hidden = false;
    document.body.classList.add('bag-open');
    panel.querySelector('[data-bag-close]').focus();
  }
  function close() {
    panel.hidden = true; backdrop.hidden = true;
    document.body.classList.remove('bag-open');
    const back = trigger && trigger.offsetParent !== null ? trigger : document.querySelector('.bag-button');
    back?.focus();
  }

  document.addEventListener('click', e => {
    const opener = e.target.closest('[data-bag-open]');
    if (opener) { e.preventDefault(); open(opener); return; }
    if (e.target.closest('[data-bag-close]') || e.target === backdrop) { close(); return; }
    if (panel.hidden) return;
    const line = e.target.closest('.bag-line');
    if (line && e.target.closest('[data-qty]')) {
      const cur = bag.lines().find(l => describeLine(l).key === line.dataset.key);
      bag.setQty(line.dataset.key, cur.qty + Number(e.target.closest('[data-qty]').dataset.qty));
      render();
    } else if (line && e.target.closest('[data-remove]')) { bag.remove(line.dataset.key); render(); }
    else if (e.target.closest('[data-continue]')) { step = 2; render(); body.querySelector('input')?.focus(); }
    else if (e.target.closest('[data-back]')) { step = 1; render(); }
    else if (e.target.closest('[data-clear]')) { bag.clear(); close(); }
  });

  document.addEventListener('submit', e => {
    if (!e.target.matches('[data-details]')) return;
    e.preventDefault();
    const values = Object.fromEntries(new FormData(e.target));
    const { ok, errors } = validateDetails(values);
    if (!ok) { renderDetails(values, errors); body.querySelector('[aria-invalid="true"]')?.focus(); return; }
    window.open(orderLink(buildOrderMessage(bag.lines(), values)), '_blank', 'noopener');
    sent = true; renderDetails(values);
  });

  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !panel.hidden) close(); });
}
