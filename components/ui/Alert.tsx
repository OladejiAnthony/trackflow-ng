import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle, Info, X, XCircle } from "lucide-react";

type AlertVariant = "error" | "success" | "warning" | "info";

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  className?: string;
  onDismiss?: () => void;
}

const config: Record<AlertVariant, { icon: React.ElementType; classes: string }> = {
  error: {
    icon: XCircle,
    classes: "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300",
  },
  success: {
    icon: CheckCircle,
    classes: "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300",
  },
  warning: {
    icon: AlertCircle,
    classes: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300",
  },
  info: {
    icon: Info,
    classes: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300",
  },
};

export function Alert({ variant = "info", title, children, className, onDismiss }: AlertProps) {
  const { icon: Icon, classes } = config[variant];

  return (
    <div className={cn("flex gap-3 px-4 py-3 rounded-xl border text-sm", classes, className)}>
      <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        {title && <p className="font-semibold mb-0.5">{title}</p>}
        <p className="leading-relaxed">{children}</p>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="flex-shrink-0 opacity-50 hover:opacity-100 transition-opacity -mt-0.5 -mr-1"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
