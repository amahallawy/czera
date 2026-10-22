// js/lib/discount.js
// The first-order code (spec: first-order-and-sale). The code word and the percent live only in
// CONFIG.firstOrder. Storage handling follows bag.js: null or throwing storage never throws.
import { CONFIG } from '../config.js';
import { bagTotal } from './bag.js';

export const CODE_KEY = 'czera.code.v1';

export function normaliseCode(s) {
  return typeof s === 'string' ? s.trim().toUpperCase() : '';
}

export function isValidCode(s) {
  return normaliseCode(s) === normaliseCode(CONFIG.firstOrder.code);
}

export function orderTotals(lines, code) {
  const subtotal = bagTotal(lines);
  const discount = isValidCode(code) ? Math.round(subtotal * CONFIG.firstOrder.percent / 100) : 0;
  return { subtotal, discount, total: subtotal - discount };
}

export function readCode(storage) {
  try {
    const stored = normaliseCode(storage?.getItem(CODE_KEY));
    return isValidCode(stored) ? stored : '';
  } catch {
    return '';
  }
}

export function writeCode(storage, code) {
  try { storage?.setItem(CODE_KEY, normaliseCode(code)); } catch { /* storage unavailable: nothing to keep */ }
}

export function clearCode(storage) {
  try { storage?.removeItem(CODE_KEY); } catch { /* storage unavailable: nothing to clear */ }
}

// The top line's "closed" memory: stores the code that was dismissed, so a new code shows again.
export const PROMO_KEY = 'czera.promo.v1';

export function promoDismissed(storage, code) {
  try {
    return normaliseCode(storage?.getItem(PROMO_KEY)) === normaliseCode(code);
  } catch {
    return false;
  }
}

export function dismissPromo(storage, code) {
  try { storage?.setItem(PROMO_KEY, normaliseCode(code)); } catch { /* storage unavailable: it shows again next page */ }
}
