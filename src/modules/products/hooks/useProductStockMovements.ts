import { useQuery } from "@tanstack/react-query";
import {
  getStockMovements,
  type GetStockMovementsParams,
  type StockMovementsResponse,
} from "../actions/get-stock-movements";

export const useProductStockMovements = (
  productId?: string,
  params: GetStockMovementsParams = {},
) => {
  return useQuery<StockMovementsResponse>({
    queryKey: [
      "product-stock-movements",
      productId,
      params.offset ?? 0,
      params.limit ?? 20,
    ],
    queryFn: () => getStockMovements(productId!, params),
    enabled: !!productId,
    staleTime: 60 * 1000,
  });
};
