import { Bell, ChevronDown, Search, Sparkles, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest, getCurrentUser, logoutUser } from "../lib/authApi";

function Header() {
    const navigate = useNavigate();

    const [accountOpen, setAccountOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [notificationCount, setNotificationCount] = useState(0);
    const [loggingOut, setLoggingOut] = useState(false);

    useEffect(() => {
        let cancelled = false;

        const loadNotificationCount = async () => {
            try {
                const currentUser = await getCurrentUser();

                if (cancelled) {
                    return;
                }

                setUser(currentUser);

                if (!currentUser) {
                    setNotificationCount(0);
                    return;
                }

                const notificationData = await apiRequest(
                    "/api/notifications/unread-count",
                );

                if (!cancelled) {
                    setNotificationCount(notificationData.unread_count ?? 0);
                }
            } catch (error) {
                if (cancelled) {
                    return;
                }

                if (error.status !== 401) {
                    console.error("Error loading notification count:", error);
                }

                setUser(null);
                setNotificationCount(0);
            }
        };

        const handleNotificationsUpdated = () => {
            loadNotificationCount();
        };

        loadNotificationCount();

        const refreshInterval = window.setInterval(
            loadNotificationCount,
            30 * 1000,
        );

        window.addEventListener(
            "unifeed:notifications-updated",
            handleNotificationsUpdated,
        );

        return () => {
            cancelled = true;
            window.clearInterval(refreshInterval);

            window.removeEventListener(
                "unifeed:notifications-updated",
                handleNotificationsUpdated,
            );
        };
    }, []);

    const handleLogout = async () => {
        setLoggingOut(true);

        try {
            await logoutUser();
            setUser(null);
            setNotificationCount(0);
            setAccountOpen(false);
            navigate("/signin");
        } catch (error) {
            console.error("Error logging out:", error);
        } finally {
            setLoggingOut(false);
        }
    };

    const displayName = user?.username || "UniFeed member";
    const profilePath = user ? `/profile/${user.id}` : "/signin";

    return (
        <header className="fixed inset-x-0 top-0 z-50 border-b border-white/8 bg-[#0b0d10]/90 backdrop-blur-xl lg:sticky lg:top-0">
            <div className="mx-auto flex h-20 max-w-[1480px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
                <Link
                    to="/"
                    className="flex items-center gap-3"
                    aria-label="UniFeed home"
                >
                    <span className="grid size-10 place-items-center rounded-2xl bg-lime-300 text-lg font-bold text-slate-950 shadow-[0_0_28px_rgba(163,230,53,0.18)]">
                        U
                    </span>

                    <span className="logo hidden text-xl font-semibold tracking-tight text-white sm:block">
                        UniFeed
                    </span>
                </Link>

                <div className="hidden max-w-md flex-1 items-center gap-2 rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-2.5 md:flex">
                    <Search className="size-4 text-slate-500" />

                    <span className="text-sm text-slate-500">
                        Search your campus community
                    </span>

                    <span className="ml-auto rounded-md border border-white/10 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
                        ⌘ K
                    </span>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                    <Link
                        to="/notifications"
                        className="relative grid size-10 place-items-center rounded-xl text-slate-400 transition hover:bg-white/7 hover:text-lime-300"
                        aria-label={
                            notificationCount > 0
                                ? `${notificationCount} unread notifications`
                                : "Notifications"
                        }
                    >
                        <Bell className="size-5" />

                        {notificationCount > 0 && (
                            <span
                                className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-lime-300"
                                aria-hidden="true"
                            />
                        )}
                    </Link>

                    <button
                        className="hidden size-10 place-items-center rounded-xl text-slate-400 transition hover:bg-white/7 hover:text-lime-300 sm:grid"
                        aria-label="Discover"
                        type="button"
                    >
                        <Sparkles className="size-5" />
                    </button>

                    <div className="relative">
                        <button
                            onClick={() => setAccountOpen(!accountOpen)}
                            className={`flex items-center gap-1 rounded-full border p-1 pr-2 transition ${
                                accountOpen
                                    ? "border-lime-300/50 bg-lime-300/10"
                                    : "border-white/10 bg-white/[0.06] hover:border-white/25"
                            }`}
                            aria-label="Account menu"
                            aria-expanded={accountOpen}
                            type="button"
                        >
                            <span className="grid size-8 place-items-center rounded-full bg-slate-800 text-slate-300">
                                {user?.username ? (
                                    user.username.charAt(0).toUpperCase()
                                ) : (
                                    <UserRound className="size-4" />
                                )}
                            </span>

                            <ChevronDown
                                className={`hidden size-3.5 text-slate-500 transition sm:block ${
                                    accountOpen ? "rotate-180" : ""
                                }`}
                            />
                        </button>

                        {accountOpen && (
                            <div className="absolute right-0 top-12 w-60 overflow-hidden rounded-2xl border border-white/10 bg-[#15191e] p-2 shadow-2xl shadow-black/40">
                                <div className="border-b border-white/8 px-3 py-3">
                                    <p className="text-sm font-semibold text-white">
                                        {user
                                            ? `@${displayName}`
                                            : "Welcome to UniFeed"}
                                    </p>

                                    <p className="mt-1 text-xs text-slate-500">
                                        {user
                                            ? "Your campus profile"
                                            : "Join your campus conversation."}
                                    </p>
                                </div>

                                {!user ? (
                                    <>
                                        <Link
                                            to="/signin"
                                            onClick={() =>
                                                setAccountOpen(false)
                                            }
                                            className="mt-2 block rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/6 hover:text-lime-300"
                                        >
                                            Sign in
                                        </Link>

                                        <Link
                                            to="/signup"
                                            onClick={() =>
                                                setAccountOpen(false)
                                            }
                                            className="block rounded-xl bg-lime-300 px-3 py-2.5 text-center text-sm font-bold text-slate-950 transition hover:bg-lime-200"
                                        >
                                            Create an account
                                        </Link>
                                    </>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleLogout}
                                        disabled={loggingOut}
                                        className="mt-2 block w-full rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-rose-300 transition hover:bg-rose-300/10 disabled:opacity-60"
                                    >
                                        {loggingOut
                                            ? "Signing out..."
                                            : "Sign out"}
                                    </button>
                                )}

                                <div className="mt-2 border-t border-white/8 pt-2">
                                    <Link
                                        to={profilePath}
                                        onClick={() => setAccountOpen(false)}
                                        className="block rounded-xl px-3 py-2 text-xs text-slate-500 hover:bg-white/6 hover:text-slate-300"
                                    >
                                        {user
                                            ? "My profile"
                                            : "Sign in to view your profile"}
                                    </Link>

                                    <Link
                                        to="/settings"
                                        onClick={() => setAccountOpen(false)}
                                        className="block rounded-xl px-3 py-2 text-xs text-slate-500 hover:bg-white/6 hover:text-slate-300"
                                    >
                                        Settings
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Header;
