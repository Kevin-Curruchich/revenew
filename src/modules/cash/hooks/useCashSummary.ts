import { useQuery } from "@tanstack/react-query";
import { getCashSummary } from "../actions/get-cash-summary";
import { cashKeys } from "./query-keys";

export const useCashSummary = () => {
  return useQuery({
    // Sales, purchases and payments move cash from other screens; always
    // refetch when the page opens instead of trusting a 30s-old copy.
    staleTime: 0,
    queryKey: cashKeys.summary(),
    queryFn: getCashSummary,
  });
};
