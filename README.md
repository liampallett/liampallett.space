# [liampallett.space](https://liampallett.space)

Personal portfolio website and blog.

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