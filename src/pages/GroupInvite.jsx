import { ArrowLeft, Check, Link2, UsersRound } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiRequest, getCurrentUser } from "../lib/authApi";

function GroupInvite() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [invite, setInvite] = useState(null);
    const [loading, setLoading] = useState(true);
    const [accepting, setAccepting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;
        const loadInvite = async () => {
            try {
                const data = await apiRequest(`/api/group-invites/${token}`);
                if (!cancelled) setInvite(data);
            } catch (requestError) {
                if (!cancelled)
                    setError(
                        requestError.message ||
                            "This invite is invalid or expired.",
                    );
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        loadInvite();
        return () => {
            cancelled = true;
        };
    }, [token]);

    const acceptInvite = async () => {
        setAccepting(true);
        setError("");
        try {
            await getCurrentUser();
            const group = await apiRequest(
                `/api/group-invites/${token}/accept`,
                {
                    method: "POST",
                },
            );
            navigate(`/groups?group=${group.id}`);
        } catch (requestError) {
            if (requestError.status === 401) {
                navigate(`/signin?next=/group-invite/${token}`);
                return;
            }
            setError(requestError.message || "Unable to accept this invite.");
        } finally {
            setAccepting(false);
        }
    };

    return (
        <div className="motion-rise mx-auto max-w-xl space-y-6">
            <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-lime-300"
            >
                <ArrowLeft className="size-4" /> Back
            </button>

            <section className="rounded-3xl border border-lime-300/15 bg-white/[0.035] p-6 text-center sm:p-8">
                <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-lime-300/15 text-lime-300">
                    <Link2 className="size-7" />
                </div>
                {loading ? (
                    <p className="mt-5 text-sm text-slate-500">
                        Checking invitation...
                    </p>
                ) : error ? (
                    <>
                        <h1 className="mt-5 text-2xl font-semibold text-white">
                            Invite unavailable
                        </h1>
                        <p className="mt-2 text-sm text-rose-200">{error}</p>
                    </>
                ) : invite ? (
                    <>
                        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-lime-300/80">
                            Private Group invitation
                        </p>
                        <h1 className="mt-2 break-words text-3xl font-semibold text-white">
                            {invite.group.title}
                        </h1>
                        <p className="mt-3 text-sm leading-6 text-slate-400">
                            {invite.group.description}
                        </p>
                        <p className="mt-4 inline-flex items-center gap-2 text-xs text-slate-500">
                            <UsersRound className="size-4 text-lime-300" />
                            Invite-only space · expires{" "}
                            {new Date(invite.expires_at).toLocaleDateString()}
                        </p>
                        {error && (
                            <p className="mt-4 text-sm text-rose-200">
                                {error}
                            </p>
                        )}
                        <button
                            type="button"
                            onClick={acceptInvite}
                            disabled={accepting}
                            className="mx-auto mt-6 inline-flex items-center gap-2 rounded-xl bg-lime-300 px-5 py-3 text-sm font-bold text-slate-950 disabled:opacity-60"
                        >
                            <Check className="size-4" />
                            {accepting ? "Joining..." : "Accept invitation"}
                        </button>
                    </>
                ) : null}
            </section>
        </div>
    );
}

export default GroupInvite;
