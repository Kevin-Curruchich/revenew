import { revenewApi } from "@/api/revenewApi";
import type { User } from "@/modules/auth";

export const getMembers = async (): Promise<User[]> => {
  const response = await revenewApi.get<User[]>("/auth/users");
  return response.data;
};
