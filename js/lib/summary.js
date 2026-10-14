// js/lib/summary.js: compact view of bag lines for the order summary.
export function summariseLines(lines, limit = 3) {
  return { shown: lines.slice(0, limit), more: Math.max(0, lines.length - limit) };
}
