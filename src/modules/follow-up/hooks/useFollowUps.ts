import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  getFollowUps,
  type GetFollowUpsParams,
} from "../actions/get-follow-ups";

export const followUpKeys = {
  all: ["follow-ups"] as const,
  list: (params: GetFollowUpsParams) => [...followUpKeys.all, params] as const,
};

export const useFollowUps = (params: GetFollowUpsParams = {}) => {
  return useQuery({
    queryKey: followUpKeys.list(params),
    queryFn: () => getFollowUps(params),
    placeholderData: keepPreviousData,
  });
};
