export type UserRole = "admin" | "sales_rep" | "viewer";

export interface User {
  id: string;
  email: string;
  display_name: string | null;
  role: UserRole;
  is_active: boolean;
  /** Optional until the backend that sends it is deployed. */
  business_name?: string;
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
}
