import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import AuthShell from "../components/AuthShell";
import { loginUser } from "../lib/authApi";

function SignIn() {
    const [form, setForm] = useState({
        identifier: "",
        password: "",
        rememberMe: false,
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const update = (field, value) =>
        setForm((current) => ({ ...current, [field]: value }));

    const submit = async (event) => {
        event.preventDefault();
        setError("");

        if (!form.identifier.trim() || !form.password) {
            setError("Enter your email and password.");
            return;
        }

        setLoading(true);

        try {
            await loginUser({
                identifier: form.identifier.trim(),
                password: form.password,
            });

            // Reload after login so Feed reads the new Flask session cookie.
            window.location.assign("/");
        } catch (requestError) {
            setError(
                requestError.message.includes("Failed to fetch")
                    ? "The authentication server could not be reached. Check that the API is live and try again."
                    : requestError.message,
            );
            setLoading(false);
        }
    };

    return (
        <AuthShell
            eyebrow="Welcome back"
            title="Sign in to UniFeed"
            description="Pick up where you left off with your campus community."
            footer={
                <>
                    <span>New to UniFeed?</span>{" "}
                    <Link
                        to="/signup"
                        className="font-semibold text-lime-300 hover:text-lime-200"
                    >
                        Create an account
                    </Link>
                </>
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
                            value={form.identifier}
                            onChange={(event) =>
                                update("identifier", event.target.value)
                            }
                            className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
                            placeholder="you@example.com"
                            autoComplete="username"
                        />
                    </div>
                </label>

                <label className="block">
                    <span className="mb-2 block text-xs font-semibold text-slate-300">
                        Password
                    </span>
                    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/15 px-3.5 py-3 transition focus-within:border-lime-300/50">
                        <LockKeyhole className="size-4 text-slate-600" />
                        <input
                            type={showPassword ? "text" : "password"}
                            value={form.password}
                            onChange={(event) =>
                                update("password", event.target.value)
                            }
                            className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
                            placeholder="Enter your password"
                            autoComplete="current-password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-slate-600 hover:text-slate-300"
                            aria-label={
                                showPassword ? "Hide password" : "Show password"
                            }
                        >
                            {showPassword ? (
                                <EyeOff className="size-4" />
                            ) : (
                                <Eye className="size-4" />
                            )}
                        </button>
                    </div>
                </label>

                <div className="flex items-center justify-between gap-3 text-xs">
                    <label className="flex items-center gap-2 text-slate-500">
                        <input
                            type="checkbox"
                            checked={form.rememberMe}
                            onChange={(event) =>
                                update("rememberMe", event.target.checked)
                            }
                            className="accent-lime-300"
                        />{" "}
                        Remember me
                    </label>
                    <Link
                        to="/forgot-password"
                        className="font-semibold text-lime-300 hover:text-lime-200"
                    >
                        Forgot password?
                    </Link>
                </div>

                {error && (
                    <p className="rounded-xl border border-rose-300/20 bg-rose-300/5 px-3 py-2.5 text-xs leading-5 text-rose-200">
                        {error}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl bg-lime-300 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-lime-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {loading ? "Signing in..." : "Sign in"}
                </button>
            </form>
        </AuthShell>
    );
}

export default SignIn;
