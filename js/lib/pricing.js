// js/lib/pricing.js
// Sale prices (#123): a product may carry an optional salePrice. It only counts when it is a positive
// number below the regular price, so a bad or equal value falls back to the regular price.
import { PRODUCTS } from '../data/products.js';

export function isOnSale(p) {
  return typeof p.salePrice === 'number' && p.salePrice > 0 && p.salePrice < p.price;
}

// The price a customer pays: the sale price while on sale, else the regular price.
export function currentPrice(p) {
  return isOnSale(p) ? p.salePrice : p.price;
}

export function saleProducts(products = PRODUCTS) {
  return products.filter(isOnSale);
}
