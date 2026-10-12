import { revenewApi } from "@/api/revenewApi";
import type { FollowUpRecord } from "../domain/follow-up";

/** Closes the follow-up and opens a new one due on `date` (YYYY-MM-DD, after today). */
export const postponeFollowUp = async (
  followUpId: string,
  date: string,
): Promise<FollowUpRecord> => {
  const response = await revenewApi.post<FollowUpRecord>(
    `/follow-ups/${followUpId}/postpone`,
    { date },
  );
  return response.data;
};
