---
$path: /docs/
title: Introduction
order: 0
description: Introduction to Amagaki, a TypeScript static site generator for hand-coded marketing and informational websites.
---
# Introduction

Amagaki is a TypeScript-based static site generator designed for hand-coding marketing and informational websites. It keeps structured content cleanly separated from templates, includes built-in localization and build profiling, and is extensible through a lightweight plugin system.

> **Maintenance mode:** Amagaki continues to receive bug fixes and dependency updates for existing sites. For new projects, we recommend [Root.js](https://rootjs.dev) — Blinkk's modern successor built with TypeScript, Preact/TSX, file routing, i18n, and a built-in CMS.

## Highlights

- **TypeScript-first:** Configure your site, routes, YAML types, and plugins in TypeScript (`amagaki.ts`).
- **Multiple template engines:** Ships with Nunjucks out of the box and supports registering custom template engines (such as Preact/TSX).
- **Minimal core:** Focuses on content, routing, localization, and static generation without imposing a frontend framework.
- **On-demand dev server:** Renders pages at request time during development rather than rebuilding the full site on every edit.
- **Built-in localization:** Manage site, collection, and document locales, locale-conditional fields (`!IfLocale`), and translation catalogs natively.

## Next steps

- [Install Amagaki](/docs/getting-started/installation/) or scaffold with [`create-amagaki`](/docs/getting-started/starter-project/)
- [Explore the project structure](/docs/getting-started/project-structure/)
- [Browse the full API Reference](/api/)
