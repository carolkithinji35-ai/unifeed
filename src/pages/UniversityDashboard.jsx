import {
    AlertTriangle,
    BarChart3,
    CheckCircle2,
    EyeOff,
    FileText,
    GraduationCap,
    Group,
    LayoutDashboard,
    LogOut,
    Search,
    Settings,
    ShieldCheck,
    UsersRound,
    XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiRequest, logoutUser } from "../lib/authApi";

function Logo() {
    return (
        <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-lime-300 text-lg font-black text-slate-950">
                U
            </span>
            <span className="text-xl font-bold tracking-tight text-white">
                Uni<span className="text-lime-300">Feed</span>
            </span>
        </div>
    );
}

function Metric({ icon: Icon, label, value, tone = "lime", note }) {
    const iconTone =
        tone === "amber"
            ? "text-amber-300"
            : tone === "rose"
              ? "text-rose-300"
              : "text-lime-300";

    return (
        <div className="border border-white/10 bg-[#111820] p-5">
            <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-slate-400">{label}</span>
                <Icon className={`size-5 ${iconTone}`} />
            </div>
            <p className="mt-4 text-3xl font-bold tracking-tight text-white">
                {Number(value || 0).toLocaleString()}
            </p>
            <p className="mt-2 text-xs text-slate-500">{note}</p>
        </div>
    );
}

function AdminSidebar({ onLogout }) {
    const items = [
        ["Overview", LayoutDashboard],
        ["Reports", AlertTriangle],
        ["Students", UsersRound],
        ["Groups", Group],
        ["Analytics", BarChart3],
        ["Settings", Settings],
    ];

    return (
        <aside className="hidden min-h-screen w-60 shrink-0 border-r border-white/8 bg-[#101820] lg:flex lg:flex-col">
            <div className="border-b border-white/8 px-6 py-6">
                <Logo />
            </div>
            <nav
                className="space-y-1 px-3 py-5"
                aria-label="University administration"
            >
                {items.map(([label, Icon], index) => (
                    <button
                        key={label}
                        type="button"
                        className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-semibold ${
                            index === 0
                                ? "border-l-2 border-lime-300 bg-lime-300/10 text-white"
                                : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
                        }`}
                    >
                        <Icon className="size-4" />
                        {label}
                    </button>
                ))}
            </nav>
            <div className="mt-auto border-t border-white/8 px-6 py-6">
                <div className="flex items-center gap-3 text-lime-300">
                    <ShieldCheck className="size-5" />
                    <div>
                        <p className="text-sm font-semibold text-white">
                            Safer campus.
                        </p>
                        <p className="text-xs text-slate-500">
                            Stronger community.
                        </p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={onLogout}
                    className="mt-6 flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-rose-300"
                >
                    <LogOut className="size-3.5" />
                    Sign out
                </button>
            </div>
        </aside>
    );
}

export default function UniversityDashboard() {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const [dashboard, setDashboard] = useState(null);
    const [students, setStudents] = useState([]);
    const [studentSearch, setStudentSearch] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (loading || !user || user.role !== "university_admin") return;

        let cancelled = false;
        Promise.all([
            apiRequest("/api/admin/summary"),
            apiRequest("/api/admin/students"),
        ])
            .then(([summary, studentData]) => {
                if (cancelled) return;
                setDashboard(summary);
                setStudents(studentData.students || []);
            })
            .catch((requestError) => {
                if (!cancelled) {
                    setError(
                        requestError.message ||
                            "Unable to load the university dashboard.",
                    );
                }
            })
            .finally(() => {
                if (!cancelled) setIsLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [loading, user]);

    const handleLogout = async () => {
        await logoutUser();
        navigate("/signin", { replace: true });
    };

    const searchStudents = async (event) => {
        event.preventDefault();
        try {
            const data = await apiRequest(
                `/api/admin/students?search=${encodeURIComponent(studentSearch)}`,
            );
            setStudents(data.students || []);
        } catch (requestError) {
            setError(requestError.message || "Unable to search students.");
        }
    };

    if (loading || (user?.role === "university_admin" && isLoading)) {
        return (
            <div className="grid min-h-screen place-items-center bg-[#0b1117] text-sm text-slate-400">
                Loading university dashboard...
            </div>
        );
    }

    if (!user) return <Navigate to="/signin" replace />;
    if (user.role !== "university_admin") return <Navigate to="/" replace />;

    const metrics = dashboard?.metrics || {};
    const activity = dashboard?.activity || {};
    const activityRows = [
        ["Posts", metrics.total_posts, FileText],
        ["Comments", metrics.total_comments, UsersRound],
        ["Groups", metrics.total_groups, Group],
    ];
    const maxActivity = Math.max(
        ...activityRows.map(([, value]) => Number(value || 0)),
        1,
    );

    return (
        <div className="min-h-screen bg-[#0b1117] text-slate-100 lg:flex">
            <AdminSidebar onLogout={handleLogout} />
            <main className="min-w-0 flex-1">
                <div className="mx-auto max-w-[1480px] px-4 py-6 sm:px-6 lg:px-9 lg:py-8">
                    <header className="flex flex-col justify-between gap-5 border-b border-white/8 pb-7 sm:flex-row sm:items-end">
                        <div>
                            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-lime-300">
                                <GraduationCap className="size-4" />
                                Campus administration
                            </div>
                            <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                                University Dashboard
                            </h1>
                            <p className="mt-2 max-w-2xl text-sm text-slate-400">
                                Monitor campus activity, keep the community
                                safe, and support a positive student experience.
                            </p>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                            <ShieldCheck className="size-4 text-lime-300" />
                            Campus Administration
                        </div>
                    </header>

                    {error && (
                        <div className="mt-6 border border-rose-300/20 bg-rose-300/5 px-4 py-3 text-sm text-rose-200">
                            {error}
                        </div>
                    )}

                    <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <Metric
                            icon={UsersRound}
                            label="Registered students"
                            value={metrics.registered_students}
                            note="Live database count"
                        />
                        <Metric
                            icon={ShieldCheck}
                            label="Students with ID"
                            value={metrics.students_with_id}
                            note="Institutional ID assigned"
                        />
                        <Metric
                            icon={BarChart3}
                            label="Active today"
                            value={metrics.active_today}
                            note="Posts and comments today"
                        />
                        <Metric
                            icon={AlertTriangle}
                            label="Pending reports"
                            value={metrics.pending_reports}
                            tone="amber"
                            note="Real reports only"
                        />
                    </section>

                    <section className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
                        <div className="border border-white/10 bg-[#111820] p-5 sm:p-6">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <h2 className="text-xl font-bold text-white">
                                        Student directory
                                    </h2>
                                    <p className="mt-1 text-sm text-slate-500">
                                        Search by institutional student ID,
                                        username, or email.
                                    </p>
                                </div>
                                <UsersRound className="size-5 text-lime-300" />
                            </div>
                            <form
                                onSubmit={searchStudents}
                                className="mt-5 flex gap-2"
                            >
                                <label className="flex min-w-0 flex-1 items-center gap-2 border border-white/10 bg-white/[0.03] px-3 py-2.5">
                                    <Search className="size-4 text-slate-500" />
                                    <input
                                        value={studentSearch}
                                        onChange={(event) =>
                                            setStudentSearch(event.target.value)
                                        }
                                        placeholder="Search student ID..."
                                        className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
                                    />
                                </label>
                                <button
                                    type="submit"
                                    className="bg-lime-300 px-4 text-sm font-bold text-slate-950"
                                >
                                    Search
                                </button>
                            </form>
                            <div className="mt-4 divide-y divide-white/8">
                                {students.length === 0 ? (
                                    <p className="py-7 text-sm text-slate-500">
                                        No student records match this search.
                                    </p>
                                ) : (
                                    students.slice(0, 6).map((student) => (
                                        <div
                                            key={student.id}
                                            className="flex items-center justify-between gap-4 py-3"
                                        >
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-semibold text-slate-200">
                                                    {[
                                                        student.first_name,
                                                        student.last_name,
                                                    ]
                                                        .filter(Boolean)
                                                        .join(" ") ||
                                                        student.username}
                                                </p>
                                                <p className="mt-1 truncate text-xs text-slate-500">
                                                    @{student.username} · User
                                                    ID {student.id}
                                                </p>
                                            </div>
                                            <span className="shrink-0 text-xs font-semibold text-lime-300">
                                                {student.student_id ||
                                                    "ID pending"}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="border border-white/10 bg-[#111820] p-5 sm:p-6">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <h2 className="text-xl font-bold text-white">
                                        Campus activity
                                    </h2>
                                    <p className="mt-1 text-sm text-slate-500">
                                        Current totals from UniFeed.
                                    </p>
                                </div>
                                <BarChart3 className="size-5 text-lime-300" />
                            </div>
                            <div className="mt-6 space-y-5">
                                {activityRows.map(([label, value, Icon]) => (
                                    <div key={label}>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="flex items-center gap-2 text-slate-400">
                                                <Icon className="size-4 text-lime-300" />
                                                {label}
                                            </span>
                                            <span className="font-semibold text-white">
                                                {Number(
                                                    value || 0,
                                                ).toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="mt-2 h-2 bg-white/8">
                                            <div
                                                className="h-2 bg-lime-300"
                                                style={{
                                                    width: `${Math.max(4, (Number(value || 0) / maxActivity) * 100)}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                                <p className="border-t border-white/8 pt-4 text-xs text-slate-500">
                                    Today: {activity.posts_today || 0} posts ·{" "}
                                    {activity.comments_today || 0} comments
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="mt-6 border border-white/10 bg-[#111820] p-5 sm:p-6">
                        <div className="flex items-center gap-3">
                            <ShieldCheck className="size-6 text-lime-300" />
                            <div>
                                <h2 className="text-xl font-bold text-white">
                                    Student safety overview
                                </h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    Moderation counters remain zero until
                                    reporting is implemented.
                                </p>
                            </div>
                        </div>
                        <div className="mt-6 grid gap-4 md:grid-cols-3">
                            {[
                                [
                                    "Reports resolved",
                                    0,
                                    CheckCircle2,
                                    "text-lime-300",
                                ],
                                [
                                    "Accounts suspended",
                                    0,
                                    XCircle,
                                    "text-rose-300",
                                ],
                                ["Content hidden", 0, EyeOff, "text-amber-300"],
                            ].map(([label, value, Icon, color]) => (
                                <div
                                    key={label}
                                    className="border-t border-white/10 pt-4"
                                >
                                    <Icon className={`size-5 ${color}`} />
                                    <p className="mt-3 text-sm text-slate-400">
                                        {label}
                                    </p>
                                    <p className="mt-1 text-2xl font-bold text-white">
                                        {value}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}
