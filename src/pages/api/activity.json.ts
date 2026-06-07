import { fetchBskyPosts, fetchBlogPosts } from "../../lib/atproto";
import { fetchTangled } from "../../lib/tangled";

export async function GET() {
    const [bsky, blog, tangled] = await Promise.allSettled([fetchBskyPosts(), fetchBlogPosts(), fetchTangled()]);

    return new Response(JSON.stringify({ bsky, blog, tangled }, null, 2), {
        headers: { "Content-Type": "application/json" },
    });
}
