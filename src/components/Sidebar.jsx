import {
    Bell,
    Bookmark,
    CalendarDays,
    Compass,
    Home,
    MessageCircle,
    Plus,
    UserRound,
    UsersRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { apiRequest, getCurrentUser } from "../lib/authApi";

const primaryItems = [
    { label: "Home", icon: Home, path: "/" },
    { label: "Explore", icon: Compass, path: "/explore" },
    { label: "Events", icon: CalendarDays, path: "/events" },
    { label: "Communities", icon: UsersRound, path: "/communities" },
];

function Sidebar() {
    const location = useLocation();
    const [user, setUser] = useState(null);
    const [bookmarkCount, setBookmarkCount] = useState(0);
    const [notificationCount, setNotificationCount] = useState(0);
    const [messageCount, setMessageCount] = useState(0);

    useEffect(() => {
        let cancelled = false;

        const loadSidebarData = async () => {
            try {
                const currentUser = await getCurrentUser();

                if (cancelled) return;

                setUser(currentUser);

                if (!currentUser) {
                    setBookmarkCount(0);
                    setNotificationCount(0);
                    setMessageCount(0);
                    return;
                }

                const [bookmarks, notificationData, messageData] =
                    await Promise.all([
                        apiRequest("/api/bookmarks"),
                        apiRequest("/api/notifications/unread-count"),
                        apiRequest("/api/messages/unread-count"),
                    ]);

                if (cancelled) return;

                setBookmarkCount(bookmarks.length);
                setNotificationCount(notificationData.unread_count ?? 0);
                setMessageCount(messageData.unread_count ?? 0);
            } catch (error) {
                if (cancelled) return;

                if (error.status !== 401) {
                    console.error("Error loading sidebar data:", error);
                }

                setUser(null);
                setBookmarkCount(0);
                setNotificationCount(0);
                setMessageCount(0);
            }
        };

        const handleBookmarkAdded = () => {
            loadSidebarData();
        };

        const handleBookmarkRemoved = () => {
            loadSidebarData();
        };

        const handleNotificationsUpdated = () => {
            loadSidebarData();
        };

        const handleMessagesUpdated = () => {
            loadSidebarData();
        };

        loadSidebarData();

        const refreshInterval = window.setInterval(loadSidebarData, 30 * 1000);

        window.addEventListener("unifeed:bookmark-added", handleBookmarkAdded);
        window.addEventListener(
            "unifeed:bookmark-removed",
            handleBookmarkRemoved,
        );
        window.addEventListener(
            "unifeed:notifications-updated",
            handleNotificationsUpdated,
        );
        window.addEventListener(
            "unifeed:messages-updated",
            handleMessagesUpdated,
        );

        return () => {
            cancelled = true;
            window.clearInterval(refreshInterval);

            window.removeEventListener(
                "unifeed:bookmark-added",
                handleBookmarkAdded,
            );
            window.removeEventListener(
                "unifeed:bookmark-removed",
                handleBookmarkRemoved,
            );
            window.removeEventListener(
                "unifeed:notifications-updated",
                handleNotificationsUpdated,
            );
            window.removeEventListener(
                "unifeed:messages-updated",
                handleMessagesUpdated,
            );
        };
    }, [location.pathname]);

    const activityItems = [
        {
            label: "Notifications",
            icon: Bell,
            path: "/notifications",
            badge: notificationCount > 0 ? String(notificationCount) : null,
        },
        {
            label: "Messages",
            icon: MessageCircle,
            path: "/messages",
            badge: messageCount > 0 ? String(messageCount) : null,
        },
        {
            label: "Bookmarks",
            icon: Bookmark,
            path: "/bookmarks",
            badge: bookmarkCount > 0 ? String(bookmarkCount) : null,
        },
    ];

    const displayName = user?.username || "UniFeed member";
    const profilePath = user ? `/profile/${user.id}` : "/signin";

    const renderItem = ({ label, icon: Icon, path, badge }) => {
        const active = location.pathname === path;

        return (
            <Link
                key={label}
                to={path}
                className={`group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold transition ${
                    active
                        ? "bg-lime-300 text-slate-950 shadow-[0_8px_30px_rgba(163,230,53,0.12)]"
                        : "text-slate-400 hover:bg-white/6 hover:text-white"
                }`}
            >
                <Icon className="size-4.5" strokeWidth={active ? 2.5 : 2} />
                <span className="flex-1">{label}</span>

                {badge && (
                    <span
                        className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                            active
                                ? "bg-slate-950/15 text-slate-950"
                                : "bg-lime-300/15 text-lime-300"
                        }`}
                    >
                        {badge}
                    </span>
                )}
            </Link>
        );
    };

    return (
        <aside className="lg:sticky lg:top-28 lg:flex lg:h-[calc(100vh-9rem)] lg:flex-col">
            <div className="sidebar-scroll flex items-center justify-between lg:min-h-0 lg:flex-1 lg:block lg:overflow-y-auto">
                <div className="mb-5 hidden px-3 lg:block">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-lime-300/80">
                        Your space
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                        Stay in the loop
                    </p>
                </div>

                <nav
                    className="flex gap-2 lg:block lg:space-y-1"
                    aria-label="Main navigation"
                >
                    {primaryItems.map(renderItem)}
                </nav>

                <div className="my-4 hidden border-t border-white/8 lg:block" />

                <p className="mb-2 hidden px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600 lg:block">
                    Your activity
                </p>

                <nav
                    className="hidden gap-2 lg:block lg:space-y-1"
                    aria-label="Activity navigation"
                >
                    {activityItems.map(renderItem)}
                </nav>
            </div>

            <Link
                to="/create-post"
                className="mt-6 hidden w-full items-center justify-center gap-2 rounded-2xl bg-lime-300 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-lime-200 active:scale-[0.98] lg:flex"
            >
                <Plus className="size-4" /> Create post
            </Link>

            <div className="mt-auto hidden border-t border-white/8 pt-5 lg:block">
                <Link
                    to={profilePath}
                    className="flex items-center gap-3 rounded-2xl p-2 text-slate-300 transition hover:bg-white/[0.06]"
                >
                    <span className="grid size-9 place-items-center rounded-full bg-slate-800 text-lime-300">
                        {user?.username ? (
                            user.username.charAt(0).toUpperCase()
                        ) : (
                            <UserRound className="size-4" />
                        )}
                    </span>

                    <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold">
                            {user ? displayName : "Sign in to view profile"}
                        </span>

                        <span className="block truncate text-xs text-slate-500">
                            {user ? `@${displayName}` : "No active session"}
                        </span>
                    </span>
                </Link>
            </div>
        </aside>
    );
}

export default Sidebar;
