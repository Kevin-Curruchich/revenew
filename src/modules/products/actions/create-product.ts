import { revenewApi } from "@/api/revenewApi";
import type {
  Product,
  ProductEarningMode,
  ProductStatus,
} from "../domain/product";

export interface CreateProductData {
  sku: string;
  name: string;
  description: string;
  earningMode: ProductEarningMode;
  earningPercent: number;
  earningFeeAmount: number;
  stock: number;
  min_stock: number;
  status: ProductStatus;
}

export const createProduct = async (
  data: CreateProductData,
): Promise<Product> => {
  const response = await revenewApi.post<Product>("/products", data);
  return response.data;
};
