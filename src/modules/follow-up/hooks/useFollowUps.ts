import { useQuery } from "@tanstack/react-query";
import {
  getFollowUps,
  type GetFollowUpsParams,
  type FollowUpsResponse,
} from "../actions/get-follow-ups";

export const useFollowUps = (params: GetFollowUpsParams = {}) => {
  return useQuery<FollowUpsResponse>({
    queryKey: [
      "follow-ups",
      params.filter ?? "all",
      params.offset ?? 0,
      params.limit ?? 10,
    ],
    queryFn: () => getFollowUps(params),
  });
};
