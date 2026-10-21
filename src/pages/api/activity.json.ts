import { fetchBskyPosts, fetchBlogPosts } from "../../lib/atproto";
import { fetchTangled } from "../../lib/tangled";
import { fetchInstagram } from "../../lib/instagram";
import { fetchLinkedIn } from "../../lib/linkedin";

export const prerender = false;

export async function GET() {
    const [bsky, blog, tangled, instagram, stories, linkedin] = await Promise.allSettled([
        fetchBskyPosts(), fetchBlogPosts(), fetchTangled(), fetchInstagram(), fetchInstagram(true), fetchLinkedIn(),
    ]);

    return new Response(JSON.stringify({ bsky, blog, tangled, instagram, stories, linkedin }, null, 2), {
        headers: { "Content-Type": "application/json" },
    });
}
