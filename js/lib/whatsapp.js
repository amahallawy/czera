// js/lib/whatsapp.js
import { CONFIG } from '../config.js';
import { describeLine, bagTotal } from './bag.js';
import { formatEGP } from './format.js';

export function buildOrderMessage(lines, details) {
  const out = ["Hello Czera, I'd like to order:"];
  for (const line of lines) {
    const d = describeLine(line);
    out.push(`• ${d.qty} × ${d.messageLabel}: ${formatEGP(d.total)}`);
  }
  out.push(`Total: ${formatEGP(bagTotal(lines))}`);
  if (details) {
    out.push('', `Name: ${details.name.trim()}`, `Phone: ${details.phone.trim()}`,
      `Address: ${details.address.trim()}, City: ${details.city.trim()}`);
    if (details.note && details.note.trim()) out.push(`Note: ${details.note.trim()}`);
  }
  return out.join('\n');
}

export function orderLink(message, number = CONFIG.whatsappNumber) {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
