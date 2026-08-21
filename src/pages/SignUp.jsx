import { Eye, EyeOff, LockKeyhole, Mail, UserRound } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthShell from "../components/AuthShell";
import { registerUser } from "../lib/authApi";

function SignUp() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const update = (field, value) =>
        setForm((current) => ({ ...current, [field]: value }));

    const submit = async (event) => {
        event.preventDefault();
        setError("");
        if (Object.values(form).some((value) => !value.trim()))
            return setError("Complete all fields to create your account.");
        if (form.password.length < 8)
            return setError("Your password should be at least 8 characters.");
        if (form.password !== form.confirmPassword)
            return setError("Your passwords do not match.");
        setLoading(true);
        try {
            await registerUser(form);
            navigate("/");
        } catch (requestError) {
            setError(
                requestError.message.includes("Failed to fetch")
                    ? "Registration is not connected yet. Your Flask API can use this form when it is ready."
                    : requestError.message,
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthShell
            eyebrow="Join the conversation"
            title="Create your UniFeed account"
            description="Find your people and make campus life a little more connected."
            footer={
                <>
                    <span>Already have an account?</span>{" "}
                    <Link
                        to="/signin"
                        className="font-semibold text-lime-300 hover:text-lime-200"
                    >
                        Sign in
                    </Link>
                </>
            }
        >
            <form onSubmit={submit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                        label="First name"
                        value={form.firstName}
                        onChange={(value) => update("firstName", value)}
                        placeholder="Carol"
                        icon={<UserRound className="size-4" />}
                    />
                    <Field
                        label="Last name"
                        value={form.lastName}
                        onChange={(value) => update("lastName", value)}
                        placeholder="Kithinji"
                        icon={<UserRound className="size-4" />}
                    />
                </div>
                <Field
                    label="Username"
                    value={form.username}
                    onChange={(value) => update("username", value)}
                    placeholder="carolcreates"
                    icon={<span className="text-sm text-slate-600">@</span>}
                />
                <Field
                    label="Email address"
                    type="email"
                    value={form.email}
                    onChange={(value) => update("email", value)}
                    placeholder="you@example.com"
                    icon={<Mail className="size-4" />}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                    <PasswordField
                        label="Password"
                        value={form.password}
                        show={showPassword}
                        setShow={() => setShowPassword(!showPassword)}
                        onChange={(value) => update("password", value)}
                    />
                    <PasswordField
                        label="Confirm password"
                        value={form.confirmPassword}
                        show={showPassword}
                        setShow={() => setShowPassword(!showPassword)}
                        onChange={(value) => update("confirmPassword", value)}
                    />
                </div>
                {error && (
                    <p className="rounded-xl border border-rose-300/20 bg-rose-300/5 px-3 py-2.5 text-xs leading-5 text-rose-200">
                        {error}
                    </p>
                )}
                <p className="text-[11px] leading-5 text-slate-600">
                    By creating an account, you agree to keep UniFeed respectful
                    and campus-safe.
                </p>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl bg-lime-300 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-lime-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {loading ? "Creating account..." : "Create account"}
                </button>
            </form>
        </AuthShell>
    );
}

function Field({ label, value, onChange, placeholder, icon, type = "text" }) {
    return (
        <label className="block">
            <span className="mb-2 block text-xs font-semibold text-slate-300">
                {label}
            </span>
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/15 px-3.5 py-3 transition focus-within:border-lime-300/50">
                {icon}
                <input
                    type={type}
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
                    placeholder={placeholder}
                />
            </div>
        </label>
    );
}

function PasswordField({ label, value, show, setShow, onChange }) {
    return (
        <label className="block">
            <span className="mb-2 block text-xs font-semibold text-slate-300">
                {label}
            </span>
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/15 px-3.5 py-3 transition focus-within:border-lime-300/50">
                <LockKeyhole className="size-4 text-slate-600" />
                <input
                    type={show ? "text" : "password"}
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
                    placeholder="8+ characters"
                    autoComplete="new-password"
                />
                <button
                    type="button"
                    onClick={setShow}
                    className="text-slate-600 hover:text-slate-300"
                    aria-label={show ? "Hide password" : "Show password"}
                >
                    {show ? (
                        <EyeOff className="size-4" />
                    ) : (
                        <Eye className="size-4" />
                    )}
                </button>
            </div>
        </label>
    );
}

export default SignUp;
