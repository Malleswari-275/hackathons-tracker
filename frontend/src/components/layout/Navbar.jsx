import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { clearAuth } from "@/store/authSlice";
import { toggleTheme } from "@/store/themeSlice";
import { setNotifications } from "@/store/notificationSlice";
import { getNotifications, markNotificationRead } from "@/api/notification.api";
import { Bell, Sun, Moon, Menu, LogOut, User, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getInitials, timeAgo } from "@/lib/utils";

export function Navbar({ onMenuClick }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useSelector((s) => s.theme.mode);
  const { unreadCount, notifications } = useSelector((s) => s.notifications);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Fetch notifications
  useEffect(() => {
    getNotifications()
      .then((res) => dispatch(setNotifications(res.data?.data || [])))
      .catch(() => {});
  }, [dispatch]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    dispatch(clearAuth());
    navigate("/login");
  };

  const handleReadNotif = async (id) => {
    try {
      await markNotificationRead(id);
      const res = await getNotifications();
      dispatch(setNotifications(res.data?.data || []));
    } catch (e) {}
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[var(--border)] bg-[var(--card)]/80 backdrop-blur-md px-4 lg:px-6">
      {/* Left: Hamburger (mobile) */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}>
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <Button variant="ghost" size="icon" onClick={() => dispatch(toggleTheme())} className="rounded-full">
          {theme === "dark" ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
        </Button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <Button variant="ghost" size="icon" className="relative rounded-full" onClick={() => setShowNotifs(!showNotifs)}>
            <Bell className="h-4.5 w-4.5" />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[var(--destructive)] text-[10px] font-bold text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Button>

          {showNotifs && (
            <div className="absolute right-0 top-12 w-80 rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-xl overflow-hidden">
              <div className="border-b border-[var(--border)] px-4 py-3 flex items-center justify-between">
                <span className="text-sm font-semibold">Notifications</span>
                <Badge variant="secondary">{unreadCount}</Badge>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="px-4 py-6 text-center text-sm text-[var(--muted-foreground)]">No notifications</p>
                ) : (
                  notifications.slice(0, 8).map((n) => (
                    <div
                      key={n._id}
                      className={`px-4 py-3 border-b border-[var(--border)] cursor-pointer hover:bg-[var(--muted)]/50 transition-colors ${!n.read ? "bg-[var(--primary)]/5" : ""}`}
                      onClick={() => handleReadNotif(n._id)}
                    >
                      <p className="text-sm font-medium truncate">{n.title}</p>
                      <p className="text-xs text-[var(--muted-foreground)] mt-0.5 truncate">{n.message}</p>
                      <p className="text-xs text-[var(--muted-foreground)] mt-1">{timeAgo(n.createdAt)}</p>
                    </div>
                  ))
                )}
              </div>
              {notifications.length > 0 && (
                <button
                  onClick={() => { setShowNotifs(false); navigate("/notifications"); }}
                  className="w-full px-4 py-2.5 text-center text-sm font-medium text-[var(--primary)] hover:bg-[var(--muted)]/50 cursor-pointer"
                >
                  View all notifications
                </button>
              )}
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2 rounded-full pl-1 pr-2 py-1 hover:bg-[var(--muted)] transition-colors cursor-pointer"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--primary)] text-xs font-bold text-white">
              {getInitials(user?.email?.split("@")[0])}
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-[var(--muted-foreground)]" />
          </button>

          {showProfile && (
            <div className="absolute right-0 top-12 w-56 rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-[var(--border)]">
                <p className="text-sm font-medium truncate">{user?.email}</p>
                <p className="text-xs text-[var(--muted-foreground)]">{user?.role?.replace(/_/g, " ")}</p>
              </div>
              <button
                onClick={() => { setShowProfile(false); navigate("/profile"); }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-[var(--muted)] transition-colors cursor-pointer"
              >
                <User className="h-4 w-4" /> Profile
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[var(--destructive)] hover:bg-[var(--muted)] transition-colors cursor-pointer"
              >
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
