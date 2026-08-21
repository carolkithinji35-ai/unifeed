import { ChevronDown, Filter, Search, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import CampusPostCard from "../components/CampusPostCard";
import PostComposer from "../components/PostComposer";
import { campusPosts } from "../data/campusContent";

function Feed() {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            try {
                const response = await fetch(
                    "https://randomuser.me/api/?results=10",
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
        const query = searchTerm.toLowerCase();
        return fullName.includes(query) || username.includes(query);
    });

    return (
        <div className="motion-rise space-y-5">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                    <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-lime-300/80">
                        <Sparkles className="size-3.5" /> Community feed
                    </p>
                    <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                        Your feed
                    </h1>
                    <p className="mt-2 text-sm text-slate-500">
                        What’s happening around your campus.
                    </p>
                </div>
                <button
                    className="flex items-center gap-2 self-start rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-lime-300/30 hover:text-lime-300 sm:self-auto"
                    type="button"
                >
                    <Filter className="size-3.5" /> Curated{" "}
                    <ChevronDown className="size-3.5" />
                </button>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.035] px-4 py-3.5 shadow-xl shadow-black/10">
                <Search className="size-4 text-slate-500" />
                <input
                    type="text"
                    placeholder="Search people or usernames..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
                />
                <span className="hidden text-xs text-slate-600 sm:block">
                    {filteredUsers.length} people
                </span>
            </div>

            <div className="flex items-center gap-2 border-b border-white/8 pb-3 text-sm">
                <button
                    className="rounded-lg bg-lime-300 px-3 py-1.5 font-semibold text-slate-950"
                    type="button"
                >
                    For you
                </button>
                <button
                    className="rounded-lg px-3 py-1.5 text-slate-500 transition hover:bg-white/5 hover:text-white"
                    type="button"
                >
                    Following
                </button>
                <span className="ml-auto text-xs text-slate-600">
                    Live updates
                </span>
            </div>

            <PostComposer />

            {loading ? (
                <div className="grid place-items-center rounded-3xl border border-white/8 bg-white/[0.02] py-20 text-center">
                    <div className="size-8 animate-spin rounded-full border-2 border-lime-300 border-t-transparent" />
                    <p className="mt-3 text-sm text-slate-500">
                        Loading your feed...
                    </p>
                </div>
            ) : filteredUsers.length > 0 ? (
                <div className="space-y-4">
                    {campusPosts.slice(0, 2).map((post, index) => (
                        <CampusPostCard
                            key={post.text}
                            post={post}
                            index={index}
                        />
                    ))}
                    {campusPosts.slice(2).map((post, index) => (
                        <CampusPostCard
                            key={post.text}
                            post={post}
                            index={index + 2}
                        />
                    ))}
                </div>
            ) : (
                <div className="rounded-3xl border border-white/8 bg-white/[0.02] py-20 text-center text-sm text-slate-500">
                    No users found matching “{searchTerm}”
                </div>
            )}
        </div>
    );
}

export default Feed;
