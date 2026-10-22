import type { ActivityItem } from "./activity";

export const GITHUB_USER = "liampallett";
const API = "https://api.github.com";

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
    if (!response.ok) throw new Error(`GitHub request failed (HTTP ${response.status})`);
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
        pull_request?: { title: string; html_url: string };
    };
};

let cache: { until: number; items: ActivityItem[] } | undefined;
let pending: Promise<ActivityItem[]> | undefined;

export async function fetchGitHub(): Promise<ActivityItem[]> {
    if (cache && cache.until > Date.now()) return cache.items;
    if (pending) return pending;
    pending = (async () => {
        // Explicitly public even when authenticated: never publish private activity.
        const { data } = await githubRequest<Event[]>(`/users/${GITHUB_USER}/events/public?per_page=100`);
        const items: ActivityItem[] = data.flatMap((event): ActivityItem[] => {
            const date = new Date(event.created_at);
            if (!Number.isFinite(date.getTime())) return [];
            const url = `https://github.com/${event.repo.name}`;
            if (event.type === "PullRequestEvent" && event.payload.pull_request) {
                const pr = event.payload.pull_request;
                return [{ type: "github", action: "pr", text: `${event.payload.action} PR: ${pr.title}`, url: pr.html_url, date }];
            }
            if (event.type === "CreateEvent" && event.payload.ref_type === "repository") {
                return [{ type: "github", action: "repo", text: `created ${event.repo.name}`, url, date }];
            }
            return [];
        });
        // Commit messages come from the commits API, independent of PushEvent payload changes.
        const { fetchGitHubCommits } = await import("./commits");
        const commits = await fetchGitHubCommits();
        items.push(...commits.map((commit): ActivityItem => ({
            type: "github", action: "commit", text: commit.message, url: commit.url, date: new Date(commit.date),
        })));
        const seen = new Set<string>();
        const unique = items.sort((a, b) => b.date.valueOf() - a.date.valueOf()).filter((item) => {
            if (seen.has(item.url)) return false;
            seen.add(item.url);
            return true;
        }).slice(0, 20);
        cache = { until: Date.now() + 3600_000, items: unique };
        return unique;
    })();
    try { return await pending; } finally { pending = undefined; }
}
