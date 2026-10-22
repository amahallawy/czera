import { describeLine } from '../lib/bag.js';
import { formatEGP } from '../lib/format.js';
import { escapeHtml } from '../lib/escape.js';
import { validateDetails } from '../lib/checkout.js';
import { buildOrderMessage, orderMailto, isLongMailto } from '../lib/email.js';
import { summariseLines } from '../lib/summary.js';
import { readDetails, writeDetails } from '../lib/details.js';
import { orderTotals, isValidCode, normaliseCode, readCode, writeCode, clearCode } from '../lib/discount.js';
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
      <div class="sr-only" aria-live="polite" data-bag-live></div>
      <div class="bag-panel__body" data-bag-body></div>
    </aside>`);
  const panel = document.querySelector('[data-bag-panel]');
  const backdrop = document.querySelector('[data-bag-backdrop]');
  const body = document.querySelector('[data-bag-body]');
  const live = document.querySelector('[data-bag-live]');
  let step = 1;
  let trigger = null;
  let sentLink = '';
  let sentMessage = '';
  let sessionStore = null;
  try { sessionStore = window.sessionStorage; } catch { /* blocked: keep details in memory only */ }
  let localStore = null;
  try { localStore = window.localStorage; } catch { /* blocked: keep the code in memory only */ }
  let code = readCode(localStore);
  const setCode = value => { code = value; if (value) writeCode(localStore, value); else clearCode(localStore); };
  const { code: promoCode, percent: promoPercent } = CONFIG.firstOrder;
  const discountLabel = `First order \u2212${promoPercent}%`;
  let details = readDetails(sessionStore);
  const remember = values => { details = { ...details, ...values }; writeDetails(sessionStore, details); };

  function renderItems() {
    const lines = bag.lines();
    if (!lines.length) {
      if (code) setCode('');
      body.innerHTML = '<p class="bag-panel__empty">Your bag is empty.</p><a class="btn btn--ink" href="catalog.html">Shop the collection</a>';
      return;
    }
    const rows = lines.map(l => {
      const d = describeLine(l);
      return `<div class="bag-line" data-key="${escapeHtml(d.key)}">
        <img src="${escapeHtml(d.image)}" alt="" class="bag-line__img" />
        <div><p class="bag-line__title">${escapeHtml(d.title)}</p><p class="bag-line__spec">${escapeHtml(d.spec)}</p>
          <div class="bag-line__ctl"><div class="qty"><button type="button" data-qty="-1" aria-label="One less">−</button><span>${d.qty}</span><button type="button" data-qty="1" aria-label="One more">+</button></div>
          <button type="button" class="bag-line__remove" data-remove>Remove</button></div></div>
        <span class="bag-line__price">${formatEGP(d.total)}</span></div>`;
    }).join('');
    body.innerHTML = `<p class="bag-panel__step">Step 1 of 2</p>${rows}
      ${renderCodeBlock()}
      ${renderTotals(lines)}
      <p class="bag-panel__note">Delivery fee confirmed by email · ${escapeHtml(CONFIG.paymentText)}</p>
      <button type="button" class="btn btn--ink btn--block" data-continue>Continue ›</button>`;
  }

  function renderCodeBlock() {
    const applied = isValidCode(code);
    const control = applied
      ? `<input id="bag-code" name="code" type="text" value="${escapeHtml(code)}" readonly aria-describedby="bag-code-note bag-code-error" />
         <button type="button" class="bag-code__btn bag-code__btn--text" data-code-remove>Remove<span class="sr-only"> code ${escapeHtml(code)}</span></button>`
      : `<input id="bag-code" name="code" type="text" autocomplete="off" autocapitalize="characters" spellcheck="false" aria-invalid="false" aria-describedby="bag-code-note bag-code-error" />
         <button type="submit" class="bag-code__btn bag-code__btn--apply" data-code-apply>Apply</button>`;
    return `<form class="bag-code" data-code-form novalidate>
      <p class="bag-code__note" id="bag-code-note"><b>First order?</b> Enter ${escapeHtml(promoCode)} for ${promoPercent}% off.</p>
      <label class="field__label" for="bag-code">Discount code</label>
      <div class="bag-code__row">${control}</div>
      <p class="bag-code__error" id="bag-code-error" role="status" data-code-error></p></form>`;
  }

  // Subtotal / first-order saving / Total when a code is applied; just Total otherwise.
  function renderTotals(lines) {
    const { subtotal, discount, total } = orderTotals(lines, code);
    if (!discount) return `<div class="bag-total"><span>Total</span><b>${formatEGP(total)}</b></div>`;
    return `<div class="bag-totals">
      <div class="bag-totals__row"><span>Subtotal</span><span>${formatEGP(subtotal)}</span></div>
      <div class="bag-totals__row bag-totals__row--saving"><span>${escapeHtml(discountLabel)}</span><span>\u2212${formatEGP(discount)}</span></div>
      <div class="bag-total"><span>Total</span><b>${formatEGP(total)}</b></div></div>`;
  }

  function applyCode(form) {
    const input = form.querySelector('#bag-code');
    const error = form.querySelector('[data-code-error]');
    if (!isValidCode(input.value)) {
      input.setAttribute('aria-invalid', 'true');
      error.textContent = "That code isn't valid.";
      input.focus();
      return;
    }
    setCode(normaliseCode(input.value));
    render();
    body.querySelector('[data-code-remove]')?.focus();
  }

  function renderSummary() {
    const lines = bag.lines();
    const { shown, more } = summariseLines(lines);
    const rows = shown.map(l => { const d = describeLine(l);
      return `<li class="order-summary__row"><span>${d.qty} × ${escapeHtml(d.title)}</span><span>${formatEGP(d.total)}</span></li>`; }).join('');
    return `<section class="order-summary" aria-label="Order summary"><ul class="order-summary__list">${rows}</ul>
      ${more ? `<p class="order-summary__more">and ${more} more</p>` : ''}
      ${renderSummaryTotals(lines)}</section>`;
  }

  function renderSummaryTotals(lines) {
    const { subtotal, discount, total } = orderTotals(lines, code);
    if (!discount) return `<p class="order-summary__total"><span>Total</span><b>${formatEGP(total)}</b></p>`;
    return `<p class="order-summary__sub"><span>Subtotal</span><span>${formatEGP(subtotal)}</span></p>
      <p class="order-summary__sub order-summary__sub--saving"><span>${escapeHtml(discountLabel)}</span><span>\u2212${formatEGP(discount)}</span></p>
      <p class="order-summary__total"><span>Total</span><b>${formatEGP(total)}</b></p>`;
  }

  function renderDetails(values = details, errors = {}) {
    const inputs = FIELDS.map(f => `
      <label class="field"><span class="field__label">${escapeHtml(f.label)}${f.required ? ' *' : ''}</span>
        <input name="${f.id}" type="${f.type || 'text'}" autocomplete="${f.autocomplete}" value="${escapeHtml(values[f.id] || '')}" ${f.required ? 'required' : ''} aria-invalid="${errors[f.id] ? 'true' : 'false'}" />
        ${errors[f.id] ? `<span class="field__error">${escapeHtml(errors[f.id])}</span>` : ''}</label>`).join('');
    body.innerHTML = `<p class="bag-panel__step">Step 2 of 2</p><h3 class="bag-panel__sub">Delivery details</h3>
      ${renderSummary()}
      <form data-details novalidate>${inputs}
        <p class="bag-panel__note">${escapeHtml(CONFIG.deliveryText)}</p>
        <button type="submit" class="btn btn--send btn--block">Send order by email<span class="sr-only"> (opens your email app)</span></button>
        <button type="button" class="bag-panel__back" data-back>‹ Back to bag</button></form>`;
  }

  function renderConfirmation() {
    body.innerHTML = `<div class="bag-confirm">
      <h3 class="bag-confirm__title" data-confirm-title tabindex="-1">Your order is ready in your email app</h3>
      <p class="bag-confirm__text">Tap Send in your email app to place it. We'll reply by email to confirm delivery and payment.</p>
      ${isLongMailto(sentLink) ? `<p class="bag-confirm__text">This is a long order, and some email apps cut long emails short. Check that every item arrived in the email, or copy the order below into it.</p>` : ''}
      <p class="bag-confirm__label" id="bag-preview-label">Your order</p>
      <pre class="bag-confirm__preview" tabindex="0" role="region" aria-labelledby="bag-preview-label" data-preview>${escapeHtml(sentMessage)}</pre>
      <button type="button" class="bag-confirm__copy" data-copy>Copy order</button>
      <p class="bag-confirm__fallback">Email app didn't open? Copy the order and send it to ${escapeHtml(CONFIG.contactEmail)}, or <a href="${escapeHtml(sentLink)}">try again<span class="sr-only"> (opens your email app)</span></a>.</p>
      <div class="bag-confirm__actions">
        <button type="button" class="btn btn--ink" data-clear>Clear bag</button>
        <button type="button" class="btn btn--ghost" data-keep>Keep bag</button></div></div>`;
    live.textContent = 'Your order is ready in your email app. Tap Send there to place it.';
    body.querySelector('[data-confirm-title]').focus();
  }

  // A mailto: link opens the email app without leaving the page. Clicked from a link inside the
  // panel (not window.open, which leaves an empty tab behind in some browsers).
  function openEmailApp(link) {
    const a = document.createElement('a');
    a.href = link;
    a.hidden = true;
    panel.append(a);
    a.click();
    a.remove();
  }

  // For visitors with no email app set up, or a long order an email app cut short (lib/email.js).
  async function copyOrder(button) {
    try {
      await navigator.clipboard.writeText(sentMessage);
      button.textContent = 'Copied';
      live.textContent = 'Order copied.';
    } catch {
      // Clipboard blocked (or not offered over plain http): select the text so it can be copied by hand.
      const preview = body.querySelector('[data-preview]');
      const range = document.createRange();
      range.selectNodeContents(preview);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      preview.focus();
      live.textContent = 'The order is selected. Copy it with your device.';
    }
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
    trigger = from; code = readCode(localStore); step = 1; sentLink = ''; sentMessage = ''; live.textContent = ''; render();
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
    else if (e.target.closest('[data-clear]')) { bag.clear(); setCode(''); close(); }
    else if (e.target.closest('[data-code-remove]')) { setCode(''); render(); body.querySelector('#bag-code')?.focus(); }
    else if (e.target.closest('[data-keep]')) { close(); }
    else if (e.target.closest('[data-copy]')) { copyOrder(e.target.closest('[data-copy]')); }
  });

  document.addEventListener('input', e => {
    if (e.target.closest('[data-details]')) remember({ [e.target.name]: e.target.value });
  });

  document.addEventListener('submit', e => {
    if (e.target.matches('[data-code-form]')) { e.preventDefault(); applyCode(e.target); return; }
    if (!e.target.matches('[data-details]')) return;
    e.preventDefault();
    const values = Object.fromEntries(new FormData(e.target));
    remember(values);
    const { ok, errors } = validateDetails(values);
    if (!ok) { renderDetails(values, errors); body.querySelector('[aria-invalid="true"]')?.focus(); return; }
    sentMessage = buildOrderMessage(bag.lines(), values, code);
    sentLink = orderMailto(sentMessage);
    openEmailApp(sentLink);
    renderConfirmation();
  });

  document.addEventListener('keydown', e => { if (!isOpen()) return;
    if (e.key === 'Escape') { close(); return; }
    if (e.key === 'Tab' && !('inert' in HTMLElement.prototype)) {
      const f = [...panel.querySelectorAll('button, a[href], input, [tabindex="0"]')].filter(el => !el.disabled);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (!panel.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
      else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
}
