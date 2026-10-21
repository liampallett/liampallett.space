export type ActivityItem =
    | { type: "instagram" | "instagram-story"; text: string; url: string; date: Date; image?: string; expiresAt?: string }
    | { type: "linkedin"; text: string; url: string; date: Date }
    | { type: "bsky"; text: string; url: string; date: Date; image?: string }
    | { type: "blog"; title: string; url: string; date: Date }
    | { type: "tangled"; action: "commit" | "pr" | "repo"; text: string; url: string; date: Date };
