import { Bell, ChevronDown, Search, Sparkles, UserRound } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

// Header component: appears at the top of every page
function Header() {
    const [accountOpen, setAccountOpen] = useState(false);

    return (
        <header className="sticky top-0 z-30 border-b border-white/8 bg-[#0b0d10]/85 backdrop-blur-xl">
            <div className="mx-auto flex h-20 max-w-[1480px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
                <Link
                    to="/"
                    className="flex items-center gap-3"
                    aria-label="UniFeed home"
                >
                    <span className="grid size-10 place-items-center rounded-2xl bg-lime-300 text-lg font-bold text-slate-950 shadow-[0_0_28px_rgba(163,230,53,0.18)]">
                        U
                    </span>
                    <span className="logo hidden text-xl font-semibold tracking-tight text-white sm:block">
                        UniFeed
                    </span>
                </Link>
                <div className="hidden max-w-md flex-1 items-center gap-2 rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-2.5 md:flex">
                    <Search className="size-4 text-slate-500" />
                    <span className="text-sm text-slate-500">
                        Search your campus community
                    </span>
                    <span className="ml-auto rounded-md border border-white/10 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
                        ⌘ K
                    </span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                    <Link
                        to="/notifications"
                        className="relative grid size-10 place-items-center rounded-xl text-slate-400 transition hover:bg-white/7 hover:text-lime-300"
                        aria-label="Notifications"
                    >
                        <Bell className="size-5" />
                        <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-lime-300" />
                    </Link>
                    <button
                        className="hidden size-10 place-items-center rounded-xl text-slate-400 transition hover:bg-white/7 hover:text-lime-300 sm:grid"
                        aria-label="Discover"
                    >
                        <Sparkles className="size-5" />
                    </button>
                    <div className="relative">
                        <button
                            onClick={() => setAccountOpen(!accountOpen)}
                            className={`flex items-center gap-1 rounded-full border p-1 pr-2 transition ${accountOpen ? "border-lime-300/50 bg-lime-300/10" : "border-white/10 bg-white/[0.06] hover:border-white/25"}`}
                            aria-label="Account menu"
                            aria-expanded={accountOpen}
                        >
                            <span className="grid size-8 place-items-center rounded-full bg-slate-800 text-slate-300">
                                <UserRound className="size-4" />
                            </span>
                            <ChevronDown
                                className={`hidden size-3.5 text-slate-500 transition sm:block ${accountOpen ? "rotate-180" : ""}`}
                            />
                        </button>
                        {accountOpen && (
                            <div className="absolute right-0 top-12 w-60 overflow-hidden rounded-2xl border border-white/10 bg-[#15191e] p-2 shadow-2xl shadow-black/40">
                                <div className="border-b border-white/8 px-3 py-3">
                                    <p className="text-sm font-semibold text-white">
                                        Welcome to UniFeed
                                    </p>
                                    <p className="mt-1 text-xs text-slate-500">
                                        Join your campus conversation.
                                    </p>
                                </div>
                                <Link
                                    to="/signin"
                                    onClick={() => setAccountOpen(false)}
                                    className="mt-2 block rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/6 hover:text-lime-300"
                                >
                                    Sign in
                                </Link>
                                <Link
                                    to="/signup"
                                    onClick={() => setAccountOpen(false)}
                                    className="block rounded-xl bg-lime-300 px-3 py-2.5 text-center text-sm font-bold text-slate-950 transition hover:bg-lime-200"
                                >
                                    Create an account
                                </Link>
                                <div className="mt-2 border-t border-white/8 pt-2">
                                    <Link
                                        to="/profile/me"
                                        onClick={() => setAccountOpen(false)}
                                        className="block rounded-xl px-3 py-2 text-xs text-slate-500 hover:bg-white/6 hover:text-slate-300"
                                    >
                                        My profile · ready for auth
                                    </Link>
                                    <Link
                                        to="/settings"
                                        onClick={() => setAccountOpen(false)}
                                        className="block rounded-xl px-3 py-2 text-xs text-slate-500 hover:bg-white/6 hover:text-slate-300"
                                    >
                                        Settings · coming soon
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Header;
