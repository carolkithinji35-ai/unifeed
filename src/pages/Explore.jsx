import {
    ArrowUpRight,
    CalendarDays,
    Compass,
    MapPin,
    Search,
    UserRound,
    UsersRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { campusEvents, communities } from "../data/campusContent";
import { apiRequest, getCurrentUser } from "../lib/authApi";

const exploreCapsules = [
    { id: "people", label: "People", icon: UserRound },
    { id: "events", label: "Events", icon: CalendarDays },
    { id: "communities", label: "Communities", icon: UsersRound },
];

function getDisplayName(user) {
    const fullName = [user.first_name, user.last_name]
        .filter(Boolean)
        .join(" ");

    return fullName || user.username;
}

function Explore() {
    const navigate = useNavigate();
    const [activeView, setActiveView] = useState("people");
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        const fetchUsers = async () => {
            setLoading(true);
            setError("");

            try {
                const currentUser = await getCurrentUser();

                if (!currentUser) {
                    navigate("/signin");
                    return;
                }

                const data = await apiRequest("/api/users");

                if (!cancelled) {
                    setUsers(data);
                }
            } catch (requestError) {
                console.error("Error fetching users:", requestError);

                if (requestError.status === 401) {
                    navigate("/signin");
                    return;
                }

                if (!cancelled) {
                    setError(
                        requestError.message ||
                            "Unable to load UniFeed members.",
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        fetchUsers();

        return () => {
            cancelled = true;
        };
    }, [navigate]);

    const query = searchTerm.trim().toLowerCase();

    const filteredUsers = users.filter((user) => {
        const displayName = getDisplayName(user).toLowerCase();
        const username = user.username.toLowerCase();
        const location = (user.location || "").toLowerCase();

        return (
            displayName.includes(query) ||
            username.includes(query) ||
            location.includes(query)
        );
    });

    return (
        <div className="motion-rise min-w-0 space-y-5">
            <div>
                <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-lime-300/80">
                    <Compass className="size-3.5" />
                    Find your people
                </p>

                <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                    Explore
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                    Meet people, discover events, and find campus communities.
                </p>
            </div>

            <nav
                className="sidebar-scroll -mx-1 flex snap-x snap-mandatory gap-2 overflow-x-auto px-1 pb-1 lg:hidden"
                aria-label="Explore sections"
            >
                {exploreCapsules.map(({ id, label, icon: Icon }) => {
                    const active = activeView === id;

                    return (
                        <button
                            key={id}
                            type="button"
                            onClick={() => setActiveView(id)}
                            aria-current={active ? "page" : undefined}
                            className={`inline-flex min-w-max snap-start items-center gap-2 rounded-full border px-4 py-2.5 text-xs font-semibold transition active:scale-[0.98] ${
                                active
                                    ? "border-lime-300 bg-lime-300 text-slate-950 shadow-[0_8px_24px_rgba(163,230,53,0.16)]"
                                    : "border-white/10 bg-white/[0.045] text-slate-400 hover:border-lime-300/30 hover:text-white"
                            }`}
                        >
                            <Icon className="size-3.5" strokeWidth={2.2} />
                            {label}
                        </button>
                    );
                })}
            </nav>

            {activeView === "people" && (
                <PeopleView
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    filteredUsers={filteredUsers}
                    users={users}
                    loading={loading}
                    error={error}
                />
            )}

            {activeView === "events" && <EventsView />}
            {activeView === "communities" && <CommunitiesView />}
        </div>
    );
}

function PeopleView({
    searchTerm,
    setSearchTerm,
    filteredUsers,
    users,
    loading,
    error,
}) {
    return (
        <>
            <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.035] px-4 py-3.5">
                <Search className="size-4 shrink-0 text-slate-500" />

                <input
                    type="text"
                    placeholder="Search by name, username, or location..."
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
                />

                <span className="shrink-0 text-xs text-slate-600">
                    {filteredUsers.length} results
                </span>
            </div>

            {error && (
                <div className="rounded-2xl border border-rose-300/20 bg-rose-300/5 px-4 py-3 text-sm text-rose-200">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="grid place-items-center rounded-3xl border border-white/8 bg-white/[0.02] py-20 text-center">
                    <div className="size-8 animate-spin rounded-full border-2 border-lime-300 border-t-transparent" />

                    <p className="mt-3 text-sm text-slate-500">
                        Finding UniFeed members...
                    </p>
                </div>
            ) : filteredUsers.length === 0 ? (
                <div className="rounded-3xl border border-white/8 bg-white/[0.02] py-20 text-center text-sm text-slate-500">
                    {users.length === 0
                        ? "No other registered members found yet."
                        : `No users found matching “${searchTerm}”`}
                </div>
            ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                    {filteredUsers.map((user) => (
                        <Link
                            key={user.id}
                            to={`/profile/${user.id}`}
                            className="group rounded-3xl border border-white/8 bg-white/[0.035] p-4 transition hover:-translate-y-0.5 hover:border-lime-300/30 hover:bg-white/[0.06]"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="grid size-14 place-items-center rounded-2xl bg-lime-300 text-xl font-bold text-slate-950 ring-2 ring-white/8">
                                    {user.username?.charAt(0).toUpperCase() ||
                                        "U"}
                                </div>

                                <span className="rounded-xl border border-white/10 p-2 text-slate-500 transition group-hover:border-lime-300/30 group-hover:text-lime-300">
                                    <UserRound className="size-4" />
                                </span>
                            </div>

                            <p className="mt-4 font-semibold text-white group-hover:text-lime-300">
                                {getDisplayName(user)}
                            </p>

                            <p className="mt-0.5 text-sm text-slate-500">
                                @{user.username}
                            </p>

                            <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-600">
                                <MapPin className="size-3.5" />
                                {user.location || "UniFeed community"}
                            </p>
                        </Link>
                    ))}
                </div>
            )}
        </>
    );
}

function EventsView() {
    return (
        <section className="space-y-4">
            <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-lime-300/80">
                    Campus calendar
                </p>
                <h2 className="mt-1 text-xl font-semibold text-white">
                    Upcoming events
                </h2>
            </div>

            <div className="min-w-0 space-y-4">
                {campusEvents.map((event) => (
                    <article
                        key={event.title}
                        className="group min-w-0 overflow-hidden rounded-3xl border border-white/8 bg-white/[0.035] transition hover:border-lime-300/30 hover:bg-white/[0.055]"
                    >
                        <div
                            className={`h-2 ${
                                event.tone === "lime"
                                    ? "bg-lime-300"
                                    : event.tone === "violet"
                                      ? "bg-violet-400"
                                      : "bg-sky-400"
                            }`}
                        />

                        <div className="flex min-w-0 flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-6">
                            <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-white/6 text-lime-300">
                                <CalendarDays className="size-6" />
                            </div>

                            <div className="min-w-0 flex-1">
                                <h2 className="break-words font-semibold text-white">
                                    {event.title}
                                </h2>
                                <p className="mt-1 break-words text-sm text-lime-300/80">
                                    {event.meta}
                                </p>
                                <p className="mt-2 break-words text-sm leading-6 text-slate-500">
                                    {event.detail}
                                </p>
                            </div>

                            <button
                                type="button"
                                className="flex shrink-0 items-center gap-2 self-start rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-lime-300/30 hover:text-lime-300 sm:self-auto"
                            >
                                View details
                                <ArrowUpRight className="size-3.5" />
                            </button>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}

function CommunitiesView() {
    return (
        <section className="space-y-4">
            <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-lime-300/80">
                    Find your people
                </p>
                <h2 className="mt-1 text-xl font-semibold text-white">
                    Campus communities
                </h2>
            </div>

            <div className="grid min-w-0 gap-4 sm:grid-cols-2">
                {communities.map((community) => (
                    <article
                        key={community.name}
                        className="min-w-0 overflow-hidden rounded-3xl border border-white/8 bg-white/[0.035] p-5 transition hover:border-lime-300/30 hover:bg-white/[0.055]"
                    >
                        <div className="flex min-w-0 items-start justify-between gap-3">
                            <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-lime-300/15 font-semibold text-lime-300">
                                {community.initials}
                            </div>

                            <UsersRound className="size-5 shrink-0 text-lime-300/70" />
                        </div>

                        <h2 className="mt-5 min-w-0 break-words font-semibold text-white">
                            {community.name}
                        </h2>
                        <p className="mt-1 break-words text-xs text-lime-300/80">
                            {community.members}
                        </p>
                        <p className="mt-3 min-w-0 break-words text-sm leading-6 text-slate-500">
                            {community.description}
                        </p>

                        <button
                            type="button"
                            className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-slate-300 transition hover:text-lime-300"
                        >
                            View details
                            <ArrowUpRight className="size-4" />
                        </button>
                    </article>
                ))}
            </div>
        </section>
    );
}

export default Explore;
