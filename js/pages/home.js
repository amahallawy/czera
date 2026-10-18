import { initShell } from '../ui/shell.js';
import { renderProductCard } from '../ui/card.js';
import { giftGroup, categoryMeta } from '../lib/products.js';
import { formatEGP } from '../lib/format.js';
import { CONFIG } from '../config.js';

initShell({ hasHero: true });

// Hero film: autoplay only where it is cheap and welcome. Touch devices, narrow
// screens, slow/cellular connections, Save-Data and reduced-data visitors get the
// poster and the play button instead. Everyone else autoplays and gets the same
// round button to pause it (WCAG 2.2.2); its name follows the state, "Pause film"
// or "Play film". Reduced motion keeps the poster, no film and no button (CSS
// hides the video and the button).
//
// The film loops every 30 s and its last 6 s (24-30 s) are the bright ivory linen
// with the gold CZERA sign-off. While they play, `body.hero-signoff` deepens the
// header shade so MENU and BAG stay readable (landing.css). The class goes on
// SIGNOFF_LEAD seconds before the cut so the 600 ms fade has finished when the
// linen appears, and comes off when the film loops back to the cotton field.
const SIGNOFF_START = 24;
const SIGNOFF_LEAD = 0.6;
const heroVideo = document.querySelector('video.hero__media');
const heroPlay = document.querySelector('[data-hero-play]');
if (heroVideo) {
  const mq = q => window.matchMedia && window.matchMedia(q).matches;
  const conn = navigator.connection;
  const reducedMotion = mq('(prefers-reduced-motion: reduce)');
  const holdBack = mq('(max-width: 768px)')
    || mq('(hover: none) and (pointer: coarse)')
    || mq('(prefers-reduced-data: reduce)')
    || Boolean(conn && (conn.saveData || conn.type === 'cellular'
      || /^(slow-2g|2g|3g)$/.test(conn.effectiveType || '')));

  const attachSources = () => {
    if (heroVideo.querySelector('source')) return;
    [['webm', 'video/webm'], ['mp4', 'video/mp4']].forEach(([ext, type]) => {
      const src = document.createElement('source');
      src.src = heroVideo.dataset[`src${ext[0].toUpperCase()}${ext.slice(1)}`];
      src.type = type;
      heroVideo.append(src);
    });
    heroVideo.load();
  };
  const play = () => {
    attachSources();
    heroVideo.preload = 'auto';
    return heroVideo.play();
  };

  // Follow the film's clock: every frame where the browser can report frames,
  // otherwise on each timeupdate (about four times a second).
  const syncSignoff = () => {
    document.body.classList.toggle('hero-signoff',
      heroVideo.currentTime >= SIGNOFF_START - SIGNOFF_LEAD);
  };
  const watchFrames = () => {
    syncSignoff();
    heroVideo.requestVideoFrameCallback(watchFrames);
  };

  if (!reducedMotion) {
    if ('requestVideoFrameCallback' in heroVideo) heroVideo.requestVideoFrameCallback(watchFrames);
    else heroVideo.addEventListener('timeupdate', syncSignoff);
    heroVideo.addEventListener('seeked', syncSignoff);

    if (heroPlay) {
      const setState = playing => {
        heroPlay.setAttribute('aria-label', playing ? 'Pause film' : 'Play film');
        heroPlay.dataset.state = playing ? 'playing' : 'paused';
      };
      heroPlay.hidden = false;
      heroVideo.addEventListener('play', () => setState(true));
      heroVideo.addEventListener('pause', () => setState(false));
      // Source load failures fire `error` on the <source>, which does not bubble.
      heroVideo.addEventListener('error', () => { setState(!heroVideo.paused); }, true);
      heroPlay.addEventListener('click', () => {
        if (heroVideo.paused) play().catch(() => setState(false));
        else heroVideo.pause();
      });
    }
    if (!holdBack) play().catch(() => { /* autoplay refused: the poster stays */ });
  }
}

const META_TEXT = {
  'gift-sets': m => `${m.count} sets · from ${formatEGP(m.minPrice)}`,
  towels: m => `${m.count} sizes · from ${formatEGP(m.minPrice)}`,
  bathrobes: m => `1200 GSM · ${formatEGP(m.minPrice)}`,
  beach: m => `100 × 200 cm · ${formatEGP(m.minPrice)}`,
};
document.querySelectorAll('[data-category-meta]').forEach(el => {
  const id = el.dataset.categoryMeta;
  el.textContent = META_TEXT[id](categoryMeta(id));
});

const panel = document.querySelector('[data-gift-panel]');
function showGroup(id) {
  panel.innerHTML = giftGroup(id).map(renderProductCard).join('');
  document.querySelectorAll('[data-gift-tab]').forEach(t => t.setAttribute('aria-selected', String(t.dataset.giftTab === id)));
}
document.querySelectorAll('[data-gift-tab]').forEach(t => t.addEventListener('click', () => showGroup(t.dataset.giftTab)));
showGroup('home');

const delivery = document.querySelector('[data-delivery-text]');
if (delivery) delivery.textContent = `We confirm the price and delivery. ${CONFIG.deliveryText}.`;
