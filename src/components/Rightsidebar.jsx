import {
    Check,
    MapPin,
    MoreHorizontal,
    TrendingUp,
    UserPlus,
    UsersRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest, getCurrentUser } from "../lib/authApi";

function shuffleUsers(users) {
    const shuffledUsers = [...users];

    for (let index = shuffledUsers.length - 1; index > 0; index -= 1) {
        const randomIndex = Math.floor(Math.random() * (index + 1));

        [shuffledUsers[index], shuffledUsers[randomIndex]] = [
            shuffledUsers[randomIndex],
            shuffledUsers[index],
        ];
    }

    return shuffledUsers;
}

function getDisplayName(user) {
    const fullName = [user.first_name, user.last_name]
        .filter(Boolean)
        .join(" ");

    return fullName || user.username;
}

function RightSidebar() {
    const navigate = useNavigate();

    const [suggestedUsers, setSuggestedUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [followLoadingId, setFollowLoadingId] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        const fetchSuggestedUsers = async () => {
            setLoading(true);
            setError("");

            try {
                const currentUser = await getCurrentUser();

                if (!currentUser) {
                    if (!cancelled) {
                        setSuggestedUsers([]);
                    }

                    return;
                }

                const users = await apiRequest("/api/users");

                if (cancelled) {
                    return;
                }

                const shuffledUsers = shuffleUsers(users).slice(0, 5);

                const usersWithFollowStatus = await Promise.all(
                    shuffledUsers.map(async (user) => {
                        try {
                            const followStatus = await apiRequest(
                                `/api/users/${user.id}/follow-status`,
                            );

                            return {
                                ...user,
                                isFollowing: Boolean(followStatus.is_following),
                            };
                        } catch (followError) {
                            if (followError.status === 401) {
                                throw followError;
                            }

                            return {
                                ...user,
                                isFollowing: false,
                            };
                        }
                    }),
                );

                if (!cancelled) {
                    setSuggestedUsers(usersWithFollowStatus);
                }
            } catch (requestError) {
                console.error("Error fetching suggested users:", requestError);

                if (requestError.status === 401) {
                    if (!cancelled) {
                        setSuggestedUsers([]);
                    }

                    return;
                }

                if (!cancelled) {
                    setError("Unable to load people to follow.");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        fetchSuggestedUsers();

        return () => {
            cancelled = true;
        };
    }, []);

    const handleFollowToggle = async (user) => {
        if (followLoadingId === user.id) {
            return;
        }

        const wasFollowing = user.isFollowing;

        setFollowLoadingId(user.id);

        setSuggestedUsers((currentUsers) =>
            currentUsers.map((currentUser) =>
                currentUser.id === user.id
                    ? {
                          ...currentUser,
                          isFollowing: !wasFollowing,
                      }
                    : currentUser,
            ),
        );

        try {
            const followStatus = await apiRequest(
                `/api/users/${user.id}/follow`,
                {
                    method: wasFollowing ? "DELETE" : "POST",
                },
            );

            setSuggestedUsers((currentUsers) =>
                currentUsers.map((currentUser) =>
                    currentUser.id === user.id
                        ? {
                              ...currentUser,
                              isFollowing: Boolean(followStatus.is_following),
                          }
                        : currentUser,
                ),
            );
        } catch (requestError) {
            console.error("Error changing follow status:", requestError);

            setSuggestedUsers((currentUsers) =>
                currentUsers.map((currentUser) =>
                    currentUser.id === user.id
                        ? {
                              ...currentUser,
                              isFollowing: wasFollowing,
                          }
                        : currentUser,
                ),
            );

            if (requestError.status === 401) {
                navigate("/signin");
            } else {
                setError(
                    requestError.message ||
                        "Unable to change the follow status.",
                );
            }
        } finally {
            setFollowLoadingId(null);
        }
    };

    return (
        <aside className="hidden space-y-5 lg:block">
            <section className="rounded-3xl border border-white/8 bg-white/[0.035] p-5 shadow-2xl shadow-black/10">
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-lime-300/80">
                            Discover
                        </p>

                        <h2 className="mt-1 font-semibold text-white">
                            People to follow
                        </h2>
                    </div>

                    <UsersRound className="size-5 text-slate-500" />
                </div>

                {error && (
                    <p className="mb-3 rounded-xl border border-rose-300/20 bg-rose-300/5 px-3 py-2 text-xs text-rose-200">
                        {error}
                    </p>
                )}

                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((item) => (
                            <div
                                key={item}
                                className="flex animate-pulse items-center gap-3"
                            >
                                <div className="size-10 rounded-full bg-white/10" />

                                <div className="min-w-0 flex-1 space-y-2">
                                    <div className="h-3 w-24 rounded bg-white/10" />
                                    <div className="h-2.5 w-16 rounded bg-white/10" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : suggestedUsers.length === 0 ? (
                    <p className="py-3 text-sm text-slate-500">
                        No other UniFeed members yet.
                    </p>
                ) : (
                    <div className="space-y-4">
                        {suggestedUsers.map((user) => (
                            <div
                                key={user.id}
                                className="flex items-center gap-3"
                            >
                                <Link
                                    to={`/profile/${user.id}`}
                                    className="grid size-10 shrink-0 place-items-center rounded-full bg-lime-300 font-bold text-slate-950 ring-2 ring-white/8"
                                    aria-label={`View ${getDisplayName(user)}'s profile`}
                                >
                                    {user.username?.charAt(0).toUpperCase() ||
                                        "U"}
                                </Link>

                                <div className="min-w-0 flex-1">
                                    <Link
                                        to={`/profile/${user.id}`}
                                        className="block truncate text-sm font-semibold text-white hover:text-lime-300"
                                    >
                                        {getDisplayName(user)}
                                    </Link>

                                    <p className="truncate text-xs text-slate-500">
                                        @{user.username}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => handleFollowToggle(user)}
                                    disabled={followLoadingId === user.id}
                                    className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                                        user.isFollowing
                                            ? "border border-lime-300/25 bg-lime-300/10 text-lime-300 hover:bg-lime-300/20"
                                            : "border border-white/10 text-slate-300 hover:border-lime-300/40 hover:text-lime-300"
                                    }`}
                                >
                                    {user.isFollowing ? (
                                        <Check className="size-3.5" />
                                    ) : (
                                        <UserPlus className="size-3.5" />
                                    )}

                                    {followLoadingId === user.id
                                        ? "..."
                                        : user.isFollowing
                                          ? "Following"
                                          : "Follow"}
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <Link
                    to="/explore"
                    className="mt-5 block text-sm font-semibold text-lime-300 hover:text-lime-200"
                >
                    See all people →
                </Link>
            </section>

            <section className="rounded-3xl border border-white/8 bg-white/[0.035] p-5">
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-lime-300/80">
                            Campus pulse
                        </p>

                        <h2 className="mt-1 font-semibold text-white">
                            Trending now
                        </h2>
                    </div>

                    <TrendingUp className="size-5 text-slate-500" />
                </div>

                <div className="space-y-4">
                    {[
                        "#finalsweek",
                        "#campuslife",
                        "#studybuddies",
                        "#weekendplans",
                    ].map((tag, index) => (
                        <div
                            key={tag}
                            className="group flex items-start justify-between gap-3"
                        >
                            <div>
                                <p className="text-xs text-slate-500">
                                    {index + 1} · Trending in UniFeed
                                </p>

                                <p className="mt-0.5 text-sm font-semibold text-slate-200 group-hover:text-lime-300">
                                    {tag}
                                </p>
                            </div>

                            <MoreHorizontal className="mt-1 size-4 text-slate-600" />
                        </div>
                    ))}
                </div>
            </section>

            <div className="flex items-center gap-3 px-2 text-xs text-slate-600">
                <MapPin className="size-3.5" />
                Unifeed campus community
            </div>
        </aside>
    );
}

export default RightSidebar;
