import { revenewApi } from "@/api/revenewApi";
import type { PasswordSetupLink } from "../domain/team";

/** A fresh link for a member whose previous one expired. */
export const createPasswordLink = async (
  id: string,
): Promise<PasswordSetupLink> => {
  const response = await revenewApi.post<PasswordSetupLink>(
    `/auth/users/${id}/password-link`,
  );
  return response.data;
};
