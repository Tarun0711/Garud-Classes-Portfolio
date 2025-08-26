import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, CheckCircle, AlertCircle, Info, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  NotificationDto,
  fetchMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  fetchAllNotifications,
} from "@/lib/api";

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Load notifications on component mount
  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await fetchAllNotifications({ limit: 20 });

      // The API can return different shapes depending on endpoint/version:
      // - an array of notifications
      // - a pagination object: { notifications: NotificationDto[], unreadCount, ... }
      // - an object under `data` with similar shape
      let notificationsList: NotificationDto[] = [];
      let unread = 0;

      if (Array.isArray(data)) {
        notificationsList = data as unknown as NotificationDto[];
        unread = notificationsList.filter((n) => !n.isRead).length;
      } else if (Array.isArray((data as any).notifications)) {
        notificationsList = (data as any).notifications;
        unread = (data as any).unreadCount ?? notificationsList.filter((n: NotificationDto) => !n.isRead).length;
      } else if (Array.isArray((data as any).data?.notifications)) {
        notificationsList = (data as any).data.notifications;
        unread = (data as any).data.unreadCount ?? notificationsList.filter((n: NotificationDto) => !n.isRead).length;
      } else {
        // Fallback: try to coerce if single object (not expected)
        console.warn("Unexpected notifications response shape, falling back to empty list:", data);
        notificationsList = [];
        unread = 0;
      }

      setNotifications(notificationsList);
      setUnreadCount(unread);
      console.log("Loaded notifications:", notificationsList, "unreadCount:", unread);
    } catch (error) {
      console.error("Failed to load notifications:", error);
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "warning":
        return <AlertCircle className="w-5 h-5 text-orange-500" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case "info":
        return <Info className="w-5 h-5 text-blue-500" />;
      case "announcement":
        return <Bell className="w-5 h-5 text-secondary" />;
      default:
        return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === id || (n as any).id === id ? { ...n, isRead: true } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const result = await markAllNotificationsAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      );
      setUnreadCount(0);
      toast({
        title: "Success",
        description: result.message,
      });
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read",
        variant: "destructive",
      });
    }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      await deleteNotification(id);
      const notificationToDelete = notifications.find(
        (n) => n._id === id || (n as any).id === id
      );
      setNotifications((prev) =>
        prev.filter((n) => n._id !== id && (n as any).id !== id)
      );
      if (notificationToDelete && !notificationToDelete.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
      toast({
        title: "Success",
        description: "Notification deleted",
      });
    } catch (error) {
      console.error("Failed to delete notification:", error);
      toast({
        title: "Error",
        description: "Failed to delete notification",
        variant: "destructive",
      });
    }
  };

  const handleNotificationClick = (notification: NotificationDto) => {
    if (!notification.isRead) {
      handleMarkAsRead(notification._id);
    }

    if (notification.actionUrl && typeof notification.actionUrl === "string") {
      const url = notification.actionUrl.trim();
      const isAbsolute = /^https?:\/\//i.test(url);
      const isRelative = url.startsWith("/");

      if (isAbsolute) window.open(url, "_blank");
      else if (isRelative) window.location.href = url;
    }
  };

  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-white hover:text-secondary transition-colors duration-300"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </motion.span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-border z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-primary/5 to-secondary/5">
                <h3 className="text-lg font-semibold text-primary flex items-center">
                  <Bell className="w-5 h-5 mr-2" />
                  Notifications
                </h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Notifications List */}
              <div className="max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="text-gray-500 mt-2">
                      Loading notifications...
                    </p>
                  </div>
                ) : notifications.length == 0 ? (
                  <div className="p-8 text-center">
                    <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No notifications yet</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {notifications.map((notification) => (
                      <motion.div
                        key={notification._id ?? (notification as any).id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer relative group ${
                          !notification.isRead ? "bg-blue-50/50" : ""
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-1">
                            {getIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <h4
                                className={`text-sm font-medium text-primary ${
                                  !notification.isRead ? "font-semibold" : ""
                                }`}
                              >
                                {notification.title}
                              </h4>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteNotification(
                                    notification._id ?? (notification as any).id
                                  );
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-all"
                              >
                                <X className="w-3 h-3 text-gray-400" />
                              </button>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                              {notification.message}
                            </p>
                            <div className="flex items-center mt-2 text-xs text-gray-400">
                              <Clock className="w-3 h-3 mr-1" />
                              {notification.timeAgo || "Just now"}
                            </div>
                            {notification.actionUrl &&
                              typeof notification.actionUrl === "string" && (
                                <div className="mt-1">
                                  <span className="text-xs text-blue-600 hover:underline">
                                    Click to view →
                                  </span>
                                </div>
                              )}
                          </div>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationDropdown;
