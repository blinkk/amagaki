---
title: Starter project
order: 1
---
# Starter project

The quickest way to start an Amagaki project with enough foundational bells and
whistles is to simply clone and run the Amagaki starter project.

This guide assumes you have Node and Git installed. Amagaki is a command line
program, so you’ll invoke these commands from your terminal. To get started,
simply clone the quick start project, install the dependencies, and run the
development server.

```
git clone https://github.com/blinkkcode/amagaki-starter
npm install
npm run dev
```

{{button.button({
    label: 'Open on GitHub',
    url: 'https://github.com/blinkkcode/amagaki-starter',
    external: true,
    class: 'button button--low',
    icon: 'launch'
})}}

## What’s included in the quick start project?

*   Sample pages
    *   Homepage
    *   About page
    *   Contact page
*   Sample blog
    *   Blog listing
    *   Blog posts
*   Feeds
    *   Sitemap
    *   RSS
*   Foundational development tools
    *   Nunjucks templates
        *   Base template
        *   Reusable partial modules
    *   Sass (with code splitting on a per-partial basis)
    *   TypeScript (with code splitting on a per-partial basis)
    *   Live reloading using BrowserSync
*   Lighthouse scores

The quick start project demonstrates how to assemble a preliminary Amagaki
website. You can customize the look and feel and adjust the stylesheet to meet
your project’s needs.

The quick start project can be built into static HTML, CSS, and JavaScript
using:

```
npm run build
```

## Other starter projects

The official starter project follows our presumptions and recommendations, and
shows how to make use of the partial loop, which is a powerful way to build
maintainable marketing websites. If you want to add your own starter project,
add it below.

{{button.button({
    label: 'Add your starter',
    url: pod.config.metadata.githubEditRoot + doc.podPath,
    external: true,
    class: 'button button--small button--tonal button--reverse',
    icon: 'add'
})}}
