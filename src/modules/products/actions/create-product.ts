import { revenewApi } from "@/api/revenewApi";
import type { Product, ProductStatus } from "../domain/product";

export interface CreateProductData {
  sku: string;
  name: string;
  description: string;
  price: number;
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
