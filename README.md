# Kushal's Personal Blog

A static personal blog with three ways to explore the same posts: a searchable field index, ordered book chapters, and flashcards. Built with Astro, Markdown/MDX, Tailwind CSS, and Pagefind.

The site keeps the Astro Cactus layout, with Geist fonts, neutral light/dark colors, and smooth transitions that respect reduced-motion preferences.

## Features

- **Field index:** search titles, summaries, and tags; filter by topic; sort by reading order or title.
- **Book chapters:** read posts in sequence, group chapters into sections, and follow previous/next links.
- **Flashcards:** reveal notes, swipe or use keyboard controls, sort into learning piles, shuffle, undo, and review saved cards.
- **Site search:** press `/` outside a text field to search published posts; press `Escape` to close search.
- **Blog essentials:** topic archives, pagination, article tables of contents, RSS, a sitemap, generated social images, and highlighted code blocks.

## Run locally

Use **Node.js 22** and **pnpm 8.15.9**, as declared in `package.json`. If pnpm is unavailable, use `npx --yes pnpm@8.15.9` in place of `pnpm` in the commands below.

```sh
git clone https://github.com/Kushal2004/PersonalBLog.git
cd PersonalBLog
pnpm install --frozen-lockfile
pnpm dev --host 127.0.0.1 --port 4325
```

Open [http://127.0.0.1:4325/](http://127.0.0.1:4325/).

Site search is available in a production build. To test it locally:

```sh
pnpm check
pnpm build
pnpm preview --host 127.0.0.1 --port 4325
```

`pnpm build` runs Astro and then the `postbuild` Pagefind indexer. The checked-in `.npmrc` enables pnpm's pre/post scripts. Deploy the complete `dist/` directory, including `dist/pagefind/`.

| Command          | Purpose                                                 |
| ---------------- | ------------------------------------------------------- |
| `pnpm dev`       | Start the development server.                           |
| `pnpm check`     | Check Astro and TypeScript files.                       |
| `pnpm build`     | Generate the static site and search index in `dist/`.   |
| `pnpm postbuild` | Rebuild the search index after the site has been built. |
| `pnpm preview`   | Serve the production build locally.                     |
| `pnpm format`    | Format project files.                                   |

## Publish a post

Add a `.md` or `.mdx` file under `src/content/post/`. For example, `src/content/post/markdown-basics.md` becomes `/posts/markdown-basics/`.

```md
---
title: "Markdown basics"
description: "A practical introduction to writing headings, links, and lists in Markdown documents."
publishDate: "2026-01-01"
tags: ["markdown", "writing"]
draft: false
reading:
  order: 1
  section: "Getting started"
  term: "Markdown"
  question: "How do you format a heading?"
  summary: "Start a line with one or more # characters, then a space and the heading."
---

## Headings

Use two hash characters followed by a space for a section heading.
```

### Frontmatter

| Field         | Required | Description                                                          |
| ------------- | -------- | -------------------------------------------------------------------- |
| `title`       | Yes      | Post title, up to 60 characters.                                     |
| `description` | Yes      | Summary between 50 and 160 characters.                               |
| `publishDate` | Yes      | Publication date; an ISO date string is recommended.                 |
| `updatedDate` | No       | Date string shown when a post is updated.                            |
| `tags`        | No       | Topic names; duplicates are removed and names are lowercased.        |
| `draft`       | No       | Defaults to `false`. Set `true` to exclude the post from production. |
| `coverImage`  | No       | An object with an image `src` and descriptive `alt` text.            |
| `ogImage`     | No       | Custom social-image path or URL; otherwise an image is generated.    |
| `reading`     | No       | Customize the index entry, chapter position, and flashcard.          |

The complete schema is in [`src/content/config.ts`](src/content/config.ts).

### Reading order and flashcards

All three reading modes use the same published posts. Drafts are excluded from these modes even during development.

- `reading.order`: a positive integer; explicitly ordered posts come first.
- `reading.section`: a chapter-group label. Give consecutive chapters the same label to group them together.
- `reading.term`: the index term and flashcard title; defaults to the post title.
- `reading.question`: the flashcard prompt; defaults to a general recall question.
- `reading.summary`: the index summary and revealed note; defaults to the post description.

Posts without an explicit order follow oldest to newest by publication date, with the slug used to break ties. The regular blog archive is newest first and can optionally sort by updated date through `siteConfig.sortPostsByUpdatedDate`.

When a flashcard itself has focus, use **Left** for “Need to learn,” **Right** for “Known,” **Down** for “Saved,” and **Up**, **Space**, or **Enter** to reveal the note. Touch swipes and the visible buttons provide the same actions.

Commit and push new posts, then redeploy the site. A connected Vercel project can rebuild automatically after each push.

## Progress and storage

The app is static and uses browser `localStorage`; it does not require a database or backend.

| Storage key                     | Saved data                                      |
| ------------------------------- | ----------------------------------------------- |
| `personal-blog-reading-view-v1` | Selected reading mode.                          |
| `personal-blog-flashcards-v1`   | Each post's flashcard pile, keyed by post slug. |
| `theme`                         | Light/dark preference.                          |

Progress is specific to the browser and site origin. It does **not** sync between devices, browsers, or deployment domains. Clearing site data removes saved progress. If storage is unavailable, the reading controls continue to work for the current session.

The index and chapters also work without JavaScript. Interactive flashcards, site search, and saved preferences require JavaScript.

## Customize

| File or directory                                                    | What it controls                                                   |
| -------------------------------------------------------------------- | ------------------------------------------------------------------ |
| [`src/site.config.ts`](src/site.config.ts)                           | Site metadata, navigation links, date formatting, and code themes. |
| [`src/styles/typography.css`](src/styles/typography.css)             | Geist fonts, text formatting, and foreground/background colors.    |
| [`src/styles/global.css`](src/styles/global.css)                     | Base page layout.                                                  |
| [`src/styles/reading.css`](src/styles/reading.css)                   | Reading cards, index grid, chapters, and flashcard layouts.        |
| [`src/styles/code-theme.ts`](src/styles/code-theme.ts)               | Light/dark syntax-highlighting colors.                             |
| [`src/components/SocialList.astro`](src/components/SocialList.astro) | Social profile links.                                              |
| [`src/content/post/`](src/content/post/)                             | Markdown/MDX posts and their local assets.                         |
| [`public/`](public/)                                                 | Favicons, app icons, fonts, and static assets.                     |

The repository includes example posts and starter copy that can be replaced with personal content. Webmentions are optional and are currently unconfigured.

## Deploy to Vercel

Import [`Kushal2004/PersonalBLog`](https://github.com/Kushal2004/PersonalBLog) into your Vercel account and use these settings:

| Setting          | Value                            |
| ---------------- | -------------------------------- |
| Framework preset | Astro                            |
| Root directory   | Repository root                  |
| Node.js version  | 22.x                             |
| Install command  | `pnpm install --frozen-lockfile` |
| Build command    | `pnpm build`                     |
| Output directory | `dist`                           |

These build settings are checked into [`vercel.json`](vercel.json), and `package.json` pins pnpm 8.15.9. Connect `main` as the production branch to publish future pushes automatically.

No runtime secrets or database configuration are required. Optionally set `SITE_URL` to the final public URL, such as `https://your-blog.vercel.app`, for canonical links, the sitemap, RSS, and `robots.txt`. Otherwise the build uses Vercel's production domain, then its deployment domain; local builds fall back to `http://localhost:4325`.

Vercel credentials and local environment files belong outside Git. `.env*` and `.vercel/` are ignored by this repository.

## Credits and licenses

- Based on [Astro Cactus](https://github.com/chrismwilliams/astro-theme-cactus), under the [MIT license](LICENSE).
- Reading experiences inspired by [FDE101](https://github.com/ajaypv/fde101).
- Typography and neutral colors follow [Kushal's original blog](https://kushal-blog.vercel.app/).
- Geist and Geist Mono are bundled under the [SIL Open Font License](public/fonts/OFL.txt).
