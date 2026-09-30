import type { VariantProps } from "class-variance-authority";
import { Badge, type badgeVariants } from "@/components/ui/badge";

export type BadgeVariant = NonNullable<
  VariantProps<typeof badgeVariants>["variant"]
>;

/** Label + visual variant for a domain status (payment, stock, etc.). */
export interface StatusBadgeInfo {
  label: string;
  variant: BadgeVariant;
}

export const StatusBadge = ({ status }: { status: StatusBadgeInfo }) => (
  <Badge variant={status.variant}>{status.label}</Badge>
);
