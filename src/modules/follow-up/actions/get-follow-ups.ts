import { revenewApi } from "@/api/revenewApi";
import type { FollowUp } from "../domain/follow-up";

export type FollowUpFilter =
  | "all"
  | "overdue"
  | "7_days"
  | "14_days"
  | "30_days";

export interface GetFollowUpsParams {
  filter?: FollowUpFilter;
  offset?: number;
  limit?: number;
}

export interface FollowUpsResponse {
  data: FollowUp[];
  meta: {
    total: number;
  };
}

export const getFollowUps = async (
  params: GetFollowUpsParams,
): Promise<FollowUpsResponse> => {
  const response = await revenewApi.get<FollowUpsResponse>("/follow-ups", {
    params,
  });
  return response.data;
};
