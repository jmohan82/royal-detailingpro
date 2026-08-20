export type ItemType = "service" | "product";

export interface Item {
  id: string;
  businessId: string;
  name: string;
  type: ItemType;
  defaultPrice: number;
  active: boolean;
  /** Days after purchase to remind the customer to come back (e.g. 30 for a wash, 180 for
   * coating). 0 means this item never generates a reminder. */
  reminderIntervalDays: number;
}
