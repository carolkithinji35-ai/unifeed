import { FileText, UserRoundCheck } from "lucide-react";

const capsuleItems = [
    { id: "posts", label: "Posts", icon: FileText },
    { id: "following", label: "Following", icon: UserRoundCheck },
];

function MobileFeedCapsules({ activeView, onChange }) {
    return (
        <nav
            className="sidebar-scroll -mx-1 flex snap-x snap-mandatory gap-2 overflow-x-auto px-1 pb-1 lg:hidden"
            aria-label="Feed sections"
        >
            {capsuleItems.map(({ id, label, icon: Icon }) => {
                const active = activeView === id;

                return (
                    <button
                        key={id}
                        type="button"
                        onClick={() => onChange(id)}
                        aria-current={active ? "page" : undefined}
                        className={`inline-flex min-w-max snap-start items-center gap-2 rounded-full border px-4 py-2.5 text-xs font-semibold transition active:scale-[0.98] ${
                            active
                                ? "border-lime-300 bg-lime-300 text-slate-950 shadow-[0_8px_24px_rgba(163,230,53,0.16)]"
                                : "border-white/10 bg-white/[0.045] text-slate-400 hover:border-lime-300/30 hover:text-white"
                        }`}
                    >
                        <Icon className="size-3.5" strokeWidth={2.2} />
                        {label}
                    </button>
                );
            })}
        </nav>
    );
}

export default MobileFeedCapsules;
