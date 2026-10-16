// Slide-in menu panel: the only primary nav, on every screen size. Opens from
// the inline start (left in English, right in Arabic) and is modal while open.
export function initMenu() {
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('[data-site-menu]');
  const menuClose = document.querySelector('[data-menu-close]');
  const menuBackdrop = document.querySelector('[data-menu-backdrop]');

  // Everything else on the page is inert while the menu is open, so Tab and
  // screen readers stay inside it (same approach as the bag panel).
  let inerted = [];
  function setBackground(on) {
    if (!on) { inerted.forEach(el => { el.inert = false; }); inerted = []; return; }
    inerted = [...document.body.children].filter(el => el !== menu && el !== menuBackdrop && !el.inert);
    inerted.forEach(el => { el.inert = true; });
  }
  // One pending hide at a time: a quick close, reopen, close must not let the
  // first close's timer hide the panel mid-slide.
  let hideTimer;
  let onEnd;
  const cancelHide = () => {
    clearTimeout(hideTimer);
    if (onEnd) menu?.removeEventListener('transitionend', onEnd);
    onEnd = null;
  };

  function openMenu() {
    if (!menu || !menuBackdrop) return;
    cancelHide();
    menu.hidden = false;
    menuBackdrop.hidden = false;
    // Force layout flush so the transition runs from the start position
    void menu.offsetHeight;
    menu.classList.add('is-open');
    menuBackdrop.classList.add('is-open');
    menu.setAttribute('aria-hidden', 'false');
    menuBackdrop.setAttribute('aria-hidden', 'false');
    menuToggle?.setAttribute('aria-expanded', 'true');
    document.body.classList.add('menu-open');
    setBackground(true);
    // Focus the close button so keyboard users land in the panel
    menuClose?.focus();
  }

  function closeMenu() {
    if (!menu || !menuBackdrop) return;
    menu.classList.remove('is-open');
    menuBackdrop.classList.remove('is-open');
    menu.setAttribute('aria-hidden', 'true');
    menuBackdrop.setAttribute('aria-hidden', 'true');
    menuToggle?.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
    setBackground(false);
    // Hide after the slide-out completes so screen readers skip the panel (and its
    // shadow is not drawn). With no transition (reduced motion) hide at once; the
    // timeout covers a transitionend that never arrives.
    cancelHide();
    const hide = () => {
      cancelHide();
      if (!menu.classList.contains('is-open')) {
        menu.hidden = true;
        menuBackdrop.hidden = true;
      }
    };
    onEnd = (e) => { if (e.target === menu && e.propertyName === 'transform') hide(); };
    const duration = parseFloat(getComputedStyle(menu).transitionDuration) || 0;
    if (duration === 0) {
      hide();
    } else {
      menu.addEventListener('transitionend', onEnd);
      hideTimer = setTimeout(hide, duration * 1000 + 100);
    }
    menuToggle?.focus();
  }

  if (menuToggle) menuToggle.addEventListener('click', openMenu);
  if (menuClose) menuClose.addEventListener('click', closeMenu);
  if (menuBackdrop) menuBackdrop.addEventListener('click', closeMenu);

  // Close menu via ESC key when open; keep Tab inside it where `inert` is
  // not supported.
  document.addEventListener('keydown', (e) => {
    if (!menu?.classList.contains('is-open')) return;
    if (e.key === 'Escape') { closeMenu(); return; }
    if (e.key === 'Tab' && !('inert' in HTMLElement.prototype)) {
      const f = [...menu.querySelectorAll('button, a[href]')];
      const first = f[0], last = f[f.length - 1];
      if (!menu.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
      else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  // Close menu when a link inside it is activated (so navigating to an
  // anchor on the same page also closes the panel)
  document.querySelectorAll('.site-menu__link').forEach((link) => {
    link.addEventListener('click', () => {
      if (menu?.classList.contains('is-open')) closeMenu();
    });
  });
}
