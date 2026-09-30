import type { StatusBadgeInfo } from "@/components/shared/StatusBadge";
import type { FollowUpItem, FollowUpStatus } from "../domain/follow-up";

const followUpStatusBadges: Record<FollowUpStatus, StatusBadgeInfo> = {
  overdue: { variant: "destructive", label: "Atrasado" },
  urgent: { variant: "default", label: "Urgente" },
  upcoming: { variant: "secondary", label: "Próximo" },
  normal: { variant: "outline", label: "Normal" },
};

export const getFollowUpStatusBadge = (
  status: FollowUpStatus,
): StatusBadgeInfo =>
  followUpStatusBadges[status] ?? followUpStatusBadges.normal;

/** "Hoy", "en 5 días", "3 días atrasado" or "N/A" when unknown. */
export const formatDaysUntil = (daysUntil: FollowUpItem["days_until"]) => {
  if (daysUntil === null) return "N/A";
  if (daysUntil === 0) return "Hoy";
  const days = Math.abs(daysUntil);
  const label = `${days} día${days === 1 ? "" : "s"}`;
  return daysUntil < 0 ? `${label} atrasado` : label;
};
