import { revenewApi } from "@/api/revenewApi";

export interface UpdateSalePaymentStatusData {
  isPaymentPending: boolean;
}

export const updateSalePaymentStatus = async (
  saleId: string,
  data: UpdateSalePaymentStatusData,
) => {
  const response = await revenewApi.patch(
    `/sales/${saleId}/payment-status`,
    data,
  );

  return response.data;
};
