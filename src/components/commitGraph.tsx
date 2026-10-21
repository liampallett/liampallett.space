import { useState, useEffect, useRef } from "react";
import type { CommitGraph } from "../lib/commits";

const WEEKS = 53;

function dayKey(date: Date): string {
    return date.toISOString().slice(0, 10);
}

/** Maps a commit count to a 0–4 intensity bucket for colouring. */
function level(count: number): number {
    if (count === 0) return 0;
    if (count <= 2) return 1;
    if (count <= 5) return 2;
    if (count <= 9) return 3;
    return 4;
}

/**
 * Builds a GitHub-style grid: WEEKS columns, each a Sun–Sat run of days,
 * ending on the week containing today.
 */
function buildWeeks(counts: Record<string, number>): { date: Date; count: number }[][] {
    const end = new Date();
    // Walk back to the Sunday starting the grid's first week.
    const start = new Date(end);
    start.setUTCDate(start.getUTCDate() - (WEEKS - 1) * 7 - end.getUTCDay());

    const weeks: { date: Date; count: number }[][] = [];
    const cursor = new Date(start);

    for (let w = 0; w < WEEKS; w++) {
        const week: { date: Date; count: number }[] = [];
        for (let d = 0; d < 7; d++) {
            const key = dayKey(cursor);
            week.push({ date: new Date(cursor), count: counts[key] ?? 0 });
            cursor.setUTCDate(cursor.getUTCDate() + 1);
        }
        weeks.push(week);
    }

    return weeks;
}

interface Tooltip {
    text: string;
    x: number;
    y: number;
}

function formatDate(date: Date): string {
    return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function CommitGraph() {
    const [graph, setGraph] = useState<CommitGraph | null>(null);
    const [error, setError] = useState(false);
    const [tooltip, setTooltip] = useState<Tooltip | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Tooltip is hover-driven, so only enable it on devices with a fine pointer.
    // On touch, mouseleave never fires and the bubble would get stuck.
    const canHover = typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    useEffect(() => {
        fetch("/api/commits.json", { signal: AbortSignal.timeout(15000) })
            .then((r) => {
                if (!r.ok) throw new Error("Commit request failed");
                return r.json();
            })
            .then(setGraph)
            .catch(() => setError(true));
    }, []);

    // Keep the most recent week in view in the narrow panel.
    useEffect(() => {
        if (graph && scrollRef.current) {
            scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
        }
    }, [graph]);

    if (error)
        return (
            <div className="commit-graph commit-graph-placeholder">
                <p className="activity-status">couldn't load commits.</p>
            </div>
        );
    if (!graph) return <p className="activity-status" role="status">loading commits…</p>;

    const weeks = buildWeeks(graph.counts);
    const today = dayKey(new Date());

    return (
        <div className="commit-graph">
            <div className="commit-graph-scroll" ref={scrollRef}>
                <div className="commit-grid">
                    {weeks.map((week, i) => (
                        <div className="commit-week" key={i}>
                            {week.map((day) => {
                                const future = dayKey(day.date) > today;
                                if (future)
                                    return <span key={dayKey(day.date)} className="commit-day level-0" data-future />;

                                const text = `${day.count} commit${day.count === 1 ? "" : "s"} · ${formatDate(day.date)}`;
                                return (
                                    <span
                                        key={dayKey(day.date)}
                                        className={`commit-day level-${level(day.count)}`}
                                        onMouseEnter={
                                            canHover
                                                ? (e) => setTooltip({ text, x: e.clientX, y: e.clientY })
                                                : undefined
                                        }
                                        onMouseLeave={canHover ? () => setTooltip(null) : undefined}
                                    />
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
            <p className="commit-graph-meta">{graph.total} commits in the last year</p>
            {tooltip && (
                <div className="commit-tooltip" style={{ left: tooltip.x, top: tooltip.y }}>
                    {tooltip.text}
                </div>
            )}
        </div>
    );
}
