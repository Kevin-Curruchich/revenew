export type UserRole = "admin" | "sales_rep" | "viewer";

export interface User {
  id: string;
  email: string;
  display_name: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
}
