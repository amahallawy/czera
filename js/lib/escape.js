// js/lib/escape.js
const MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export function escapeHtml(value) {
  if (value === null || value === undefined) return '';
  return String(value).replace(/[&<>"']/g, ch => MAP[ch]);
}

// Product names are set in Italiana, whose old-style figures read "3" as "ȝ".
// Wrap each number ("3", "2.5", "1,000", "100%") so CSS can set it in Montserrat.
// Split before escaping: entities such as &#39; contain digits of their own.
export function nameHtml(name) {
  if (name === null || name === undefined) return '';
  return String(name).split(/(\d+(?:[.,]\d+)*%?)/)
    .map((part, i) => (i % 2 ? `<span class="num">${part}</span>` : escapeHtml(part))).join('');
}
