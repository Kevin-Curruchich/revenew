import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormErrorAlertProps {
  message?: string | null;
  className?: string;
}

/** Form/page level error message (e.g. the API rejected a submit). */
export const FormErrorAlert = ({ message, className }: FormErrorAlertProps) => {
  if (!message) return null;

  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive",
        className,
      )}
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <p>{message}</p>
    </div>
  );
};
