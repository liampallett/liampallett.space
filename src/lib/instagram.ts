import type { ActivityItem } from "./activity";

type Media = {
    id: string;
    caption?: string;
    media_type: string;
    media_url?: string;
    thumbnail_url?: string;
    permalink?: string;
    timestamp: string;
};

// Each edge has its own cache and failure boundary: Stories must not break posts.
const cache = new Map<string, { until: number; items: ActivityItem[] }>();

export async function fetchInstagram(stories = false): Promise<ActivityItem[]> {
    const token = process.env.INSTAGRAM_ACCESS_TOKEN || import.meta.env?.INSTAGRAM_ACCESS_TOKEN;
    const userId = process.env.INSTAGRAM_USER_ID || import.meta.env?.INSTAGRAM_USER_ID;
    if (!token || !userId) return [];

    const edge = stories ? "stories" : "media";
    const cached = cache.get(edge);
    if (cached && cached.until > Date.now()) return active(cached.items);

    const version = process.env.INSTAGRAM_API_VERSION || "v25.0";
    const url = new URL(`https://graph.instagram.com/${version}/${encodeURIComponent(userId)}/${edge}`);
    url.searchParams.set("fields", "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp");
    url.searchParams.set("limit", stories ? "100" : "10");
    const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(10_000),
    });
    const body = await response.json();
    if (!response.ok || body.error || !Array.isArray(body.data)) {
        // Do not expose upstream errors or credentials through the public endpoint.
        console.error(`Instagram ${edge} failed (HTTP ${response.status}, code ${body.error?.code ?? "unknown"})`);
        throw new Error(`Instagram ${edge} unavailable`);
    }

    const media = body.data as Media[];
    const items: ActivityItem[] = media.flatMap((item) => {
        const date = new Date(item.timestamp);
        if (!Number.isFinite(date.getTime())) return [];
        if (!stories && !item.permalink) return [];
        return [{
            type: stories ? "instagram-story" as const : "instagram" as const,
            text: item.caption || (stories ? "view Instagram story" : "view Instagram post"),
            url: item.permalink || `https://www.instagram.com/stories/liamisastudent/${encodeURIComponent(item.id)}/`,
            date,
            image: item.media_type === "VIDEO" ? item.thumbnail_url : item.media_url,
            ...(stories ? { expiresAt: new Date(date.getTime() + 24 * 60 * 60 * 1000).toISOString() } : {}),
        }];
    });
    // Group active Stories into one entry, linked to the latest available Story.
    const visible = active(items).sort((a, b) => b.date.getTime() - a.date.getTime());
    const result = stories ? visible.slice(0, 1).map((item) => ({
        ...item,
        text: `view ${visible.length} Instagram ${visible.length === 1 ? "story" : "stories"}`,
    })) : visible;
    cache.set(edge, { until: Date.now() + 5 * 60 * 1000, items: result });
    return result;
}

function active(items: ActivityItem[]): ActivityItem[] {
    return items.filter((item) => !("expiresAt" in item) || !item.expiresAt || Date.parse(item.expiresAt) > Date.now());
}
