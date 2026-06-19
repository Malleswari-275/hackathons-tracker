import { FileX } from "lucide-react";

export function EmptyState({ title = "No data found", description = "There's nothing here yet.", icon: Icon = FileX, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="rounded-full bg-[var(--muted)] p-4 mb-4">
        <Icon className="h-10 w-10 text-[var(--muted-foreground)]" />
      </div>
      <h3 className="text-lg font-semibold text-[var(--foreground)]">{title}</h3>
      <p className="mt-1 text-sm text-[var(--muted-foreground)] max-w-sm">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
