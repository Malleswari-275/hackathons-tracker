import { NavLink } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Trophy, Users, UserPlus, Bell, User, ClipboardList,
  BarChart3, ShieldCheck, GraduationCap, Zap
} from "lucide-react";

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
    { to: "/competitions", icon: Trophy, label: "Explore Competitions" },
    { to: "/notifications", icon: Bell, label: "Notifications" },
    { to: "/profile", icon: User, label: "Profile" },
  ],
};

export function Sidebar() {
  const { role } = useAuth();
  const items = navItems[role] || [];

  return (
    <aside className="fixed left-0 top-0 z-40 hidden lg:flex h-screen w-64 flex-col bg-[var(--sidebar)] text-[var(--sidebar-foreground)]">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 border-b border-white/10 px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--primary)]">
          <Trophy className="h-4 w-4 text-white" />
        </div>
        <span className="text-lg font-bold text-white tracking-tight">HackPortal</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-[var(--sidebar-active)] text-white shadow-md"
                  : "text-[var(--sidebar-foreground)] hover:bg-white/5 hover:text-white"
              )
            }
          >
            <item.icon className="h-4.5 w-4.5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/10 px-3 py-4">
        <div className="rounded-lg bg-white/5 p-3 text-center">
          <p className="text-xs text-white/60">Logged in as</p>
          <p className="text-sm font-semibold text-white mt-0.5">{role?.replace(/_/g, " ")}</p>
        </div>
      </div>
    </aside>
  );
}
