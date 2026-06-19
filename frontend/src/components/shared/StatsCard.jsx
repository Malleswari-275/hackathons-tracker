import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function StatsCard({ title, value, icon: Icon, description, className, trend }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={cn("overflow-hidden", className)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-[var(--muted-foreground)]">{title}</p>
              <p className="text-3xl font-bold tracking-tight">{value}</p>
              {description && (
                <p className="text-xs text-[var(--muted-foreground)]">{description}</p>
              )}
            </div>
            {Icon && (
              <div className="rounded-xl bg-[var(--primary)]/10 p-3">
                <Icon className="h-6 w-6 text-[var(--primary)]" />
              </div>
            )}
          </div>
          {trend !== undefined && (
            <div className="mt-3 flex items-center gap-1 text-xs">
              <span className={trend >= 0 ? "text-[var(--success)]" : "text-[var(--destructive)]"}>
                {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}%
              </span>
              <span className="text-[var(--muted-foreground)]">from last period</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
