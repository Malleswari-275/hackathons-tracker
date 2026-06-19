import { NavLink } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { X, Trophy, LayoutDashboard, Bell, User, ShieldCheck, GraduationCap, Zap } from "lucide-react";
import { APP_TITLE } from "@/config/appTarget";

const navItems = {
  SUPER_ADMIN: [
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/competitions", icon: Trophy, label: "Competitions" },
    { to: "/competitions/new", icon: Zap, label: "Create Competition" },
    { to: "/users/admins", icon: ShieldCheck, label: "Admin Management" },
    { to: "/users/students", icon: GraduationCap, label: "Student Management" },
    { to: "/notifications", icon: Bell, label: "Notifications" },
    { to: "/profile", icon: User, label: "Profile" },
  ],
  ADMIN: [
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/competitions", icon: Trophy, label: "Competitions" },
    { to: "/competitions/new", icon: Zap, label: "Create Competition" },
    { to: "/users/students", icon: GraduationCap, label: "Students" },
    { to: "/notifications", icon: Bell, label: "Notifications" },
    { to: "/profile", icon: User, label: "Profile" },
  ],
  STUDENT: [
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/competitions", icon: Trophy, label: "Explore" },
    { to: "/notifications", icon: Bell, label: "Notifications" },
    { to: "/profile", icon: User, label: "Profile" },
  ],
};

export function MobileDrawer({ open, onClose }) {
  const { role } = useAuth();
  const items = navItems[role] || [];

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden" onClick={onClose} />
      <div className="fixed left-0 top-0 z-50 h-screen w-64 bg-[var(--sidebar)] text-[var(--sidebar-foreground)] lg:hidden shadow-2xl">
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--primary)]">
              <Trophy className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-white">{APP_TITLE}</span>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="px-3 py-4 space-y-1">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                  isActive ? "bg-[var(--sidebar-active)] text-white" : "text-[var(--sidebar-foreground)] hover:bg-white/5"
                )
              }
            >
              <item.icon className="h-4.5 w-4.5" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </>
  );
}
