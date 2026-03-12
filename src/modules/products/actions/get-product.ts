import { revenewApi } from "@/api/revenewApi";
import type { Product } from "../domain/product";

export const getProduct = async (productId: string): Promise<Product> => {
  const response = await revenewApi.get<Product>(`/products/${productId}`);
  return response.data;
};
