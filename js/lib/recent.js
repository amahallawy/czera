// js/lib/recent.js
export const RECENT_KEY = 'czera.recent.v1';

export function readRecent(storage) {
  try {
    const parsed = JSON.parse(storage?.getItem(RECENT_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter(s => typeof s === 'string') : [];
  } catch {
    return [];
  }
}

export function pushRecent(storage, slug, max = 4) {
  const next = [slug, ...readRecent(storage).filter(s => s !== slug)].slice(0, max);
  try { storage?.setItem(RECENT_KEY, JSON.stringify(next)); } catch { /* storage unavailable: nothing to remember */ }
  return next;
}
