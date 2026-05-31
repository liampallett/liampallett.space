import { AtpAgent } from "@atproto/api";
import * as fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const agent = new AtpAgent({ service: "https://gomphus.us-west.host.bsky.network" });

await agent.login({
    identifier: "liampallett.space",
    password: process.env.ATPROTO_APP_PASSWORD!,
});

const imageBuffer = fs.readFileSync("./public/star-512.png");
const response = await agent.com.atproto.repo.uploadBlob(new Uint8Array(imageBuffer), { encoding: "image/png" });

console.log("Blob ref:", response.data.blob.ref.toString());
console.log("Size:", imageBuffer.byteLength);
