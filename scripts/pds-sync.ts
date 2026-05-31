import { StandardSitePublisher } from "@bryanguffey/astro-standard-site";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

dotenv.config();

// Helper to recursively find all markdown files (handles nested slug folders cleanly)
function getMarkdownFiles(dir: string, fileList: string[] = []): string[] {
    const files = fs.readdirSync(dir);
    files.forEach((file) => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            fileList = getMarkdownFiles(filePath, fileList);
        } else if (file.endsWith(".md") || file.endsWith(".mdx")) {
            fileList.push(filePath);
        }
    });
    return fileList;
}

async function syncAllPosts() {
    if (!process.env.ATPROTO_APP_PASSWORD) {
        console.error("❌ Aborting: ATPROTO_APP_PASSWORD is missing from environment variables.");
        process.exit(1);
    }

    const publisher = new StandardSitePublisher({
        identifier: "liampallett.space",
        password: process.env.ATPROTO_APP_PASSWORD,
    });

    console.log("📨 Connecting to PDS...");
    await publisher.login();

    const blogDir = path.resolve("./src/content/blog");
    const markdownFiles = getMarkdownFiles(blogDir);

    for (const filePath of markdownFiles) {
        const fileContent = fs.readFileSync(filePath, "utf-8");
        const { data, content } = matter(fileContent);

        // Derive the slug cleanly from either the filename or folder name
        const fileParsed = path.parse(filePath);
        const slug = fileParsed.name === "index" ? path.basename(fileParsed.dir) : fileParsed.name;

        console.log(`🚀 Synchronizing PDS record schema for: /blog/${slug}`);

        try {
            await publisher.publishDocument({
                site: "at://did:plc:tgb4klpomminc5lv3clzb6wm/site.standard.publication/3mn5k67ewiz25",
                title: data.title || "Untitled Post",
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
                rkey: slug, // Matches the template's fallback string exactly!
            });
        } catch (err) {
            console.error(`❌ Failed sync for ${slug}:`, err);
        }
    }
    console.log("✅ PDS firehose sync complete.");
}

syncAllPosts();
