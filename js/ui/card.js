import { escapeHtml } from '../lib/escape.js';
import { formatEGP } from '../lib/format.js';

export function renderProductCard(p) {
  const name = escapeHtml(p.name);
  const href = `product.html?slug=${escapeHtml(p.slug)}`;
  const alt = p.images[1]
    ? `<img class="card__img card__img--alt" src="${escapeHtml(p.images[1])}" alt="" loading="lazy" />`
    : '';
  return `
    <article class="card">
      <a class="card__media" href="${href}" tabindex="-1" aria-hidden="true">
        <img class="card__img" src="${escapeHtml(p.images[0])}" alt="${name}" loading="lazy" />${alt}
      </a>
      <h3 class="card__name"><a href="${href}">${name}</a></h3>
      <p class="card__spec">${escapeHtml(p.spec)}</p>
      <div class="card__row">
        <span class="card__price">${formatEGP(p.price)}</span>
        <button class="card__add" type="button" data-add-to-bag="${escapeHtml(p.slug)}" aria-label="Add ${name} to bag">Add to bag ›</button>
      </div>
    </article>`;
}
