import { revenewApi } from "@/api/revenewApi";
import type { Product } from "../domain/product";

export interface GetProductsParams {
  limit?: number;
  offset?: number;
  search?: string;
}

export interface ProductsResponse {
  data: Product[];
  meta: {
    total: number;
  };
}

export const getProducts = async (
  params: GetProductsParams,
): Promise<ProductsResponse> => {
  const response = await revenewApi.get<ProductsResponse>("/products", {
    params,
  });
  return response.data;
};
