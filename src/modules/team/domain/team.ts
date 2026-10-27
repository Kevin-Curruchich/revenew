import type { User, UserRole } from "@/modules/auth";

export const roleLabels: Record<UserRole, string> = {
  admin: "Administrador",
  sales_rep: "Vendedor",
  viewer: "Solo lectura",
};

/** Roles an admin can give when adding someone (admins are only promoted). */
export type NewMemberRole = Exclude<UserRole, "admin">;

export interface CreateMemberRequest {
  email: string;
  display_name?: string | null;
  role: NewMemberRole;
}

/**
 * Firebase link where the member sets their password. It is a credential:
 * keep it in component state only, never log or persist it.
 */
export interface PasswordSetupLink {
  password_setup_link: string;
}

export type CreatedMember = User & PasswordSetupLink;

/** Send only the fields that change: the backend writes every key, nulls too. */
export interface UpdateMemberRequest {
  display_name?: string;
  is_active?: boolean;
  role?: UserRole;
}
