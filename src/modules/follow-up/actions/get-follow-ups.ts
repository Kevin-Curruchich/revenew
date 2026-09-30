import { revenewApi } from "@/api/revenewApi";
import type { PaginatedResponse, PaginationParams } from "@/lib/api-types";
import type { FollowUp } from "../domain/follow-up";

export const FOLLOW_UP_FILTERS = [
  "all",
  "overdue",
  "7_days",
  "14_days",
  "30_days",
] as const;

export type FollowUpFilter = (typeof FOLLOW_UP_FILTERS)[number];

export const isFollowUpFilter = (value: string): value is FollowUpFilter =>
  (FOLLOW_UP_FILTERS as readonly string[]).includes(value);

export interface GetFollowUpsParams extends PaginationParams {
  filter?: FollowUpFilter;
}

export type FollowUpsResponse = PaginatedResponse<FollowUp>;

export const getFollowUps = async (
  params: GetFollowUpsParams = {},
): Promise<FollowUpsResponse> => {
  const response = await revenewApi.get<FollowUpsResponse>("/follow-ups", {
    params: {
      filter: params.filter ?? "all",
      offset: params.offset ?? 0,
      limit: params.limit ?? 10,
    },
  });
  return response.data;
};
