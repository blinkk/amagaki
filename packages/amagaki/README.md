# Amagaki

[![npm version](https://img.shields.io/npm/v/@amagaki/amagaki.svg)](https://www.npmjs.com/package/@amagaki/amagaki)
[![Run tests](https://github.com/blinkk/amagaki/actions/workflows/test-amagaki.yml/badge.svg)](https://github.com/blinkk/amagaki/actions/workflows/test-amagaki.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/blinkk/amagaki/blob/main/LICENSE.md)

> [!NOTE]
> **Maintenance mode:** Amagaki is actively maintained for existing sites with bug fixes and dependency updates, but for new projects we recommend <img src="https://amagaki.dev/static/images/rootjs-beet.svg" width="13" height="19" alt="" align="absmiddle">&nbsp;[**Root.js**](https://rootjs.dev) ([GitHub](https://github.com/blinkk/rootjs)) — our modern successor built with TypeScript, Preact/TSX, file routing, i18n, and a built-in CMS.

**Amagaki** is a TypeScript-based static site generator designed for hand-coding marketing and informational websites. It provides flexible URL routing, built-in localization, custom YAML types, an extensible plugin architecture, build profiling, and pluggable template engines.

Amagaki takes concepts from [Grow](https://grow.dev) and brings them to a TypeScript and Node.js ecosystem.

## Documentation

Read the full documentation and API reference at **[amagaki.dev](https://amagaki.dev)**.

## Key Features

- **TypeScript & Node.js**: Write site configuration, plugins, and custom routes in TypeScript with minimal core dependencies.
- **Data-driven content**: Author structured content in YAML and Markdown with built-in YAML constructors (`!pod.doc`, `!pod.collection`, `!pod.staticFile`, `!pod.string`, `!IfLocale`, `!IfEnvironment`).
- **Pluggable template engines**: Ships with Nunjucks out of the box and supports registering custom template engines (such as Preact/TSX).
- **On-demand dev server**: Renders pages on request during development instead of rebuilding the entire site on every edit.
- **Built-in localization (i18n)**: Manage translatable strings, locale-scoped fields, and localized URLs natively.
- **Extensible plugin system**: Hook into routing, YAML parsing, template engines, Express dev server middleware, and build lifecycle events.
- **Built-in profiling**: Inspect memory usage, build times, route counts, and missing translation reports on every build.

## Requirements

- Node.js **20+**

## Quick Start

Scaffold a new project from the official [`amagaki-starter`](https://github.com/blinkk/amagaki-starter):

```bash
npx create-amagaki my-site
cd my-site
npm run dev
```

Or install `@amagaki/amagaki` directly in an existing project:

```bash
npm install --save @amagaki/amagaki
```

### Common Commands

```bash
npx amagaki serve             # Start the local development server (default port 8080)
npx amagaki build             # Build the static site to ./build/
npx amagaki --profile build   # Build and print detailed profiling tables
npx amagaki export -o ./out   # Export a build to another directory with diff summary
```

## Development

This monorepo uses npm workspaces, TypeScript, and AVA:

```bash
git clone https://github.com/blinkk/amagaki.git
cd amagaki
npm ci
npm run build -w packages/amagaki
npm run build -w packages/amagaki-plugin-page-builder
npm run build -w packages/amagaki-engine-preact
npm run build -w packages/create-amagaki
npm test --workspaces
```

## License

[MIT](https://github.com/blinkk/amagaki/blob/main/LICENSE.md)
