import type { ProductLot } from "./product";

export interface ProductLots {
  product_id: string;
  product_sku: string;
  product_name: string;
  total_stock: string;
  lots: ProductLot[];
}

/** Units and cost still sitting in the given lots. */
export const summarizeLots = (lots: ProductLot[]) =>
  lots.reduce(
    (acc, lot) => {
      const quantity = Number(lot.remaining_quantity);
      return {
        units: acc.units + quantity,
        cost: acc.cost + quantity * Number(lot.unit_cost),
      };
    },
    { units: 0, cost: 0 },
  );
