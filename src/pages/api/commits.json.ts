import { fetchCommitGraph } from "../../lib/commits";

export const prerender = false;

export async function GET() {
    let graph;
    try {
        graph = await fetchCommitGraph();
    } catch {
        return new Response(JSON.stringify({ error: "GitHub commits unavailable" }), {
            status: 503, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
        });
    }

    return new Response(JSON.stringify(graph), {
        headers: {
            "Content-Type": "application/json",
            // Live, but amortise the GitHub API calls: serve cached for an
            // hour, then keep serving stale for an hour while revalidating.
            "Cache-Control": "public, max-age=0, must-revalidate",
            "Netlify-CDN-Cache-Control": "public, s-maxage=3600, stale-while-revalidate=3600",
        },
    });
}
