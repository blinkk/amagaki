---
title: Installation
order: 0
description: Install @amagaki/amagaki or create a new project with create-amagaki.
---
# Installation

Amagaki requires **Node.js 20 or higher**.

## Start from the starter template

To scaffold a new zero-bundler site from [`examples/starter/`](https://github.com/blinkk/amagaki/tree/main/examples/starter):

```bash
npx create-amagaki my-site
cd my-site
npm run dev
```

## Install directly

To integrate Amagaki into an existing Node.js project or start from scratch:

```bash
npm install --save @amagaki/amagaki

# Start the development server (default port 8080)
npx amagaki serve

# Build the static site to ./build/
npx amagaki build
```

Amagaki uses sensible defaults even without an `amagaki.ts` file. See [Project structure](/docs/getting-started/project-structure/) and [Configuration](/docs/getting-started/configuration/) to customize your site.
