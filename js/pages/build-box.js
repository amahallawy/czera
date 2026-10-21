import { initShell, showToast } from '../ui/shell.js';
import { emptyBox, BOX_SIZES, BOX_TOWELS, BOX_ROBES, TOWEL_COLOURS, STRIPED, SIZES_BY_COLOUR, boxPrice, pieceCount, towelCount, robeCount, groupFull, validateBox, sizeAllowed, towelsForColour, towelId, colourName } from '../lib/box.js';
import { CONFIG } from '../config.js';
import { findProduct } from '../lib/products.js';
import { formatEGP } from '../lib/format.js';
import { fitSticky } from '../ui/sticky-fit.js';

const { bag } = initShell();
const sel = emptyBox();
const params = new URLSearchParams(location.search);
const preset = params.get('add');
const presetColour = params.get('colour');
if (BOX_SIZES.some(s => s.id === preset)) {
  // Pick the requested colour if that size exists in it, else the first colour that has the size.
  sel.colour = TOWEL_COLOURS.includes(presetColour) && sizeAllowed({ colour: presetColour }, preset)
    ? presetColour
    : TOWEL_COLOURS.find(c => SIZES_BY_COLOUR[c].includes(preset));
  sel.items[towelId(sel.colour, preset)] = 1;
} else if (TOWEL_COLOURS.includes(presetColour)) {
  sel.colour = presetColour;
}

const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const choice = (group, value, label) =>
  `<button type="button" class="box-option" data-group="${group}" data-value="${value}" aria-pressed="${sel[group] === value}">
     <span class="swatch swatch--${value}" aria-hidden="true"></span>${label}</button>`;
// The colour buttons only choose which towels are listed (#113): a box can mix colours, so no
// colour is ever disabled and counts in other colours are kept.
function renderColours() {
  document.querySelector('[data-options="colour"]').innerHTML =
    TOWEL_COLOURS.map(v => choice('colour', v, cap(colourName(v)))).join('');
}

function render() {
  renderColours();
  document.querySelector('[data-colour-note]').textContent = STRIPED.includes(sel.colour)
    ? 'Stripes come in the 100 × 200 beach size only.'
    : 'Beach towels come in blue or yellow stripes only.';
  // Towels (up to 6, all sizes together) and bathrobes (up to 2) each stop at their limit (#107):
  // the group's + buttons are disabled and point to the note saying why.
  const towelsFull = groupFull(sel, 'towels');
  const robesFull = groupFull(sel, 'robes');
  const row = (item, label, name, note, full, group) => {
    const q = sel.items[item.id] || 0;
    const plus = full ? ` disabled aria-describedby="${group}-full"` : '';
    return `<div class="box-size"><span class="box-size__label">${label}</span>
      <small>${note}</small>
      <span class="qty"><button type="button" data-size="${item.id}" data-delta="-1" aria-label="One less ${name}" ${q === 0 ? 'disabled' : ''}>−</button>
      <span>${q}</span><button type="button" data-size="${item.id}" data-delta="1" aria-label="One more ${name}"${plus}>+</button></span></div>`;
  };
  document.querySelector('[data-options="items"]').innerHTML = towelsForColour(sel.colour).map(t =>
    row(t, `${t.label} ${t.spec.replace(' cm', '')}`, `${t.label} ${t.spec}, ${colourName(t.colour)}`, formatEGP(findProduct(t.slug).price), towelsFull, 'towels')).join('');
  document.querySelector('[data-options="robes"]').innerHTML = BOX_ROBES
    .map(r => row(r, r.label, r.label, formatEGP(findProduct(r.slug).price), robesFull, 'robes')).join('');
  document.querySelector('[data-count="towels"]').textContent = `Up to ${CONFIG.boxMaxTowels} · ${towelCount(sel)} of ${CONFIG.boxMaxTowels}`;
  document.querySelector('[data-count="robes"]').textContent = `Up to ${CONFIG.boxMaxRobes} · ${robeCount(sel)} of ${CONFIG.boxMaxRobes}`;
  // Live regions: write only when the text changes, so a full group isn't announced again on
  // every unrelated click.
  const setNote = (group, text) => {
    const el = document.querySelector(`[data-full="${group}"]`);
    if (el.textContent !== text) el.textContent = text;
  };
  setNote('towels', towelsFull ? `You have ${CONFIG.boxMaxTowels} towels. Remove one to choose another.` : '');
  setNote('robes', robesFull ? `You have ${CONFIG.boxMaxRobes} bathrobes. Remove one to choose another.` : '');

  const chosen = BOX_TOWELS.filter(t => sel.items[t.id] > 0);
  const chosenRobes = BOX_ROBES.filter(r => sel.items[r.id] > 0);
  const price = item => formatEGP(sel.items[item.id] * findProduct(item.slug).price);
  document.querySelector('[data-summary]').innerHTML = chosen.length || chosenRobes.length
    ? chosen.map(t => `<li>${sel.items[t.id]} × ${t.label} ${t.spec}, ${colourName(t.colour)} <span>${price(t)}</span></li>`).join('')
      + chosenRobes.map(r => `<li>${sel.items[r.id]} × ${r.label} <span>${price(r)}</span></li>`).join('')
    : '<li class="box-preview__empty">Nothing chosen yet.</li>';
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
    if (opt.disabled) return;
    sel[opt.dataset.group] = opt.dataset.value;
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
  const toggle = e.target.closest('[data-contents-toggle]');
  if (toggle) {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    toggle.textContent = open ? 'Hide contents' : 'Show contents';
    document.querySelector('[data-preview]').classList.toggle('is-open', open);
    return;
  }
  if (e.target.closest('[data-add-box]') && validateBox(sel).ok) {
    bag.add({ type: 'box', box: structuredClone(sel), qty: 1 });
    showToast('Your custom box was added to your bag');
  }
});

// On phones the total bar is fixed; keep the whole page (footer included) clear of it (collapsed height, so an open list doesn't add scroll).
document.body.classList.add('has-box-bar');
const bar = document.querySelector('.box-preview__body');
const list = document.querySelector('[data-summary]');
function syncBarHeight() {
  const open = document.querySelector('[data-preview]').classList.contains('is-open');
  const extra = open && getComputedStyle(list).display !== 'none' ? list.getBoundingClientRect().height : 0;
  document.documentElement.style.setProperty('--box-bar-h', `${Math.max(0, Math.ceil(bar.getBoundingClientRect().height - extra))}px`);
}
if ('ResizeObserver' in window) new ResizeObserver(syncBarHeight).observe(bar);
window.addEventListener('resize', syncBarHeight);

render();
syncBarHeight();

// Desktop: the preview stays sticky only while it fits (no inner scrollbar).
fitSticky(document.querySelector('[data-preview]'));
