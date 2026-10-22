// Site-wide settings. PLACEHOLDER values are approved drafts; replace before launch (spec §11).
export const CONFIG = {
  contactEmail: 'support@czeramaison.com', // orders and enquiries arrive here (owner, #84)
  deliveryText: 'Across Egypt in 2–5 days, next day in Cairo & Giza', // PLACEHOLDER
  paymentText: 'Cash on delivery or InstaPay',                          // PLACEHOLDER
  careText: 'Machine wash warm, tumble dry low',                        // PLACEHOLDER
  social: [
    { label: 'Instagram', handle: '@czera_maison', url: 'https://www.instagram.com/czera_maison' },
    { label: 'Facebook', handle: 'CzeraMaison', url: 'https://www.facebook.com/CzeraMaison' },
    { label: 'TikTok', handle: '@czera23', url: 'https://www.tiktok.com/@czera23' },
  ],
  boxMinPieces: 2, // DRAFT until the client confirms (spec §8)
  boxMaxTowels: 6, // towels per box, all sizes and colours together (as on WordPress, #107)
  boxMaxRobes: 2, // bathrobes per box (as on WordPress, #107)
  firstOrder: { code: 'WELCOME10', percent: 10 }, // DEMO values (owner, 2026-10-21); the only place they are written
};
