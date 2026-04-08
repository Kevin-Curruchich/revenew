import { revenewApi } from "@/api/revenewApi";

export interface ProductLot {
  purchase_item_id: string;
  purchase_id: string;
  purchase_date: string;
  unit_cost: string;
  remaining_quantity: number;
  suggested_unit_price: string;
}

export interface ProductForSale {
  id: string;
  sku: string;
  name: string;
  stock: number;
  earning_mode: "fee" | "percent";
  earning_percent: string;
  earning_fee_amount: string;
  status: "active" | "inactive";
  first_available_lot: ProductLot;
  has_more_lots: boolean;
}

export interface GetProductsForSaleParams {
  limit?: number;
  offset?: number;
  search?: string;
}

export interface ProductsForSaleResponse {
  data: ProductForSale[];
  meta: {
    total: number;
  };
}

export const getProductsForSale = async (
  params: GetProductsForSaleParams,
): Promise<ProductsForSaleResponse> => {
  const response = await revenewApi.get<ProductsForSaleResponse>(
    "/products/for-sale",
    {
      params,
    },
  );

  return response.data;
};
