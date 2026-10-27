import { revenewApi } from "@/api/revenewApi";
import type { User } from "@/modules/auth";
import type { UpdateMemberRequest } from "../domain/team";

export const updateMember = async (
  id: string,
  data: UpdateMemberRequest,
): Promise<User> => {
  const response = await revenewApi.put<User>(`/auth/users/${id}`, data);
  return response.data;
};
