---
title: CLI
order: 5
---
# CLI

The `@amagaki/amagaki` package provides a command line interface (CLI) program.
All commands should be invoked from your pod's root directory. You can invoke
the `amagaki` command easily using `npx`.

It offers two commands:

- `build`
- `serve`

## build

```
npx amagaki build
```

The `build` command is used to build the HTML and collect static file
dependencies for your site.

When building the site, Amagaki will walk all content, generate routes, render
HTML, and copy static files to the specified output paths. The deployed fileset
will contain everything needed to deploy your static site.

## serve

```
npx amagaki serve
```

The `serve` command starts the Amagaki dev server. The Amagaki dev server builds
pages on the fly at request time (and caches the result, until the underlying
filesystem is changed).