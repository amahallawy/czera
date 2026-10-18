import { initShell } from '../ui/shell.js';
import { CONFIG } from '../config.js';
import { mailtoLink, bulkMailto } from '../lib/email.js';
import { socialLinksHtml } from '../ui/social.js';

initShell();
document.querySelector('[data-care]').textContent = `Care: ${CONFIG.careText}.`;
const email = document.querySelector('[data-email-link]');
email.textContent = CONFIG.contactEmail;
email.href = mailtoLink();
// Social media as icons, the same row as the footer (#80).
document.querySelector('[data-social]').innerHTML = socialLinksHtml(CONFIG.social);
document.querySelector('[data-delivery]').textContent = `${CONFIG.deliveryText}. ${CONFIG.paymentText}.`;
document.querySelector('[data-bulk-link]').href = bulkMailto();
