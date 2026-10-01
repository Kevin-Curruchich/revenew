import { revenewApi } from "@/api/revenewApi";
import type { ProductLots } from "../domain/product-lot";

/** Lots with units left, oldest first (the order sales consume them). */
export const getProductLots = async (
  productId: string,
): Promise<ProductLots> => {
  const response = await revenewApi.get<ProductLots>(
    `/products/${productId}/lots-availability`,
  );
  return response.data;
};
