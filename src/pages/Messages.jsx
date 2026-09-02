import {
    ArrowLeft,
    LoaderCircle,
    MessageCircle,
    Send,
    UserPlus,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest, getCurrentUser } from "../lib/authApi";

function formatMessageTime(createdAt) {
    if (!createdAt) return "";

    const date = new Date(createdAt);

    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
    });
}

function getUserDisplayName(user) {
    if (!user) return "UniFeed member";

    const fullName = [user.first_name, user.last_name]
        .filter(Boolean)
        .join(" ");

    return fullName || user.username;
}

function Messages() {
    const navigate = useNavigate();

    const [users, setUsers] = useState([]);
    const [conversations, setConversations] = useState([]);
    const [selectedConversationId, setSelectedConversationId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [messageText, setMessageText] = useState("");
    const [loading, setLoading] = useState(true);
    const [messagesLoading, setMessagesLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [startingConversation, setStartingConversation] = useState(false);
    const [error, setError] = useState("");

    const selectedConversation = useMemo(
        () =>
            conversations.find(
                (conversation) => conversation.id === selectedConversationId,
            ) || null,
        [conversations, selectedConversationId],
    );

    const usersWithConversations = useMemo(() => {
        const conversationUserIds = new Set(
            conversations.map((conversation) => conversation.other_user?.id),
        );

        return users.filter((user) => !conversationUserIds.has(user.id));
    }, [conversations, users]);

    const loadInbox = async () => {
        const [user, availableUsers, conversationData] = await Promise.all([
            getCurrentUser(),
            apiRequest("/api/users"),
            apiRequest("/api/conversations"),
        ]);

        setCurrentUser(user);
        setUsers(availableUsers);
        setConversations(conversationData);

        if (
            selectedConversationId &&
            !conversationData.some(
                (conversation) => conversation.id === selectedConversationId,
            )
        ) {
            setSelectedConversationId(null);
            setMessages([]);
        }
    };

    useEffect(() => {
        let cancelled = false;

        const initializeMessages = async () => {
            setLoading(true);
            setError("");

            try {
                const user = await getCurrentUser();

                if (!user) {
                    navigate("/signin");
                    return;
                }

                const [availableUsers, conversationData] = await Promise.all([
                    apiRequest("/api/users"),
                    apiRequest("/api/conversations"),
                ]);

                if (cancelled) {
                    return;
                }

                setCurrentUser(user);
                setUsers(availableUsers);
                setConversations(conversationData);

                // Do not automatically open the first conversation.
                // The list should be visible first, especially on mobile.
                setSelectedConversationId(null);
            } catch (requestError) {
                console.error("Error loading messages:", requestError);

                if (requestError.status === 401) {
                    navigate("/signin");
                    return;
                }

                if (!cancelled) {
                    setError(
                        requestError.message || "Unable to load your messages.",
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        initializeMessages();

        return () => {
            cancelled = true;
        };
    }, [navigate]);

    useEffect(() => {
        if (!selectedConversationId) {
            return undefined;
        }

        let cancelled = false;

        const loadConversationMessages = async () => {
            setMessagesLoading(true);
            setError("");

            try {
                const data = await apiRequest(
                    `/api/conversations/${selectedConversationId}/messages`,
                );

                if (cancelled) {
                    return;
                }

                setMessages(data);

                await apiRequest(
                    `/api/conversations/${selectedConversationId}/read`,
                    {
                        method: "POST",
                    },
                );

                if (!cancelled) {
                    setConversations((currentConversations) =>
                        currentConversations.map((conversation) =>
                            conversation.id === selectedConversationId
                                ? {
                                      ...conversation,
                                      unread_count: 0,
                                  }
                                : conversation,
                        ),
                    );

                    window.dispatchEvent(new Event("unifeed:messages-updated"));
                }
            } catch (requestError) {
                console.error("Error loading conversation:", requestError);

                if (requestError.status === 401) {
                    navigate("/signin");
                    return;
                }

                if (!cancelled) {
                    setError(
                        requestError.message ||
                            "Unable to load this conversation.",
                    );
                }
            } finally {
                if (!cancelled) {
                    setMessagesLoading(false);
                }
            }
        };

        loadConversationMessages();

        return () => {
            cancelled = true;
        };
    }, [navigate, selectedConversationId]);

    const openConversation = (conversationId) => {
        setError("");
        setSelectedConversationId(conversationId);
    };

    const closeConversation = () => {
        setSelectedConversationId(null);
        setMessages([]);
        setMessageText("");
        setError("");
    };

    const startConversation = async (userId) => {
        setStartingConversation(true);
        setError("");

        try {
            const conversation = await apiRequest("/api/conversations", {
                method: "POST",
                body: JSON.stringify({ user_id: userId }),
            });

            setConversations((currentConversations) => {
                const existingConversation = currentConversations.find(
                    (item) => item.id === conversation.id,
                );

                if (existingConversation) {
                    return currentConversations.map((item) =>
                        item.id === conversation.id ? conversation : item,
                    );
                }

                return [conversation, ...currentConversations];
            });

            setSelectedConversationId(conversation.id);
        } catch (requestError) {
            console.error("Error starting conversation:", requestError);

            if (requestError.status === 401) {
                navigate("/signin");
                return;
            }

            setError(
                requestError.message || "Unable to start this conversation.",
            );
        } finally {
            setStartingConversation(false);
        }
    };

    const sendMessage = async (event) => {
        event.preventDefault();

        if (!selectedConversationId || !messageText.trim()) {
            return;
        }

        setSending(true);
        setError("");

        try {
            const newMessage = await apiRequest(
                `/api/conversations/${selectedConversationId}/messages`,
                {
                    method: "POST",
                    body: JSON.stringify({
                        content: messageText.trim(),
                    }),
                },
            );

            setMessages((currentMessages) => [...currentMessages, newMessage]);
            setMessageText("");

            await loadInbox();
        } catch (requestError) {
            console.error("Error sending message:", requestError);

            if (requestError.status === 401) {
                navigate("/signin");
                return;
            }

            setError(requestError.message || "Unable to send this message.");
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return (
            <div className="grid min-h-[60vh] place-items-center text-sm text-slate-500">
                <span className="flex items-center gap-2">
                    <LoaderCircle className="size-4 animate-spin text-lime-300" />
                    Loading messages...
                </span>
            </div>
        );
    }

    return (
        <div className="motion-rise min-w-0 space-y-6">
            {!selectedConversation && (
                <div className="flex items-start gap-4">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="grid size-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.035] text-slate-400 transition hover:border-lime-300/30 hover:text-lime-300"
                        aria-label="Go back"
                    >
                        <ArrowLeft className="size-4" />
                    </button>

                    <div className="min-w-0">
                        <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-lime-300/80">
                            <MessageCircle className="size-3.5" />
                            Private conversations
                        </p>

                        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                            Messages
                        </h1>

                        <p className="mt-2 text-sm leading-6 text-slate-500">
                            Have a private conversation with another UniFeed
                            member.
                        </p>
                    </div>
                </div>
            )}

            {error && (
                <div className="rounded-2xl border border-rose-300/20 bg-rose-300/5 px-4 py-3 text-sm text-rose-200">
                    {error}
                </div>
            )}

            <div className="grid min-h-[560px] min-w-0 overflow-hidden rounded-3xl border border-white/8 bg-white/[0.035] lg:grid-cols-[280px_minmax(0,1fr)]">
                <aside
                    className={`min-w-0 border-white/8 lg:border-r ${
                        selectedConversation ? "hidden lg:block" : "block"
                    }`}
                >
                    <div className="border-b border-white/8 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                            Conversations
                        </p>
                    </div>

                    <div className="max-h-[560px] min-w-0 overflow-y-auto">
                        {conversations.length === 0 ? (
                            <p className="p-4 text-sm leading-6 text-slate-600">
                                No conversations yet. Start one below.
                            </p>
                        ) : (
                            conversations.map((conversation) => (
                                <button
                                    key={conversation.id}
                                    type="button"
                                    onClick={() =>
                                        openConversation(conversation.id)
                                    }
                                    className={`flex w-full min-w-0 items-center gap-3 border-b border-white/5 p-4 text-left transition ${
                                        selectedConversationId ===
                                        conversation.id
                                            ? "bg-lime-300/10"
                                            : "hover:bg-white/[0.04]"
                                    }`}
                                >
                                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-sky-400/15 text-sm font-bold text-sky-300">
                                        {conversation.other_user?.username
                                            ?.charAt(0)
                                            .toUpperCase() || "U"}
                                    </span>

                                    <span className="min-w-0 flex-1">
                                        <span className="block truncate text-sm font-semibold text-white">
                                            {getUserDisplayName(
                                                conversation.other_user,
                                            )}
                                        </span>

                                        <span className="mt-1 block truncate text-xs text-slate-500">
                                            {conversation.latest_message
                                                ?.content || "No messages yet"}
                                        </span>
                                    </span>

                                    {conversation.unread_count > 0 && (
                                        <span className="grid size-5 shrink-0 place-items-center rounded-full bg-lime-300 text-[10px] font-bold text-slate-950">
                                            {conversation.unread_count}
                                        </span>
                                    )}
                                </button>
                            ))
                        )}
                    </div>

                    <div className="border-t border-white/8 p-4">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                            Start a conversation
                        </p>

                        <div className="space-y-2">
                            {usersWithConversations.length === 0 ? (
                                <p className="text-xs leading-5 text-slate-600">
                                    No new members are available to message.
                                </p>
                            ) : (
                                usersWithConversations.map((user) => (
                                    <button
                                        key={user.id}
                                        type="button"
                                        onClick={() =>
                                            startConversation(user.id)
                                        }
                                        disabled={startingConversation}
                                        className="flex w-full min-w-0 items-center gap-2 rounded-xl px-2 py-2 text-left text-sm text-slate-300 transition hover:bg-white/[0.05] hover:text-lime-300 disabled:opacity-50"
                                    >
                                        <UserPlus className="size-4 shrink-0" />

                                        <span className="truncate">
                                            {getUserDisplayName(user)}
                                        </span>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </aside>

                <section
                    className={`min-w-0 flex-col ${
                        selectedConversation ? "flex" : "hidden lg:flex"
                    }`}
                >
                    {selectedConversation ? (
                        <>
                            <header className="flex items-center gap-3 border-b border-white/8 p-4 sm:p-5">
                                <button
                                    type="button"
                                    onClick={closeConversation}
                                    className="grid size-9 shrink-0 place-items-center rounded-xl border border-white/10 text-slate-400 transition hover:border-lime-300/30 hover:text-lime-300 lg:hidden"
                                    aria-label="Back to conversations"
                                >
                                    <ArrowLeft className="size-4" />
                                </button>

                                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-sky-400/15 text-sm font-bold text-sky-300">
                                    {selectedConversation.other_user?.username
                                        ?.charAt(0)
                                        .toUpperCase() || "U"}
                                </span>

                                <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-white">
                                        {getUserDisplayName(
                                            selectedConversation.other_user,
                                        )}
                                    </p>

                                    <p className="mt-1 text-xs text-slate-500">
                                        Private conversation
                                    </p>
                                </div>
                            </header>

                            <div className="flex min-h-0 flex-1 flex-col">
                                <div className="flex-1 space-y-3 overflow-y-auto p-4 sm:p-5">
                                    {messagesLoading ? (
                                        <div className="flex items-center gap-2 text-sm text-slate-500">
                                            <LoaderCircle className="size-4 animate-spin text-lime-300" />
                                            Loading conversation...
                                        </div>
                                    ) : messages.length === 0 ? (
                                        <div className="grid h-full min-h-64 place-items-center text-center text-sm text-slate-600">
                                            <p>
                                                No messages yet. Say hello to
                                                start the conversation.
                                            </p>
                                        </div>
                                    ) : (
                                        messages.map((message) => {
                                            const isOwnMessage =
                                                message.sender_id ===
                                                currentUser?.id;

                                            return (
                                                <div
                                                    key={message.id}
                                                    className={`flex ${
                                                        isOwnMessage
                                                            ? "justify-end"
                                                            : "justify-start"
                                                    }`}
                                                >
                                                    <div
                                                        className={`max-w-[82%] rounded-2xl px-4 py-3 ${
                                                            isOwnMessage
                                                                ? "bg-lime-300 text-slate-950"
                                                                : "bg-white/[0.07] text-slate-200"
                                                        }`}
                                                    >
                                                        <p className="break-words text-sm leading-6">
                                                            {message.content}
                                                        </p>

                                                        <p
                                                            className={`mt-1 text-[10px] ${
                                                                isOwnMessage
                                                                    ? "text-slate-950/60"
                                                                    : "text-slate-500"
                                                            }`}
                                                        >
                                                            {formatMessageTime(
                                                                message.created_at,
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>

                                <form
                                    onSubmit={sendMessage}
                                    className="flex gap-2 border-t border-white/8 p-4 sm:p-5"
                                >
                                    <input
                                        value={messageText}
                                        onChange={(event) =>
                                            setMessageText(event.target.value)
                                        }
                                        maxLength="2000"
                                        placeholder="Write a private message..."
                                        className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-lime-300/40"
                                    />

                                    <button
                                        type="submit"
                                        disabled={
                                            sending || !messageText.trim()
                                        }
                                        className="grid size-11 shrink-0 place-items-center rounded-xl bg-lime-300 text-slate-950 transition hover:bg-lime-200 disabled:cursor-not-allowed disabled:opacity-50"
                                        aria-label="Send message"
                                    >
                                        {sending ? (
                                            <LoaderCircle className="size-4 animate-spin" />
                                        ) : (
                                            <Send className="size-4" />
                                        )}
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="grid flex-1 place-items-center px-6 text-center">
                            <div>
                                <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-sky-400/10 text-sky-300">
                                    <MessageCircle className="size-6" />
                                </div>

                                <h2 className="mt-4 font-semibold text-white">
                                    Choose a conversation
                                </h2>

                                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                                    Select a conversation or choose a member
                                    from the list to start messaging.
                                </p>
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}

export default Messages;
