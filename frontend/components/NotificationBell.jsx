"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { useAuth } from "@/lib/authContext";
import { subscribeNotifications, markNotificationRead } from "@/lib/notifications";

export default function NotificationBell() {
  const { user } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!user?.uid) return;
    return subscribeNotifications(user.uid, (list) => {
      setNotifications(list);
      setUnreadCount(list.filter((n) => !n.read).length);
    });
  }, [user?.uid]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleClick(notification) {
    await markNotificationRead(notification.id);
    setOpen(false);
    if (notification.bookingId) {
      router.push(`/chat/${notification.bookingId}`);
    }
  }

  if (!user) return null;

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-full p-2 text-sunlo-text/80 hover:bg-orange-50"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-xl">
          <div className="border-b border-orange-100 px-4 py-3">
            <p className="text-sm font-semibold text-sunlo-text">Notifications</p>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-sunlo-muted">No notifications yet</p>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className={`w-full px-4 py-3 text-left transition-colors hover:bg-orange-50 ${
                    n.read ? "opacity-70" : "bg-orange-50/40"
                  }`}
                >
                  <p className="text-sm font-medium text-sunlo-text">{n.title}</p>
                  <p className="text-xs text-sunlo-muted">{n.body}</p>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
