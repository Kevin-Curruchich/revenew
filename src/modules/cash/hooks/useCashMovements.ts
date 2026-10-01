import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  getCashMovements,
  type GetCashMovementsParams,
} from "../actions/get-cash-movements";
import { cashKeys } from "./query-keys";

export const useCashMovements = (params: GetCashMovementsParams = {}) => {
  return useQuery({
    // Sales, purchases and payments move cash from other screens; always
    // refetch when the page opens instead of trusting a 30s-old copy.
    staleTime: 0,
    queryKey: cashKeys.movementList(params),
    queryFn: () => getCashMovements(params),
    placeholderData: keepPreviousData,
  });
};
