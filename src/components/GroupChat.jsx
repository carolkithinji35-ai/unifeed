import { Send, UsersRound } from "lucide-react";
import { useEffect, useState } from "react";
import { apiRequest, getCurrentUser } from "../lib/authApi";

function displayName(user) {
    if (!user) return "UniFeed member";

    const fullName = [user.first_name, user.last_name]
        .filter(Boolean)
        .join(" ")
        .trim();

    return fullName || user.username || "UniFeed member";
}

function formatSentTime(value) {
    if (!value) return "";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function GroupChat({ groupId }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        const loadChat = async () => {
            setLoading(true);
            setError("");

            try {
                const [messageData, user] = await Promise.all([
                    apiRequest(`/api/groups/${groupId}/messages`),
                    getCurrentUser(),
                ]);

                if (!cancelled) {
                    setMessages(messageData);
                    setCurrentUser(user);

                    await apiRequest(`/api/groups/${groupId}/messages/read`, {
                        method: "PATCH",
                    });
                    window.dispatchEvent(
                        new Event("unifeed:notifications-updated"),
                    );
                }
            } catch (requestError) {
                if (!cancelled) {
                    setError(
                        requestError.message || "Unable to load group chat.",
                    );
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        loadChat();

        return () => {
            cancelled = true;
        };
    }, [groupId]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        const trimmedContent = content.trim();

        if (!trimmedContent || sending) return;

        setSending(true);
        setError("");

        try {
            const message = await apiRequest(
                `/api/groups/${groupId}/messages`,
                {
                    method: "POST",
                    body: JSON.stringify({ content: trimmedContent }),
                },
            );

            setMessages((currentMessages) => [...currentMessages, message]);
            setContent("");
        } catch (requestError) {
            setError(requestError.message || "Unable to send group message.");
        } finally {
            setSending(false);
        }
    };

    return (
        <section className="mt-6 rounded-3xl border border-lime-300/15 bg-black/15 p-4 sm:p-5">
            <div className="flex items-center gap-2 border-b border-white/8 pb-3">
                <UsersRound className="size-4 text-lime-300" />
                <div>
                    <h3 className="font-semibold text-white">Group chat</h3>
                    <p className="text-xs text-slate-500">
                        Visible to approved members only.
                    </p>
                </div>
            </div>

            {error && (
                <p className="mt-3 rounded-xl bg-rose-400/10 px-3 py-2 text-xs text-rose-200">
                    {error}
                </p>
            )}

            <div className="sidebar-scroll mt-4 max-h-80 space-y-3 overflow-y-auto pr-1">
                {loading ? (
                    <p className="text-sm text-slate-500">
                        Loading group chat...
                    </p>
                ) : messages.length === 0 ? (
                    <p className="text-sm text-slate-500">
                        No messages yet. Start the conversation.
                    </p>
                ) : (
                    messages.map((message) => {
                        const isMine =
                            Number(message.sender_id) ===
                            Number(currentUser?.id);

                        return (
                            <div
                                key={message.id}
                                className={`flex w-full ${
                                    isMine ? "justify-end" : "justify-start"
                                }`}
                            >
                                <div
                                    className={`max-w-[86%] rounded-2xl px-3 py-2.5 sm:max-w-[72%] ${
                                        isMine
                                            ? "rounded-br-md bg-lime-300 text-slate-950"
                                            : "rounded-bl-md bg-white/[0.07] text-slate-100"
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <p
                                            className={`min-w-0 truncate text-xs font-semibold ${
                                                isMine
                                                    ? "text-slate-800"
                                                    : "text-lime-300"
                                            }`}
                                        >
                                            {isMine
                                                ? "You"
                                                : displayName(message.sender)}
                                        </p>
                                        <time
                                            dateTime={message.created_at}
                                            className={`shrink-0 text-[10px] ${
                                                isMine
                                                    ? "text-slate-700"
                                                    : "text-slate-500"
                                            }`}
                                        >
                                            {formatSentTime(message.created_at)}
                                        </time>
                                    </div>
                                    <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-5">
                                        {message.content}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
                <input
                    value={content}
                    onChange={(event) => setContent(event.target.value)}
                    maxLength={2000}
                    placeholder="Write to your group..."
                    className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-lime-300/50"
                />
                <button
                    type="submit"
                    disabled={sending || !content.trim()}
                    className="grid size-10 shrink-0 place-items-center rounded-xl bg-lime-300 text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Send group message"
                >
                    <Send className="size-4" />
                </button>
            </form>
        </section>
    );
}

export default GroupChat;
