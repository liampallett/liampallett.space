import type { ActivityItem } from "./activity";

const DID = "did:plc:tgb4klpomminc5lv3clzb6wm";
const PDS = "https://gomphus.us-west.host.bsky.network";

export async function fetchBskyPosts(): Promise<ActivityItem[]> {
    const res = await fetch(
        `${PDS}/xrpc/com.atproto.repo.listRecords?repo=${DID}&collection=app.bsky.feed.post&limit=10`,
    );
    const { records } = await res.json();
    if (!Array.isArray(records)) return [];
    return records
        .map((r: any) => ({
            type: "bsky" as const,
            text: r.value.text,
            url: `https://bsky.app/profile/${DID}/post/${r.uri.split("/").pop()}`,
            date: new Date(r.value.createdAt),
            image: r.value.embed?.images?.[0]?.image?.ref?.$link
                ? `https://cdn.bsky.app/img/feed_thumbnail/plain/${DID}/${r.value.embed.images[0].image.ref.$link}@jpeg`
                : undefined,
        }))
        .filter((item) => item.text.length > 0);
}

export async function fetchBlogPosts(): Promise<ActivityItem[]> {
    const res = await fetch(
        `${PDS}/xrpc/com.atproto.repo.listRecords?repo=${DID}&collection=site.standard.document&limit=10`,
    );
    const { records } = await res.json();
    if (!Array.isArray(records)) return [];
    return records.map((r: any) => ({
        type: "blog" as const,
        title: r.value.title,
        url: `https://liampallett.space${r.value.path}`,
        date: new Date(r.value.publishedAt),
    }));
}
