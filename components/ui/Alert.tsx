import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle, Info, XCircle } from "lucide-react";

type AlertVariant = "error" | "success" | "warning" | "info";

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  className?: string;
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

export function Alert({ variant = "info", title, children, className }: AlertProps) {
  const { icon: Icon, classes } = config[variant];

  return (
    <div className={cn("flex gap-3 px-4 py-3 rounded-xl border text-sm", classes, className)}>
      <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" />
      <div>
        {title && <p className="font-semibold mb-0.5">{title}</p>}
        <p className="leading-relaxed">{children}</p>
      </div>
    </div>
  );
}
