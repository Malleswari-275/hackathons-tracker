import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

const routeLabels = {
  dashboard: "Dashboard",
  competitions: "Competitions",
  new: "Create",
  edit: "Edit",
  review: "Review",
  users: "Users",
  admins: "Admin Management",
  students: "Student Management",
  assignments: "Assignments",
  registrations: "Registrations",
  notifications: "Notifications",
  profile: "Profile",
};

export function Breadcrumbs() {
  const location = useLocation();
  const paths = location.pathname.split("/").filter(Boolean);

  if (paths.length <= 1) return null;

  return (
    <nav className="flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] mb-4">
      <Link to="/dashboard" className="hover:text-[var(--foreground)] transition-colors">
        <Home className="h-3.5 w-3.5" />
      </Link>
      {paths.map((segment, i) => {
        const path = `/${paths.slice(0, i + 1).join("/")}`;
        const isLast = i === paths.length - 1;
        const label = routeLabels[segment] || decodeURIComponent(segment);

        return (
          <span key={path} className="flex items-center gap-1.5">
            <ChevronRight className="h-3 w-3" />
            {isLast ? (
              <span className="font-medium text-[var(--foreground)]">{label}</span>
            ) : (
              <Link to={path} className="hover:text-[var(--foreground)] transition-colors">{label}</Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
