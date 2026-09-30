import type { GetCustomersParams } from "../actions/get-customers";

export const customerKeys = {
  all: ["customers"] as const,
  lists: () => [...customerKeys.all, "list"] as const,
  list: (params: GetCustomersParams) =>
    [...customerKeys.lists(), params] as const,
  detail: (id: string) => [...customerKeys.all, "detail", id] as const,
};
