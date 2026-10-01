import type {
  FollowUpItem,
  FollowUpStatus,
} from "@/modules/follow-up/domain/follow-up";
import type { Sale } from "@/modules/sales/domain/sale";

export type PriorityCustomerStatus = FollowUpStatus;

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
  /** Receivables: sales still pending payment, any date. Decimal as string. */
  pendingPaymentsTotal?: string;
  pendingPaymentsCount?: number;
  recentSales: Sale[];
  priorityCustomers: PriorityCustomer[];
}
