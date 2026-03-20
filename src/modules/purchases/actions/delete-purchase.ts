import { revenewApi } from "@/api/revenewApi";

export const deletePurchase = async (purchaseId: string): Promise<void> => {
  await revenewApi.delete(`/purchases/${purchaseId}`);
};
