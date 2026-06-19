import * as React from "react";
import { cn } from "@/lib/utils";

const badgeVariants = {
  default: "bg-[var(--primary)] text-[var(--primary-foreground)]",
  secondary: "bg-[var(--secondary)] text-[var(--secondary-foreground)]",
  destructive: "bg-[var(--destructive)] text-[var(--destructive-foreground)]",
  outline: "border border-[var(--border)] text-[var(--foreground)]",
  success: "bg-[var(--success)] text-[var(--success-foreground)]",
  warning: "bg-[var(--warning)] text-[var(--warning-foreground)]",
  gold: "bg-[var(--accent)] text-[var(--accent-foreground)]",
};

function Badge({ className, variant = "default", ...props }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
        badgeVariants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
