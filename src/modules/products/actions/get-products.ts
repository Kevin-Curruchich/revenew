import { revenewApi } from "@/api/revenewApi";
import type { PaginatedResponse, PaginationParams } from "@/lib/api-types";
import type { Product } from "../domain/product";

export interface GetProductsParams extends PaginationParams {
  search?: string;
}

export type ProductsResponse = PaginatedResponse<Product>;

export const getProducts = async (
  params: GetProductsParams = {},
): Promise<ProductsResponse> => {
  const response = await revenewApi.get<ProductsResponse>("/products", {
    params: {
      offset: params.offset ?? 0,
      limit: params.limit ?? 10,
      search: params.search || undefined,
    },
  });
  return response.data;
};
