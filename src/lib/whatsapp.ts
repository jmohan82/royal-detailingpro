/**
 * Normalizes a stored mobile number (validated elsewhere as 7-15 digits, no country code) into
 * the international format wa.me needs. Assumes India (+91) for a bare 10-digit number, matching
 * how phone numbers are entered everywhere else in this app.
 */
export function normalizeMobileForWhatsApp(mobile: string): string {
  const digits = mobile.replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  return digits;
}

export function buildWhatsAppLink(mobile: string, message: string): string {
  const number = normalizeMobileForWhatsApp(mobile);
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function buildThankYouMessage(params: {
  customerName: string;
  businessName: string;
  itemNames: string[];
}): string {
  const { customerName, businessName, itemNames } = params;
  const serviceList = itemNames.join(", ") || "service";
  return `Hi ${customerName}, thank you for choosing ${businessName}! Your ${serviceList} is complete — we hope you're happy with the results. See you again soon!`;
}

export function buildReminderMessage(params: {
  customerName: string;
  businessName: string;
  itemName: string;
  businessPhone?: string;
}): string {
  const { customerName, businessName, itemName, businessPhone } = params;
  const callToAction = businessPhone
    ? ` Call us at ${businessPhone} or reply here to book.`
    : " Reply here to book your slot.";
  return `Hi ${customerName}, it's time for your ${itemName} at ${businessName}!${callToAction}`;
}
