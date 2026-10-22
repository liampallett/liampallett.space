# [liampallett.space](https://liampallett.space)

[![Netlify Status](https://api.netlify.com/api/v1/badges/f8d5d8af-99e5-4dda-b839-7246b0bfda2f/deploy-status)](https://app.netlify.com/projects/liampallett-space/deploys)

Personal website with portfolio and blog.

---

# What the Project Is

- Public facing site to display my current projects.
- Blog page for long-form reading.
- Links to my other social presences.

---

# Tech Stack

- Languages used: TypeScript, HTML, CSS
- Frameworks/libraries: Astro.js
- Deployed on Netlify

---

# Project Structure

```
├── README.md
├── _config.yaml
├── astro.config.mjs
├── package-lock.json
├── package.json
├── public
│   ├── Liam Pallett CV.pdf
│   ├── favicon.ico
│   ├── favicon.svg
│   └── images
│       └── jp-morgan-photo.jpeg
├── src
│   ├── components
│   │   ├── blog-card.astro
│   │   ├── footer.astro
│   │   ├── header.astro
│   │   ├── project-card.astro
│   │   └── vh.astro
│   ├── content
│   │   ├── blog
│   │   │   ├── nssc-day-1
│   │   │   └── nssc-day-2
│   │   └── config.ts
│   ├── layouts
│   │   └── layout.astro
│   └── pages
│       ├── 404.astro
│       ├── blog
│       │   └── [slug].astro
│       ├── blog.astro
│       ├── index.astro
│       └── projects.astro
└── tsconfig.json
```

## Sync PDS after new blog post
```bash
npx tsx scripts/pds-sync.ts
```

## Social activity feed

Set `INSTAGRAM_ACCESS_TOKEN` and `INSTAGRAM_USER_ID` in Netlify with the Functions scope, then redeploy. The ID must be the connected Instagram user ID, not the app ID. Optional `INSTAGRAM_API_VERSION` overrides the default `v25.0`.

`npm run dev` uses Astro's local server without Netlify's Edge emulator. For local Instagram requests, also set the two variables in the gitignored `.env` file and restart the server; Netlify's hosted variables are not automatically downloaded.

The server reads posts and active Stories independently, caching each for five minutes per running function instance. Multiple Stories occupy one feed entry. Expired Stories are hidden in the browser too. Videos link to Instagram; only available thumbnails are displayed. Missing credentials disable Instagram; API failures leave other sources working. Check Netlify function logs for sanitized Instagram error codes if a source is absent.

Use a long-lived Instagram user token. Automatic token renewal is not implemented: renew the token before its expiry and update Netlify, then redeploy. A generated token is not necessarily long-lived; check its expiry in Meta's tools. Keep tokens out of Git and client-side variables.

Add LinkedIn posts to `src/data/linkedin.json`, newest first, then redeploy:

```json
[
  {
    "text": "A short description of your update",
    "url": "https://www.linkedin.com/posts/YOUR-POST",
    "date": "2026-10-21T12:00:00Z"
  }
]
```

All sources share the existing eight-item limit and chronological ordering. Live Instagram permissions and media must be verified after deployment; a successful build alone does not verify the connected account.

## GitHub activity and commits

Project links and coding activity use `liampallett` on GitHub. The graph counts commits authored by that account on the default branches of its public owned repositories over the trailing 53 weeks, deduplicating commit SHAs across repositories. Private repositories and commits not linked to the GitHub account are excluded. This is not GitHub's full contribution calendar.

Set an optional server-only `GITHUB_TOKEN` in Netlify with Functions scope for a higher API rate limit, then redeploy. Public read access is sufficient; no private repository permissions are needed. Without a token, GitHub's shared anonymous rate limit may be exhausted. Never use a `PUBLIC_` variable for the token. For local development, put it in the gitignored `.env`.

GitHub results are cached for an hour per function instance. Upstream failures do not produce a partial commit total; the graph shows its error state. PR and repository creation activity comes from GitHub's recent public events, while commit messages come from the same commit data as the graph.

Netlify deploys directly from the GitHub repository's `main` branch. The obsolete Tangled webhook workflow has been removed.

## Public master CV

The header labels the download “master CV” to identify the full record of projects, experience and activities. It downloads `/cv.pdf`, built from the private `liampallett/cv` repository with `sh build-public.sh`. Copy `build/public/cv.pdf` into `public/cv.pdf` and `public/Liam Pallett CV.pdf` (the legacy URL) when updating it. Use this public build, which omits the phone number; do not publish `master.pdf` or application variants. The link opens the PDF directly, with cache revalidation so visitors receive the latest deployed copy. Updates are copied explicitly, not synced automatically.
