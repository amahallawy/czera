import { PRODUCTS } from '../data/products.js';

export function findProduct(slug) {
  if (!slug) return null;
  return PRODUCTS.find(p => p.slug === slug) ?? null;
}

export function byCategory(id) {
  return PRODUCTS.filter(p => p.category === id);
}

export function giftGroup(id) {
  return PRODUCTS.filter(p => p.giftGroup === id);
}

export function categoryMeta(id) {
  const list = byCategory(id);
  return { count: list.length, minPrice: Math.min(...list.map(p => p.price)) };
}
