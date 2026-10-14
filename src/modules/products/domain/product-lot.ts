import type { ProductLot } from "./product";

/** A confirmed lot with nothing left; `quantity` is what was bought. */
export interface SoldOutLot {
  purchase_item_id: string;
  purchase_id: string;
  purchase_date: string;
  quantity: string;
  unit_cost: string;
}

export interface ProductLots {
  product_id: string;
  product_sku: string;
  product_name: string;
  total_stock: string;
  lots: ProductLot[];
  /** Newest first, at most 20. Missing on APIs older than this field. */
  sold_out_lots?: SoldOutLot[];
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
