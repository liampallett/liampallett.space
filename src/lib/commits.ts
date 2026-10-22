import { GITHUB_USER, githubPages } from "./github";

export interface CommitGraph {
    counts: Record<string, number>;
    total: number;
}

interface Repo { full_name: string; size: number; private: boolean }
interface Commit {
    sha: string;
    html_url: string;
    commit: { message: string; author: { date: string } | null };
}
interface PublicCommit { sha: string; message: string; url: string; date: string }

let cache: { until: number; commits: PublicCommit[] } | undefined;
let pending: Promise<PublicCommit[]> | undefined;

/** Public owned repos, default branches, authored by the profile owner. */
export async function fetchGitHubCommits(): Promise<PublicCommit[]> {
    if (cache && cache.until > Date.now()) return cache.commits;
    if (pending) return pending;
    pending = (async () => {
        const repos = await githubPages<Repo>(`/users/${GITHUB_USER}/repos?type=owner`);
        const since = new Date();
        since.setUTCDate(since.getUTCDate() - 53 * 7);
        since.setUTCHours(0, 0, 0, 0);
        const commits = new Map<string, PublicCommit>();
        // Limit concurrency; an upstream failure must not become a misleading partial graph.
        const queue = repos.filter((repo) => !repo.private && repo.size > 0);
        await Promise.all(Array.from({ length: Math.min(3, queue.length) }, async () => {
            for (let repo = queue.shift(); repo; repo = queue.shift()) {
                const path = `/repos/${repo.full_name}/commits?author=${GITHUB_USER}&since=${encodeURIComponent(since.toISOString())}`;
                for (const commit of await githubPages<Commit>(path)) {
                    const date = commit.commit.author?.date;
                    if (!date || !Number.isFinite(Date.parse(date)) || Date.parse(date) < since.getTime() || Date.parse(date) > Date.now()) continue;
                    if (!commits.has(commit.sha)) commits.set(commit.sha, {
                        sha: commit.sha, message: commit.commit.message.split("\n")[0], url: commit.html_url, date,
                    });
                }
            }
        }));
        const result = [...commits.values()];
        cache = { until: Date.now() + 3600_000, commits: result };
        return result;
    })();
    try { return await pending; } finally { pending = undefined; }
}

export async function fetchCommitGraph(): Promise<CommitGraph> {
    const commits = await fetchGitHubCommits();
    const counts: Record<string, number> = {};
    for (const commit of commits) {
        const day = new Date(commit.date).toISOString().slice(0, 10);
        counts[day] = (counts[day] ?? 0) + 1;
    }
    return { counts, total: commits.length };
}
