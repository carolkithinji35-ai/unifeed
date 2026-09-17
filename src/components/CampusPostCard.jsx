import {
    Bookmark,
    ChevronDown,
    Edit3,
    Flag,
    Heart,
    MessageCircle,
    Repeat2,
    Send,
    Share2,
    Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../lib/authApi";

function formatRelativeTime(createdAt) {
    if (!createdAt) return "Just now";

    const createdTime = new Date(createdAt).getTime();

    if (Number.isNaN(createdTime)) return "Just now";

    const elapsedSeconds = Math.max(
        0,
        Math.floor((Date.now() - createdTime) / 1000),
    );

    if (elapsedSeconds < 60) return "Just now";

    const elapsedMinutes = Math.floor(elapsedSeconds / 60);

    if (elapsedMinutes < 60) {
        return `${elapsedMinutes}m ago`;
    }

    const elapsedHours = Math.floor(elapsedMinutes / 60);

    if (elapsedHours < 24) {
        return `${elapsedHours}h ago`;
    }

    const elapsedDays = Math.floor(elapsedHours / 24);

    if (elapsedDays < 7) {
        return `${elapsedDays}d ago`;
    }

    const elapsedWeeks = Math.floor(elapsedDays / 7);

    if (elapsedWeeks < 4) {
        return `${elapsedWeeks}w ago`;
    }

    return new Date(createdAt).toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function CampusPostCard({ post, currentUser, onDeleted, onUpdated }) {
    const navigate = useNavigate();

    const [relativeTime, setRelativeTime] = useState(() =>
        formatRelativeTime(post.created_at),
    );
    const [liked, setLiked] = useState(Boolean(post.liked_by_current_user));
    const [likes, setLikes] = useState(post.like_count ?? 0);
    const [reposted, setReposted] = useState(
        Boolean(post.reposted_by_current_user),
    );
    const [reposts, setReposts] = useState(post.repost_count ?? 0);
    const [bookmarked, setBookmarked] = useState(
        Boolean(post.bookmarked_by_current_user),
    );
    const [comments, setComments] = useState([]);
    const [commentCount, setCommentCount] = useState(post.comment_count ?? 0);
    const [commentsOpen, setCommentsOpen] = useState(false);
    const [commentText, setCommentText] = useState("");
    const [commentsLoading, setCommentsLoading] = useState(false);
    const [commentSubmitting, setCommentSubmitting] = useState(false);
    const [commentError, setCommentError] = useState("");
    const [deleting, setDeleting] = useState(false);
    const [editing, setEditing] = useState(false);
    const [editText, setEditText] = useState(post.text || post.content || "");
    const [savingEdit, setSavingEdit] = useState(false);
    const [socialActionLoading, setSocialActionLoading] = useState("");
    const [reportTarget, setReportTarget] = useState(null);
    const [reportReason, setReportReason] = useState("spam");
    const [reportSubmitting, setReportSubmitting] = useState(false);
    const [reportMenuOpen, setReportMenuOpen] = useState(false);
    const [reportSuccess, setReportSuccess] = useState(false);
    const [reportedPost, setReportedPost] = useState(false);
    const [reportedComments, setReportedComments] = useState(() => new Set());

    useEffect(() => {
        const updateRelativeTime = () => {
            setRelativeTime(formatRelativeTime(post.created_at));
        };

        updateRelativeTime();

        const intervalId = window.setInterval(updateRelativeTime, 30 * 1000);

        return () => window.clearInterval(intervalId);
    }, [post.created_at]);

    const applyPostState = (data) => {
        setLiked(Boolean(data.liked_by_current_user));
        setLikes(data.like_count ?? 0);
        setReposted(Boolean(data.reposted_by_current_user));
        setReposts(data.repost_count ?? 0);
        setBookmarked(Boolean(data.bookmarked_by_current_user));
    };

    const handleSaveEdit = async () => {
        if (!editText.trim()) {
            setCommentError("Post content cannot be empty.");
            return;
        }

        setSavingEdit(true);
        setCommentError("");

        try {
            const updatedPost = await apiRequest(`/api/posts/${post.id}`, {
                method: "PATCH",
                body: JSON.stringify({ content: editText.trim() }),
            });

            onUpdated?.(updatedPost);
            setEditing(false);
        } catch (error) {
            console.error("Error updating post:", error);
            setCommentError(error.message || "Unable to update this post.");
        } finally {
            setSavingEdit(false);
        }
    };

    const openReportModal = (target) => {
        if (!currentUser) {
            navigate("/signin");
            return;
        }

        setReportReason("spam");
        setReportTarget(target);
        setReportMenuOpen(false);
        setReportSuccess(false);
        setCommentError("");
    };

    const closeReportModal = () => {
        if (reportSubmitting) return;
        setReportTarget(null);
        setReportReason("spam");
        setReportMenuOpen(false);
        setReportSuccess(false);
    };

    const submitReport = async (event) => {
        event.preventDefault();
        if (!reportTarget || !reportReason) return;

        setReportSubmitting(true);
        setCommentError("");

        const endpoint =
            reportTarget.type === "post"
                ? `/api/posts/${reportTarget.id}/report`
                : `/api/comments/${reportTarget.id}/report`;

        try {
            await apiRequest(endpoint, {
                method: "POST",
                body: JSON.stringify({ reason: reportReason }),
            });
            if (reportTarget.type === "post") {
                setReportedPost(true);
            } else {
                setReportedComments(
                    (current) => new Set([...current, reportTarget.id]),
                );
            }
            setReportSuccess(true);
            setReportMenuOpen(false);
            setCommentError("");

            window.setTimeout(() => {
                setReportTarget(null);
                setReportReason("spam");
                setReportMenuOpen(false);
                setReportSuccess(false);
            }, 1500);
        } catch (error) {
            setCommentError(error.message || "Unable to submit this report.");
        } finally {
            setReportSubmitting(false);
        }
    };

    const handleDeleteComment = async (commentId) => {
        try {
            await apiRequest(`/api/comments/${commentId}`, {
                method: "DELETE",
            });

            setComments((currentComments) =>
                currentComments.filter((comment) => comment.id !== commentId),
            );
            setCommentCount((currentCount) => Math.max(0, currentCount - 1));
        } catch (error) {
            console.error("Error deleting comment:", error);
            setCommentError(error.message || "Unable to delete this comment.");
        }
    };

    const handleDelete = async () => {
        if (!currentUser || post.author_id !== currentUser.id) return;

        const confirmed = window.confirm(
            "Delete this post? This action cannot be undone.",
        );

        if (!confirmed) return;

        setDeleting(true);
        setCommentError("");

        try {
            await apiRequest(`/api/posts/${post.id}`, {
                method: "DELETE",
            });

            onDeleted?.(post.id);
        } catch (error) {
            console.error("Error deleting post:", error);
            setCommentError(error.message || "Unable to delete this post.");
        } finally {
            setDeleting(false);
        }
    };

    const handleLike = async () => {
        if (!currentUser) {
            navigate("/signin");
            return;
        }

        setSocialActionLoading("like");
        setCommentError("");

        try {
            const data = await apiRequest(`/api/posts/${post.id}/like`, {
                method: liked ? "DELETE" : "POST",
            });

            applyPostState(data);
        } catch (error) {
            console.error("Error updating like:", error);

            if (error.status === 401) {
                navigate("/signin");
            } else {
                setCommentError(error.message || "Unable to update this like.");
            }
        } finally {
            setSocialActionLoading("");
        }
    };

    const handleRepost = async () => {
        if (!currentUser) {
            navigate("/signin");
            return;
        }

        setSocialActionLoading("repost");
        setCommentError("");

        try {
            const data = await apiRequest(`/api/posts/${post.id}/repost`, {
                method: reposted ? "DELETE" : "POST",
            });

            applyPostState(data);
        } catch (error) {
            console.error("Error updating repost:", error);

            if (error.status === 401) {
                navigate("/signin");
            } else {
                setCommentError(
                    error.message || "Unable to update this repost.",
                );
            }
        } finally {
            setSocialActionLoading("");
        }
    };

    const handleBookmark = async () => {
        if (!currentUser) {
            navigate("/signin");
            return;
        }

        setSocialActionLoading("bookmark");
        setCommentError("");

        try {
            const data = await apiRequest(`/api/posts/${post.id}/bookmark`, {
                method: bookmarked ? "DELETE" : "POST",
            });

            applyPostState(data);

            window.dispatchEvent(
                new Event(
                    data.bookmarked_by_current_user
                        ? "unifeed:bookmark-added"
                        : "unifeed:bookmark-removed",
                ),
            );
        } catch (error) {
            console.error("Error updating bookmark:", error);

            if (error.status === 401) {
                navigate("/signin");
            } else {
                setCommentError(
                    error.message || "Unable to update this bookmark.",
                );
            }
        } finally {
            setSocialActionLoading("");
        }
    };

    const handleShare = async () => {
        const shareData = {
            title: "UniFeed campus post",
            text: post.text || post.content,
            url: window.location.href,
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else if (navigator.clipboard) {
                await navigator.clipboard.writeText(window.location.href);
                setCommentError("Post link copied to your clipboard.");
            }
        } catch (error) {
            if (error.name !== "AbortError") {
                setCommentError("Unable to share this post.");
            }
        }
    };

    const loadComments = async () => {
        const nextOpenState = !commentsOpen;
        setCommentsOpen(nextOpenState);

        if (!nextOpenState || comments.length > 0) return;

        setCommentsLoading(true);
        setCommentError("");

        try {
            const data = await apiRequest(`/api/posts/${post.id}/comments`);

            setComments(data);
            setCommentCount(data.length);
        } catch (error) {
            console.error("Error loading comments:", error);
            setCommentError("Comments could not be loaded.");
        } finally {
            setCommentsLoading(false);
        }
    };

    const submitComment = async (event) => {
        event.preventDefault();

        if (!commentText.trim()) return;

        if (!currentUser) {
            navigate("/signin");
            return;
        }

        setCommentSubmitting(true);
        setCommentError("");

        try {
            const data = await apiRequest(`/api/posts/${post.id}/comments`, {
                method: "POST",
                body: JSON.stringify({
                    content: commentText.trim(),
                }),
            });

            setComments((currentComments) => [...currentComments, data]);
            setCommentCount((currentCount) => currentCount + 1);
            setCommentText("");
            setCommentsOpen(true);
        } catch (error) {
            console.error("Error creating comment:", error);

            if (error.status === 401) {
                navigate("/signin");
                return;
            }

            setCommentError(error.message || "Unable to add this comment.");
        } finally {
            setCommentSubmitting(false);
        }
    };

    return (
        <article className="rounded-3xl border border-lime-300/10 bg-[linear-gradient(135deg,rgba(163,230,53,0.06),rgba(255,255,255,0.035)_44%)] p-5 transition hover:border-lime-300/25 hover:bg-white/[0.055] sm:p-6">
            <div className="flex items-start gap-4">
                {post.author_id ? (
                    <Link
                        to={`/profile/${post.author_id}`}
                        className="grid size-11 shrink-0 place-items-center rounded-2xl bg-lime-300 text-sm font-bold text-slate-950 transition hover:ring-2 hover:ring-lime-300/50"
                        aria-label={`Open ${post.author?.username || "student"}'s profile`}
                    >
                        {post.author?.username?.charAt(0).toUpperCase() || "U"}
                    </Link>
                ) : (
                    <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-lime-300 text-sm font-bold text-slate-950">
                        {post.author?.username?.charAt(0).toUpperCase() || "U"}
                    </div>
                )}

                <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                {post.author_id ? (
                                    <Link
                                        to={`/profile/${post.author_id}`}
                                        className="text-sm font-semibold text-white transition hover:text-lime-300"
                                    >
                                        {post.author?.username ||
                                            "UniFeed Campus Desk"}
                                    </Link>
                                ) : (
                                    <span className="text-sm font-semibold text-white">
                                        {post.author?.username ??
                                            "UniFeed Campus Desk"}
                                    </span>
                                )}

                                <span className="rounded-full bg-lime-300/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-lime-300">
                                    {post.eyebrow || "Campus post"}
                                </span>
                            </div>

                            <p className="mt-1 text-xs text-slate-600">
                                Community post · {relativeTime}
                            </p>
                        </div>

                        <div className="flex items-center gap-1">
                            {currentUser?.id !== post.author_id && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        openReportModal({
                                            type: "post",
                                            id: post.id,
                                        })
                                    }
                                    className={`rounded-lg p-1 transition hover:bg-lime-300/10 ${
                                        reportedPost
                                            ? "text-lime-300"
                                            : "text-slate-600 hover:text-lime-300"
                                    }`}
                                    aria-label="Report this post"
                                    title="Report post"
                                >
                                    <Flag
                                        className="size-4"
                                        fill={
                                            reportedPost
                                                ? "currentColor"
                                                : "none"
                                        }
                                    />
                                </button>
                            )}

                            {currentUser?.id === post.author_id && (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => setEditing(true)}
                                        className="rounded-lg p-1 text-slate-600 transition hover:bg-lime-300/10 hover:text-lime-300"
                                        aria-label="Edit your post"
                                        title="Edit your post"
                                    >
                                        <Edit3 className="size-4" />
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleDelete}
                                        disabled={deleting}
                                        className="rounded-lg p-1 text-slate-600 transition hover:bg-rose-300/10 hover:text-rose-300 disabled:opacity-50"
                                        aria-label="Delete your post"
                                        title="Delete your post"
                                    >
                                        <Trash2 className="size-4" />
                                    </button>
                                </>
                            )}

                            <button
                                type="button"
                                onClick={handleBookmark}
                                disabled={socialActionLoading === "bookmark"}
                                className={`rounded-lg p-1 transition hover:bg-white/8 ${
                                    bookmarked
                                        ? "text-lime-300"
                                        : "text-slate-600 hover:text-white"
                                } disabled:opacity-50`}
                                aria-label={
                                    bookmarked
                                        ? "Remove bookmark"
                                        : "Save campus post"
                                }
                                title={
                                    bookmarked ? "Remove bookmark" : "Save post"
                                }
                            >
                                <Bookmark
                                    className="size-4"
                                    fill={bookmarked ? "currentColor" : "none"}
                                />
                            </button>
                        </div>
                    </div>

                    {editing ? (
                        <div className="mt-4 space-y-3">
                            <textarea
                                value={editText}
                                onChange={(event) =>
                                    setEditText(event.target.value)
                                }
                                rows="3"
                                className="w-full resize-none rounded-xl border border-lime-300/30 bg-black/20 px-3 py-2 text-sm leading-6 text-white outline-none"
                            />

                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={handleSaveEdit}
                                    disabled={savingEdit}
                                    className="rounded-lg bg-lime-300 px-3 py-1.5 text-xs font-bold text-slate-950 disabled:opacity-60"
                                >
                                    {savingEdit ? "Saving..." : "Save changes"}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditText(
                                            post.text || post.content || "",
                                        );
                                        setEditing(false);
                                    }}
                                    className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-white"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <p className="mt-4 text-[15px] leading-7 text-slate-200">
                            {post.text || post.content}
                        </p>
                    )}

                    {post.tags?.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                            {post.tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="rounded-full bg-white/6 px-2.5 py-1 text-[11px] font-medium text-slate-500"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}

                    {post.image_url && (
                        <img
                            src={post.image_url}
                            alt="Campus post"
                            className="mt-4 max-h-80 w-full rounded-2xl object-cover"
                        />
                    )}

                    <div className="mt-5 flex items-center justify-between gap-1 border-t border-white/8 pt-4 text-xs text-slate-500 sm:justify-start sm:gap-7">
                        <button
                            type="button"
                            onClick={loadComments}
                            className={`flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 transition sm:flex-none sm:justify-start sm:gap-2 ${
                                commentsOpen
                                    ? "text-sky-300"
                                    : "hover:bg-white/[0.04] hover:text-sky-300"
                            }`}
                            aria-label={`View ${commentCount} ${
                                commentCount === 1 ? "comment" : "comments"
                            }`}
                            title="Comments"
                        >
                            <MessageCircle className="size-4 shrink-0" />

                            <span className="sm:hidden">{commentCount}</span>

                            <span className="hidden sm:inline">
                                {commentCount}{" "}
                                {commentCount === 1 ? "comment" : "comments"}
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={handleRepost}
                            disabled={socialActionLoading === "repost"}
                            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 transition sm:flex-none sm:justify-start sm:gap-2 ${
                                reposted
                                    ? "text-lime-300"
                                    : "hover:bg-white/[0.04] hover:text-lime-300"
                            } disabled:opacity-50`}
                            aria-label={
                                reposted
                                    ? `Undo repost. ${reposts} reposts`
                                    : `Repost campus post. ${reposts} reposts`
                            }
                            title={reposted ? "Undo repost" : "Repost"}
                        >
                            <Repeat2 className="size-4 shrink-0" />
                            <span>{reposts}</span>
                        </button>

                        <button
                            type="button"
                            onClick={handleLike}
                            disabled={socialActionLoading === "like"}
                            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 transition sm:flex-none sm:justify-start sm:gap-2 ${
                                liked
                                    ? "text-rose-400"
                                    : "hover:bg-white/[0.04] hover:text-rose-400"
                            } disabled:opacity-50`}
                            aria-label={
                                liked
                                    ? `Unlike campus post. ${likes} likes`
                                    : `Like campus post. ${likes} likes`
                            }
                            title={liked ? "Unlike" : "Like"}
                        >
                            <Heart
                                className="size-4 shrink-0"
                                fill={liked ? "currentColor" : "none"}
                            />

                            <span>{likes}</span>
                        </button>

                        <button
                            type="button"
                            onClick={handleShare}
                            className="flex shrink-0 items-center justify-center rounded-lg p-1.5 transition hover:bg-white/[0.04] hover:text-sky-300 sm:ml-auto"
                            aria-label="Share campus post"
                            title="Share"
                        >
                            <Share2 className="size-4" />
                        </button>
                    </div>

                    {commentsOpen && (
                        <div className="mt-4 border-t border-white/8 pt-4">
                            {commentsLoading && (
                                <p className="text-xs text-slate-500">
                                    Loading comments...
                                </p>
                            )}

                            {commentError && (
                                <p className="mb-3 text-xs text-rose-300">
                                    {commentError}
                                </p>
                            )}

                            {!commentsLoading &&
                                comments.length === 0 &&
                                !commentError && (
                                    <p className="mb-3 text-xs text-slate-600">
                                        No comments yet. Start the conversation.
                                    </p>
                                )}

                            <div className="space-y-2">
                                {comments.map((comment) => (
                                    <div
                                        key={comment.id}
                                        className="flex items-start justify-between gap-3 rounded-xl bg-white/[0.035] px-3 py-2 text-sm text-slate-300"
                                    >
                                        <p>
                                            {comment.author_id ? (
                                                <Link
                                                    to={`/profile/${comment.author_id}`}
                                                    className="font-semibold text-lime-300 transition hover:text-lime-200"
                                                >
                                                    {comment.author?.username ||
                                                        "Student"}
                                                </Link>
                                            ) : (
                                                <span className="font-semibold text-lime-300">
                                                    {comment.author?.username ||
                                                        "Student"}
                                                </span>
                                            )}

                                            <span className="text-slate-500">
                                                :{" "}
                                            </span>

                                            {comment.content}
                                        </p>

                                        {currentUser?.id !==
                                            comment.author_id && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    openReportModal({
                                                        type: "comment",
                                                        id: comment.id,
                                                    })
                                                }
                                                className={`shrink-0 transition hover:text-lime-300 ${
                                                    reportedComments.has(
                                                        comment.id,
                                                    )
                                                        ? "text-lime-300"
                                                        : "text-slate-600"
                                                }`}
                                                aria-label="Report this comment"
                                                title="Report comment"
                                            >
                                                <Flag
                                                    className="size-3.5"
                                                    fill={
                                                        reportedComments.has(
                                                            comment.id,
                                                        )
                                                            ? "currentColor"
                                                            : "none"
                                                    }
                                                />
                                            </button>
                                        )}

                                        {currentUser?.id ===
                                            comment.author_id && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleDeleteComment(
                                                        comment.id,
                                                    )
                                                }
                                                className="shrink-0 text-slate-600 hover:text-rose-300"
                                                aria-label="Delete your comment"
                                                title="Delete your comment"
                                            >
                                                <Trash2 className="size-3.5" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <form
                                onSubmit={submitComment}
                                className="mt-3 flex gap-2"
                            >
                                <input
                                    value={commentText}
                                    onChange={(event) =>
                                        setCommentText(event.target.value)
                                    }
                                    placeholder="Write a comment..."
                                    className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white outline-none placeholder:text-slate-600 focus:border-lime-300/40"
                                />

                                <button
                                    type="submit"
                                    disabled={commentSubmitting}
                                    className="grid size-9 shrink-0 place-items-center rounded-xl bg-lime-300 text-slate-950 transition hover:bg-lime-200 disabled:opacity-60"
                                    aria-label="Send comment"
                                >
                                    <Send className="size-3.5" />
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>

            {reportTarget &&
                createPortal(
                    <div
                        className="fixed inset-0 z-[9999] grid place-items-center bg-slate-950/75 px-4 backdrop-blur-sm"
                        role="presentation"
                        onMouseDown={(event) => {
                            if (event.target === event.currentTarget) {
                                closeReportModal();
                            }
                        }}
                    >
                        <form
                            onSubmit={submitReport}
                            className="relative z-[10000] min-h-[280px] w-full max-w-md rounded-2xl border border-white/10 p-5 text-white shadow-2xl"
                            style={{ backgroundColor: "#11161d" }}
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="report-dialog-title"
                        >
                            {reportSuccess ? (
                                <div className="py-8 text-center">
                                    <div className="mx-auto grid size-14 place-items-center rounded-full bg-lime-300/15 text-2xl text-lime-300">
                                        ✓
                                    </div>
                                    <h2 className="mt-4 text-lg font-semibold text-white">
                                        Report submitted
                                    </h2>
                                    <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-400">
                                        Thanks for helping keep UniFeed safe.
                                        The report has been sent for review.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={closeReportModal}
                                        className="mt-6 rounded-xl bg-lime-300 px-5 py-2.5 text-sm font-bold text-slate-950 hover:bg-lime-200"
                                    >
                                        Done
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-lime-300">
                                                Community safety
                                            </p>
                                            <h2
                                                id="report-dialog-title"
                                                className="mt-1 text-lg font-semibold text-white"
                                            >
                                                Report this {reportTarget.type}
                                            </h2>
                                            <p className="mt-1 text-sm leading-6 text-slate-400">
                                                Choose the reason that best
                                                describes the issue. Your
                                                identity will not be shown in
                                                the university dashboard.
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={closeReportModal}
                                            className="rounded-lg px-2 py-1 text-xl leading-none text-slate-500 hover:bg-white/5 hover:text-white"
                                            aria-label="Close report dialog"
                                        >
                                            ×
                                        </button>
                                    </div>

                                    <label className="mt-5 block text-xs font-semibold text-slate-300">
                                        Reason
                                        <div className="relative mt-2">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setReportMenuOpen(
                                                        (isOpen) => !isOpen,
                                                    )
                                                }
                                                className="flex w-full items-center justify-between rounded-xl border border-lime-300/25 bg-[#11161d] px-3 py-2.5 text-left text-sm text-white outline-none transition hover:border-lime-300 focus:border-lime-300 focus:ring-2 focus:ring-lime-300/20"
                                                aria-haspopup="listbox"
                                                aria-expanded={reportMenuOpen}
                                            >
                                                <span>
                                                    {reportReason ===
                                                    "explicit content"
                                                        ? "Explicit content"
                                                        : reportReason ===
                                                            "harmful content"
                                                          ? "Harmful content"
                                                          : reportReason
                                                                .charAt(0)
                                                                .toUpperCase() +
                                                            reportReason.slice(
                                                                1,
                                                            )}
                                                </span>
                                                <ChevronDown
                                                    className={`size-4 text-lime-300 transition-transform ${reportMenuOpen ? "rotate-180" : ""}`}
                                                />
                                            </button>

                                            {reportMenuOpen && (
                                                <div
                                                    className="absolute left-0 right-0 top-full z-[10001] mt-2 overflow-hidden rounded-xl border border-lime-300/25 bg-[#11161d] p-1 shadow-2xl"
                                                    role="listbox"
                                                >
                                                    {[
                                                        "spam",
                                                        "harassment",
                                                        "explicit content",
                                                        "harmful content",
                                                        "other",
                                                    ].map((reason) => {
                                                        const label =
                                                            reason ===
                                                            "explicit content"
                                                                ? "Explicit content"
                                                                : reason ===
                                                                    "harmful content"
                                                                  ? "Harmful content"
                                                                  : reason
                                                                        .charAt(
                                                                            0,
                                                                        )
                                                                        .toUpperCase() +
                                                                    reason.slice(
                                                                        1,
                                                                    );

                                                        return (
                                                            <button
                                                                key={reason}
                                                                type="button"
                                                                onClick={() => {
                                                                    setReportReason(
                                                                        reason,
                                                                    );
                                                                    setReportMenuOpen(
                                                                        false,
                                                                    );
                                                                }}
                                                                className="block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-300 transition hover:bg-lime-300 hover:text-slate-950"
                                                                role="option"
                                                                aria-selected={
                                                                    reportReason ===
                                                                    reason
                                                                }
                                                            >
                                                                {label}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </label>

                                    <div className="mt-5 flex justify-end gap-2">
                                        <button
                                            type="button"
                                            onClick={closeReportModal}
                                            disabled={reportSubmitting}
                                            className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-slate-400 hover:text-white disabled:opacity-50"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={reportSubmitting}
                                            className="rounded-xl bg-lime-300 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-lime-200 disabled:opacity-60"
                                        >
                                            {reportSubmitting
                                                ? "Submitting..."
                                                : "Submit report"}
                                        </button>
                                    </div>
                                </>
                            )}
                        </form>
                    </div>,
                    document.body,
                )}
        </article>
    );
}

export default CampusPostCard;
