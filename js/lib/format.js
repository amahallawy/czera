// js/lib/format.js
export function formatEGP(amount) {
  return `${Number(amount).toLocaleString('en-US')} EGP`;
}
