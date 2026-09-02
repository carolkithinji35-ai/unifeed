import {
    ArrowLeft,
    CalendarDays,
    Check,
    Edit3,
    Globe2,
    Mail,
    MapPin,
    X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CampusPostCard from "../components/CampusPostCard";
import { apiRequest, getCurrentUser } from "../lib/authApi";

function formatPost(post) {
    return {
        ...post,
        text: post.content,
        eyebrow: "Campus post",
        tags: [],
    };
}

function Profile() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState("");

    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        username: "",
        email: "",
        bio: "",
        location: "",
    });

    const isOwnProfile =
        currentUser && user
            ? String(currentUser.id) === String(user.id)
            : false;

    useEffect(() => {
        let cancelled = false;

        const loadProfile = async () => {
            setLoading(true);
            setError("");

            try {
                const viewer = await getCurrentUser();

                if (!viewer) {
                    navigate("/signin");
                    return;
                }

                const [profileUser, allPosts] = await Promise.all([
                    apiRequest(`/api/users/${id}`),
                    apiRequest("/api/posts"),
                ]);

                if (cancelled) return;

                const profilePosts = allPosts
                    .filter(
                        (post) =>
                            String(post.author_id) === String(profileUser.id),
                    )
                    .map(formatPost);

                setCurrentUser(viewer);
                setUser(profileUser);
                setPosts(profilePosts);
                setFormData({
                    first_name: profileUser.first_name || "",
                    last_name: profileUser.last_name || "",
                    username: profileUser.username || "",
                    email: profileUser.email || "",
                    bio: profileUser.bio || "",
                    location: profileUser.location || "",
                });
            } catch (requestError) {
                console.error("Error loading profile:", requestError);

                if (requestError.status === 401) {
                    navigate("/signin");
                    return;
                }

                if (!cancelled) {
                    setError(
                        requestError.message || "Unable to load this profile.",
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadProfile();

        return () => {
            cancelled = true;
        };
    }, [id, navigate]);

    const initials = useMemo(
        () => user?.username?.charAt(0).toUpperCase() || "U",
        [user],
    );

    const handleFormChange = (event) => {
        const { name, value } = event.target;

        setFormData((currentData) => ({
            ...currentData,
            [name]: value,
        }));
    };

    const startEditing = () => {
        if (!isOwnProfile) return;

        setFormError("");
        setEditing(true);
    };

    const cancelEditing = () => {
        setFormError("");
        setFormData({
            first_name: user?.first_name || "",
            last_name: user?.last_name || "",
            username: user?.username || "",
            email: user?.email || "",
            bio: user?.bio || "",
            location: user?.location || "",
        });
        setEditing(false);
    };

    const saveProfile = async (event) => {
        event.preventDefault();

        if (!isOwnProfile) {
            return;
        }

        setSaving(true);
        setFormError("");

        try {
            const updatedUser = await apiRequest("/api/auth/me", {
                method: "PATCH",
                body: JSON.stringify(formData),
            });

            setUser(updatedUser);
            setCurrentUser(updatedUser);
            setFormData({
                first_name: updatedUser.first_name || "",
                last_name: updatedUser.last_name || "",
                username: updatedUser.username || "",
                email: updatedUser.email || "",
                bio: updatedUser.bio || "",
                location: updatedUser.location || "",
            });
            setEditing(false);
        } catch (requestError) {
            console.error("Error updating profile:", requestError);

            if (requestError.status === 401) {
                navigate("/signin");
                return;
            }

            setFormError(
                requestError.message || "Unable to update your profile.",
            );
        } finally {
            setSaving(false);
        }
    };

    const handlePostUpdated = (updatedPost) => {
        setPosts((currentPosts) =>
            currentPosts.map((post) =>
                post.id === updatedPost.id
                    ? {
                          ...formatPost(updatedPost),
                          text: updatedPost.content,
                      }
                    : post,
            ),
        );
    };

    const handlePostDeleted = (postId) => {
        setPosts((currentPosts) =>
            currentPosts.filter((post) => post.id !== postId),
        );
    };

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

    const displayName =
        [user.first_name, user.last_name].filter(Boolean).join(" ") ||
        user.username;

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
                            {displayName}
                        </h1>

                        <p className="mt-1 text-sm text-slate-500">
                            @{user.username}
                        </p>
                    </div>

                    {isOwnProfile && !editing && (
                        <button
                            type="button"
                            onClick={startEditing}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-lime-300/20 bg-lime-300/10 px-4 py-2 text-sm font-semibold text-lime-300 transition hover:bg-lime-300/20"
                        >
                            <Edit3 className="size-4" />
                            Edit profile
                        </button>
                    )}
                </div>

                {editing && isOwnProfile ? (
                    <form
                        onSubmit={saveProfile}
                        className="mt-6 space-y-4 rounded-2xl border border-lime-300/15 bg-black/10 p-4 sm:p-5"
                    >
                        {formError && (
                            <p className="rounded-xl border border-rose-300/20 bg-rose-300/5 px-3 py-2 text-sm text-rose-200">
                                {formError}
                            </p>
                        )}

                        <div className="grid gap-4 sm:grid-cols-2">
                            <label className="space-y-2">
                                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    First name
                                </span>

                                <input
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleFormChange}
                                    maxLength="80"
                                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-lime-300/40"
                                    placeholder="Your first name"
                                />
                            </label>

                            <label className="space-y-2">
                                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Last name
                                </span>

                                <input
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleFormChange}
                                    maxLength="80"
                                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-lime-300/40"
                                    placeholder="Your last name"
                                />
                            </label>

                            <label className="space-y-2">
                                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Username
                                </span>

                                <input
                                    name="username"
                                    value={formData.username}
                                    onChange={handleFormChange}
                                    minLength="3"
                                    maxLength="80"
                                    required
                                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-lime-300/40"
                                    placeholder="Your username"
                                />
                            </label>

                            <label className="space-y-2">
                                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Email
                                </span>

                                <input
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleFormChange}
                                    maxLength="120"
                                    required
                                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-lime-300/40"
                                    placeholder="you@example.com"
                                />
                            </label>
                        </div>

                        <label className="block space-y-2">
                            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Location
                            </span>

                            <input
                                name="location"
                                value={formData.location}
                                onChange={handleFormChange}
                                maxLength="120"
                                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-lime-300/40"
                                placeholder="Campus or city"
                            />
                        </label>

                        <label className="block space-y-2">
                            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Bio
                            </span>

                            <textarea
                                name="bio"
                                value={formData.bio}
                                onChange={handleFormChange}
                                maxLength="500"
                                rows="3"
                                className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm leading-6 text-white outline-none placeholder:text-slate-600 focus:border-lime-300/40"
                                placeholder="Tell the campus community a little about yourself"
                            />
                        </label>

                        <div className="flex flex-wrap gap-2">
                            <button
                                type="submit"
                                disabled={saving}
                                className="inline-flex items-center gap-2 rounded-xl bg-lime-300 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-lime-200 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <Check className="size-4" />
                                {saving ? "Saving..." : "Save profile"}
                            </button>

                            <button
                                type="button"
                                onClick={cancelEditing}
                                disabled={saving}
                                className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-slate-400 transition hover:text-white disabled:opacity-60"
                            >
                                <X className="size-4" />
                                Cancel
                            </button>
                        </div>
                    </form>
                ) : (
                    <>
                        <p className="mt-5 max-w-xl text-sm leading-6 text-slate-400">
                            {user.bio ||
                                "Student, creative thinker, and part of the UniFeed community. Sharing the little moments that make campus life memorable."}
                        </p>

                        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
                            <span className="flex items-center gap-1.5">
                                <MapPin className="size-3.5" />
                                {user.location || "Campus community"}
                            </span>

                            <span className="flex items-center gap-1.5 break-all">
                                <Mail className="size-3.5 shrink-0" />
                                {user.email}
                            </span>

                            <span className="flex items-center gap-1.5">
                                <CalendarDays className="size-3.5" />
                                Joined recently
                            </span>
                        </div>
                    </>
                )}

                <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm">
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
                    className="flex gap-6 overflow-x-auto"
                    aria-label="Profile tabs"
                >
                    {["Posts", "Replies", "Media", "Likes"].map(
                        (tab, index) => (
                            <button
                                key={tab}
                                type="button"
                                className={`whitespace-nowrap border-b-2 py-4 text-sm font-semibold ${
                                    index === 0
                                        ? "border-lime-300 text-white"
                                        : "border-transparent text-slate-600 hover:text-slate-300"
                                }`}
                            >
                                {tab}
                            </button>
                        ),
                    )}
                </nav>
            </div>

            {posts.length > 0 ? (
                <div className="space-y-3 border-t border-white/8 px-5 py-5 sm:px-7">
                    {posts.map((post, index) => (
                        <CampusPostCard
                            key={post.id}
                            post={post}
                            index={index}
                            currentUser={currentUser}
                            onUpdated={handlePostUpdated}
                            onDeleted={handlePostDeleted}
                        />
                    ))}
                </div>
            ) : (
                <div className="grid place-items-center border-t border-white/8 px-5 py-20 text-center text-sm text-slate-500">
                    <div className="mb-3 grid size-12 place-items-center rounded-2xl bg-white/5 text-slate-600">
                        <Globe2 className="size-5" />
                    </div>

                    {isOwnProfile
                        ? "No posts yet—your posts will appear here."
                        : "No posts yet."}
                </div>
            )}
        </div>
    );
}

export default Profile;
