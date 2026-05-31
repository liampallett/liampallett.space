import type { APIRoute } from "astro";
import { generatePublicationWellKnown } from "@bryanguffey/astro-standard-site";

export const GET: APIRoute = () => {
    return new Response(
        generatePublicationWellKnown({
            did: "did:plc:tgb4klpomminc5lv3clzb6wm", // Your DID
            publicationRkey: "3mn5k67ewiz25", // Your Record Key from Part 1
        }),
        {
            headers: { "Content-Type": "application/json" },
        },
    );
};
