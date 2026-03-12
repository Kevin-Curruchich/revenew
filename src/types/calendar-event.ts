// CalendarEvent domain interface from DOMAIN_MODELS.md
export type CalendarEventType = "overdue" | "upcoming";

export interface CalendarEvent {
  date: string; // YYYY-MM-DD
  customerId: number;
  customer: string;
  productId: number;
  productName: string;
  type: CalendarEventType;
}
