export type CustomerStatus = "active" | "inactive";

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  lastPurchase: string;
  status: CustomerStatus;
}
