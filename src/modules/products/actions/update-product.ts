import { revenewApi } from "@/api/revenewApi";
import type { Product } from "../domain/product";
import type { CreateProductData } from "./create-product";

export type UpdateProductData = CreateProductData;

export const updateProduct = async (
  productId: string,
  data: UpdateProductData,
): Promise<Product> => {
  const response = await revenewApi.put<Product>(
    `/products/${productId}`,
    data,
  );
  return response.data;
};
