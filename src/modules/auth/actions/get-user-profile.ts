import { revenewApi } from "@/api/revenewApi";
import type { AuthMeResponse } from "../domain/types";

export const getUserProfile = async () => {
  try {
    const response = await revenewApi.get<AuthMeResponse>("/auth/me");
    const user = response.data;

    return user;
  } catch {
    return null;
  }
};
