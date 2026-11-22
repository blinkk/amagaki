---
title: Starter project
order: 1
description: Start a minimal, zero-bundler Amagaki project using create-amagaki or examples/starter.
---
# Starter project

The quickest way to spin up an Amagaki site is with `create-amagaki`, which scaffolds a minimal, zero-bundler project from [`examples/starter/`](https://github.com/blinkk/amagaki/tree/main/examples/starter) inside the main repository.

```bash
npx create-amagaki my-site
cd my-site
npm run dev
```

{{button.button({
    label: 'Browse examples/starter on GitHub',
    url: 'https://github.com/blinkk/amagaki/tree/main/examples/starter',
    icon: 'launch'
})}}

## What's included

The starter has a single dependency (`@amagaki/amagaki`) and zero frontend bundler boilerplate:

- **Sample pages**: YAML homepage with reusable partials (`/content/pages/index.yaml`) and a Markdown page with front matter (`/content/pages/about.md`)
- **Nunjucks templates**: Base layout (`/views/base.njk`) plus `hero` and `cards` partials
- **Shared site chrome**: Navigation and footer links in `/content/partials/site.yaml` using `!pod.doc`
- **Built-in localization**: `en` and `ja` locales configured in `amagaki.ts` with translations in `/locales/ja.yaml`
- **Plain CSS**: Clean stylesheet at `/static/css/main.css` served via `staticRoutes` — bring your own CSS/JS bundler only if you need one

## Building for production

Generate the static site to `./build/`:

```bash
npm run build
```

You can also pass a custom GitHub starter repo (or subdirectory URL) via `--starter`:

```bash
npx create-amagaki my-site --starter https://github.com/<owner>/<repo>
```
