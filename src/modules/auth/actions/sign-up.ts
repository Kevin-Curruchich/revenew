import { revenewApi } from "@/api/revenewApi";
import type { User } from "../domain/user";

/** Registers a business and its first user (the admin). */
export interface UserSignUpRequest {
  business_name: string;
  email: string;
  password: string;
  display_name?: string | null;
  /** IANA zone; the backend defaults to America/Guatemala. */
  timezone?: string;
}

export const signUp = async (data: UserSignUpRequest): Promise<User> => {
  const response = await revenewApi.post<User>("/auth/signup", data);
  return response.data;
};
