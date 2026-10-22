import { useState, useEffect } from "react";
import type { ActivityItem } from "../lib/activity";

function timeAgo(date: Date, now: number): string {
    const seconds = Math.floor((now - date.getTime()) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    const months = Math.floor(days / 30);
    return `${months}mo ago`;
}

function label(item: ActivityItem): string {
    if (item.type === "blog") return "# BLOG";
    if (item.type === "bsky") return "@ BSKY";
    if (item.type === "instagram") return "@ INSTAGRAM";
    if (item.type === "instagram-story") return "@ IG STORY";
    if (item.type === "linkedin") return "@ LINKEDIN";
    if (item.action === "pr") return "! PR";
    if (item.action === "repo") return "+ REPO";
    return "> COMMIT";
}

function displayText(item: ActivityItem): string {
    if (item.type === "blog") return item.title;
    if (item.type === "bsky") return item.text.split("\n")[0].slice(0, 80) + (item.text.length > 80 ? "…" : "");
    return item.text.slice(0, 72) + (item.text.length > 72 ? "…" : "");
}

export default function ActivityFeed() {
    const [items, setItems] = useState<ActivityItem[]>([]);
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(true);
    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        const id = setInterval(() => setNow(Date.now()), 60_000);
        return () => clearInterval(id);
    }, []);

    useEffect(() => {
        fetch("/api/activity.json", { signal: AbortSignal.timeout(15000) })
            .then((r) => {
                if (!r.ok) throw new Error("Activity request failed");
                return r.json();
            })
            .then((data) => {
                const all = [
                    ...(data.bsky.status === "fulfilled" ? data.bsky.value : []),
                    ...(data.blog.status === "fulfilled" ? data.blog.value : []),
                    ...(data.github?.status === "fulfilled" ? data.github.value : []),
                    ...(data.instagram?.status === "fulfilled" ? data.instagram.value : []),
                    ...(data.stories?.status === "fulfilled" ? data.stories.value : []),
                    ...(data.linkedin?.status === "fulfilled" ? data.linkedin.value : []),
                ]
                    .filter((item: any) => item.url && Number.isFinite(Date.parse(item.date)) &&
                        (!item.expiresAt || Date.parse(item.expiresAt) > Date.now()))
                    .filter((item: any, index: number, all: any[]) => all.findIndex((other) => other.url === item.url) === index)
                    .map((item: any) => ({ ...item, date: new Date(item.date) }))
                    .sort((a: any, b: any) => b.date - a.date)
                    .slice(0, 8);
                setItems(all);
            })
            .catch(() => setError(true))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <p className="activity-status" role="status">loading activity…</p>;
    if (error) return <p className="activity-status">couldn't load activity.</p>;
    if (items.length === 0) return <p className="activity-status">no activity yet.</p>;

    return (
        <div className="activity-feed">
            {items.filter((item) => !("expiresAt" in item) || !item.expiresAt || Date.parse(item.expiresAt) > now).map((item) => (
                <div key={item.url} className="activity-item">
                    <div className="activity-meta">
                        <span className={`activity-type ${item.type === "github" ? item.action : item.type}`}>
                            {label(item)}
                        </span>
                        <span className="activity-time">{timeAgo(item.date, now)}</span>
                    </div>
                    <a className="link" href={item.url} target="_blank" rel="noopener noreferrer">
                        {displayText(item)}
                    </a>
                    {"image" in item && item.image && (
                        <img className="activity-image" src={item.image} alt="" loading="lazy" />
                    )}
                </div>
            ))}
        </div>
    );
}
