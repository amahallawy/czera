import { initShell } from '../ui/shell.js';
import { CONFIG } from '../config.js';
import { orderLink } from '../lib/whatsapp.js';

initShell();
document.querySelector('[data-care]').textContent = `Care: ${CONFIG.careText}.`;
const wa = document.querySelector('[data-wa-display]');
wa.textContent = CONFIG.whatsappDisplay;
wa.href = `https://wa.me/${CONFIG.whatsappNumber}`;
const social = document.querySelector('[data-social]');
for (const s of CONFIG.social) {
  const li = document.createElement('li');
  const a = document.createElement('a');
  a.href = s.url;
  a.target = '_blank';
  a.rel = 'noopener';
  a.textContent = `${s.label} ${s.handle}`;
  li.append(a);
  social.append(li);
}
document.querySelector('[data-delivery]').textContent = `${CONFIG.deliveryText}. ${CONFIG.paymentText}.`;
document.querySelector('[data-bulk-link]').href = orderLink("Hello Czera, I'd like to ask about a bulk or corporate order.");
