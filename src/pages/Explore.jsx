import { Compass, MapPin, Search, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Explore() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch(
                    "https://randomuser.me/api/?results=20",
                );
                const data = await response.json();
                setUsers(data.results);
                sessionStorage.setItem("users", JSON.stringify(data.results));
            } catch (error) {
                console.error("Error fetching users:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const filteredUsers = users.filter((user) => {
        const fullName = `${user.name.first} ${user.name.last}`.toLowerCase();
        const username = user.login.username.toLowerCase();
        const location =
            `${user.location.city} ${user.location.country}`.toLowerCase();
        const query = searchTerm.toLowerCase();
        return (
            fullName.includes(query) ||
            username.includes(query) ||
            location.includes(query)
        );
    });

    return (
        <div className="motion-rise space-y-5">
            <div>
                <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-lime-300/80">
                    <Compass className="size-3.5" /> Find your people
                </p>
                <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                    Explore
                </h1>
                <p className="mt-2 text-sm text-slate-500">
                    Meet students and communities from around the world.
                </p>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.035] px-4 py-3.5">
                <Search className="size-4 text-slate-500" />
                <input
                    type="text"
                    placeholder="Search by name, username, or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
                />
                <span className="text-xs text-slate-600">
                    {filteredUsers.length} results
                </span>
            </div>

            {loading ? (
                <div className="grid place-items-center rounded-3xl border border-white/8 bg-white/[0.02] py-20 text-center">
                    <div className="size-8 animate-spin rounded-full border-2 border-lime-300 border-t-transparent" />
                    <p className="mt-3 text-sm text-slate-500">
                        Finding people...
                    </p>
                </div>
            ) : filteredUsers.length === 0 ? (
                <div className="rounded-3xl border border-white/8 bg-white/[0.02] py-20 text-center text-sm text-slate-500">
                    No users found matching “{searchTerm}”
                </div>
            ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                    {filteredUsers.map((user) => (
                        <Link
                            key={user.login.uuid}
                            to={`/profile/${user.login.uuid}`}
                            className="group rounded-3xl border border-white/8 bg-white/[0.035] p-4 transition hover:-translate-y-0.5 hover:border-lime-300/30 hover:bg-white/[0.06]"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <img
                                    src={user.picture.large}
                                    alt={user.name.first}
                                    className="size-14 rounded-2xl object-cover ring-2 ring-white/8"
                                />
                                <span className="rounded-xl border border-white/10 p-2 text-slate-500 transition group-hover:border-lime-300/30 group-hover:text-lime-300">
                                    <UserPlus className="size-4" />
                                </span>
                            </div>
                            <p className="mt-4 font-semibold text-white group-hover:text-lime-300">
                                {user.name.first} {user.name.last}
                            </p>
                            <p className="mt-0.5 text-sm text-slate-500">
                                @{user.login.username}
                            </p>
                            <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-600">
                                <MapPin className="size-3.5" />{" "}
                                {user.location.city}, {user.location.country}
                            </p>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Explore;
