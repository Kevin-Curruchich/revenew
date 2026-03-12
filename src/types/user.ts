// User domain interface from DOMAIN_MODELS.md
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

export interface UserSignUpRequest {
  email: string;
  password: string;
  display_name?: string | null;
  role?: UserRole; // default: "viewer"
}

export interface UserUpdateRequest {
  display_name?: string | null;
  is_active?: boolean | null;
  role?: UserRole | null;
}

export interface UserUpdateRoleRequest {
  role: UserRole;
}
