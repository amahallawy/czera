// js/lib/email.js
// Orders and enquiries go by email (owner decision, #84): a mailto: link opens the visitor's email
// app addressed to the shop, with the subject and the order already written.
import { CONFIG } from '../config.js';
import { describeLine } from './bag.js';
import { formatEGP } from './format.js';
import { orderTotals, normaliseCode } from './discount.js';

export const ORDER_SUBJECT = 'Order from czeramaison.com';
export const BULK_SUBJECT = 'Bulk or corporate order';
export const BULK_MESSAGE = "Hello Czera, I'd like to ask about a bulk or corporate order.";

// Some email apps cut a mailto: link short past about 2,000 characters (older Outlook on Windows
// is the usual one). A long bag still opens the email app; the bag's confirmation step then says
// so and offers to copy the order, so nothing is lost if the body arrives cut.
export const MAILTO_SAFE_LENGTH = 2000;

export function buildOrderMessage(lines, details, code = '') {
  const out = ["Hello Czera, I'd like to order:"];
  for (const line of lines) {
    const d = describeLine(line);
    out.push(`• ${d.qty} × ${d.messageLabel}: ${formatEGP(d.total)}`);
  }
  const totals = orderTotals(lines, code);
  if (totals.discount > 0) {
    out.push(`Code ${normaliseCode(code)}: −${CONFIG.firstOrder.percent}% (−${formatEGP(totals.discount)})`);
  }
  out.push(`Total: ${formatEGP(totals.total)}`);
  if (details) {
    out.push('', `Name: ${details.name.trim()}`, `Phone: ${details.phone.trim()}`,
      `Address: ${details.address.trim()}, City: ${details.city.trim()}`);
    if (details.note && details.note.trim()) out.push(`Note: ${details.note.trim()}`);
  }
  return out.join('\n');
}

// mailto:<to>?subject=…&body=… — every value through encodeURIComponent (so &, #, ? and Arabic
// survive, and spaces are %20, never "+"), and line breaks in the body sent as CRLF (RFC 6068).
export function mailtoLink({ to = CONFIG.contactEmail, subject = '', body = '' } = {}) {
  const params = [];
  if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
  if (body) params.push(`body=${encodeURIComponent(body.replace(/\r?\n/g, '\r\n'))}`);
  return `mailto:${to}${params.length ? `?${params.join('&')}` : ''}`;
}

export function orderMailto(message) {
  return mailtoLink({ subject: ORDER_SUBJECT, body: message });
}

export function bulkMailto() {
  return mailtoLink({ subject: BULK_SUBJECT, body: BULK_MESSAGE });
}

export function isLongMailto(link) {
  return link.length > MAILTO_SAFE_LENGTH;
}
