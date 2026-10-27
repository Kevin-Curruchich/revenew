import { revenewApi } from "@/api/revenewApi";
import type { CreatedMember, CreateMemberRequest } from "../domain/team";

export const createMember = async (
  data: CreateMemberRequest,
): Promise<CreatedMember> => {
  const response = await revenewApi.post<CreatedMember>("/auth/users", data);
  return response.data;
};
