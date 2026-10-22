import { escapeHtml, nameHtml } from '../lib/escape.js';
import { formatEGP } from '../lib/format.js';
import { isOnSale, currentPrice } from '../lib/pricing.js';

export const SALE_FLAG = '<span class="card__flag">Sale</span>';

// Plain price, or the regular price struck through beside the sale price; screen readers hear "Was ..., now ...".
export function priceHtml(p) {
  if (!isOnSale(p)) return formatEGP(p.price);
  return `<span class="price"><s class="price__was"><span class="sr-only">Was </span>${formatEGP(p.price)}</s> <span class="price__now"><span class="sr-only">, now </span>${formatEGP(currentPrice(p))}</span></span>`;
}

export function renderProductCard(p) {
  const name = escapeHtml(p.name);
  const href = `product.html?slug=${escapeHtml(p.slug)}`;
  const alt = p.images[1]
    ? `<img class="card__img card__img--alt" src="${escapeHtml(p.images[1])}" alt="" loading="lazy" />`
    : '';
  return `
    <article class="card">
      <a class="card__media" href="${href}" tabindex="-1" aria-hidden="true">
        <img class="card__img" src="${escapeHtml(p.images[0])}" alt="${name}" loading="lazy" />${alt}${isOnSale(p) ? SALE_FLAG : ''}
      </a>
      <h3 class="card__name"><a href="${href}">${nameHtml(p.name)}</a></h3>
      <p class="card__spec">${escapeHtml(p.spec)}</p>
      <div class="card__row">
        <span class="card__price">${priceHtml(p)}</span>
        <button class="card__add" type="button" data-add-to-bag="${escapeHtml(p.slug)}" aria-label="Add ${name} to bag">Add to bag ›</button>
      </div>
    </article>`;
}
