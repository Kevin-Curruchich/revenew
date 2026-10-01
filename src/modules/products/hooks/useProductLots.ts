import { useQuery } from "@tanstack/react-query";
import { getProductLots } from "../actions/get-product-lots";
import { productKeys } from "./query-keys";

export const useProductLots = (productId: string | undefined) => {
  return useQuery({
    queryKey: productKeys.lots(productId ?? ""),
    queryFn: () => getProductLots(productId!),
    enabled: !!productId,
  });
};
