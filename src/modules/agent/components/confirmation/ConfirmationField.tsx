import type { ReactNode } from "react";

/** Label/value pair used in the summaries of every confirmation card. */
export const ConfirmationField = ({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) => (
  <div>
    <dt className="text-xs text-muted-foreground">{label}</dt>
    <dd className="font-medium">{children}</dd>
  </div>
);
