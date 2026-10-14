import { initShell } from '../ui/shell.js';
import { CONFIG } from '../config.js';
import { orderLink } from '../lib/whatsapp.js';

initShell();
document.querySelector('[data-care]').textContent = `Care: ${CONFIG.careText}.`;
document.querySelector('[data-wa-display]').textContent = CONFIG.whatsappDisplay;
const ig = document.querySelector('[data-ig]');
ig.href = `https://www.instagram.com/${CONFIG.instagram}`;
ig.textContent = `@${CONFIG.instagram}`;
document.querySelector('[data-delivery]').textContent = `${CONFIG.deliveryText}. ${CONFIG.paymentText}.`;
document.querySelector('[data-bulk-link]').href = orderLink("Hello Czera, I'd like to ask about a bulk or corporate order.");
