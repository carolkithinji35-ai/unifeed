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
        <div className="rounded-2xl border border-white/10 bg-[#111820] p-5">
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

function AdminSidebar({ activeSection, onSectionChange, onLogout }) {
    const items = [
        ["Overview", LayoutDashboard],
        ["Reports", AlertTriangle],
        ["Students", UsersRound],
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
                        onClick={() => onSectionChange(label.toLowerCase())}
                        className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-semibold ${
                            activeSection === label.toLowerCase()
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
    const [lastUpdated, setLastUpdated] = useState(null);
    const [activeSection, setActiveSection] = useState("overview");

    useEffect(() => {
        if (loading || !user || user.role !== "university_admin") {
            return undefined;
        }

        let cancelled = false;

        const loadDashboard = async () => {
            try {
                const [summary, studentData] = await Promise.all([
                    apiRequest("/api/admin/summary"),
                    apiRequest("/api/admin/students"),
                ]);

                if (cancelled) return;

                setDashboard(summary);
                setStudents(studentData.students || []);
                setLastUpdated(new Date());
                setError("");
            } catch (requestError) {
                if (!cancelled) {
                    setError(
                        requestError.message ||
                            "Unable to load the university dashboard.",
                    );
                }
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        };

        loadDashboard();
        const refreshInterval = window.setInterval(loadDashboard, 30_000);

        return () => {
            cancelled = true;
            window.clearInterval(refreshInterval);
        };
    }, [loading, user]);

    useEffect(() => {
        if (loading || !user || user.role !== "university_admin") {
            return undefined;
        }

        let cancelled = false;
        const timer = window.setTimeout(async () => {
            try {
                const data = await apiRequest(
                    `/api/admin/students?search=${encodeURIComponent(studentSearch.trim())}`,
                );

                if (!cancelled) {
                    setStudents(data.students || []);
                    setError("");
                }
            } catch (requestError) {
                if (!cancelled) {
                    setError(
                        requestError.message || "Unable to search students.",
                    );
                }
            }
        }, 300);

        return () => {
            cancelled = true;
            window.clearTimeout(timer);
        };
    }, [loading, studentSearch, user]);

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
    const reports = dashboard?.reports || [];
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
            <AdminSidebar
                activeSection={activeSection}
                onSectionChange={setActiveSection}
                onLogout={handleLogout}
            />
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
                        <div className="flex flex-col items-start gap-1 text-xs text-slate-400 sm:items-end">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="size-4 text-lime-300" />
                                Campus Administration
                            </div>
                            <span className="text-[11px] text-slate-600">
                                {lastUpdated
                                    ? `Live · updated ${lastUpdated.toLocaleTimeString()}`
                                    : "Loading live data..."}
                            </span>
                        </div>
                    </header>

                    {error && (
                        <div className="mt-6 border border-rose-300/20 bg-rose-300/5 px-4 py-3 text-sm text-rose-200">
                            {error}
                        </div>
                    )}

                    <section
                        className={`mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4 ${activeSection !== "overview" ? "hidden" : ""}`}
                    >
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

                    <section
                        className={`mt-6 grid gap-6 xl:grid-cols-[1.25fr_0.75fr] ${activeSection !== "overview" ? "hidden" : ""}`}
                    >
                        <div className="rounded-2xl border border-white/10 bg-[#111820] p-5 sm:p-6">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <h2 className="text-xl font-bold text-white">
                                        Recent reports
                                    </h2>
                                    <p className="mt-1 text-sm text-slate-500">
                                        Reported content and the account it
                                        belongs to.
                                    </p>
                                </div>
                                <AlertTriangle className="size-5 text-amber-300" />
                            </div>
                            <div className="mt-5 divide-y divide-white/8">
                                {reports.length === 0 ? (
                                    <p className="py-7 text-sm text-slate-500">
                                        No reports have been submitted yet.
                                    </p>
                                ) : (
                                    reports.map((report) => (
                                        <div key={report.id} className="py-3">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex min-w-0 items-center gap-2">
                                                    <span className="size-2 shrink-0 rounded-full bg-amber-300" />
                                                    <span className="text-sm font-semibold text-slate-200">
                                                        {report.reason}
                                                    </span>
                                                    <span className="text-xs text-slate-600">
                                                        {report.content_type}
                                                    </span>
                                                </div>
                                                <span className="shrink-0 rounded-full bg-amber-300/10 px-2 py-1 text-[10px] font-semibold text-amber-200">
                                                    {report.status.replace(
                                                        "_",
                                                        " ",
                                                    )}
                                                </span>
                                            </div>
                                            <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-400">
                                                {report.content}
                                            </p>
                                            <p className="mt-2 text-[11px] text-slate-600">
                                                Account:{" "}
                                                {report.reported_account
                                                    .student_id ||
                                                    "ID pending"}{" "}
                                                · @
                                                {
                                                    report.reported_account
                                                        .username
                                                }{" "}
                                                ·{" "}
                                                {new Date(
                                                    report.created_at,
                                                ).toLocaleString()}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-[#111820] p-5 sm:p-6">
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

                    <section
                        className={`mt-6 rounded-2xl border border-white/10 bg-[#111820] p-5 sm:p-6 ${activeSection !== "overview" ? "hidden" : ""}`}
                    >
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

                    <section
                        className={
                            activeSection === "reports"
                                ? "mt-6 rounded-2xl border border-white/10 bg-[#111820] p-5 sm:p-6"
                                : "hidden"
                        }
                    >
                        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                            <div>
                                <h2 className="text-xl font-bold text-white">
                                    All reports
                                </h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    Review reported posts and comments using
                                    live UniFeed data.
                                </p>
                            </div>
                            <span className="text-xs text-slate-500">
                                {reports.length.toLocaleString()} reports loaded
                            </span>
                        </div>

                        <div className="mt-6 overflow-x-auto">
                            <table className="w-full min-w-[900px] text-left text-sm">
                                <thead className="border-b border-white/10 text-xs uppercase tracking-[0.16em] text-slate-600">
                                    <tr>
                                        <th className="px-3 py-3 font-semibold">
                                            Reason
                                        </th>
                                        <th className="px-3 py-3 font-semibold">
                                            Content
                                        </th>
                                        <th className="px-3 py-3 font-semibold">
                                            Reported account
                                        </th>
                                        <th className="px-3 py-3 font-semibold">
                                            Status
                                        </th>
                                        <th className="px-3 py-3 font-semibold">
                                            Date
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/8">
                                    {reports.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan="5"
                                                className="px-3 py-10 text-center text-slate-500"
                                            >
                                                No reports have been submitted
                                                yet.
                                            </td>
                                        </tr>
                                    ) : (
                                        reports.map((report) => (
                                            <tr
                                                key={report.id}
                                                className="align-top hover:bg-white/[0.025]"
                                            >
                                                <td className="px-3 py-4 font-semibold text-slate-200">
                                                    {report.reason}
                                                </td>
                                                <td className="max-w-[320px] px-3 py-4">
                                                    <span className="text-xs uppercase tracking-wide text-slate-600">
                                                        {report.content_type}
                                                    </span>
                                                    <p className="mt-1 line-clamp-3 text-slate-400">
                                                        {report.content}
                                                    </p>
                                                </td>
                                                <td className="px-3 py-4">
                                                    <p className="font-semibold text-white">
                                                        @
                                                        {report.reported_account
                                                            ?.username ||
                                                            "Unknown"}
                                                    </p>
                                                    <p className="mt-1 font-mono text-xs text-lime-300">
                                                        {report.reported_account
                                                            ?.student_id ||
                                                            "ID pending"}
                                                    </p>
                                                </td>
                                                <td className="px-3 py-4">
                                                    <span className="rounded-full bg-amber-300/10 px-2 py-1 text-xs font-semibold capitalize text-amber-200">
                                                        {String(
                                                            report.status ||
                                                                "pending",
                                                        ).replace("_", " ")}
                                                    </span>
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-xs text-slate-500">
                                                    {new Date(
                                                        report.created_at,
                                                    ).toLocaleString()}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <section
                        className={
                            activeSection === "students"
                                ? "mt-6 rounded-2xl border border-white/10 bg-[#111820] p-5 sm:p-6"
                                : "hidden"
                        }
                    >
                        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                            <div>
                                <h2 className="text-xl font-bold text-white">
                                    All UniFeed students
                                </h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    Search by institutional student ID or
                                    student name.
                                </p>
                            </div>
                            <span className="text-xs text-slate-500">
                                {students.length.toLocaleString()} records shown
                            </span>
                        </div>

                        <form
                            onSubmit={searchStudents}
                            className="mt-5 flex flex-col gap-3 sm:flex-row"
                        >
                            <label className="relative min-w-0 flex-1">
                                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
                                <input
                                    value={studentSearch}
                                    onChange={(event) =>
                                        setStudentSearch(event.target.value)
                                    }
                                    placeholder="Search by student ID or name..."
                                    className="w-full rounded-xl border border-white/10 bg-[#0b1117] py-3 pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-lime-300/60"
                                />
                            </label>
                            <button
                                type="submit"
                                className="rounded-xl bg-lime-300 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-lime-200"
                            >
                                Search
                            </button>
                        </form>

                        <div className="mt-6 overflow-x-auto">
                            <table className="w-full min-w-[680px] text-left text-sm">
                                <thead className="border-b border-white/10 text-xs uppercase tracking-[0.16em] text-slate-600">
                                    <tr>
                                        <th className="px-3 py-3 font-semibold">
                                            Student
                                        </th>
                                        <th className="px-3 py-3 font-semibold">
                                            Institutional ID
                                        </th>
                                        <th className="px-3 py-3 font-semibold">
                                            Username
                                        </th>
                                        <th className="px-3 py-3 font-semibold">
                                            Email
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/8">
                                    {students.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan="4"
                                                className="px-3 py-8 text-center text-slate-500"
                                            >
                                                No student records found.
                                            </td>
                                        </tr>
                                    ) : (
                                        students.map((student) => (
                                            <tr
                                                key={student.id}
                                                className="hover:bg-white/[0.025]"
                                            >
                                                <td className="px-3 py-4 font-semibold text-white">
                                                    {[
                                                        student.first_name,
                                                        student.last_name,
                                                    ]
                                                        .filter(Boolean)
                                                        .join(" ") ||
                                                        "Unnamed student"}
                                                </td>
                                                <td className="px-3 py-4 font-mono text-lime-300">
                                                    {student.student_id ||
                                                        "ID pending"}
                                                </td>
                                                <td className="px-3 py-4 text-slate-300">
                                                    @{student.username}
                                                </td>
                                                <td className="px-3 py-4 text-slate-400">
                                                    {student.email}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}
