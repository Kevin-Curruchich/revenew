import type { ReactNode } from "react";
import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PageHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  /** Route for the "back" arrow. Omit to hide it. */
  backTo?: string;
  /** Extra content next to the title (e.g. a status badge). */
  badge?: ReactNode;
  /** Buttons aligned to the right. */
  actions?: ReactNode;
}

export const PageHeader = ({
  title,
  description,
  backTo,
  badge,
  actions,
}: PageHeaderProps) => (
  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div className="flex items-center gap-4">
      {backTo ? (
        <Button variant="ghost" size="icon" asChild>
          <Link to={backTo} aria-label="Volver">
            <ArrowLeft />
          </Link>
        </Button>
      ) : null}
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-3xl font-bold">{title}</h1>
          {badge}
        </div>
        {description ? (
          <p className="text-muted-foreground">{description}</p>
        ) : null}
      </div>
    </div>
    {actions ? (
      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
        {actions}
      </div>
    ) : null}
  </div>
);
