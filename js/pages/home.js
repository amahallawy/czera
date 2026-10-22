import { initShell } from '../ui/shell.js';
import { renderProductCard } from '../ui/card.js';
import { giftGroup, categoryMeta } from '../lib/products.js';
import { formatEGP } from '../lib/format.js';
import { CONFIG } from '../config.js';
import { escapeHtml } from '../lib/escape.js';

initShell({ hasHero: true });

// Hero film: it plays by itself for everyone, phones and Reduce Motion included
// (owner decision, 2026-10-21, #119). The round button is always there to pause it
// (WCAG 2.2.2); its name follows the state, "Pause film" or "Play film". Where the
// browser refuses autoplay (iOS Low Power Mode, for one) the poster stays and the
// same button starts the film.
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
  play().catch(() => { /* autoplay refused: the poster stays and the button reads "Play film" */ });
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

// Welcome note after Gift sets: the wording is fixed; the code and percent come from CONFIG.firstOrder.
const welcome = document.querySelector('[data-welcome-note]');
if (welcome) {
  const { code, percent } = CONFIG.firstOrder;
  welcome.innerHTML = `<div class="welcome-note__card">
    <span class="eyebrow eyebrow--gold">Welcome to CZERA</span>
    <h2 id="welcome-title" class="welcome-note__title">${escapeHtml(String(percent))}% off your first order.</h2>
    <p class="welcome-note__text">Use the code at checkout.</p>
    <p class="welcome-note__code"><span class="sr-only">Code: </span>${escapeHtml(code)}</p>
  </div>`;
}
