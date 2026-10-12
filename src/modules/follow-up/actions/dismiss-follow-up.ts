import { revenewApi } from "@/api/revenewApi";

/** Closes the follow-up until the next sale of that product. */
export const dismissFollowUp = async (followUpId: string): Promise<void> => {
  await revenewApi.post(`/follow-ups/${followUpId}/dismiss`);
};
