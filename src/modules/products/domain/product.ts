export type ProductStatus = "active" | "inactive";

export interface Product {
  id: number;
  sku: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  status: ProductStatus;
}
