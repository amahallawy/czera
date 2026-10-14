// js/lib/details.js: typed delivery details kept for this tab only (sessionStorage, never localStorage).
export const DETAILS_KEY = 'czera.details.v1';
const FIELD_IDS = ['name', 'phone', 'address', 'city', 'note'];

export function readDetails(storage) {
  try {
    const parsed = JSON.parse(storage?.getItem(DETAILS_KEY) || '{}');
    const out = {};
    for (const id of FIELD_IDS) if (typeof parsed?.[id] === 'string') out[id] = parsed[id];
    return out;
  } catch {
    return {};
  }
}

export function writeDetails(storage, values) {
  try {
    const clean = {};
    for (const id of FIELD_IDS) if (typeof values?.[id] === 'string') clean[id] = values[id];
    storage?.setItem(DETAILS_KEY, JSON.stringify(clean));
  } catch { /* storage unavailable: details stay in memory for this visit */ }
}
