import { findProduct } from './products.js';
import { validateBox, normalizeBox, boxKey, boxPrice, boxLabel, boxSpecText } from './box.js';

export const BAG_KEY = 'czera.bag.v1';
export const MAX_QTY = 20;

export function lineKey(line) {
  return line.type === 'box' ? `box:${boxKey(line.box)}` : `product:${line.slug}`;
}

function cleanQty(q) {
  return Number.isInteger(q) && q >= 1 ? Math.min(q, MAX_QTY) : 0;
}

function cleanLine(line) {
  if (!line || typeof line !== 'object') return null;
  const qty = cleanQty(line.qty);
  if (!qty) return null;
  if (line.type === 'product' && findProduct(line.slug)) return { type: 'product', slug: line.slug, qty };
  if (line.type === 'box') {
    // An older bag may hold a one-colour box (counts per size), which becomes the same towels in that
    // colour (#113), and box-colour and ribbon fields, which are dropped (neither is a choice).
    const b = normalizeBox(line.box);
    if (validateBox(b).ok) return { type: 'box', box: { items: { ...b.items } }, qty };
  }
  return null;
}

// Saved lines that now share a key (e.g. two boxes that differed only by the retired box-colour or ribbon field)
// become one line, so a quantity change or removal acts on exactly one row.
function merge(lines) {
  const byKey = new Map();
  for (const line of lines) {
    const key = lineKey(line);
    const existing = byKey.get(key);
    if (existing) existing.qty = Math.min(existing.qty + line.qty, MAX_QTY);
    else byKey.set(key, line);
  }
  return [...byKey.values()];
}

function read(storage) {
  try {
    const raw = storage?.getItem(BAG_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? merge(parsed.map(cleanLine).filter(Boolean)) : [];
  } catch {
    return [];
  }
}

export function createBag(storage) {
  let items = read(storage);
  const listeners = new Set();

  function commit() {
    try { storage?.setItem(BAG_KEY, JSON.stringify(items)); } catch { /* storage unavailable: keep in memory (AgDR-0002) */ }
    listeners.forEach(fn => fn());
  }

  return {
    lines: () => items.map(l => (l.type === 'box' ? { ...l, box: { ...l.box, items: { ...l.box.items } } } : { ...l })),
    count: () => items.reduce((n, l) => n + l.qty, 0),
    add(line) {
      const clean = cleanLine(line);
      if (!clean) return;
      const key = lineKey(clean);
      const existing = items.find(l => lineKey(l) === key);
      if (existing) existing.qty = Math.min(existing.qty + clean.qty, MAX_QTY);
      else items.push(clean);
      commit();
    },
    setQty(key, qty) {
      const q = cleanQty(qty);
      items = q ? items.map(l => (lineKey(l) === key ? { ...l, qty: q } : l)) : items.filter(l => lineKey(l) !== key);
      commit();
    },
    remove(key) {
      items = items.filter(l => lineKey(l) !== key);
      commit();
    },
    clear() {
      items = [];
      commit();
    },
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
  };
}

export function describeLine(line) {
  if (line.type === 'box') {
    const unit = boxPrice(line.box);
    return {
      key: lineKey(line), title: 'Custom box',
      spec: boxSpecText(line.box),
      image: 'assets/img/products/complete-czera-set-2.jpg',
      unitPrice: unit, qty: line.qty, total: unit * line.qty, messageLabel: boxLabel(line.box),
    };
  }
  const p = findProduct(line.slug);
  return {
    key: lineKey(line), title: p.name, spec: p.spec, image: p.images[0],
    unitPrice: p.price, qty: line.qty, total: p.price * line.qty, messageLabel: p.name,
  };
}

export function bagTotal(lines) {
  return lines.reduce((sum, l) => sum + describeLine(l).total, 0);
}
