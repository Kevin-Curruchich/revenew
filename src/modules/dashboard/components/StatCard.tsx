import type { ReactNode } from "react";
import { Link } from "react-router";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface StatCardProps {
  label: string;
  value: ReactNode;
  /** Small line under the value. */
  detail?: ReactNode;
  /** Makes the whole card a link to the related list. */
  to?: string;
}

export const StatCard = ({ label, value, detail, to }: StatCardProps) => {
  const card = (
    <Card
      className={to ? "h-full transition-colors hover:bg-accent/40" : "h-full"}
    >
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-3xl">{value}</CardTitle>
        {detail ? (
          <CardDescription className="text-xs">{detail}</CardDescription>
        ) : null}
      </CardHeader>
    </Card>
  );

  return to ? (
    <Link
      to={to}
      className="rounded-xl outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
    >
      {card}
    </Link>
  ) : (
    card
  );
};
