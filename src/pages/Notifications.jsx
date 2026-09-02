import {
    Bell,
    CheckCheck,
    Heart,
    LoaderCircle,
    MessageCircle,
    UserPlus,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest, getCurrentUser } from "../lib/authApi";

function formatNotificationTime(createdAt) {
    if (!createdAt) return "Just now";

    const createdTime = new Date(createdAt).getTime();

    if (Number.isNaN(createdTime)) return "Just now";

    const elapsedSeconds = Math.max(
        0,
        Math.floor((Date.now() - createdTime) / 1000),
    );

    if (elapsedSeconds < 60) return "Just now";

    const minutes = Math.floor(elapsedSeconds / 60);

    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);

    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);

    if (days < 7) return `${days}d ago`;

    return new Date(createdAt).toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function NotificationIcon({ type }) {
    if (type === "like") {
        return <Heart className="size-4" fill="currentColor" />;
    }

    if (type === "comment") {
        return <MessageCircle className="size-4" />;
    }

    if (type === "follow") {
        return <UserPlus className="size-4" />;
    }

    return <Bell className="size-4" />;
}

function notificationIconStyles(type) {
    if (type === "like") {
        return "bg-rose-400/15 text-rose-300";
    }

    if (type === "comment") {
        return "bg-sky-400/15 text-sky-300";
    }

    if (type === "follow") {
        return "bg-lime-300/15 text-lime-300";
    }

    return "bg-slate-400/15 text-slate-300";
}

function Notifications() {
    const navigate = useNavigate();

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [markingAll, setMarkingAll] = useState(false);
    const [markingId, setMarkingId] = useState(null);

    useEffect(() => {
        let cancelled = false;

        const loadNotifications = async () => {
            setLoading(true);
            setError("");

            try {
                const currentUser = await getCurrentUser();

                if (!currentUser) {
                    navigate("/signin");
                    return;
                }

                const data = await apiRequest("/api/notifications");

                if (!cancelled) {
                    setNotifications(Array.isArray(data) ? data : []);
                }
            } catch (requestError) {
                console.error("Error loading notifications:", requestError);

                if (requestError.status === 401) {
                    navigate("/signin");
                    return;
                }

                if (!cancelled) {
                    setError(
                        requestError.message ||
                            "Unable to load your notifications.",
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadNotifications();

        return () => {
            cancelled = true;
        };
    }, [navigate]);

    const unreadCount = notifications.filter(
        (notification) => !notification.is_read,
    ).length;

    const markAsRead = async (notificationId) => {
        setMarkingId(notificationId);

        try {
            const updatedNotification = await apiRequest(
                `/api/notifications/${notificationId}/read`,
                {
                    method: "PATCH",
                },
            );

            setNotifications((currentNotifications) =>
                currentNotifications.map((notification) =>
                    notification.id === notificationId
                        ? updatedNotification
                        : notification,
                ),
            );

            window.dispatchEvent(new Event("unifeed:notifications-updated"));
        } catch (requestError) {
            console.error("Error marking notification as read:", requestError);

            setError(
                requestError.message ||
                    "Unable to mark this notification as read.",
            );
        } finally {
            setMarkingId(null);
        }
    };

    const markAllAsRead = async () => {
        if (unreadCount === 0) {
            return;
        }

        setMarkingAll(true);
        setError("");

        try {
            await apiRequest("/api/notifications/read-all", {
                method: "POST",
            });

            setNotifications((currentNotifications) =>
                currentNotifications.map((notification) => ({
                    ...notification,
                    is_read: true,
                })),
            );

            window.dispatchEvent(new Event("unifeed:notifications-updated"));
        } catch (requestError) {
            console.error(
                "Error marking all notifications as read:",
                requestError,
            );

            setError(
                requestError.message ||
                    "Unable to mark all notifications as read.",
            );
        } finally {
            setMarkingAll(false);
        }
    };

    if (loading) {
        return (
            <div className="grid min-h-[60vh] place-items-center text-sm text-slate-500">
                <span className="flex items-center gap-2">
                    <LoaderCircle className="size-4 animate-spin text-lime-300" />
                    Loading notifications...
                </span>
            </div>
        );
    }

    return (
        <div className="motion-rise space-y-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                    <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-lime-300/80">
                        <Bell className="size-3.5" />
                        Stay in the loop
                    </p>

                    <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                        Notifications
                    </h1>

                    <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                        See who liked, commented on, or followed your UniFeed
                        profile.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={markAllAsRead}
                    disabled={markingAll || unreadCount === 0}
                    className="flex items-center justify-center gap-2 self-start rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-lime-300/30 hover:text-lime-300 disabled:cursor-not-allowed disabled:opacity-40 sm:self-auto"
                >
                    <CheckCheck className="size-4" />
                    {markingAll ? "Updating..." : "Mark all as read"}
                </button>
            </div>

            {error && (
                <div className="rounded-2xl border border-rose-300/20 bg-rose-300/5 px-4 py-3 text-sm text-rose-200">
                    {error}
                </div>
            )}

            {notifications.length === 0 ? (
                <div className="grid min-h-[360px] place-items-center rounded-3xl border border-dashed border-white/10 bg-white/[0.02] px-6 text-center">
                    <div>
                        <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-lime-300/10 text-lime-300">
                            <Bell className="size-6" />
                        </div>

                        <h2 className="mt-4 font-semibold text-white">
                            You’re all caught up
                        </h2>

                        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                            Likes, comments, and new followers will appear here.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="space-y-2">
                    {notifications.map((notification) => (
                        <article
                            key={notification.id}
                            className={`flex items-start gap-4 rounded-2xl border p-4 transition ${
                                notification.is_read
                                    ? "border-white/8 bg-white/[0.025]"
                                    : "border-lime-300/20 bg-lime-300/[0.06]"
                            }`}
                        >
                            <div
                                className={`grid size-10 shrink-0 place-items-center rounded-xl ${notificationIconStyles(
                                    notification.type,
                                )}`}
                            >
                                <NotificationIcon type={notification.type} />
                            </div>

                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-white">
                                    {notification.message}
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                    {formatNotificationTime(
                                        notification.created_at,
                                    )}
                                </p>
                            </div>

                            {!notification.is_read && (
                                <button
                                    type="button"
                                    onClick={() => markAsRead(notification.id)}
                                    disabled={markingId === notification.id}
                                    className="shrink-0 rounded-lg border border-lime-300/20 px-2.5 py-1.5 text-[11px] font-semibold text-lime-300 transition hover:bg-lime-300/10 disabled:opacity-50"
                                >
                                    {markingId === notification.id
                                        ? "Saving..."
                                        : "Mark read"}
                                </button>
                            )}
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Notifications;
