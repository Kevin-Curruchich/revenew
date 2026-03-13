import type { FollowUpItem } from "@/modules/follow-up/domain/follow-up";
import type { Sale } from "@/modules/sales/domain/sale";

export type PriorityCustomerStatus =
  | "overdue"
  | "urgent"
  | "upcoming"
  | "normal";

export interface PriorityCustomer {
  customer_id: string;
  customer: string;
  email: string | null;
  status: PriorityCustomerStatus;
  items: FollowUpItem[];
}

export interface DashboardSummary {
  totalCustomers: number;
  salesThisMonth: number;
  pendingFollowUps: number;
  upcomingPurchases7Days: number;
  recentSales: Sale[];
  priorityCustomers: PriorityCustomer[];
}
