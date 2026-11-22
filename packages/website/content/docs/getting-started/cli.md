---
title: CLI
order: 5
description: Reference for the amagaki CLI commands (serve, build, export) and options.
---
# CLI

The `@amagaki/amagaki` package ships with the `amagaki` CLI. Run commands from your pod's root directory (or pass an optional `[root]` path) via `npx amagaki`.

## Global options

Pass global flags **before** the subcommand:

| Flag | Description |
| --- | --- |
| `-V, --version` | Print the installed `@amagaki/amagaki` version. |
| `--profile` | Print build/template/route profiling tables when the command finishes. |
| `-e, --env <name>` | Activate a named environment defined in `amagaki.ts` (e.g. `prod`, `staging`). |

```bash
npx amagaki --profile -e prod build
```

## `serve [root]`

Starts the local Express development server. Pages render on demand at request time and reset their cache automatically when content, templates, plugins, or `amagaki.ts` change.

| Option | Default | Description |
| --- | --- | --- |
| `-p, --port <number>` | `8080` | Port to listen on (automatically increments if already in use). |

```bash
npx amagaki serve
npx amagaki serve --port 3000
```

## `build [root]`

Walks all content, resolves routes, renders documents, copies static files, and writes a manifest (`.amagaki/manifest.json`) to `./build/`.

| Option | Description |
| --- | --- |
| `-p, --pattern <patterns...>` | Glob pattern(s) for an incremental build of matching pod paths only. |
| `-l, --write-locales` | Write missing translation strings per locale to `./build/.amagaki/locales/`. |

```bash
# Full build
npx amagaki build

# Incremental build for specific content files
npx amagaki build -p '/content/pages/about.yaml'

# Build with profiling and missing translation export
npx amagaki --profile build --write-locales
```

## `export [root]`

Copies a completed build directory to another output directory (such as a deployment checkout), adding new/modified files and deleting stale files tracked by the build manifest.

| Option | Default | Description |
| --- | --- | --- |
| `-o, --exportDir <path>` | *(required)* | Target directory to export files into. |
| `-b, --buildDir <path>` | `build` | Source build directory relative to the pod root. |
| `-c, --exportControlDir <path>` | *(same as exportDir)* | Optional directory for storing the export control manifest. |

```bash
npx amagaki export -o ./dist-deploy
```
