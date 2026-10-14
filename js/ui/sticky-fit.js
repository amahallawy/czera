// Keep a sticky side panel sticky only while it fits under the header. A taller
// panel gets `is-tall` (CSS makes it static) so it scrolls with the page and all
// of it stays reachable, with no inner scrollbar.
export function fitSticky(panel) {
  if (!panel) return;
  // Read the sticky offset only while sticky: once static, `top` no longer applies.
  let top = 0;
  const fit = () => {
    if (!panel.classList.contains('is-tall')) top = parseFloat(getComputedStyle(panel).top) || 0;
    panel.classList.toggle('is-tall', top + panel.offsetHeight > window.innerHeight);
  };
  if ('ResizeObserver' in window) new ResizeObserver(fit).observe(panel);
  window.addEventListener('resize', fit);
  fit();
}
