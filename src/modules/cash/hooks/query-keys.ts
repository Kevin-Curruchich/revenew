import type { GetCashMovementsParams } from "../actions/get-cash-movements";

export const cashKeys = {
  all: ["cash"] as const,
  summary: () => [...cashKeys.all, "summary"] as const,
  movements: () => [...cashKeys.all, "movements"] as const,
  movementList: (params: GetCashMovementsParams) =>
    [...cashKeys.movements(), params] as const,
};
