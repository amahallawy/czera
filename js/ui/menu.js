// Slide-in menu panel (opens from the right)
export function initMenu() {
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('[data-site-menu]');
  const menuClose = document.querySelector('[data-menu-close]');
  const menuBackdrop = document.querySelector('[data-menu-backdrop]');

  function openMenu() {
    if (!menu || !menuBackdrop) return;
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
    // Hide after the transition completes so screen readers skip the panel
    const onEnd = () => {
      if (!menu.classList.contains('is-open')) {
        menu.hidden = true;
        menuBackdrop.hidden = true;
      }
      menu.removeEventListener('transitionend', onEnd);
    };
    menu.addEventListener('transitionend', onEnd);
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
