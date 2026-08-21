import {
    ArrowUpRight,
    Bookmark,
    CalendarDays,
    ChevronRight,
    Clock3,
    MessageCircle,
    Plus,
    UsersRound,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
    campusEvents,
    communities,
    messages,
    notifications,
} from "../data/campusContent";

const pageConfig = {
    events: {
        eyebrow: "Campus calendar",
        title: "Events",
        description:
            "Find the conversations, meetups, and moments worth showing up for.",
        action: "Create event",
    },
    communities: {
        eyebrow: "Find your people",
        title: "Communities",
        description:
            "Join spaces built around your interests, course, residence, or campus life.",
        action: "Start a community",
    },
    notifications: {
        eyebrow: "Stay in the loop",
        title: "Notifications",
        description:
            "Your latest activity, reminders, and conversations in one place.",
        action: null,
    },
    messages: {
        eyebrow: "Private conversations",
        title: "Messages",
        description:
            "Keep the campus conversation going, one thoughtful message at a time.",
        action: "New message",
    },
    bookmarks: {
        eyebrow: "Your collection",
        title: "Bookmarks",
        description:
            "Save the posts, events, and resources you want to come back to.",
        action: null,
    },
};

function FuturePage({ type }) {
    const config = pageConfig[type];

    return (
        <div className="motion-rise space-y-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-lime-300/80">
                        {config.eyebrow}
                    </p>
                    <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                        {config.title}
                    </h1>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                        {config.description}
                    </p>
                </div>
                {config.action && (
                    <button
                        type="button"
                        className="flex items-center justify-center gap-2 self-start rounded-xl bg-lime-300 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-lime-200 active:scale-[0.98] sm:self-auto"
                    >
                        <Plus className="size-4" /> {config.action}
                    </button>
                )}
            </div>

            {type === "events" && <EventList />}
            {type === "communities" && <CommunityList />}
            {type === "notifications" && <NotificationList />}
            {type === "messages" && <MessageList />}
            {type === "bookmarks" && <BookmarkEmpty />}
        </div>
    );
}

function EventList() {
    return (
        <div className="space-y-4">
            {campusEvents.map((event) => (
                <article
                    key={event.title}
                    className="group overflow-hidden rounded-3xl border border-white/8 bg-white/[0.035] transition hover:border-lime-300/30 hover:bg-white/[0.055]"
                >
                    <div
                        className={`h-2 ${event.tone === "lime" ? "bg-lime-300" : event.tone === "violet" ? "bg-violet-400" : "bg-sky-400"}`}
                    />
                    <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-6">
                        <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-white/6 text-lime-300">
                            <CalendarDays className="size-6" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h2 className="font-semibold text-white">
                                {event.title}
                            </h2>
                            <p className="mt-1 text-sm text-lime-300/80">
                                {event.meta}
                            </p>
                            <p className="mt-2 text-sm leading-6 text-slate-500">
                                {event.detail}
                            </p>
                        </div>
                        <button
                            type="button"
                            className="flex items-center gap-2 self-start rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-lime-300/30 hover:text-lime-300 sm:self-auto"
                        >
                            View details <ArrowUpRight className="size-3.5" />
                        </button>
                    </div>
                </article>
            ))}
        </div>
    );
}

function CommunityList() {
    return (
        <div className="grid gap-4 sm:grid-cols-2">
            {communities.map((community) => (
                <article
                    key={community.name}
                    className="rounded-3xl border border-white/8 bg-white/[0.035] p-5 transition hover:-translate-y-0.5 hover:border-lime-300/30 hover:bg-white/[0.055]"
                >
                    <div className="flex items-start justify-between">
                        <div className="grid size-12 place-items-center rounded-2xl bg-lime-300/15 font-semibold text-lime-300">
                            {community.initials}
                        </div>
                        <button
                            type="button"
                            className="rounded-xl border border-white/10 p-2 text-slate-500 transition hover:text-lime-300"
                            aria-label={`Join ${community.name}`}
                        >
                            <UsersRound className="size-4" />
                        </button>
                    </div>
                    <h2 className="mt-5 font-semibold text-white">
                        {community.name}
                    </h2>
                    <p className="mt-1 text-xs text-lime-300/80">
                        {community.members}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-slate-500">
                        {community.description}
                    </p>
                    <button
                        type="button"
                        className="mt-5 flex items-center gap-1 text-sm font-semibold text-slate-300 transition hover:text-lime-300"
                    >
                        Explore community <ChevronRight className="size-4" />
                    </button>
                </article>
            ))}
        </div>
    );
}

function NotificationList() {
    return (
        <div className="space-y-2">
            {notifications.map((notification) => (
                <article
                    key={notification.title}
                    className="flex items-center gap-4 rounded-2xl border border-white/8 bg-white/[0.035] p-4 transition hover:bg-white/[0.055]"
                >
                    <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-lime-300/10 text-lime-300">
                        {notification.type === "like" ? (
                            <span className="text-lg">♥</span>
                        ) : notification.type === "event" ? (
                            <CalendarDays className="size-4" />
                        ) : notification.type === "reply" ? (
                            <MessageCircle className="size-4" />
                        ) : (
                            <UsersRound className="size-4" />
                        )}
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-semibold text-white">
                            {notification.title}
                        </p>
                        <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                            <Clock3 className="size-3" /> {notification.detail}
                        </p>
                    </div>
                    <span className="size-2 rounded-full bg-lime-300" />
                </article>
            ))}
        </div>
    );
}

function MessageList() {
    return (
        <div className="space-y-2">
            {messages.map((message) => (
                <Link
                    key={message.name}
                    to="#"
                    className="flex items-center gap-4 rounded-2xl border border-white/8 bg-white/[0.035] p-4 transition hover:border-lime-300/25 hover:bg-white/[0.055]"
                >
                    <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-sky-400/15 text-sm font-semibold text-sky-300">
                        {message.initials}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-white">
                            {message.name}
                        </p>
                        <p className="mt-1 truncate text-sm text-slate-500">
                            {message.preview}
                        </p>
                    </div>
                    <span className="text-xs text-slate-600">
                        {message.time}
                    </span>
                    <ChevronRight className="size-4 text-slate-600" />
                </Link>
            ))}
        </div>
    );
}

function BookmarkEmpty() {
    return (
        <div className="grid min-h-[360px] place-items-center rounded-3xl border border-dashed border-white/10 bg-white/[0.02] px-6 text-center">
            <div>
                <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-lime-300/10 text-lime-300">
                    <Bookmark className="size-6" />
                </div>
                <h2 className="mt-4 font-semibold text-white">
                    Your collection starts here
                </h2>
                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                    Save an inspiring post, useful event, or campus resource and
                    it will appear here.
                </p>
            </div>
        </div>
    );
}

export default FuturePage;
