import { CONFIG } from '../config.js';
import { findProduct } from './products.js';

export const BOX_SIZES = [
  { id: 'face', label: 'Face', spec: '30 × 30 cm', slug: 'face-towel' },
  { id: 'hand', label: 'Hand', spec: '50 × 100 cm', slug: 'hand-towel' },
  { id: 'bath', label: 'Bath', spec: '70 × 140 cm', slug: 'bath-towel' },
  { id: 'sheet', label: 'Bath sheet', spec: '90 × 160 cm', slug: 'bath-sheet' },
  { id: 'beach', label: 'Beach', spec: '100 × 200 cm', slug: 'blue-stripe-beach-towel' },
];
// Bathrobes (#107): the second group, as on the WordPress builder. The towel colour does not
// apply to them; each robe has its own colour.
export const BOX_ROBES = [
  { id: 'robeWhite', label: 'White bathrobe', slug: 'white-bathrobe' },
  { id: 'robeBlack', label: 'Black bathrobe', slug: 'black-bathrobe' },
];
const ALL_ITEMS = [...BOX_SIZES, ...BOX_ROBES];
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
  return { colour: 'white', items: { face: 0, hand: 0, bath: 0, sheet: 0, beach: 0, robeWhite: 0, robeBlack: 0 } };
}

const countOf = (sel, list) => list.reduce((n, s) => n + (sel.items[s.id] || 0), 0);
export const towelCount = sel => countOf(sel, BOX_SIZES);
export const robeCount = sel => countOf(sel, BOX_ROBES);

export function pieceCount(sel) {
  return countOf(sel, ALL_ITEMS);
}

// True when the group ('towels' or 'robes') has reached its limit, so its + buttons stop.
export function groupFull(sel, group) {
  return group === 'robes' ? robeCount(sel) >= CONFIG.boxMaxRobes : towelCount(sel) >= CONFIG.boxMaxTowels;
}

export function boxPrice(sel) {
  return ALL_ITEMS.reduce((sum, s) => sum + (sel.items[s.id] || 0) * findProduct(s.slug).price, 0);
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
  for (const s of ALL_ITEMS) {
    const q = sel.items[s.id] ?? 0;
    if (!Number.isInteger(q) || q < 0) return invalid;
  }
  const n = pieceCount(sel);
  if (n < CONFIG.boxMinPieces) return { ok: false, reason: `Choose at least ${CONFIG.boxMinPieces} pieces.` };
  if (towelCount(sel) > CONFIG.boxMaxTowels) return { ok: false, reason: `Towels: up to ${CONFIG.boxMaxTowels} per box.` };
  if (robeCount(sel) > CONFIG.boxMaxRobes) return { ok: false, reason: `Bathrobes: up to ${CONFIG.boxMaxRobes} per box.` };
  if (BOX_SIZES.some(s => (sel.items[s.id] || 0) > 0 && !sizeAllowed(sel, s.id))) {
    return { ok: false, reason: STRIPED.includes(sel.colour)
      ? 'Striped towels come in the beach size only.'
      : 'Beach towels come in blue or yellow stripes only.' };
  }
  return { ok: true, reason: null };
}

function chosen(sel, list = BOX_SIZES) {
  return list.filter(s => (sel.items[s.id] || 0) > 0);
}
const listItems = (sel, list) => chosen(sel, list).map(s => `${sel.items[s.id]} × ${s.label}`).join(', ');

export function boxKey(sel) {
  const items = chosen(sel, ALL_ITEMS).map(s => `${s.id}:${sel.items[s.id]}`).join(',');
  return `${sel.colour}|${items}`;
}

// The towels only ("2 × Face, 1 × Bath"); the towel colour belongs with them.
export function boxItemsText(sel) {
  return listItems(sel, BOX_SIZES);
}

export function boxRobesText(sel) {
  return listItems(sel, BOX_ROBES);
}

// "Custom box: 2 × Bath, white; 1 × Black bathrobe". A box of bathrobes alone has no towel colour.
export function boxLabel(sel) {
  const parts = [];
  if (towelCount(sel)) parts.push(`${boxItemsText(sel)}, ${sel.colour}`);
  if (robeCount(sel)) parts.push(boxRobesText(sel));
  return `Custom box: ${parts.join('; ')}`;
}

// The bag line's detail: "2 × Bath · white · 1 × Black bathrobe".
export function boxSpecText(sel) {
  const parts = [];
  if (towelCount(sel)) parts.push(boxItemsText(sel), sel.colour);
  if (robeCount(sel)) parts.push(boxRobesText(sel));
  return parts.join(' · ');
}
