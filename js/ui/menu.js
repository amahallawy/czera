// Slide-in menu panel (opens from the right)
export function initMenu() {
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('[data-site-menu]');
  const menuClose = document.querySelector('[data-menu-close]');
  const menuBackdrop = document.querySelector('[data-menu-backdrop]');
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

  // Close menu via ESC key when open
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu?.classList.contains('is-open')) {
      closeMenu();
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
