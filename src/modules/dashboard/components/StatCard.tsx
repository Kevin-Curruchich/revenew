import type { ReactNode } from "react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const StatCard = ({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) => (
  <Card>
    <CardHeader>
      <CardDescription>{label}</CardDescription>
      <CardTitle className="text-3xl">{value}</CardTitle>
    </CardHeader>
  </Card>
);
