import posts from "../data/linkedin.json";
import type { ActivityItem } from "./activity";

export async function fetchLinkedIn(): Promise<ActivityItem[]> {
    return (posts as { text: string; url: string; date: string }[]).map((post) => ({
        ...post,
        type: "linkedin" as const,
        date: new Date(post.date),
    }));
}
