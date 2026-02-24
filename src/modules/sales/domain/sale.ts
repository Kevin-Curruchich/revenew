import type { Product } from "../../products/domain/product";

export interface SaleItem {
  productId: number;
  product?: Product;
  quantity: number;
  unitPrice: number; // The price of the product AT THE TIME OF SALE
  subtotal: number;
}

export interface Sale {
  id: number;
  customer: string;
  date: string;
  total: string;
  items: SaleItem[];
  nextPurchase: string;
}
