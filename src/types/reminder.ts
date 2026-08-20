/** A log entry recording that a service reminder was sent to a customer via WhatsApp. Used to
 * work out when the next reminder for that customer + item is due. */
export interface ReminderSend {
  id: string;
  businessId: string;
  customerMobile: string;
  customerName: string;
  itemId: string;
  itemName: string;
  sentAt: number;
  sentBy: string;
}
