import { ArrowLeft, CalendarDays, Globe2, Mail, MapPin } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiRequest, getCurrentUser } from "../lib/authApi";

function Profile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadProfile = async () => {
            setLoading(true);
            setError("");

            try {
                const currentUser = await getCurrentUser();

                if (String(currentUser.id) !== String(id)) {
                    throw new Error(
                        "Only your authenticated profile is available right now.",
                    );
                }

                const allPosts = await apiRequest("/api/posts");
                const ownPosts = allPosts.filter(
                    (post) => String(post.author_id) === String(currentUser.id),
                );

                setUser(currentUser);
                setPosts(ownPosts);
            } catch (requestError) {
                console.error("Error loading profile:", requestError);
                setError(
                    requestError.message || "Unable to load this profile.",
                );
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, [id]);

    const initials = useMemo(
        () => user?.username?.charAt(0).toUpperCase() || "U",
        [user],
    );

    if (loading) {
        return (
            <div className="grid min-h-[60vh] place-items-center text-sm text-slate-500">
                Loading profile...
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="grid min-h-[60vh] place-items-center rounded-3xl border border-white/8 bg-white/[0.035] px-5 text-center text-sm text-rose-300">
                {error || "Profile could not be loaded."}
            </div>
        );
    }

    return (
        <div className="motion-rise overflow-hidden rounded-3xl border border-white/8 bg-white/[0.035]">
            <div className="relative h-36 bg-[radial-gradient(circle_at_20%_20%,rgba(163,230,53,0.5),transparent_30%),linear-gradient(120deg,#17212a,#29331d_55%,#10151b)] sm:h-48">
                <button
                    onClick={() => navigate(-1)}
                    type="button"
                    className="absolute left-4 top-4 grid size-9 place-items-center rounded-xl border border-white/15 bg-black/20 text-white backdrop-blur transition hover:bg-black/40"
                    aria-label="Go back"
                >
                    <ArrowLeft className="size-4" />
                </button>
                <div className="absolute bottom-0 left-5 grid size-24 translate-y-1/2 place-items-center rounded-3xl border-4 border-[#0b0d10] bg-lime-300 text-4xl font-bold text-slate-950 shadow-xl sm:size-28">
                    {initials}
                </div>
            </div>

            <div className="px-5 pb-6 pt-16 sm:px-7 sm:pt-20">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div>
                        <h1 className="text-2xl font-semibold text-white">
                            {user.username}
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            @{user.username}
                        </p>
                    </div>
                    <span className="rounded-xl border border-lime-300/20 bg-lime-300/10 px-4 py-2 text-sm font-semibold text-lime-300">
                        Your profile
                    </span>
                </div>

                <p className="mt-5 max-w-xl text-sm leading-6 text-slate-400">
                    Student, creative thinker, and part of the UniFeed
                    community. Sharing the little moments that make campus life
                    memorable.
                </p>

                <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5">
                        <MapPin className="size-3.5" /> Campus community
                    </span>
                    <span className="flex items-center gap-1.5">
                        <Mail className="size-3.5" /> {user.email}
                    </span>
                    <span className="flex items-center gap-1.5">
                        <CalendarDays className="size-3.5" /> Joined recently
                    </span>
                </div>

                <div className="mt-6 flex gap-6 text-sm">
                    <span>
                        <strong className="text-white">{posts.length}</strong>{" "}
                        <span className="text-slate-500">Posts</span>
                    </span>
                    <span>
                        <strong className="text-white">0</strong>{" "}
                        <span className="text-slate-500">Following</span>
                    </span>
                    <span>
                        <strong className="text-white">0</strong>{" "}
                        <span className="text-slate-500">Followers</span>
                    </span>
                </div>
            </div>

            <div className="border-t border-white/8 px-5 sm:px-7">
                <nav
                    className="flex gap-6 overflow-auto"
                    aria-label="Profile tabs"
                >
                    {["Posts", "Replies", "Media", "Likes"].map(
                        (tab, index) => (
                            <button
                                key={tab}
                                type="button"
                                className={`whitespace-nowrap border-b-2 py-4 text-sm font-semibold ${index === 0 ? "border-lime-300 text-white" : "border-transparent text-slate-600 hover:text-slate-300"}`}
                            >
                                {tab}
                            </button>
                        ),
                    )}
                </nav>
            </div>

            {posts.length > 0 ? (
                <div className="space-y-3 border-t border-white/8 px-5 py-5 sm:px-7">
                    {posts.map((post) => (
                        <article
                            key={post.id}
                            className="rounded-2xl border border-white/8 bg-white/[0.025] p-4"
                        >
                            <p className="text-sm leading-6 text-slate-200">
                                {post.content}
                            </p>
                            <p className="mt-3 text-xs text-slate-600">
                                {post.comment_count ?? 0} comments
                            </p>
                        </article>
                    ))}
                </div>
            ) : (
                <div className="grid place-items-center border-t border-white/8 px-5 py-20 text-center text-sm text-slate-500">
                    <div className="mb-3 grid size-12 place-items-center rounded-2xl bg-white/5 text-slate-600">
                        <Globe2 className="size-5" />
                    </div>
                    No posts yet—your posts will appear here.
                </div>
            )}
        </div>
    );
}

export default Profile;
