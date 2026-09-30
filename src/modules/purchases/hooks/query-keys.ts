import type { GetPurchasesParams } from "../actions/get-purchases";

export const purchaseKeys = {
  all: ["purchases"] as const,
  lists: () => [...purchaseKeys.all, "list"] as const,
  list: (params: GetPurchasesParams) =>
    [...purchaseKeys.lists(), params] as const,
  detail: (id: string) => [...purchaseKeys.all, "detail", id] as const,
};
