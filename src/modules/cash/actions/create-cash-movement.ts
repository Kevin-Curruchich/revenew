import { revenewApi } from "@/api/revenewApi";
import type { CashMovementType } from "../domain/cash";

export interface CashMovementPayload {
  type: CashMovementType;
  amount: string;
  /** `YYYY-MM-DD`, a business day. */
  date: string;
  payment_method: "efectivo" | "transferencia" | null;
  note: string | null;
}

/** A movement that is not a sale or a purchase (those record their own). */
export const createCashMovement = async (payload: CashMovementPayload) => {
  await revenewApi.post("/cash/movements", payload);
};
