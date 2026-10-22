import { fetchBskyPosts, fetchBlogPosts } from "../../lib/atproto";
import { fetchGitHub } from "../../lib/github";
import { fetchInstagram } from "../../lib/instagram";
import { fetchLinkedIn } from "../../lib/linkedin";

export const prerender = false;

export async function GET() {
    const [bsky, blog, github, instagram, stories, linkedin] = await Promise.allSettled([
        fetchBskyPosts(), fetchBlogPosts(), fetchGitHub(), fetchInstagram(), fetchInstagram(true), fetchLinkedIn(),
    ]);

    return new Response(JSON.stringify({ bsky, blog, github, instagram, stories, linkedin }, null, 2), {
        headers: { "Content-Type": "application/json" },
    });
}
