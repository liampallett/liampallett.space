import { fetchCommitGraph } from "../../lib/commits";

export const prerender = false;

export async function GET() {
    const graph = await fetchCommitGraph();

    return new Response(JSON.stringify(graph), {
        headers: {
            "Content-Type": "application/json",
            // Live, but amortise the per-repo knot calls: serve cached for an
            // hour, then keep serving stale for a day while revalidating.
            "Cache-Control": "public, max-age=0, must-revalidate",
            "Netlify-CDN-Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
    });
}
