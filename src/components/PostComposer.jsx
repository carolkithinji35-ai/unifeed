import { ImagePlus, Send, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

function PostComposer({ onPostCreated, currentUser }) {
    const [body, setBody] = useState("");
    const [file, setFile] = useState(null);
    const [error, setError] = useState("");
    const [status, setStatus] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const fileInputRef = useRef(null);

    const preview = useMemo(
        () => (file ? URL.createObjectURL(file) : ""),
        [file],
    );

    useEffect(() => {
        return () => {
            if (preview) URL.revokeObjectURL(preview);
        };
    }, [preview]);

    const onFileChange = (event) => {
        const selected = event.target.files?.[0];
        if (!selected) return;

        if (!selected.type.startsWith("image/")) {
            setError("Please choose an image file.");
            return;
        }

        if (selected.size > 5 * 1024 * 1024) {
            setError("Images must be smaller than 5 MB.");
            return;
        }

        setError("");
        setFile(selected);
        setStatus("Images are preview-only for now; text will be posted.");
    };

    const clearFile = () => {
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!body.trim()) {
            setError("Add some text before posting.");
            return;
        }

        setError("");
        setStatus("");
        setSubmitting(true);

        try {
            const response = await fetch("/api/posts", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    content: body.trim(),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Unable to create post.");
            }

            setBody("");
            clearFile();
            setStatus("Post shared with your campus.");
            onPostCreated?.(data);
        } catch (requestError) {
            console.error("Error creating post:", requestError);
            setError(requestError.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-white/8 bg-white/[0.035] p-5 shadow-xl shadow-black/10 sm:p-6"
        >
            <div className="flex gap-3">
                <div className="grid size-10 shrink-0 place-items-center rounded-2xl bg-lime-300 text-sm font-bold text-slate-950">
                    {currentUser?.username?.charAt(0).toUpperCase() || "U"}
                </div>
                <textarea
                    value={body}
                    onChange={(event) => {
                        setBody(event.target.value);
                        setStatus("");
                        setError("");
                    }}
                    rows="2"
                    placeholder="Share a campus moment..."
                    className="min-h-[64px] flex-1 resize-none bg-transparent text-sm leading-6 text-white outline-none placeholder:text-slate-600"
                />
            </div>

            {preview && (
                <div className="relative mt-4 overflow-hidden rounded-2xl border border-white/8">
                    <img
                        src={preview}
                        alt="Selected post preview"
                        className="max-h-72 w-full object-cover"
                    />
                    <button
                        type="button"
                        onClick={clearFile}
                        className="absolute right-3 top-3 grid size-8 place-items-center rounded-xl bg-black/60 text-white backdrop-blur transition hover:bg-black/80"
                        aria-label="Remove image"
                    >
                        <X className="size-4" />
                    </button>
                </div>
            )}

            {error && (
                <p className="mt-3 text-xs font-medium text-rose-300">
                    {error}
                </p>
            )}

            {status && (
                <p className="mt-3 text-xs font-medium text-lime-300">
                    {status}
                </p>
            )}

            <div className="mt-4 flex items-center justify-between border-t border-white/8 pt-4">
                <div className="flex items-center gap-2">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={onFileChange}
                        className="hidden"
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-400 transition hover:bg-white/6 hover:text-lime-300"
                    >
                        <ImagePlus className="size-4" /> Add image
                    </button>
                    <span className="hidden text-[11px] text-slate-600 sm:block">
                        PNG, JPG, or WebP · 5 MB max
                    </span>
                </div>
                <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-2 rounded-xl bg-lime-300 px-3.5 py-2 text-xs font-bold text-slate-950 transition hover:bg-lime-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                >
                    <Send className="size-3.5" />
                    {submitting ? "Posting..." : "Post"}
                </button>
            </div>
        </form>
    );
}

export default PostComposer;
