export type FollowUpStatus = "overdue" | "urgent" | "upcoming" | "normal";

export interface FollowUp {
  id: number;
  customer: string;
  email: string;
  lastPurchase: string;
  nextPurchase: string;
  daysUntil: number;
  status: FollowUpStatus;
}
