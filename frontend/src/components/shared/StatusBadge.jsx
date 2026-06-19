import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const statusConfig = {
  PENDING: { variant: "warning", label: "Pending" },
  PUBLISHED: { variant: "success", label: "Published" },
  REJECTED: { variant: "destructive", label: "Rejected" },
  LIVE: { variant: "default", label: "Live" },
  CLOSED: { variant: "outline", label: "Closed" },
  ACTIVE: { variant: "success", label: "Active" },
  BLOCKED: { variant: "destructive", label: "Blocked" },
  INVITED: { variant: "secondary", label: "Invited" },
  REGISTERED: { variant: "success", label: "Registered" },
  NOT_REGISTERED: { variant: "outline", label: "Not Registered" },
  UPCOMING: { variant: "default", label: "Upcoming" },
  COMPLETED: { variant: "outline", label: "Completed" },
};

export function StatusBadge({ status, className }) {
  const config = statusConfig[status] || { variant: "outline", label: status };
  return (
    <Badge variant={config.variant} className={cn(className)}>
      {config.label}
    </Badge>
  );
}
