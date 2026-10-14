// js/lib/checkout.js
const REQUIRED = { name: 'Enter your name.', address: 'Enter your address.', city: 'Enter your city.' };

export function validateDetails(details = {}) {
  const errors = {};
  for (const [field, message] of Object.entries(REQUIRED)) {
    if (!String(details[field] ?? '').trim()) errors[field] = message;
  }
  const digits = String(details.phone ?? '').replace(/\D/g, '');
  if (digits.length < 8) errors.phone = 'Enter a phone number we can call.';
  return { ok: Object.keys(errors).length === 0, errors };
}
