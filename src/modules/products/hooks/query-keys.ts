import type { GetProductsParams } from "../actions/get-products";
import type { GetProductsForSaleParams } from "../actions/get-products-for-sale";
import type { GetStockMovementsParams } from "../actions/get-stock-movements";

/**
 * Everything product related lives under `["products"]`, so any change to
 * stock (sales, purchases) can refresh it all with a single invalidation.
 */
export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (params: GetProductsParams) =>
    [...productKeys.lists(), params] as const,
  forSale: (params: GetProductsForSaleParams) =>
    [...productKeys.all, "for-sale", params] as const,
  detail: (id: string) => [...productKeys.all, "detail", id] as const,
  stockMovements: (id: string, params: GetStockMovementsParams) =>
    [...productKeys.detail(id), "stock-movements", params] as const,
};
