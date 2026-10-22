import type { ActivityItem } from "./activity";

export const GITHUB_USER = "liampallett";
const API = "https://api.github.com";

export class GitHubRequestError extends Error {
    constructor(public status: number) {
        super(`GitHub request failed (HTTP ${status})`);
    }
}

export async function githubRequest<T>(path: string): Promise<{ data: T; next: boolean }> {
    const token = process.env.GITHUB_TOKEN || import.meta.env?.GITHUB_TOKEN;
    const response = await fetch(`${API}${path}`, {
        headers: {
            Accept: "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
            "User-Agent": "liampallett.space",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) throw new GitHubRequestError(response.status);
    return { data: await response.json(), next: /rel="next"/.test(response.headers.get("link") ?? "") };
}

export async function githubPages<T>(path: string): Promise<T[]> {
    const items: T[] = [];
    for (let page = 1; ; page++) {
        const { data, next } = await githubRequest<T[]>(`${path}${path.includes("?") ? "&" : "?"}per_page=100&page=${page}`);
        if (!Array.isArray(data)) throw new Error("Invalid GitHub response");
        items.push(...data);
        if (!next) return items;
    }
}

type Event = {
    type: string;
    repo: { name: string };
    created_at: string;
    payload: {
        ref_type?: string;
        action?: string;
        number?: number;
        pull_request?: { number?: number; title?: string; html_url?: string };
    };
};

let cache: { until: number; items: ActivityItem[] } | undefined;
let pending: Promise<ActivityItem[]> | undefined;

export async function fetchGitHub(): Promise<ActivityItem[]> {
    if (cache && cache.until > Date.now()) return cache.items;
    if (pending) return pending;
    pending = (async () => {
        // Explicitly public even when authenticated: never publish private activity.
        const { fetchGitHubCommits } = await import("./commits");
        const [events, commitResult] = await Promise.allSettled([
            githubRequest<Event[]>(`/users/${GITHUB_USER}/events/public?per_page=100`),
            fetchGitHubCommits(),
        ]);
        if (events.status === "rejected" && commitResult.status === "rejected") {
            throw new Error("GitHub activity unavailable");
        }
        const data = events.status === "fulfilled" ? events.value.data : [];
        const items: ActivityItem[] = data.flatMap((event): ActivityItem[] => {
            const date = new Date(event.created_at);
            if (!Number.isFinite(date.getTime())) return [];
            const url = `https://github.com/${event.repo.name}`;
            if (event.type === "PullRequestEvent" && event.payload.pull_request) {
                const pr = event.payload.pull_request;
                const number = event.payload.number ?? pr.number;
                if (typeof number !== "number" || !Number.isSafeInteger(number) || number <= 0) return [];
                const title = pr.title || `${event.repo.name} #${number}`;
                return [{
                    type: "github", action: "pr",
                    text: `${event.payload.action || "updated"} PR: ${title}`,
                    url: pr.html_url || `${url}/pull/${number}`, date,
                }];
            }
            if (event.type === "CreateEvent" && event.payload.ref_type === "repository") {
                return [{ type: "github", action: "repo", text: `created ${event.repo.name}`, url, date }];
            }
            return [];
        });
        // Commit messages come from the commits API, independent of PushEvent payload changes.
        const commits = commitResult.status === "fulfilled" ? commitResult.value : [];
        items.push(...commits.map((commit): ActivityItem => ({
            type: "github", action: "commit", text: commit.message, url: commit.url, date: new Date(commit.date),
        })));
        const seen = new Set<string>();
        const unique = items.sort((a, b) => b.date.valueOf() - a.date.valueOf()).filter((item) => {
            if (seen.has(item.url)) return false;
            seen.add(item.url);
            return true;
        }).slice(0, 20);
        // Retry a failed sub-source soon instead of caching incomplete activity for an hour.
        const ttl = events.status === "fulfilled" && commitResult.status === "fulfilled" ? 3600_000 : 60_000;
        cache = { until: Date.now() + ttl, items: unique };
        return unique;
    })();
    try { return await pending; } finally { pending = undefined; }
}
