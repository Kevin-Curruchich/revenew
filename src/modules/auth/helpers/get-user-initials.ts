import type { User } from "../domain/user";

/** "Kevin CX" -> "KC"; falls back to the email's first letter. */
export const getUserInitials = (user: Pick<User, "display_name" | "email">) => {
  const source = user.display_name?.trim() || user.email;
  const words = source.split(/\s+/).filter(Boolean);
  const initials =
    words.length > 1 ? words[0][0] + words[1][0] : (words[0]?.[0] ?? "?");
  return initials.toUpperCase();
};
