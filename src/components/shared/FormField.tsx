import type { PropsWithChildren, ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FieldErrorProps {
  message?: string;
}

export const FieldError = ({ message }: FieldErrorProps) => {
  if (!message) return null;
  return (
    <p role="alert" className="text-sm text-destructive">
      {message}
    </p>
  );
};

interface FormFieldProps extends PropsWithChildren {
  label: ReactNode;
  htmlFor?: string;
  error?: string;
  hint?: ReactNode;
  className?: string;
}

/** Label + control + validation message, the building block of every form. */
export const FormField = ({
  label,
  htmlFor,
  error,
  hint,
  className,
  children,
}: FormFieldProps) => (
  <div className={cn("space-y-2", className)}>
    <Label htmlFor={htmlFor}>{label}</Label>
    {children}
    {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    <FieldError message={error} />
  </div>
);
