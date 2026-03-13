import type { FollowUpStatus } from "../domain/follow-up";

const followUpStatusBadgeMap = {
  overdue: { variant: "destructive" as const, label: "Atrasado" },
  urgent: { variant: "default" as const, label: "Urgente" },
  upcoming: { variant: "secondary" as const, label: "Próximo" },
  normal: { variant: "outline" as const, label: "Normal" },
};

export const getFollowUpStatusBadge = (status: FollowUpStatus) => {
  return followUpStatusBadgeMap[status] ?? followUpStatusBadgeMap.normal;
};
