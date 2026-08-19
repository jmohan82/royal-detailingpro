export type ItemType = "service" | "product";

export interface Item {
  id: string;
  businessId: string;
  name: string;
  type: ItemType;
  defaultPrice: number;
  active: boolean;
}
