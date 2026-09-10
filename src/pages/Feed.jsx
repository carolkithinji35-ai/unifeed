import { ChevronDown, Filter, Search, Sparkles, UsersRound } from "lucide-react";
import { useEffect, useState } from "react";
import CampusPostCard from "../components/CampusPostCard";
import MobileFeedCapsules from "../components/MobileFeedCapsules";
import { apiRequest, getCurrentUser } from "../lib/authApi";

function Feed() {
    const [posts, setPosts] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [activeView, setActiveView] = useState("posts");
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        getCurrentUser()
            .then(setCurrentUser)
            .catch(() => setCurrentUser(null));
    }, []);

    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true);
            setError("");

            try {
                const data = await apiRequest("/api/posts");

                const formattedPosts = data.map((post) => ({
                    ...post,
                    text: post.content,
                    eyebrow: "Campus post",
                    tags: [],
                }));

                setPosts(formattedPosts);
            } catch (requestError) {
                console.error("Error fetching posts:", requestError);
                setError(
                    "We could not load the campus feed. Please try again.",
                );
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    const filteredPosts = posts.filter((post) => {
        const query = searchTerm.trim().toLowerCase();

        return (
            !query ||
            post.content.toLowerCase().includes(query) ||
            post.author?.username?.toLowerCase().includes(query)
        );
    });

    const handlePostUpdated = (updatedPost) => {
        const formattedPost = {
            ...updatedPost,
            text: updatedPost.content,
            eyebrow: "Campus post",
            tags: [],
        };

        setPosts((currentPosts) =>
            currentPosts.map((post) =>
                post.id === updatedPost.id ? formattedPost : post,
            ),
        );
    };

    const handlePostDeleted = (postId) => {
        setPosts((currentPosts) =>
            currentPosts.filter((post) => post.id !== postId),
        );
    };

    return (
        <div className="motion-rise min-w-0 space-y-5">
            <div className="flex min-w-0 flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div className="min-w-0">
                    <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-lime-300/80">
                        <Sparkles className="size-3.5" />
                        Community feed
                    </p>

                    <h1 className="break-words text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                        Your feed
                    </h1>

                    <p className="mt-2 text-sm text-slate-500">
                        What’s happening around your campus.
                    </p>
                </div>

                <button
                    className="flex shrink-0 items-center gap-2 self-start rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-lime-300/30 hover:text-lime-300 sm:self-auto"
                    type="button"
                >
                    <Filter className="size-3.5" />
                    Curated
                    <ChevronDown className="size-3.5" />
                </button>
            </div>

            <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.035] px-4 py-3.5 shadow-xl shadow-black/10">
                <Search className="size-4 shrink-0 text-slate-500" />

                <input
                    type="text"
                    placeholder="Search campus posts..."
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
                />

                <span className="hidden shrink-0 text-xs text-slate-600 sm:block">
                    {filteredPosts.length} posts
                </span>
            </div>

            <MobileFeedCapsules
                activeView={activeView}
                onChange={setActiveView}
            />

            <div className="hidden items-center gap-2 border-b border-white/8 pb-3 text-sm lg:flex">
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

            {activeView === "posts" && (
                <PostsView
                    loading={loading}
                    error={error}
                    posts={filteredPosts}
                    searchTerm={searchTerm}
                    currentUser={currentUser}
                    onDeleted={handlePostDeleted}
                    onUpdated={handlePostUpdated}
                />
            )}

            {activeView === "following" && <FollowingView />}
        </div>
    );
}

function PostsView({
    loading,
    error,
    posts,
    searchTerm,
    currentUser,
    onDeleted,
    onUpdated,
}) {
    if (loading) {
        return (
            <div className="grid place-items-center rounded-3xl border border-white/8 bg-white/[0.02] py-20 text-center">
                <div className="size-8 animate-spin rounded-full border-2 border-lime-300 border-t-transparent" />
                <p className="mt-3 text-sm text-slate-500">
                    Loading your feed...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-3xl border border-rose-400/20 bg-rose-400/5 py-20 text-center text-sm text-rose-300">
                {error}
            </div>
        );
    }

    if (posts.length === 0) {
        return (
            <div className="rounded-3xl border border-white/8 bg-white/[0.02] py-20 text-center text-sm text-slate-500">
                {searchTerm
                    ? `No posts found matching “${searchTerm}”`
                    : "No posts yet. Be the first to start the conversation."}
            </div>
        );
    }

    return (
        <div className="min-w-0 space-y-4">
            {posts.map((post, index) => (
                <CampusPostCard
                    key={post.id}
                    post={post}
                    index={index}
                    currentUser={currentUser}
                    onDeleted={onDeleted}
                    onUpdated={onUpdated}
                />
            ))}
        </div>
    );
}

function FollowingView() {
    return (
        <div className="rounded-3xl border border-white/8 bg-white/[0.02] px-6 py-16 text-center">
            <UsersRound className="mx-auto size-8 text-lime-300/70" />
            <h2 className="mt-4 text-lg font-semibold text-white">
                Your following feed
            </h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                Posts from people you follow will appear here when the following
                feed endpoint is connected.
            </p>
        </div>
    );
}

export default Feed;
