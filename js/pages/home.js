import { initShell } from '../ui/shell.js';
import { renderProductCard } from '../ui/card.js';
import { giftGroup, categoryMeta } from '../lib/products.js';
import { formatEGP } from '../lib/format.js';
import { CONFIG } from '../config.js';

initShell({ hasHero: true });

// Hero film: autoplay only where it is cheap and welcome. Touch devices, narrow
// screens, slow/cellular connections, Save-Data and reduced-data visitors get the
// poster and a "Play film" control instead. Everyone else autoplays and gets a
// "Pause film" control (WCAG 2.2.2). Reduced motion keeps the poster, no control
// (CSS hides the video and the button).
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

  if (!reducedMotion) {
    if (heroPlay) {
      const label = heroPlay.querySelector('[data-hero-play-label]');
      const setLabel = text => {
        label.textContent = text;
        heroPlay.dataset.state = text === 'Pause film' ? 'playing' : 'paused';
      };
      heroPlay.hidden = false;
      heroVideo.addEventListener('play', () => setLabel('Pause film'));
      heroVideo.addEventListener('pause', () => setLabel('Play film'));
      // Source load failures fire `error` on the <source>, which does not bubble.
      heroVideo.addEventListener('error', () => { setLabel(heroVideo.paused ? 'Play film' : 'Pause film'); }, true);
      heroPlay.addEventListener('click', () => {
        if (heroVideo.paused) play().catch(() => setLabel('Play film'));
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
