import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { getErrorMessage } from "@/lib/errors";

export const LoadingState = ({ label }: { label?: string }) => (
  <div className="py-12">
    <LoadingSpinner label={label} />
  </div>
);

interface ErrorStateProps {
  error: unknown;
  title?: string;
  onRetry?: () => void;
}

export const ErrorState = ({
  error,
  title = "No se pudo cargar la información",
  onRetry,
}: ErrorStateProps) => (
  <div role="alert" className="space-y-3 py-12 text-center">
    <p className="font-medium">{title}</p>
    <p className="text-sm text-muted-foreground">{getErrorMessage(error)}</p>
    {onRetry ? (
      <Button variant="outline" size="sm" onClick={onRetry}>
        Reintentar
      </Button>
    ) : null}
  </div>
);

interface EmptyStateProps {
  title: string;
  description?: ReactNode;
}

export const EmptyState = ({ title, description }: EmptyStateProps) => (
  <div className="space-y-2 py-12 text-center">
    <p className="font-medium">{title}</p>
    {description ? (
      <p className="text-sm text-muted-foreground">{description}</p>
    ) : null}
  </div>
);
