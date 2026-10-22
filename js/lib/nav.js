import { PRODUCTS, CATEGORIES } from '../data/products.js';
import { saleProducts } from './pricing.js';

// The slide-in menu, in the client's order (#101): the whole collection, the
// four categories, the box builder (featured: styled to invite a click), Sale
// (plain, only while something is on sale), then About. Category links use the menu's own wording (`navLabel`); the footer and
// the Collection filters keep the short `label`.
export function menuItems(products = PRODUCTS) {
  return [
    { label: 'Shop all', href: 'catalog.html' },
    ...CATEGORIES.map(c => ({ label: c.navLabel, href: `catalog.html?category=${c.id}` })),
    { label: 'Build Your Own Box', href: 'build-your-box.html', featured: true },
    ...(saleProducts(products).length > 0 ? [{ label: 'Sale', href: 'catalog.html?sale=1' }] : []),
    { label: 'About CZERA', href: 'about.html' },
  ];
}
