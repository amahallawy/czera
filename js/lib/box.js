import { CONFIG } from '../config.js';
import { findProduct } from './products.js';

export const BOX_SIZES = [
  { id: 'face', label: 'Face', spec: '30 × 30 cm', slug: 'face-towel' },
  { id: 'hand', label: 'Hand', spec: '50 × 100 cm', slug: 'hand-towel' },
  { id: 'bath', label: 'Bath', spec: '70 × 140 cm', slug: 'bath-towel' },
  { id: 'sheet', label: 'Bath sheet', spec: '90 × 160 cm', slug: 'bath-sheet' },
  { id: 'beach', label: 'Beach', spec: '100 × 200 cm', slug: 'blue-stripe-beach-towel' },
];
export const BOX_COLOURS = ['black', 'beige'];
export const RIBBONS = ['burgundy', 'gold'];
export const TOWEL_COLOURS = ['white', 'black', 'blue', 'yellow'];
export const STRIPED = ['blue', 'yellow']; // DRAFT: stripes only in the beach size (spec §8)

export function emptyBox() {
  return { box: 'black', ribbon: 'burgundy', colour: 'white', items: { face: 0, hand: 0, bath: 0, sheet: 0, beach: 0 } };
}

export function pieceCount(sel) {
  return BOX_SIZES.reduce((n, s) => n + (sel.items[s.id] || 0), 0);
}

export function boxPrice(sel) {
  return BOX_SIZES.reduce((sum, s) => sum + (sel.items[s.id] || 0) * findProduct(s.slug).price, 0);
}

export function sizeAllowed(sel, sizeId) {
  return !STRIPED.includes(sel.colour) || sizeId === 'beach';
}

export function validateBox(sel) {
  const invalid = { ok: false, reason: 'Invalid choice.' };
  if (!sel || typeof sel !== 'object' || !sel.items) return invalid;
  if (!BOX_COLOURS.includes(sel.box) || !RIBBONS.includes(sel.ribbon) || !TOWEL_COLOURS.includes(sel.colour)) return invalid;
  for (const s of BOX_SIZES) {
    const q = sel.items[s.id] ?? 0;
    if (!Number.isInteger(q) || q < 0) return invalid;
  }
  const n = pieceCount(sel);
  if (n < CONFIG.boxMinPieces) return { ok: false, reason: `Choose at least ${CONFIG.boxMinPieces} pieces.` };
  if (n > CONFIG.boxMaxPieces) return { ok: false, reason: `A box holds up to ${CONFIG.boxMaxPieces} pieces.` };
  if (BOX_SIZES.some(s => (sel.items[s.id] || 0) > 0 && !sizeAllowed(sel, s.id))) {
    return { ok: false, reason: 'Striped colours come in the beach size only.' };
  }
  return { ok: true, reason: null };
}

function chosen(sel) {
  return BOX_SIZES.filter(s => (sel.items[s.id] || 0) > 0);
}

export function boxKey(sel) {
  const items = chosen(sel).map(s => `${s.id}:${sel.items[s.id]}`).join(',');
  return `${sel.box}|${sel.ribbon}|${sel.colour}|${items}`;
}

export function boxItemsText(sel) {
  return chosen(sel).map(s => `${sel.items[s.id]} × ${s.label}`).join(', ');
}

export function boxLabel(sel) {
  return `Custom box (${sel.box} box, ${sel.ribbon} ribbon): ${boxItemsText(sel)}, ${sel.colour}`;
}
