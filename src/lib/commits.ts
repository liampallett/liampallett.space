const DID = "did:plc:tgb4klpomminc5lv3clzb6wm";
const PDS = "https://gomphus.us-west.host.bsky.network";

export interface CommitGraph {
    /** Map of YYYY-MM-DD -> commit count, covering the trailing year. */
    counts: Record<string, number>;
    /** Total commits counted across the window. */
    total: number;
}

interface RepoRef {
    repoDid: string;
    knot: string;
}

/**
 * Lists the owner's tangled repos and the knot each lives on. The repo's own
 * DID (not the owner handle) is what the knot's log endpoint keys on.
 */
async function listRepos(): Promise<RepoRef[]> {
    const res = await fetch(
        `${PDS}/xrpc/com.atproto.repo.listRecords?repo=${DID}&collection=sh.tangled.repo&limit=100`,
    );
    const { records } = await res.json();
    if (!Array.isArray(records)) return [];

    return records
        .map((r: any) => ({ repoDid: r.value?.repoDid, knot: r.value?.knot }))
        .filter((r): r is RepoRef => Boolean(r.repoDid && r.knot));
}

/**
 * Pulls the full commit log for a single repo from its knot.
 *
 * NOTE: sh.tangled.repo.log is an undocumented knot XRPC endpoint, so the shape
 * could change without notice. Callers must tolerate this throwing/returning [].
 * Omitting `ref` lets the knot pick the repo's default branch (main vs master).
 */
async function fetchRepoCommitDates({ repoDid, knot }: RepoRef): Promise<Date[]> {
    const res = await fetch(`https://${knot}/xrpc/sh.tangled.repo.log?repo=${repoDid}&per_page=1000`);
    const data = await res.json();
    if (!Array.isArray(data?.commits)) return [];

    return data.commits.map((c: any) => new Date(c?.author?.When)).filter((d: Date) => !Number.isNaN(d.getTime()));
}

function dayKey(date: Date): string {
    return date.toISOString().slice(0, 10);
}

/**
 * Aggregates every commit across all repos into a per-day count for the
 * trailing 53 weeks (enough to fill a GitHub-style heatmap grid). Fails soft:
 * a repo whose knot errors is simply skipped.
 */
export async function fetchCommitGraph(): Promise<CommitGraph> {
    const repos = await listRepos();

    const results = await Promise.allSettled(repos.map(fetchRepoCommitDates));

    const cutoff = new Date();
    cutoff.setUTCDate(cutoff.getUTCDate() - 53 * 7);

    const counts: Record<string, number> = {};
    let total = 0;

    for (const result of results) {
        if (result.status !== "fulfilled") continue;
        for (const date of result.value) {
            if (date < cutoff) continue;
            const key = dayKey(date);
            counts[key] = (counts[key] ?? 0) + 1;
            total++;
        }
    }

    return { counts, total };
}
