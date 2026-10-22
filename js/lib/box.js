import { CONFIG } from '../config.js';
import { findProduct } from './products.js';
import { currentPrice } from './pricing.js';

export const BOX_SIZES = [
  { id: 'face', label: 'Face', spec: '30 × 30 cm', slug: 'face-towel' },
  { id: 'hand', label: 'Hand', spec: '50 × 100 cm', slug: 'hand-towel' },
  { id: 'bath', label: 'Bath', spec: '70 × 140 cm', slug: 'bath-towel' },
  { id: 'sheet', label: 'Bath sheet', spec: '90 × 160 cm', slug: 'bath-sheet' },
  { id: 'beach', label: 'Beach', spec: '100 × 200 cm', slug: 'blue-stripe-beach-towel' },
];
// Bathrobes (#107): the second group, as on the WordPress builder. Each robe has its own colour.
export const BOX_ROBES = [
  { id: 'robeWhite', label: 'White bathrobe', slug: 'white-bathrobe' },
  { id: 'robeBlack', label: 'Black bathrobe', slug: 'black-bathrobe' },
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
const SLUG = { 'blue-beach': 'blue-stripe-beach-towel', 'yellow-beach': 'yellow-stripe-beach-towel' };
export const colourName = colour => (STRIPED.includes(colour) ? `${colour} stripe` : colour);
export const towelId = (colour, size) => `${colour}-${size}`;

// Mixed colours (#113), as on the WordPress builder: every towel is one colour in one size, and a
// box may hold any of them. The colour buttons only choose which towels are shown.
export const BOX_TOWELS = TOWEL_COLOURS.flatMap(colour => SIZES_BY_COLOUR[colour].map(size => {
  const s = BOX_SIZES.find(x => x.id === size);
  const id = towelId(colour, size);
  return { id, colour, size, label: s.label, spec: s.spec, slug: SLUG[id] || s.slug };
}));
const ALL_ITEMS = [...BOX_TOWELS, ...BOX_ROBES];
const KNOWN = new Set(ALL_ITEMS.map(x => x.id));
const LEGACY_SIZES = BOX_SIZES.map(s => s.id);

export const towelsForColour = colour => BOX_TOWELS.filter(t => t.colour === colour);

export function emptyBox() {
  return { colour: 'white', items: Object.fromEntries(ALL_ITEMS.map(x => [x.id, 0])) };
}

// A box saved before #113 held one colour and counts per size ({ colour: 'white', items: { face: 2 } }).
// It becomes the same towels in that colour ({ 'white-face': 2 }); anything else is kept as it is,
// so a size the colour never had ('white-beach') stays and fails validation, as it always did.
// Zero counts are dropped, so a saved box only ever lists what is in it.
export function normalizeBox(sel) {
  if (!sel || typeof sel !== 'object' || !sel.items || typeof sel.items !== 'object') return sel;
  const items = {};
  for (const [key, q] of Object.entries(sel.items)) {
    if (q === 0) continue;
    const id = LEGACY_SIZES.includes(key) ? towelId(sel.colour, key) : key;
    items[id] = id in items && Number.isInteger(q) && Number.isInteger(items[id]) ? items[id] + q : q;
  }
  return { ...sel, items };
}

const countOf = (sel, list) => list.reduce((n, s) => n + (sel.items[s.id] || 0), 0);
export const towelCount = sel => countOf(sel, BOX_TOWELS);
export const robeCount = sel => countOf(sel, BOX_ROBES);

export function pieceCount(sel) {
  return countOf(sel, ALL_ITEMS);
}

// True when the group ('towels' or 'robes') has reached its limit, so its + buttons stop.
export function groupFull(sel, group) {
  return group === 'robes' ? robeCount(sel) >= CONFIG.boxMaxRobes : towelCount(sel) >= CONFIG.boxMaxTowels;
}

export function boxPrice(sel) {
  return ALL_ITEMS.reduce((sum, s) => sum + (sel.items[s.id] || 0) * currentPrice(findProduct(s.slug)), 0);
}

// Whether `sizeId` comes in the selected colour (used by the ?add= link from a product page).
export function sizeAllowed(sel, sizeId) {
  return (SIZES_BY_COLOUR[sel.colour] || []).includes(sizeId);
}

export function validateBox(sel) {
  const invalid = { ok: false, reason: 'Invalid choice.' };
  if (!sel || typeof sel !== 'object' || !sel.items || typeof sel.items !== 'object') return invalid;
  for (const [key, q] of Object.entries(sel.items)) {
    if (!Number.isInteger(q) || q < 0) return invalid;
    if (q > 0 && !KNOWN.has(key)) return invalid;   // a towel that doesn't exist, e.g. 'white-beach'
  }
  const n = pieceCount(sel);
  if (n < CONFIG.boxMinPieces) return { ok: false, reason: `Choose at least ${CONFIG.boxMinPieces} pieces.` };
  if (towelCount(sel) > CONFIG.boxMaxTowels) return { ok: false, reason: `Towels: up to ${CONFIG.boxMaxTowels} per box.` };
  if (robeCount(sel) > CONFIG.boxMaxRobes) return { ok: false, reason: `Bathrobes: up to ${CONFIG.boxMaxRobes} per box.` };
  return { ok: true, reason: null };
}

const chosen = (sel, list) => list.filter(s => (sel.items[s.id] || 0) > 0);

// The box's identity: its contents only (the selected colour button is not part of it).
export function boxKey(sel) {
  return chosen(sel, ALL_ITEMS).map(s => `${s.id}:${sel.items[s.id]}`).join(',');
}

// The towels, each with its colour: "2 × Bath (white), 1 × Beach (blue stripe)".
export function boxItemsText(sel) {
  return chosen(sel, BOX_TOWELS).map(t => `${sel.items[t.id]} × ${t.label} (${colourName(t.colour)})`).join(', ');
}

export function boxRobesText(sel) {
  return chosen(sel, BOX_ROBES).map(r => `${sel.items[r.id]} × ${r.label}`).join(', ');
}

const parts = sel => [boxItemsText(sel), boxRobesText(sel)].filter(Boolean);

// "Custom box: 2 × Bath (white), 1 × Beach (blue stripe); 1 × Black bathrobe"
export function boxLabel(sel) {
  return `Custom box: ${parts(sel).join('; ')}`;
}

// The bag line's detail: "2 × Bath (white) · 1 × Black bathrobe".
export function boxSpecText(sel) {
  return parts(sel).join(' · ');
}
