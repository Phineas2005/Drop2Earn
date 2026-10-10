"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Notification = {
  id: string;
  title: string;
  message: string;
  href: string | null;
  read_at: string | null;
  created_at: string;
};

export function NotificationsPanel() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  async function loadNotifications() {
    const { data, error } = await supabase.rpc("get_my_notifications");
    if (!error) {
      setNotifications((data ?? []) as Notification[]);
    }
    setLoading(false);
  }

  useEffect(() => {
    queueMicrotask(() => {
      void loadNotifications();
    });
  }, []);

  async function markRead(notification: Notification) {
    if (!notification.read_at) {
      await supabase.rpc("mark_notification_read", {
        target_notification_id: notification.id,
      });
      setNotifications((current) =>
        current.map((item) =>
          item.id === notification.id
            ? { ...item, read_at: new Date().toISOString() }
            : item
        )
      );
    }
    setOpen(false);
  }

  const unreadCount = notifications.filter((notification) => !notification.read_at).length;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="relative rounded-lg p-2 text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
        aria-expanded={open}
      >
        <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17H9.143m8.286-2.5V10a5.429 5.429 0 00-10.858 0v4.5L5 17h14l-1.571-2.5zM14 20a2.2 2.2 0 01-4 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-green-600 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-30 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
          <div className="border-b border-gray-100 px-4 py-3">
            <p className="font-semibold text-gray-900">Notifications</p>
            <p className="mt-0.5 text-xs text-gray-500">Updates about your Drop2Earn activity</p>
          </div>
          {loading ? (
            <p className="px-4 py-6 text-center text-sm text-gray-500">Loading notifications...</p>
          ) : notifications.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-gray-500">You are all caught up.</p>
          ) : (
            <div className="max-h-96 divide-y divide-gray-100 overflow-y-auto">
              {notifications.map((notification) => {
                const content = (
                  <div className={`px-4 py-3 text-left transition hover:bg-gray-50 ${notification.read_at ? "" : "bg-green-50/60"}`}>
                    <div className="flex items-start gap-2">
                      {!notification.read_at && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-green-600" />}
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{notification.title}</p>
                        <p className="mt-1 text-xs leading-5 text-gray-600">{notification.message}</p>
                        <p className="mt-1 text-[11px] text-gray-400">
                          {new Date(notification.created_at).toLocaleString("en-GB")}
                        </p>
                      </div>
                    </div>
                  </div>
                );

                return notification.href ? (
                  <Link key={notification.id} href={notification.href} onClick={() => void markRead(notification)}>
                    {content}
                  </Link>
                ) : (
                  <button key={notification.id} type="button" className="block w-full" onClick={() => void markRead(notification)}>
                    {content}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
