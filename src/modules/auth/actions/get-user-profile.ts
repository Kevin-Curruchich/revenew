import { revenewApi } from "@/api/revenewApi";
import type { User } from "../domain/user";

export const getUserProfile = async (): Promise<User> => {
  const response = await revenewApi.get<User>("/auth/me");
  return response.data;
};
