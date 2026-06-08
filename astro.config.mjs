import { defineConfig } from "astro/config";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import react from "@astrojs/react";
import netlify from "@astrojs/netlify";

export default defineConfig({
    site: "https://liampallett.space",
    adapter: netlify(),
    integrations: [react()],
    markdown: {
        remarkPlugins: [remarkMath],
        rehypePlugins: [rehypeKatex],
    },
});
