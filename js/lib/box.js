import { CONFIG } from '../config.js';
import { findProduct } from './products.js';

export const BOX_SIZES = [
  { id: 'face', label: 'Face', spec: '30 × 30 cm', slug: 'face-towel' },
  { id: 'hand', label: 'Hand', spec: '50 × 100 cm', slug: 'hand-towel' },
  { id: 'bath', label: 'Bath', spec: '70 × 140 cm', slug: 'bath-towel' },
  { id: 'sheet', label: 'Bath sheet', spec: '90 × 160 cm', slug: 'bath-sheet' },
  { id: 'beach', label: 'Beach', spec: '100 × 200 cm', slug: 'blue-stripe-beach-towel' },
];
// No box colour or ribbon choice: the team picks the box to fit the towels and adds ribbons
// when available. Neither is ever chosen by the customer (#103).
// DRAFT: which sizes exist in each towel colour, from the catalogue. Awaiting client confirmation (spec §8).
export const SIZES_BY_COLOUR = {
  white: ['face', 'hand', 'bath', 'sheet'],
  blue: ['beach'],
  yellow: ['beach'],
};
export const TOWEL_COLOURS = Object.keys(SIZES_BY_COLOUR);
export const STRIPED = ['blue', 'yellow'];

export function emptyBox() {
  return { colour: 'white', items: { face: 0, hand: 0, bath: 0, sheet: 0, beach: 0 } };
}

export function pieceCount(sel) {
  return BOX_SIZES.reduce((n, s) => n + (sel.items[s.id] || 0), 0);
}

export function boxPrice(sel) {
  return BOX_SIZES.reduce((sum, s) => sum + (sel.items[s.id] || 0) * findProduct(s.slug).price, 0);
}

export function sizeAllowed(sel, sizeId) {
  return (SIZES_BY_COLOUR[sel.colour] || []).includes(sizeId);
}

const PLURAL = { face: 'face towels', hand: 'hand towels', bath: 'bath towels', sheet: 'bath sheets', beach: 'beach towels' };
const listText = words => (words.length < 2 ? words.join('') : `${words.slice(0, -1).join(', ')} and ${words.at(-1)}`);

// Sizes already in the box (`items` is the selection's { sizeId: qty } map) that `colour` does not come in.
export function colourConflicts(colour, items) {
  const sizes = SIZES_BY_COLOUR[colour] || [];
  return BOX_SIZES.filter(s => (items?.[s.id] || 0) > 0 && !sizes.includes(s.id)).map(s => s.id);
}

// Why `colour` can't be chosen for the towels already in the box, or null when it can.
export function colourBlockReason(colour, items) {
  if (!TOWEL_COLOURS.includes(colour)) return 'Not available.';
  const conflicts = colourConflicts(colour, items);
  if (!conflicts.length) return null;
  const labels = conflicts.map(id => BOX_SIZES.find(s => s.id === id).label.toLowerCase());
  const lead = STRIPED.includes(colour) ? 'Stripes come in the beach size only.' : `No ${listText(labels)} size in ${colour}.`;
  return `${lead} Remove the ${listText(conflicts.map(id => PLURAL[id]))} first.`;
}

// The towel colours that can hold everything already in the box (all of them when it is empty).
export function allowedColours(items) {
  return TOWEL_COLOURS.filter(c => colourBlockReason(c, items) === null);
}

export function validateBox(sel) {
  const invalid = { ok: false, reason: 'Invalid choice.' };
  if (!sel || typeof sel !== 'object' || !sel.items) return invalid;
  if (!TOWEL_COLOURS.includes(sel.colour)) return invalid;
  for (const s of BOX_SIZES) {
    const q = sel.items[s.id] ?? 0;
    if (!Number.isInteger(q) || q < 0) return invalid;
  }
  const n = pieceCount(sel);
  if (n < CONFIG.boxMinPieces) return { ok: false, reason: `Choose at least ${CONFIG.boxMinPieces} pieces.` };
  if (n > CONFIG.boxMaxPieces) return { ok: false, reason: `A box holds up to ${CONFIG.boxMaxPieces} pieces.` };
  if (BOX_SIZES.some(s => (sel.items[s.id] || 0) > 0 && !sizeAllowed(sel, s.id))) {
    return { ok: false, reason: STRIPED.includes(sel.colour)
      ? 'Striped towels come in the beach size only.'
      : 'Beach towels come in blue or yellow stripes only.' };
  }
  return { ok: true, reason: null };
}

function chosen(sel) {
  return BOX_SIZES.filter(s => (sel.items[s.id] || 0) > 0);
}

export function boxKey(sel) {
  const items = chosen(sel).map(s => `${s.id}:${sel.items[s.id]}`).join(',');
  return `${sel.colour}|${items}`;
}

export function boxItemsText(sel) {
  return chosen(sel).map(s => `${sel.items[s.id]} × ${s.label}`).join(', ');
}

export function boxLabel(sel) {
  return `Custom box: ${boxItemsText(sel)}, ${sel.colour}`;
}
