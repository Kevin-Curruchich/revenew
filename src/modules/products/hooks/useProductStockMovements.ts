import { useQuery } from "@tanstack/react-query";
import {
  getStockMovements,
  type GetStockMovementsParams,
} from "../actions/get-stock-movements";
import { productKeys } from "./query-keys";

export const useProductStockMovements = (
  productId: string | undefined,
  params: GetStockMovementsParams = {},
) => {
  return useQuery({
    queryKey: productKeys.stockMovements(productId ?? "", params),
    queryFn: () => getStockMovements(productId!, params),
    enabled: !!productId,
  });
};
