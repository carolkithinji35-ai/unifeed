import { Bell, LockKeyhole, Palette, ShieldCheck } from "lucide-react";

const settings = [
    {
        title: "Account & password",
        detail: "Your email, username, and password controls.",
        icon: LockKeyhole,
    },
    {
        title: "Notifications",
        detail: "Choose which campus moments reach you.",
        icon: Bell,
    },
    {
        title: "Privacy & safety",
        detail: "Manage visibility, blocking, and reporting preferences.",
        icon: ShieldCheck,
    },
    {
        title: "Appearance",
        detail: "Theme and motion preferences for your UniFeed.",
        icon: Palette,
    },
];

function Settings() {
    return (
        <div className="motion-rise space-y-6">
            <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-lime-300/80">
                    Make it yours
                </p>
                <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                    Settings
                </h1>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                    Your account controls will become available when
                    authentication is connected.
                </p>
            </div>
            <div className="space-y-3">
                {settings.map(({ title, detail, icon: Icon }) => (
                    <button
                        type="button"
                        key={title}
                        className="flex w-full items-center gap-4 rounded-2xl border border-white/8 bg-white/[0.035] p-4 text-left transition hover:border-lime-300/25 hover:bg-white/[0.055]"
                    >
                        <span className="grid size-10 place-items-center rounded-xl bg-lime-300/10 text-lime-300">
                            <Icon className="size-4" />
                        </span>
                        <span className="flex-1">
                            <span className="block text-sm font-semibold text-white">
                                {title}
                            </span>
                            <span className="mt-1 block text-xs text-slate-500">
                                {detail}
                            </span>
                        </span>
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                            Coming soon
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
}

export default Settings;
