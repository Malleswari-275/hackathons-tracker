import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getNotifications, markNotificationRead } from "@/api/notification.api";
import { setNotifications, markRead } from "@/store/notificationSlice";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/EmptyState";
import { Bell, Check, Mail } from "lucide-react";
import { timeAgo } from "@/lib/utils";
import { motion } from "framer-motion";
import { toast } from "sonner";

const typeIcons = {
  EVENT_ASSIGNED: "🎯",
  EVENT_APPROVED: "✅",
  EVENT_REJECTED: "❌",
  ELIGIBLE_EVENT: "🏆",
  DEADLINE_REMINDER: "⏰",
  EVENT_STARTS: "🚀",
  GENERAL: "📢",
};

export default function NotificationsPage() {
  const dispatch = useDispatch();
  const { notifications } = useSelector((s) => s.notifications);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    setLoading(true);
    getNotifications()
      .then((res) => dispatch(setNotifications(res.data?.data || [])))
      .catch(() => toast.error("Failed to load notifications"))
      .finally(() => setLoading(false));
  }, [dispatch]);

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      dispatch(markRead(id));
    } catch (e) {}
  };

  const filtered = filter === "unread"
    ? notifications.filter((n) => !n.read)
    : filter === "read"
    ? notifications.filter((n) => n.read)
    : notifications;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="text-[var(--muted-foreground)]">{notifications.filter((n) => !n.read).length} unread</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {["all", "unread", "read"].map((f) => (
          <Button
            key={f}
            variant={filter === f ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(f)}
            className="capitalize"
          >
            {f}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--primary)] border-t-transparent" /></div>
      ) : filtered.length === 0 ? (
        <EmptyState title="No notifications" description="You're all caught up!" icon={Bell} />
      ) : (
        <div className="space-y-2">
          {filtered.map((notif, idx) => (
            <motion.div
              key={notif._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
            >
              <Card className={`transition-colors ${!notif.read ? "border-[var(--primary)]/30 bg-[var(--primary)]/5" : ""}`}>
                <CardContent className="p-4 flex items-start gap-3">
                  <span className="text-xl mt-0.5">{typeIcons[notif.type] || "📢"}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-sm">{notif.title}</p>
                      {!notif.read && (
                        <Button variant="ghost" size="sm" onClick={() => handleMarkRead(notif._id)} className="shrink-0 gap-1 text-xs">
                          <Check className="h-3.5 w-3.5" /> Mark read
                        </Button>
                      )}
                    </div>
                    <p className="text-sm text-[var(--muted-foreground)] mt-0.5">{notif.message}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Badge variant="outline" className="text-xs">{notif.type?.replace(/_/g, " ")}</Badge>
                      <span className="text-xs text-[var(--muted-foreground)]">{timeAgo(notif.createdAt)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
