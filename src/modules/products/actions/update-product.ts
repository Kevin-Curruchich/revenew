import { revenewApi } from "@/api/revenewApi";
import type { Product } from "../domain/product";
import type { ProductPayload } from "./create-product";

export const updateProduct = async (
  productId: string,
  data: ProductPayload,
): Promise<Product> => {
  const response = await revenewApi.put<Product>(
    `/products/${productId}`,
    data,
  );
  return response.data;
};
