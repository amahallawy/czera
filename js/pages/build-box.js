import { initShell, showToast } from '../ui/shell.js';
import { emptyBox, BOX_SIZES, BOX_COLOURS, RIBBONS, TOWEL_COLOURS, STRIPED, boxPrice, pieceCount, validateBox, sizeAllowed } from '../lib/box.js';
import { findProduct } from '../lib/products.js';
import { formatEGP } from '../lib/format.js';

const { bag } = initShell();
const sel = emptyBox();
const preset = new URLSearchParams(location.search).get('add');
if (BOX_SIZES.some(s => s.id === preset)) sel.items[preset] = 1;

const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const choice = (group, value, label) =>
  `<button type="button" class="box-option" data-group="${group}" data-value="${value}" aria-pressed="${sel[group] === value}">
     <span class="swatch swatch--${value}" aria-hidden="true"></span>${label}</button>`;

function render() {
  document.querySelector('[data-options="box"]').innerHTML = BOX_COLOURS.map(v => choice('box', v, cap(v))).join('');
  document.querySelector('[data-options="ribbon"]').innerHTML = RIBBONS.map(v => choice('ribbon', v, cap(v))).join('');
  document.querySelector('[data-options="colour"]').innerHTML = TOWEL_COLOURS.map(v =>
    choice('colour', v, STRIPED.includes(v) ? `${cap(v)} stripe` : cap(v))).join('');
  document.querySelector('[data-options="items"]').innerHTML = BOX_SIZES.map(s => {
    const allowed = sizeAllowed(sel, s.id);
    const q = sel.items[s.id];
    return `<div class="box-size${allowed ? '' : ' is-disabled'}"><span class="box-size__label">${s.label} ${s.spec.replace(' cm', '')}</span>
      <small>${formatEGP(findProduct(s.slug).price)}</small>
      <span class="qty"><button type="button" data-size="${s.id}" data-delta="-1" aria-label="One less ${s.label}" ${q === 0 ? 'disabled' : ''}>−</button>
      <span>${q}</span><button type="button" data-size="${s.id}" data-delta="1" aria-label="One more ${s.label}" ${allowed ? '' : 'disabled'}>+</button></span></div>`;
  }).join('');

  const chosen = BOX_SIZES.filter(s => sel.items[s.id] > 0);
  document.querySelector('[data-summary]').innerHTML =
    `<li>${cap(sel.box)} box · ${sel.ribbon} ribbon <span>free</span></li>` +
    chosen.map(s => `<li>${sel.items[s.id]} × ${s.label} ${s.spec}, ${sel.colour} <span>${formatEGP(sel.items[s.id] * findProduct(s.slug).price)}</span></li>`).join('');
  const n = pieceCount(sel);
  document.querySelector('[data-piece-count]').textContent = `Total · ${n} ${n === 1 ? 'piece' : 'pieces'}`;
  document.querySelector('[data-total]').textContent = formatEGP(boxPrice(sel));
  const { ok, reason } = validateBox(sel);
  document.querySelector('[data-reason]').textContent = ok ? '' : reason;
  document.querySelector('[data-add-box]').disabled = !ok;
}

// Re-rendering replaces the controls, so remember the focused one and put focus back.
function focusedControl() {
  const a = document.activeElement;
  if (!a || !a.dataset) return null;
  if (a.dataset.group) {
    return { sel: `[data-group="${a.dataset.group}"][data-value="${a.dataset.value}"]`, fallback: `[data-group="${a.dataset.group}"]` };
  }
  if (a.dataset.size) {
    const other = a.dataset.delta === '1' ? '-1' : '1';
    return { sel: `[data-size="${a.dataset.size}"][data-delta="${a.dataset.delta}"]`, fallback: `[data-size="${a.dataset.size}"][data-delta="${other}"]` };
  }
  return null;
}

function renderKeepingFocus() {
  const f = focusedControl();
  render();
  if (!f) return;
  let el = document.querySelector(f.sel);
  if (!el || el.disabled) el = document.querySelector(f.fallback);
  if (el && !el.disabled) el.focus();
}

document.addEventListener('click', e => {
  const opt = e.target.closest('[data-group]');
  if (opt) {
    sel[opt.dataset.group] = opt.dataset.value;
    if (STRIPED.includes(sel.colour)) BOX_SIZES.forEach(s => { if (s.id !== 'beach') sel.items[s.id] = 0; });
    renderKeepingFocus();
    return;
  }
  const step = e.target.closest('[data-size]');
  if (step) {
    const id = step.dataset.size;
    sel.items[id] = Math.max(0, sel.items[id] + Number(step.dataset.delta));
    renderKeepingFocus();
    return;
  }
  if (e.target.closest('[data-add-box]') && validateBox(sel).ok) {
    bag.add({ type: 'box', box: structuredClone(sel), qty: 1 });
    showToast('Your custom box was added to your bag');
  }
});

render();
