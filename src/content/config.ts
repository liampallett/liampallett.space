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

const projects = defineCollection({
    schema: z.object({
        title: z.string(),
        description: z.string(),
        date: z.date(),
        link: z.string(),
        tags: z.array(z.string()),
        featured: z.boolean().default(false),
    }),
});

const garden = defineCollection({
    schema: z.object({
        title: z.string(),
        description: z.string(),
        date: z.date(),
    }),
});

export const collections = {
    blog,
    projects,
    garden,
};
