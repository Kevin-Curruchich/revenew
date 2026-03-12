import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  label?: string;
}

export const LoadingSpinner = ({
  className,
  size = "md",
  label = "Cargando...",
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-3",
    lg: "h-12 w-12 border-4",
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={cn(
          "animate-spin rounded-full border-gray-300 border-t-primary",
          sizeClasses[size],
          className,
        )}
      />
      {label && (
        <p className="text-sm text-muted-foreground font-medium">{label}</p>
      )}
    </div>
  );
};

export const FullPageLoader = ({ label }: { label?: string }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <LoadingSpinner size="lg" label={label} />
    </div>
  );
};
