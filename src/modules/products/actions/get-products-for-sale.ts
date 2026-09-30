import { revenewApi } from "@/api/revenewApi";
import type { PaginationParams } from "@/lib/api-types";
import type { ProductForSale } from "../domain/product";

export interface GetProductsForSaleParams extends PaginationParams {
  search?: string;
}

export const getProductsForSale = async (
  params: GetProductsForSaleParams = {},
): Promise<ProductForSale[]> => {
  const response = await revenewApi.get<ProductForSale[]>(
    "/products/for-sale",
    {
      params: {
        offset: params.offset ?? 0,
        limit: params.limit ?? 50,
        search: params.search || undefined,
      },
    },
  );

  return response.data;
};
