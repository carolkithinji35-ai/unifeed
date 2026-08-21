import { Bookmark, Heart, MessageCircle, Repeat2, Share2 } from "lucide-react";
import { useState } from "react";

function CampusPostCard({ post, index }) {
    const [liked, setLiked] = useState(false);
    const [likes, setLikes] = useState(64 + index * 13);

    return (
        <article className="rounded-3xl border border-lime-300/10 bg-[linear-gradient(135deg,rgba(163,230,53,0.06),rgba(255,255,255,0.035)_44%)] p-5 transition hover:border-lime-300/25 hover:bg-white/[0.055] sm:p-6">
            <div className="flex items-start gap-4">
                <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-lime-300 text-sm font-bold text-slate-950">U</div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3"><div><div className="flex flex-wrap items-center gap-2"><span className="text-sm font-semibold text-white">UniFeed Campus Desk</span><span className="rounded-full bg-lime-300/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-lime-300">{post.eyebrow}</span></div><p className="mt-1 text-xs text-slate-600">Community prompt · {index + 1}h ago</p></div><button type="button" className="rounded-lg p-1 text-slate-600 transition hover:bg-white/8 hover:text-white" aria-label="Save campus post"><Bookmark className="size-4" /></button></div>
                    <p className="mt-4 text-[15px] leading-7 text-slate-200">{post.text}</p>
                    <div className="mt-4 flex flex-wrap gap-2">{post.tags.map((tag) => <span key={tag} className="rounded-full bg-white/6 px-2.5 py-1 text-[11px] font-medium text-slate-500">{tag}</span>)}</div>
                    <div className="mt-5 flex items-center justify-between border-t border-white/8 pt-4 text-xs text-slate-500 sm:justify-start sm:gap-7"><button type="button" className="flex items-center gap-2 transition hover:text-sky-300" aria-label="Comment on campus post"><MessageCircle className="size-4" /><span>{8 + index}</span></button><button type="button" className="flex items-center gap-2 transition hover:text-lime-300" aria-label="Repost campus post"><Repeat2 className="size-4" /><span>{12 + index}</span></button><button type="button" onClick={() => { const next = !liked; setLiked(next); setLikes(next ? likes + 1 : likes - 1); }} className={`flex items-center gap-2 transition ${liked ? "text-rose-400" : "hover:text-rose-400"}`} aria-label="Like campus post"><Heart className="size-4" fill={liked ? "currentColor" : "none"} /><span>{likes}</span></button><button type="button" className="ml-auto transition hover:text-sky-300" aria-label="Share campus post"><Share2 className="size-4" /></button></div>
                </div>
            </div>
        </article>
    );
}

export default CampusPostCard;
