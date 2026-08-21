import { ArrowLeft, Mail, Send } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import AuthShell from "../components/AuthShell";
import { requestPasswordReset } from "../lib/authApi";

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const submit = async (event) => {
        event.preventDefault();
        setError("");
        setSuccess("");
        if (!email.trim() || !email.includes("@")) {
            setError("Enter a valid email address.");
            return;
        }
        setLoading(true);
        try {
            await requestPasswordReset({ email });
            setSuccess(
                "If an account exists for this email, reset instructions will be sent shortly.",
            );
        } catch (requestError) {
            setError(
                requestError.message.includes("Failed to fetch")
                    ? "Password recovery is not connected yet. Your Flask API can use this form when it is ready."
                    : requestError.message,
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthShell
            eyebrow="Account recovery"
            title="Reset your password"
            description="Enter your email and we’ll help you get back into your campus space."
            footer={
                <Link
                    to="/signin"
                    className="inline-flex items-center gap-2 font-semibold text-lime-300 hover:text-lime-200"
                >
                    <ArrowLeft className="size-4" /> Back to sign in
                </Link>
            }
        >
            <form onSubmit={submit} className="space-y-5">
                <label className="block">
                    <span className="mb-2 block text-xs font-semibold text-slate-300">
                        Email address
                    </span>
                    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/15 px-3.5 py-3 transition focus-within:border-lime-300/50">
                        <Mail className="size-4 text-slate-600" />
                        <input
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
                            placeholder="you@example.com"
                            autoComplete="email"
                        />
                    </div>
                </label>
                {error && (
                    <p className="rounded-xl border border-rose-300/20 bg-rose-300/5 px-3 py-2.5 text-xs leading-5 text-rose-200">
                        {error}
                    </p>
                )}
                {success && (
                    <p className="rounded-xl border border-lime-300/20 bg-lime-300/5 px-3 py-2.5 text-xs leading-5 text-lime-200">
                        {success}
                    </p>
                )}
                <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-lime-300 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-lime-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    <Send className="size-4" />
                    {loading ? "Sending..." : "Send reset link"}
                </button>
            </form>
        </AuthShell>
    );
}

export default ForgotPassword;
