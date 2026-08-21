import { MapPin, MoreHorizontal, TrendingUp, UsersRound } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function RightSidebar() {
    const [suggestedUsers, setSuggestedUsers] = useState([]);

    useEffect(() => {
        const fetchSuggestedUsers = async () => {
            try {
                const response = await fetch(
                    "https://randomuser.me/api/?results=5",
                );
                const data = await response.json();
                setSuggestedUsers(data.results);
            } catch (error) {
                console.error("Error fetching suggested users:", error);
            }
        };
        fetchSuggestedUsers();
    }, []);

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
                <div className="space-y-4">
                    {suggestedUsers.map((user) => (
                        <div
                            key={user.login.uuid}
                            className="flex items-center gap-3"
                        >
                            <Link to={`/profile/${user.login.uuid}`}>
                                <img
                                    src={user.picture.thumbnail}
                                    alt={user.name.first}
                                    className="size-10 rounded-full object-cover ring-2 ring-white/8"
                                />
                            </Link>
                            <div className="min-w-0 flex-1">
                                <Link
                                    to={`/profile/${user.login.uuid}`}
                                    className="block truncate text-sm font-semibold text-white hover:text-lime-300"
                                >
                                    {user.name.first} {user.name.last}
                                </Link>
                                <p className="truncate text-xs text-slate-500">
                                    @{user.login.username}
                                </p>
                            </div>
                            <button
                                type="button"
                                className="rounded-xl border border-white/10 px-2.5 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-lime-300/40 hover:text-lime-300"
                            >
                                Follow
                            </button>
                        </div>
                    ))}
                </div>
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
                <MapPin className="size-3.5" /> Nairobi campus community
            </div>
        </aside>
    );
}

export default RightSidebar;
