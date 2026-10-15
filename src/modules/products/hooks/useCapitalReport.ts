import { useQuery } from "@tanstack/react-query";
import { getCapitalReport } from "../actions/get-capital-report";
import { productKeys } from "./query-keys";

export const useCapitalReport = () => {
  return useQuery({
    // Payments change receivables without touching products; always refetch.
    staleTime: 0,
    queryKey: productKeys.capital(),
    queryFn: getCapitalReport,
  });
};
