import { Compass, MapPin, Search, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest, getCurrentUser } from "../lib/authApi";

function getDisplayName(user) {
    const fullName = [user.first_name, user.last_name]
        .filter(Boolean)
        .join(" ");

    return fullName || user.username;
}

function Explore() {
    const navigate = useNavigate();
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
        <div className="motion-rise space-y-5">
            <div>
                <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-lime-300/80">
                    <Compass className="size-3.5" />
                    Find your people
                </p>

                <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                    Explore
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                    Meet real members of the UniFeed community.
                </p>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.035] px-4 py-3.5">
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
        </div>
    );
}

export default Explore;
