import { StandardSitePublisher } from "@bryanguffey/astro-standard-site";
import { AtpAgent } from "@atproto/api";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

dotenv.config();

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

function writeAtUri(filePath: string, fileContent: string, uri: string, hasExisting: boolean) {
    let updatedContent: string;
    if (hasExisting) {
        updatedContent = fileContent.replace(/^atUri:.*$/m, `atUri: "${uri}"`);
    } else {
        updatedContent = fileContent.replace(
            /^---\n([\s\S]*?)\n---/,
            (_, frontmatter) => `---\n${frontmatter}atUri: "${uri}"\n---`,
        );
    }
    fs.writeFileSync(filePath, updatedContent);
}

async function syncAllPosts() {
    if (!process.env.ATPROTO_APP_PASSWORD) {
        console.error("❌ Aborting: ATPROTO_APP_PASSWORD is missing.");
        process.exit(1);
    }

    const publisher = new StandardSitePublisher({
        identifier: "liampallett.space",
        password: process.env.ATPROTO_APP_PASSWORD,
    });

    console.log("📨 Connecting to PDS...");
    await publisher.login();

    // Separate agent for updates
    const agent = new AtpAgent({ service: "https://gomphus.us-west.host.bsky.network" });
    await agent.login({
        identifier: "liampallett.space",
        password: process.env.ATPROTO_APP_PASSWORD,
    });

    const blogDir = path.resolve("./src/content/blog");
    const markdownFiles = getMarkdownFiles(blogDir);

    for (const filePath of markdownFiles) {
        const fileContent = fs.readFileSync(filePath, "utf-8");
        const { data, content } = matter(fileContent);
        const fileParsed = path.parse(filePath);
        const slug = fileParsed.name === "index" ? path.basename(fileParsed.dir) : fileParsed.name;

        const record = {
            $type: "site.standard.document",
            site: "at://did:plc:tgb4klpomminc5lv3clzb6wm/site.standard.publication/3mn5k67ewiz25",
            title: data.title || "Untitled Post",
            description: data.description || "",
            publishedAt: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
            path: `/blog/${slug}`,
            content: {
                $type: "site.standard.content.markdown",
                text: content,
                version: "1.0",
            },
            textContent: content.replace(/[#*`_\-]/g, ""),
            tags: data.tags || [],
        };

        try {
            if (data.atUri) {
                // Update existing record
                const rkey = data.atUri.split("/").pop()!;
                await agent.com.atproto.repo.putRecord({
                    repo: agent.did!,
                    collection: "site.standard.document",
                    rkey,
                    record,
                });
                console.log(`✅ Updated: /blog/${slug}`);
            } else {
                // Create new record
                const result = await publisher.publishDocument(record);
                console.log(`✅ Created: /blog/${slug} → ${result.uri}`);
                writeAtUri(filePath, fileContent, result.uri, false);
            }
        } catch (err) {
            console.error(`❌ Failed for ${slug}:`, err);
        }
    }

    console.log("✅ Sync complete.");
}

syncAllPosts();
