// src/lib/tangled.ts
import type { ActivityItem } from "./activity";

const HANDLE = "liampallett.space";
const PROFILE_FEED = `https://tangled.org/${HANDLE}/feed.atom`;

function parseEntries(xml: string, source: "profile" | "commits"): ActivityItem[] {
    const entries = xml.match(/<entry>([\s\S]*?)<\/entry>/g) ?? [];

    return entries.map((entry) => {
        const title =
            entry
                .match(/<title>([\s\S]*?)<\/title>/)?.[1]
                ?.replace(/&#39;/g, "'")
                ?.replace(/&amp;/g, "&")
                ?.replace(/&quot;/g, '"')
                ?.replace(/^@liampallett\.space /, "") ?? "";
        const text = title.replace(/^\[Commit [a-f0-9]+\] /, "");
        const url = entry.match(/<link href="([^"]+)"/)?.[1] ?? "";
        const dateStr = entry.match(/<updated>(.*?)<\/updated>/)?.[1] ?? "";
        const date = new Date(dateStr);

        if (source === "commits") {
            return { type: "tangled" as const, action: "commit" as const, text: text, url, date };
        }

        const action = title.includes("pull request")
            ? ("pr" as const)
            : title.includes("created repository")
              ? ("repo" as const)
              : ("commit" as const);

        return { type: "tangled" as const, action, text: text, url, date };
    });
}

function extractRepoNames(xml: string): string[] {
    const entries = xml.match(/<entry>([\s\S]*?)<\/entry>/g) ?? [];
    const repos = new Set<string>();

    for (const entry of entries) {
        // matches "created repository 'name'" and PR entries which contain a repo
        const repoMatch = entry.match(/\/@liampallett\.space\/([^/"<\s]+)/);
        if (repoMatch) repos.add(repoMatch[1]);
    }

    return Array.from(repos);
}

export async function fetchTangled(): Promise<ActivityItem[]> {
    const profileRes = await fetch(PROFILE_FEED);
    const profileXml = await profileRes.text();

    const profileItems = parseEntries(profileXml, "profile");
    const repos = extractRepoNames(profileXml);

    // fetch all repo commit feeds in parallel
    const commitFeeds = await Promise.allSettled(
        repos.map((repo) => fetch(`https://tangled.org/${HANDLE}/${repo}/feed.atom`).then((r) => r.text())),
    );

    const commitItems = commitFeeds.flatMap((result, i) => {
        if (result.status === "rejected") return [];
        return parseEntries(result.value, "commits");
    });

    // Profile and commit feeds can surface the same item (e.g. a PR), so
    // dedupe by URL, keeping the first (profile) occurrence.
    const seen = new Set<string>();

    return [...profileItems, ...commitItems]
        .filter((item) => {
            if (seen.has(item.url)) return false;
            seen.add(item.url);
            return true;
        })
        .sort((a, b) => b.date.valueOf() - a.date.valueOf());
}
