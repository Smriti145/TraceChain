import api from "../api/axios";
import {
  AppNotification,
  cacheNotifications,
  getCachedNotifications,
  markAllCachedNotificationsRead,
  markCachedNotificationRead,
} from "./storage";

export type NotificationFeed = {
  notifications: AppNotification[];
  unreadCount: number;
  offline: boolean;
};

const countUnread = (items: AppNotification[]) => items.filter(item => !item.readAt).length;

export const loadNotifications = async (): Promise<NotificationFeed> => {
  try {
    const {data} = await api.get("/notifications?limit=100");
    const notifications = Array.isArray(data.notifications) ? data.notifications : [];
    await cacheNotifications(notifications);
    return {notifications, unreadCount: Number(data.unreadCount) || 0, offline: false};
  } catch {
    const notifications = await getCachedNotifications();
    return {notifications, unreadCount: countUnread(notifications), offline: true};
  }
};

export const readNotification = async (id: string) => {
  const notifications = await markCachedNotificationRead(id);
  try {
    await api.patch(`/notifications/${encodeURIComponent(id)}/read`);
  } catch {
    // Keep the local read state while offline; the next refresh reconciles it.
  }
  return notifications;
};

export const readAllNotifications = async () => {
  const notifications = await markAllCachedNotificationsRead();
  try {
    await api.patch("/notifications/read-all");
  } catch {
    // Keep the local read state while offline.
  }
  return notifications;
};
