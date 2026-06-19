import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getDashboardAnalytics } from "@/api/dashboard.api";
import { StatsCard } from "@/components/shared/StatsCard";
import { PieChartWidget } from "@/components/shared/PieChart";
import { DashboardSkeleton } from "@/components/shared/LoadingSkeleton";
import { Trophy, Users, GraduationCap, TrendingUp, Clock, CheckCircle, XCircle, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function DashboardPage() {
  const { role, user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getDashboardAnalytics()
      .then((res) => setMetrics(res.data?.data || res.data))
      .catch(() => toast.error("Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardSkeleton />;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-[var(--muted-foreground)] mt-1">
          Welcome back{user?.email ? `, ${user.email.split("@")[0]}` : ""}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {role === "SUPER_ADMIN" && (
          <>
            <StatsCard title="Total Competitions" value={metrics?.totalCompetitions ?? 0} icon={Trophy} />
            <StatsCard title="Total Students" value={metrics?.totalStudents ?? 0} icon={GraduationCap} />
            <StatsCard title="Total Admins" value={metrics?.totalAdmins ?? 0} icon={Users} />
            <StatsCard title="Active Events" value={metrics?.activeEvents ?? metrics?.liveCompetitions ?? 0} icon={TrendingUp} />
          </>
        )}
        {role === "ADMIN" && (
          <>
            <StatsCard title="Assigned Competitions" value={metrics?.assignedCompetitions ?? 0} icon={Trophy} />
            <StatsCard title="My Students" value={metrics?.totalStudents ?? 0} icon={GraduationCap} />
            <StatsCard title="Pending Approvals" value={metrics?.pendingApprovals ?? 0} icon={Clock} />
            <StatsCard title="Registrations" value={metrics?.totalRegistrations ?? 0} icon={BarChart3} />
          </>
        )}
        {role === "STUDENT" && (
          <>
            <StatsCard title="Eligible Events" value={metrics?.eligibleEvents ?? 0} icon={Trophy} />
            <StatsCard title="Registered" value={metrics?.registeredEvents ?? 0} icon={CheckCircle} />
            <StatsCard title="Upcoming Deadlines" value={metrics?.upcomingDeadlines ?? 0} icon={Clock} />
            <StatsCard title="Completed" value={metrics?.completedEvents ?? 0} icon={TrendingUp} />
          </>
        )}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {metrics?.statusDistribution && (
          <PieChartWidget
            title="Competition Status Distribution"
            data={Object.entries(metrics.statusDistribution).map(([name, value]) => ({ name, value }))}
          />
        )}
        {metrics?.eventTypeDistribution && (
          <PieChartWidget
            title="Event Type Distribution"
            data={Object.entries(metrics.eventTypeDistribution).map(([name, value]) => ({ name: name.replace(/_/g, " "), value }))}
          />
        )}
      </div>

      {/* Recent Activity */}
      {metrics?.recentCompetitions && metrics.recentCompetitions.length > 0 && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
          <h3 className="text-sm font-semibold mb-4">Recent Competitions</h3>
          <div className="space-y-3">
            {metrics.recentCompetitions.slice(0, 5).map((comp) => (
              <div key={comp._id} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
                <div>
                  <p className="text-sm font-medium">{comp.title}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">{comp.organization}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  comp.status === "LIVE" ? "bg-[var(--success)]/10 text-[var(--success)]" :
                  comp.status === "PENDING" ? "bg-[var(--warning)]/10 text-[var(--warning)]" :
                  "bg-[var(--muted)] text-[var(--muted-foreground)]"
                }`}>
                  {comp.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
