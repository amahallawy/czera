// The 16 products. Source of truth: the client's info.txt files and catalogue PDF
// (graphics/client-2026-10/). Prices in EGP. Read PRODUCT.md before editing copy.
const img = (slug, ...n) => n.map(i => `assets/img/products/${slug}-${i}.jpg`);
// The client's newer photo leads, the original photos follow (#101).
const withMain = (slug, ...n) => [`assets/img/products/${slug}-main.jpg`, ...img(slug, ...n)];
const SET_FEATURES = ['Premium 100% cotton', 'Ultra soft and highly absorbent', 'Hotel-style quality', 'Gift-ready packaging'];

export const CATEGORIES = [
  { id: 'towels', label: 'Towels', navLabel: 'The towel collection' },
  { id: 'bathrobes', label: 'Bathrobes', navLabel: 'Bathrobes' },
  { id: 'beach', label: 'Beach', navLabel: 'Beach towels' },
  { id: 'gift-sets', label: 'Gift sets', navLabel: 'Gift sets' },
];

export const PRODUCTS = [
  {
    slug: 'complete-czera-set', name: 'The Complete Czera Set', category: 'gift-sets', price: 1450,
    spec: '5 pieces · burgundy ribbon', colours: ['white'], images: img('complete-czera-set', 1, 2, 3),
    description: 'Five 100% cotton towels, from face towel to bath sheet, presented in the black Czera gift box and finished with burgundy satin ribbons.',
    features: [...SET_FEATURES, 'For weddings, birthdays and special occasions'],
    contents: [
      { qty: 2, label: 'Face towel', spec: '30 × 30 cm' },
      { qty: 1, label: 'Hand towel', spec: '50 × 100 cm' },
      { qty: 1, label: 'Bath towel', spec: '70 × 140 cm' },
      { qty: 1, label: 'Bath sheet', spec: '90 × 160 cm' },
    ],
    ribbon: 'burgundy', giftGroup: 'home', boxable: false,
  },
  {
    slug: 'three-bath-towels-set', name: '3 Bath Towels Set', category: 'gift-sets', price: 1410,
    spec: '3 × 70 × 140 cm', colours: ['white'], images: img('three-bath-towels-set', 1, 2, 3),
    description: 'Three 100% cotton bath towels, presented in the black Czera gift box and finished with satin ribbons. Soft, absorbent and hotel-inspired.',
    features: [...SET_FEATURES, 'For weddings, birthdays and special occasions'],
    contents: [{ qty: 3, label: 'Bath towel', spec: '70 × 140 cm' }],
    ribbon: 'burgundy', giftGroup: 'home', boxable: false,
  },
  {
    slug: 'three-bath-sheets-set', name: '3 Bath Sheets Set', category: 'gift-sets', price: 1950,
    spec: '3 × 90 × 160 cm', colours: ['white'], images: img('three-bath-sheets-set', 1, 2, 3),
    description: 'Three generously sized 100% cotton bath sheets, presented in the black Czera gift box and finished with satin ribbons.',
    features: [...SET_FEATURES, 'For weddings, birthdays and special occasions'],
    contents: [{ qty: 3, label: 'Bath sheet', spec: '90 × 160 cm' }],
    ribbon: 'burgundy', giftGroup: 'home', boxable: false,
  },
  {
    slug: 'hand-and-bath-sheet-set', name: 'Hand & Bath Sheet Set', category: 'gift-sets', price: 1760,
    spec: '4 pieces · black box', colours: ['white'], images: img('hand-and-bath-sheet-set', 1, 2, 3),
    description: 'Two bath sheets and two hand towels in 100% cotton, presented in the black Czera gift box and finished with satin ribbons.',
    features: [...SET_FEATURES, 'For weddings, birthdays and special occasions'],
    contents: [
      { qty: 2, label: 'Bath sheet', spec: '90 × 160 cm' },
      { qty: 2, label: 'Hand towel', spec: '50 × 100 cm' },
    ],
    ribbon: 'burgundy', giftGroup: 'home', boxable: false,
  },
  {
    slug: 'his-and-hers-robes', name: 'His & Hers Robes', category: 'gift-sets', price: 2000,
    spec: '2 robes · 1200 GSM', colours: ['white', 'black'], images: img('his-and-hers-robes', 2, 3),
    description: 'Two 100% cotton bathrobes, one white and one black, at 1200 GSM, presented in the black Czera gift box with satin ribbons.',
    features: ['Premium 100% cotton', '1200 GSM', 'Fits up to 130 kg', 'Thick and plush', 'Gift-ready packaging', 'For weddings and anniversaries'],
    contents: [
      { qty: 1, label: 'White bathrobe', spec: '1200 GSM' },
      { qty: 1, label: 'Black bathrobe', spec: '1200 GSM' },
    ],
    ribbon: 'gold', giftGroup: 'robes-beach', boxable: false,
  },
  {
    slug: 'robe-beach-black-blue', name: 'Robe & Beach Set, Black + Blue', category: 'gift-sets', price: 1850,
    spec: 'Robe + beach towel', colours: ['black', 'striped'], images: img('robe-beach-black-blue', 2, 3, 1),
    description: 'A black 1200 GSM bathrobe and a blue-and-white striped beach towel, presented in the black Czera gift box with satin ribbon.',
    features: ['Premium 100% cotton', 'Bathrobe: 1200 GSM, fits up to 130 kg', 'Beach towel: 100 × 200 cm', 'Gift-ready packaging'],
    contents: [
      { qty: 1, label: 'Black bathrobe', spec: '1200 GSM' },
      { qty: 1, label: 'Blue stripe beach towel', spec: '100 × 200 cm' },
    ],
    ribbon: 'gold', giftGroup: 'robes-beach', boxable: false,
  },
  {
    slug: 'robe-beach-white-yellow', name: 'Robe & Beach Set, White + Yellow', category: 'gift-sets', price: 1850,
    spec: 'Robe + beach towel', colours: ['white', 'striped'], images: ['assets/img/catalogue/p17.jpg'],
    description: 'A white 1200 GSM bathrobe and a yellow-and-white striped beach towel, presented in the black Czera gift box with satin ribbon.',
    features: ['Premium 100% cotton', 'Bathrobe: 1200 GSM, fits up to 130 kg', 'Beach towel: 100 × 200 cm', 'Gift-ready packaging'],
    contents: [
      { qty: 1, label: 'White bathrobe', spec: '1200 GSM' },
      { qty: 1, label: 'Yellow stripe beach towel', spec: '100 × 200 cm' },
    ],
    ribbon: 'gold', giftGroup: 'robes-beach', boxable: false,
  },
  {
    slug: 'beach-towel-set', name: 'Beach Towel Set', category: 'gift-sets', price: 1700,
    spec: 'Yellow + blue · 2 × 100 × 200 cm', colours: ['striped'], images: ['assets/img/catalogue/p20.jpg'],
    description: 'Two 100% cotton beach towels, one in yellow and white stripes and one in blue and white, presented in the black Czera gift box with satin ribbons.',
    features: ['100% premium cotton', 'Ultra soft and highly absorbent', 'Gift-ready packaging', 'For beach and pool'],
    contents: [
      { qty: 1, label: 'Yellow stripe beach towel', spec: '100 × 200 cm' },
      { qty: 1, label: 'Blue stripe beach towel', spec: '100 × 200 cm' },
    ],
    ribbon: 'gold', giftGroup: 'robes-beach', boxable: false,
  },
  {
    slug: 'white-bathrobe', name: 'White Bathrobe', category: 'bathrobes', price: 1000,
    spec: '1200 GSM · fits up to 130 kg', colours: ['white'], images: img('white-bathrobe', 2, 1),
    description: 'A 100% cotton bathrobe at 1200 GSM: soft, thick and absorbent, with a generous fit for up to 130 kg. The hotel and spa feeling, at home.',
    features: ['100% premium cotton', '1200 GSM', 'Fits up to 130 kg', 'Ultra soft and highly absorbent', 'Thick and plush', 'Hotel-style quality'],
    contents: null, ribbon: null, giftGroup: null, boxable: false,
  },
  {
    slug: 'black-bathrobe', name: 'Black Bathrobe', category: 'bathrobes', price: 1000,
    spec: '1200 GSM · fits up to 130 kg', colours: ['black'], images: img('black-bathrobe', 1, 3),
    description: 'A 100% cotton bathrobe at 1200 GSM: soft, thick and absorbent, with a generous fit for up to 130 kg. The hotel and spa feeling, at home.',
    features: ['100% premium cotton', '1200 GSM', 'Fits up to 130 kg', 'Ultra soft and highly absorbent', 'Thick and plush', 'Hotel-style quality'],
    contents: null, ribbon: null, giftGroup: null, boxable: false,
  },
  {
    slug: 'face-towel', name: 'Face Towel', category: 'towels', price: 50,
    spec: '30 × 30 cm', colours: ['white'], images: withMain('face-towel', 2, 3),
    description: 'A compact 100% cotton towel for face and hands. Soft and absorbent, with a timeless finish that suits every bathroom.',
    features: ['100% premium cotton', '30 × 30 cm', 'Soft and absorbent', 'For face and hands'],
    contents: null, ribbon: null, giftGroup: null, boxable: true,
  },
  {
    slug: 'hand-towel', name: 'Hand Towel', category: 'towels', price: 230,
    spec: '50 × 100 cm', colours: ['white'], images: withMain('hand-towel', 1, 3),
    description: 'A 100% cotton towel that pairs softness with excellent absorbency, with a plush texture and a classic hotel-style finish.',
    features: ['100% cotton', '50 × 100 cm', 'Ultra soft and absorbent', 'Hotel-style quality', 'Durable and easy to care for'],
    contents: null, ribbon: null, giftGroup: null, boxable: true,
  },
  {
    slug: 'bath-towel', name: 'Bath Towel', category: 'towels', price: 470,
    spec: '70 × 140 cm', colours: ['white'], images: withMain('bath-towel', 1, 2),
    description: 'A 100% cotton bath towel with a plush terry texture and a classic hotel-style finish. Soft and highly absorbent, for every day.',
    features: ['100% premium cotton', '70 × 140 cm', 'Ultra soft and highly absorbent', 'Classic hotel-style finish', 'Durable'],
    contents: null, ribbon: null, giftGroup: null, boxable: true,
  },
  {
    slug: 'bath-sheet', name: 'Bath Sheet', category: 'towels', price: 650,
    spec: '90 × 160 cm', colours: ['white'], images: withMain('bath-sheet', 1, 2),
    description: 'A generous 100% cotton bath sheet with a plush, soft texture and excellent absorbency. Extra coverage with a classic hotel-style finish.',
    features: ['100% premium cotton', '90 × 160 cm', 'Ultra soft and highly absorbent', 'Generous size for extra comfort', 'Classic hotel-style finish'],
    contents: null, ribbon: null, giftGroup: null, boxable: true,
  },
  {
    slug: 'blue-stripe-beach-towel', name: 'Blue Stripe Beach Towel', category: 'beach', price: 850,
    spec: '100 × 200 cm', colours: ['striped'], images: withMain('blue-stripe-beach-towel', 2, 3),
    description: 'A 100% cotton beach towel in bold blue-and-white stripes. Plush, absorbent and generously sized for the pool or the sea.',
    features: ['100% premium cotton', '100 × 200 cm', 'Ultra soft and highly absorbent', 'Blue and white stripes', 'For beach and pool'],
    contents: null, ribbon: null, giftGroup: null, boxable: true,
  },
  {
    slug: 'yellow-stripe-beach-towel', name: 'Yellow Stripe Beach Towel', category: 'beach', price: 850,
    spec: '100 × 200 cm', colours: ['striped'], images: withMain('yellow-stripe-beach-towel', 1, 2),
    description: 'A 100% cotton beach towel in yellow-and-white stripes. Plush, absorbent and generously sized for the pool or the sea.',
    features: ['100% premium cotton', '100 × 200 cm', 'Ultra soft and highly absorbent', 'Yellow and white stripes', 'For beach and pool'],
    contents: null, ribbon: null, giftGroup: null, boxable: true,
  },
];
