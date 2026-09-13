import {
    ArrowLeft,
    Check,
    Copy,
    MessageCircle,
    Link2,
    Plus,
    Shield,
    Trash2,
    UserPlus,
    UsersRound,
    X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { apiRequest, getCurrentUser } from "../lib/authApi";
import GroupChat from "../components/GroupChat";

function displayName(user) {
    if (!user) return "UniFeed member";

    const fullName = [user.first_name, user.last_name]
        .filter(Boolean)
        .join(" ")
        .trim();

    return fullName || user.username || "UniFeed member";
}

function initials(value) {
    return String(value || "U")
        .slice(0, 2)
        .toUpperCase();
}

function Groups() {
    const navigate = useNavigate();
    const location = useLocation();
    const [currentUser, setCurrentUser] = useState(null);
    const [groups, setGroups] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedGroupId, setSelectedGroupId] = useState(null);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [loading, setLoading] = useState(true);
    const [detailLoading, setDetailLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [memberSaving, setMemberSaving] = useState(false);
    const [error, setError] = useState("");
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [form, setForm] = useState({ title: "", description: "" });
    const [selectedUserId, setSelectedUserId] = useState("");
    const [inviteLink, setInviteLink] = useState("");
    const [inviteSaving, setInviteSaving] = useState(false);
    const [inviteCopied, setInviteCopied] = useState(false);

    const loadGroups = async () => {
        const [user, groupData, availableUsers] = await Promise.all([
            getCurrentUser(),
            apiRequest("/api/groups"),
            apiRequest("/api/users"),
        ]);

        if (!user) {
            navigate("/signin");
            return;
        }

        setCurrentUser(user);
        setGroups(groupData);
        setUsers(availableUsers);
    };

    useEffect(() => {
        let cancelled = false;

        const initialize = async () => {
            setLoading(true);
            setError("");

            try {
                await loadGroups();
            } catch (requestError) {
                if (!cancelled) {
                    if (requestError.status === 401) {
                        navigate("/signin");
                        return;
                    }

                    setError(
                        requestError.message || "Unable to load your groups.",
                    );
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        initialize();

        return () => {
            cancelled = true;
        };
    }, [navigate]);

    const openGroup = async (groupId) => {
        setSelectedGroupId(groupId);
        setSelectedGroup(null);
        setDetailLoading(true);
        setError("");

        try {
            const group = await apiRequest(`/api/groups/${groupId}`);

            if (group.unread_count > 0) {
                await apiRequest(`/api/groups/${groupId}/messages/read`, {
                    method: "PATCH",
                });
                window.dispatchEvent(
                    new Event("unifeed:notifications-updated"),
                );
            }

            const readGroup = { ...group, unread_count: 0 };
            setGroups((currentGroups) =>
                currentGroups.map((currentGroup) =>
                    currentGroup.id === groupId ? readGroup : currentGroup,
                ),
            );
            setSelectedGroup(readGroup);
        } catch (requestError) {
            setError(requestError.message || "Unable to load this group.");
        } finally {
            setDetailLoading(false);
        }
    };

    useEffect(() => {
        const openGroupId = location.state?.openGroupId;
        if (!openGroupId || groups.length === 0) return undefined;

        const timer = window.setTimeout(() => {
            openGroup(Number(openGroupId));
            navigate(location.pathname, { replace: true, state: {} });
        }, 0);

        return () => window.clearTimeout(timer);
    }, [groups, location.pathname, location.state, navigate]);

    const updateGroupInLists = (updatedGroup) => {
        setGroups((currentGroups) =>
            currentGroups.map((group) =>
                group.id === updatedGroup.id ? updatedGroup : group,
            ),
        );
        setSelectedGroup(updatedGroup);
    };

    const handleCreateGroup = async (event) => {
        event.preventDefault();
        if (saving) return;

        setSaving(true);
        setError("");

        try {
            const createdGroup = await apiRequest("/api/groups", {
                method: "POST",
                body: JSON.stringify(form),
            });

            setGroups((currentGroups) => [createdGroup, ...currentGroups]);
            setForm({ title: "", description: "" });
            setShowCreateForm(false);
            setSelectedGroupId(createdGroup.id);
            setSelectedGroup(createdGroup);
        } catch (requestError) {
            setError(requestError.message || "Unable to create this group.");
        } finally {
            setSaving(false);
        }
    };

    const handleAddMember = async () => {
        if (!selectedGroup || !selectedUserId || memberSaving) return;

        setMemberSaving(true);
        setError("");

        try {
            const updatedGroup = await apiRequest(
                `/api/groups/${selectedGroup.id}/members`,
                {
                    method: "POST",
                    body: JSON.stringify({ user_id: Number(selectedUserId) }),
                },
            );

            updateGroupInLists(updatedGroup);
            setSelectedUserId("");
        } catch (requestError) {
            setError(requestError.message || "Unable to add this member.");
        } finally {
            setMemberSaving(false);
        }
    };

    const handleRemoveMember = async (memberId) => {
        if (!selectedGroup || memberSaving) return;

        setMemberSaving(true);
        setError("");

        try {
            const updatedGroup = await apiRequest(
                `/api/groups/${selectedGroup.id}/members/${memberId}`,
                { method: "DELETE" },
            );

            updateGroupInLists(updatedGroup);
        } catch (requestError) {
            setError(requestError.message || "Unable to remove this member.");
        } finally {
            setMemberSaving(false);
        }
    };

    const handleGenerateInvite = async () => {
        if (!selectedGroup || inviteSaving) return;

        setInviteSaving(true);
        setInviteCopied(false);
        setError("");

        try {
            const invite = await apiRequest(
                `/api/groups/${selectedGroup.id}/invites`,
                { method: "POST" },
            );
            setInviteLink(
                `${window.location.origin}/group-invite/${invite.token}`,
            );
        } catch (requestError) {
            setError(requestError.message || "Unable to create invite link.");
        } finally {
            setInviteSaving(false);
        }
    };

    const handleCopyInvite = async () => {
        if (!inviteLink) return;
        try {
            await navigator.clipboard.writeText(inviteLink);
            setInviteCopied(true);
        } catch {
            setError("Copy failed. Select the link and copy it manually.");
        }
    };

    const availableInvitees = useMemo(() => {
        const memberIds = new Set(
            (selectedGroup?.members || []).map((member) => member.id),
        );

        return users.filter(
            (user) => user.id !== currentUser?.id && !memberIds.has(user.id),
        );
    }, [currentUser?.id, selectedGroup?.members, users]);

    return (
        <div className="motion-rise min-w-0 space-y-6">
            <div className="flex min-w-0 flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div className="min-w-0">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-lime-300"
                    >
                        <ArrowLeft className="size-4" />
                        Back
                    </button>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-lime-300/80">
                        Private spaces
                    </p>
                    <h1 className="break-words text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                        Groups
                    </h1>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                        Create invite-only spaces for the people you choose.
                        Communities remain separate.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => setShowCreateForm((visible) => !visible)}
                    className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-lime-300 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-lime-200 sm:self-auto"
                >
                    {showCreateForm ? (
                        <X className="size-4" />
                    ) : (
                        <Plus className="size-4" />
                    )}
                    {showCreateForm ? "Close" : "Create group"}
                </button>
            </div>

            {error && (
                <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
                    {error}
                </div>
            )}

            {showCreateForm && (
                <form
                    onSubmit={handleCreateGroup}
                    className="space-y-4 rounded-3xl border border-lime-300/15 bg-white/[0.035] p-5"
                >
                    <div>
                        <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                            Group title
                        </label>
                        <input
                            value={form.title}
                            onChange={(event) =>
                                setForm((current) => ({
                                    ...current,
                                    title: event.target.value,
                                }))
                            }
                            maxLength={120}
                            placeholder="e.g. Moringa developers"
                            className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-lime-300/50"
                            required
                        />
                    </div>
                    <div>
                        <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                            Description
                        </label>
                        <textarea
                            value={form.description}
                            onChange={(event) =>
                                setForm((current) => ({
                                    ...current,
                                    description: event.target.value,
                                }))
                            }
                            rows={3}
                            placeholder="What is this private group for?"
                            className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-lime-300/50"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center gap-2 rounded-xl bg-lime-300 px-4 py-2.5 text-sm font-bold text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <Check className="size-4" />
                        {saving ? "Creating..." : "Create private group"}
                    </button>
                </form>
            )}

            {loading ? (
                <div className="rounded-3xl border border-white/8 bg-white/[0.035] p-8 text-center text-sm text-slate-500">
                    Loading your groups...
                </div>
            ) : groups.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.025] p-8 text-center">
                    <UsersRound className="mx-auto size-8 text-lime-300" />
                    <h2 className="mt-4 font-semibold text-white">
                        No private groups yet
                    </h2>
                    <p className="mt-2 text-sm text-slate-500">
                        Create a group and invite the people you want in it.
                    </p>
                </div>
            ) : (
                <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
                    <div className="space-y-3">
                        {groups.map((group) => (
                            <button
                                key={group.id}
                                type="button"
                                onClick={() => openGroup(group.id)}
                                className={`w-full rounded-3xl border p-5 text-left transition ${
                                    selectedGroupId === group.id
                                        ? "border-lime-300/40 bg-lime-300/[0.08]"
                                        : "border-white/8 bg-white/[0.035] hover:border-lime-300/25 hover:bg-white/[0.055]"
                                }`}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-lime-300/15 font-semibold text-lime-300">
                                        {initials(group.title)}
                                    </span>
                                    <div className="flex flex-wrap items-center justify-end gap-2">
                                        {group.unread_count > 0 && (
                                            <span className="rounded-full bg-lime-300 px-2.5 py-1 text-[11px] font-bold text-slate-950">
                                                {group.unread_count} unread
                                            </span>
                                        )}
                                        <span className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] font-semibold text-slate-400">
                                            Invite-only
                                        </span>
                                    </div>
                                </div>
                                <h2 className="mt-4 break-words font-semibold text-white">
                                    {group.title}
                                </h2>
                                <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-500">
                                    {group.description}
                                </p>
                                <p className="mt-4 flex items-center gap-2 text-xs font-semibold text-lime-300/80">
                                    <UsersRound className="size-3.5" />
                                    {group.member_count}{" "}
                                    {group.member_count === 1
                                        ? "member"
                                        : "members"}
                                </p>
                            </button>
                        ))}
                    </div>

                    <section className="min-w-0 rounded-3xl border border-white/8 bg-white/[0.035] p-5 sm:p-6">
                        {detailLoading ? (
                            <p className="text-sm text-slate-500">
                                Loading group...
                            </p>
                        ) : selectedGroup ? (
                            <>
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0">
                                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-lime-300/80">
                                            Private group
                                        </p>
                                        <h2 className="mt-2 break-words text-2xl font-semibold text-white">
                                            {selectedGroup.title}
                                        </h2>
                                        <p className="mt-2 break-words text-sm leading-6 text-slate-500">
                                            {selectedGroup.description}
                                        </p>
                                    </div>
                                    {selectedGroup.is_admin && (
                                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-lime-300/10 px-2.5 py-1 text-[11px] font-semibold text-lime-300">
                                            <Shield className="size-3" /> Admin
                                        </span>
                                    )}
                                </div>

                                <div className="mt-6 flex items-center justify-between border-b border-white/8 pb-3">
                                    <h3 className="font-semibold text-white">
                                        Members
                                    </h3>
                                    <span className="text-sm text-slate-500">
                                        {selectedGroup.member_count}
                                    </span>
                                </div>

                                {selectedGroup.is_admin && (
                                    <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                                        <select
                                            value={selectedUserId}
                                            onChange={(event) =>
                                                setSelectedUserId(
                                                    event.target.value,
                                                )
                                            }
                                            className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#11151a] px-3 py-2.5 text-sm text-slate-300 outline-none focus:border-lime-300/50"
                                        >
                                            <option value="">
                                                Select a person to invite
                                            </option>
                                            {availableInvitees.map((user) => (
                                                <option
                                                    key={user.id}
                                                    value={user.id}
                                                >
                                                    @{user.username}
                                                </option>
                                            ))}
                                        </select>
                                        <button
                                            type="button"
                                            onClick={handleAddMember}
                                            disabled={
                                                !selectedUserId || memberSaving
                                            }
                                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-lime-300 px-3 py-2.5 text-sm font-bold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <UserPlus className="size-4" />
                                            Add
                                        </button>
                                    </div>
                                )}

                                {selectedGroup.is_admin && (
                                    <div className="mt-5 rounded-2xl border border-lime-300/15 bg-lime-300/[0.04] p-4">
                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                            <div>
                                                <p className="flex items-center gap-2 text-sm font-semibold text-white">
                                                    <MessageCircle className="size-4 text-lime-300" />
                                                    Invite people privately
                                                </p>
                                                <p className="mt-1 text-xs leading-5 text-slate-500">
                                                    Links expire after 7 days
                                                    and can be revoked from the
                                                    server.
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={handleGenerateInvite}
                                                disabled={inviteSaving}
                                                className="inline-flex items-center gap-2 rounded-xl bg-lime-300 px-3 py-2 text-xs font-bold text-slate-950 disabled:opacity-60"
                                            >
                                                <Link2 className="size-3.5" />
                                                {inviteSaving
                                                    ? "Generating..."
                                                    : "Generate link"}
                                            </button>
                                        </div>
                                        {inviteLink && (
                                            <div className="mt-3 flex min-w-0 gap-2">
                                                <input
                                                    value={inviteLink}
                                                    readOnly
                                                    className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-slate-300 outline-none"
                                                    aria-label="Group invite link"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleCopyInvite}
                                                    className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-slate-300 hover:border-lime-300/40 hover:text-lime-300"
                                                >
                                                    <Copy className="size-3.5" />
                                                    {inviteCopied
                                                        ? "Copied"
                                                        : "Copy"}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="mt-5 space-y-2">
                                    {selectedGroup.members?.map((member) => {
                                        const isCreator =
                                            member.id ===
                                            selectedGroup.creator_id;

                                        return (
                                            <div
                                                key={member.id}
                                                className="flex items-center gap-3 rounded-2xl border border-white/8 bg-black/10 p-3"
                                            >
                                                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-slate-800 text-xs font-bold text-lime-300">
                                                    {initials(member.username)}
                                                </span>
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-semibold text-white">
                                                        {displayName(member)}
                                                    </p>
                                                    <p className="truncate text-xs text-slate-500">
                                                        @{member.username}
                                                    </p>
                                                </div>
                                                {isCreator ? (
                                                    <span className="text-[11px] font-semibold text-lime-300">
                                                        Creator
                                                    </span>
                                                ) : selectedGroup.is_admin ? (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleRemoveMember(
                                                                member.id,
                                                            )
                                                        }
                                                        disabled={memberSaving}
                                                        className="rounded-lg p-2 text-slate-500 transition hover:bg-rose-400/10 hover:text-rose-300 disabled:opacity-50"
                                                        aria-label={`Remove ${member.username}`}
                                                    >
                                                        <Trash2 className="size-4" />
                                                    </button>
                                                ) : null}
                                            </div>
                                        );
                                    })}
                                </div>

                                <GroupChat groupId={selectedGroup.id} />
                            </>
                        ) : (
                            <div className="grid min-h-64 place-items-center text-center">
                                <div>
                                    <UsersRound className="mx-auto size-8 text-lime-300" />
                                    <p className="mt-3 text-sm text-slate-500">
                                        Select a group to view its members.
                                    </p>
                                </div>
                            </div>
                        )}
                    </section>
                </div>
            )}
        </div>
    );
}

export default Groups;
