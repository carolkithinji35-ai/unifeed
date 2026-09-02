import { Bookmark, BookmarkX, LoaderCircle, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest, getCurrentUser } from "../lib/authApi";

function Bookmarks() {
    const navigate = useNavigate();
    const [bookmarks, setBookmarks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [removingId, setRemovingId] = useState(null);

    useEffect(() => {
        let cancelled = false;

        const loadBookmarks = async () => {
            try {
                const currentUser = await getCurrentUser();

                if (!currentUser) {
                    navigate("/signin");
                    return;
                }

                const data = await apiRequest("/api/bookmarks");

                if (!cancelled) {
                    setBookmarks(data);
                }
            } catch (requestError) {
                console.error("Error loading bookmarks:", requestError);

                if (requestError.status === 401) {
                    navigate("/signin");
                    return;
                }

                if (!cancelled) {
                    setError(
                        requestError.message ||
                            "Unable to load your bookmarked posts.",
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadBookmarks();

        return () => {
            cancelled = true;
        };
    }, [navigate]);

    const removeBookmark = async (postId) => {
        setRemovingId(postId);
        setError("");

        try {
            await apiRequest(`/api/posts/${postId}/bookmark`, {
                method: "DELETE",
            });

            setBookmarks((currentBookmarks) =>
                currentBookmarks.filter((post) => post.id !== postId),
            );

            window.dispatchEvent(new Event("unifeed:bookmarks-changed"));
        } catch (requestError) {
            console.error("Error removing bookmark:", requestError);

            if (requestError.status === 401) {
                navigate("/signin");
                return;
            }

            setError(requestError.message || "Unable to remove this bookmark.");
        } finally {
            setRemovingId(null);
        }
    };

    if (loading) {
        return (
            <div className="grid min-h-[60vh] place-items-center text-sm text-slate-500">
                <span className="flex items-center gap-2">
                    <LoaderCircle className="size-4 animate-spin text-lime-300" />
                    Loading your bookmarks...
                </span>
            </div>
        );
    }

    return (
        <div className="motion-rise space-y-6">
            <div>
                <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-lime-300/80">
                    <Bookmark className="size-3.5" /> Your collection
                </p>

                <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                    Bookmarks
                </h1>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                    Keep the posts and campus moments you want to revisit.
                </p>
            </div>

            {error && (
                <div className="rounded-2xl border border-rose-300/20 bg-rose-300/5 px-4 py-3 text-sm text-rose-200">
                    {error}
                </div>
            )}

            {bookmarks.length === 0 ? (
                <div className="grid min-h-90 place-items-center rounded-3xl border border-dashed border-white/10 bg-white/2 px-6 text-center">
                    <div>
                        <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-lime-300/10 text-lime-300">
                            <BookmarkX className="size-6" />
                        </div>

                        <h2 className="mt-4 font-semibold text-white">
                            Your collection starts here
                        </h2>

                        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                            Bookmark a useful post or memorable campus moment
                            and it will appear here.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    {bookmarks.map((post) => (
                        <article
                            key={post.id}
                            className="rounded-3xl border border-white/8 bg-white/[0.035] p-5 transition hover:border-lime-300/25 sm:p-6"
                        >
                            <div className="flex items-start gap-4">
                                <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-lime-300 text-sm font-bold text-slate-950">
                                    {post.author?.username
                                        ?.charAt(0)
                                        .toUpperCase() || "U"}
                                </div>

                                <div className="min-w-0 flex-1">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-semibold text-white">
                                                {post.author?.username ||
                                                    "UniFeed Campus Desk"}
                                            </p>

                                            <p className="mt-1 text-xs text-slate-600">
                                                Saved campus post
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                removeBookmark(post.id)
                                            }
                                            disabled={removingId === post.id}
                                            className="flex shrink-0 items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-slate-400 transition hover:border-rose-300/30 hover:text-rose-300 disabled:cursor-not-allowed disabled:opacity-50"
                                            aria-label="Remove bookmark"
                                        >
                                            <Trash2 className="size-3.5" />

                                            {removingId === post.id
                                                ? "Removing..."
                                                : "Remove"}
                                        </button>
                                    </div>

                                    <p className="mt-4 text-[15px] leading-7 text-slate-200">
                                        {post.content}
                                    </p>

                                    <div className="mt-5 flex flex-wrap gap-4 border-t border-white/8 pt-4 text-xs text-slate-500">
                                        <span>
                                            {post.like_count ?? 0} likes
                                        </span>

                                        <span>
                                            {post.repost_count ?? 0} reposts
                                        </span>

                                        <span>
                                            {post.comment_count ?? 0} comments
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Bookmarks;
