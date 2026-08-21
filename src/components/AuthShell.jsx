import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

function AuthShell({ eyebrow, title, description, children, footer }) {
    return (
        <div className="min-h-[calc(100vh-10rem)] py-4 sm:py-10">
            <div className="grid overflow-hidden rounded-[2rem] border border-white/8 bg-white/[0.035] lg:grid-cols-[0.9fr_1.1fr]">
                <div className="relative hidden overflow-hidden bg-[radial-gradient(circle_at_20%_20%,rgba(163,230,53,0.45),transparent_26%),linear-gradient(145deg,#1a2418,#0d1110_65%)] p-10 lg:flex lg:flex-col lg:justify-between">
                    <div className="relative z-10">
                        <Link
                            to="/"
                            className="inline-flex items-center gap-2 text-sm font-semibold text-white"
                        >
                            <span className="grid size-9 place-items-center rounded-xl bg-lime-300 font-bold text-slate-950">
                                U
                            </span>{" "}
                            UniFeed
                        </Link>
                        <div className="mt-28 max-w-sm">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-lime-300">
                                One campus, one conversation
                            </p>
                            <h2 className="mt-4 text-4xl font-semibold leading-tight text-white">
                                Your people are already here.
                            </h2>
                            <p className="mt-5 text-sm leading-7 text-slate-300/80">
                                Discover campus moments, find your communities,
                                and keep up with the conversations that make
                                student life yours.
                            </p>
                        </div>
                    </div>
                    <div className="relative z-10 flex items-center gap-2 text-xs text-slate-300/70">
                        <ShieldCheck className="size-4 text-lime-300" /> Your
                        account stays yours.
                    </div>
                    <div className="absolute -bottom-24 -right-20 size-72 rounded-full border border-lime-300/20 bg-lime-300/10 blur-2xl" />
                </div>
                <div className="p-6 sm:p-10">
                    <Link
                        to="/"
                        className="mb-10 inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-white lg:hidden"
                    >
                        <ArrowLeft className="size-4" /> Back to UniFeed
                    </Link>
                    <div className="mx-auto max-w-md">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-lime-300/80">
                            {eyebrow}
                        </p>
                        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
                            {title}
                        </h1>
                        <p className="mt-2 text-sm leading-6 text-slate-500">
                            {description}
                        </p>
                        <div className="mt-8">{children}</div>
                        {footer && (
                            <div className="mt-8 border-t border-white/8 pt-6 text-center text-sm text-slate-500">
                                {footer}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AuthShell;
