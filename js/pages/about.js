import { initShell } from '../ui/shell.js';
import { CONFIG } from '../config.js';
import { orderLink } from '../lib/whatsapp.js';
import { socialLinksHtml } from '../ui/social.js';

initShell();
document.querySelector('[data-care]').textContent = `Care: ${CONFIG.careText}.`;
const wa = document.querySelector('[data-wa-display]');
wa.textContent = CONFIG.whatsappDisplay;
wa.href = `https://wa.me/${CONFIG.whatsappNumber}`;
// Social media as icons, the same row as the footer (#80).
document.querySelector('[data-social]').innerHTML = socialLinksHtml(CONFIG.social);
document.querySelector('[data-delivery]').textContent = `${CONFIG.deliveryText}. ${CONFIG.paymentText}.`;
document.querySelector('[data-bulk-link]').href = orderLink("Hello Czera, I'd like to ask about a bulk or corporate order.");
