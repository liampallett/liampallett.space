import { defineCollection, z } from "astro:content";

const blog = defineCollection({
    schema: z.object({
        title: z.string(),
        date: z.date(),
        description: z.string(),
        tags: z.array(z.string()).optional().default([]),

        ogImage: z.string().optional(),
        atUri: z.string().optional(),
    }),
});

export const collections = { blog };
