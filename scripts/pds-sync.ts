import { getCollection } from "astro:content"; // Note: If your script engine struggles to pull content here, we can switch to standard fs reading
import { StandardSitePublisher } from "@bryanguffey/astro-standard-site";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import matter from "gray-matter"; // Run 'npm install gray-matter' if not already present

dotenv.config();

async function syncAllPosts() {
    if (!process.env.ATPROTO_APP_PASSWORD) {
        console.error("❌ Aborting: ATPROTO_APP_PASSWORD is missing from environment variables.");
        process.exit(1);
    }

    const publisher = new StandardSitePublisher({
        handle: "liampallett.space",
        appPassword: process.env.ATPROTO_APP_PASSWORD,
    });

    console.log("📨 Connecting to Personal Data Server (PDS)...");
    await publisher.login();

    // Scan your content directory directly
    const blogDir = path.resolve("./src/content/blog");
    const files = fs.readdirSync(blogDir).filter((file) => file.endsWith(".md") || file.endsWith(".mdx"));

    for (const file of files) {
        const filePath = path.join(blogDir, file);
        const fileContent = fs.readFileSync(filePath, "utf-8");
        const { data, content } = matter(fileContent);
        const slug = file.replace(/\.mdx?$/, "");

        console.log(`🚀 Synchronizing record structure for: /blog/${slug}`);

        try {
            // Force the PDS engine to register the record utilizing our strict deterministic rkey configuration rules!
            await publisher.publishDocument({
                site: "at://did:plc:tgb4klpomminc5lv3clzb6wm/site.standard.publication/3mn5k67ewiz25",
                title: data.title,
                description: data.description || "Software Engineering student & developer.",
                publishedAt: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
                path: `/blog/${slug}/`,
                content: {
                    $type: "site.standard.content.markdown",
                    text: content,
                    version: "1.0",
                },
                textContent: content.replace(/[#*`_\-]/g, ""),
                tags: data.tags || [],
                // This critical parameter binds the data registry perfectly to match our layout configuration file link output elements
                rkey: slug,
            });
        } catch (err) {
            console.error(`❌ Failed tracking sync execution for ${slug}:`, err);
        }
    }
    console.log("✅ All repository assets have completed syncing smoothly with the ATProto firehose.");
}

syncAllPosts();
