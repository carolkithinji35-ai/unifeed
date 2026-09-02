import { ArrowLeft, PenLine } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PostComposer from "../components/PostComposer";
import { getCurrentUser } from "../lib/authApi";

function CreatePost() {
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            try {
                const user = await getCurrentUser();

                if (!user) {
                    navigate("/signin");
                    return;
                }

                setCurrentUser(user);
            } catch (error) {
                console.error("Error loading current user:", error);
                navigate("/signin");
            } finally {
                setLoading(false);
            }
        };

        loadUser();
    }, [navigate]);

    const handlePostCreated = () => {
        navigate("/");
    };

    if (loading) {
        return (
            <div className="grid min-h-[60vh] place-items-center text-sm text-slate-500">
                Preparing your composer...
            </div>
        );
    }

    if (!currentUser) {
        return null;
    }

    return (
        <div className="motion-rise mx-auto max-w-2xl space-y-6">
            <div className="flex items-start gap-4">
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="grid size-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.035] text-slate-400 transition hover:border-lime-300/30 hover:text-lime-300"
                    aria-label="Go back"
                >
                    <ArrowLeft className="size-4" />
                </button>

                <div>
                    <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-lime-300/80">
                        <PenLine className="size-3.5" />
                        Share with campus
                    </p>
                    <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                        Create a post
                    </h1>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                        Share an update, question, opportunity, or campus moment
                        with the UniFeed community.
                    </p>
                </div>
            </div>

            <PostComposer
                currentUser={currentUser}
                onPostCreated={handlePostCreated}
            />
        </div>
    );
}

export default CreatePost;
