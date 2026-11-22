---
title: Documents, Collections & URLs
order: 2
description: API reference for Document, Collection, StaticFile, Url, and TemplateContext.
---
# Documents, Collections & URLs

## `Document`

Represents a content file (`.yaml`, `.yml`, `.md`, or `.html`) paired with a `Locale`. Obtain documents with `pod.doc(podPath, locale?)` or `pod.docs(patterns?, options?)`.

### Static Members

| Member | Signature / Value | Description |
| --- | --- | --- |
| `Document.list` | `list(pod, patterns?, options?): Document[]` | Glob-matches documents under `pod.root` (supports `options.exclude` and `options.sort`). |
| `Document.isServable` | `isServable(podPath: string): boolean` | Returns `true` if `podPath` is not `_`-prefixed and has a supported extension. |
| `Document.SupportedExtensions` | `Set<string>` | `.yaml`, `.yml`, `.md`, `.html`. |
| `Document.FrontMatterOnlyExtensions` | `Set<string>` | `.yaml`, `.yml`. |
| `Document.SelfReferencedView` | `'self'` | Special `$view: self` value indicating the document renders itself as a template. |

### Instance Properties & Methods

| Member | Type | Description |
| --- | --- | --- |
| `podPath` | `string` | Pod-relative file path (e.g. `'/content/pages/about.yaml'`). |
| `locale` | `Locale` | Locale bound to this document instance. |
| `pod` | `Pod` | Parent `Pod` reference. |
| `ext` | `string` | File extension including leading dot (e.g. `'.md'`). |
| `basename` | `string` | Filename without extension (`'about'` for `/content/pages/about.yaml`). |
| `collection` | `Collection` or `null` | Nearest enclosing collection containing `_collection.yaml`. |
| `collectionPath` | `string` | Document's relative directory path inside its collection. |
| `fields` | `any` | Parsed YAML object or front matter, localized for `doc.locale`. |
| `body` | `string` | Markdown or HTML body below the `---` front matter delimiter (empty string for YAML). |
| `content` | `string` or `null` | Raw file contents from disk. |
| `view` | `DocumentView` | Template pod path (e.g. `'/views/page.njk'`), `'self'`, or custom async render function. |
| `pathFormat` | `string` or `false` | Resolved `$path` (or `$localization.path` for non-default locales); `false` for partial/hidden docs. |
| `url` | `Url` or `undefined` | Resolved serving `Url` from `pod.router`, or `undefined` if non-routed. |
| `locales` | `Set<Locale>` | Effective locales for this document (`$localization.locales` → collection → pod). |
| `defaultLocale` | `Locale` | Effective default locale (`$localization.defaultLocale` → collection → pod). |
| `render(context?)` | `Promise<string>` | Resolves async YAML fields and renders the document through its template engine. |

### `DocumentListOptions`

| Option | Type | Description |
| --- | --- | --- |
| `exclude` | `string` or `string[]` | Glob pattern(s) of pod paths to exclude from results. |
| `sort` | `string` | Field name on `doc.fields` to sort by (strings sorted with `localeCompare`, numbers numerically). |

### `TemplateContext`

Every template rendered by `doc.render()` receives:

| Variable | Type | Description |
| --- | --- | --- |
| `doc` | `Document` | Current document being rendered. |
| `pod` | `Pod` | Current pod instance. |
| `env` | `Environment` | Current environment (`pod.env`). |
| `process` | `NodeJS.Process` | Node.js process object (e.g. `process.env`). |
| `route` | `Route` (optional) | Active `DocumentRoute` when rendered via router/builder. |
| `req` | `express.Request` (optional) | Express request object during `amagaki serve`. |

---

## `Collection`

Represents a content directory configured by a `_collection.yaml` file. Obtain via `pod.collection(podPath)` or `pod.collections(patterns?, options?)`.

### Static Members

| Member | Signature | Description |
| --- | --- | --- |
| `Collection.ConfigFile` | `'_collection.yaml'` | Filename that identifies a collection directory. |
| `Collection.list` | `list(pod, patterns?, options?): Collection[]` | Lists collections matching glob pattern(s); supports `{sort: 'field'}`. |
| `Collection.find` | `find(pod, path): Collection` or `null` | Walks upwards from `path` to locate the nearest `_collection.yaml`. |
| `Collection.normalizePath` | `normalizePath(path: string): string` | Normalizes `'content/pages/'` to `'/content/pages'`. |

### Instance Properties & Methods

| Member | Type | Description |
| --- | --- | --- |
| `podPath` | `string` | Normalized collection pod path (e.g. `'/content/blog'`). |
| `collectionPath` | `string` | Path to the collection's `_collection.yaml`. |
| `basename` | `string` | Directory name (`'blog'` for `'/content/blog'`). |
| `exists` | `Boolean` | Whether `_collection.yaml` exists in this directory. |
| `fields` | `any` | Parsed contents of `_collection.yaml`. |
| `locales` | `Set<Locale>` | Effective locales for this collection (falls back to `pod.locales`). |
| `index` | `Document` | The collection's `index.*` document. |
| `parent` | `Collection` or `null` | Immediate parent collection, if one exists. |
| `parents` | `Collection[]` | Ancestor collections up to the root collection. |
| `parentPath` | `string` | Parent directory pod path. |
| `subcollections` | `Collection[]` | All nested child collections recursively. |
| `docs(options?)` | `Document[]` | Lists documents in this collection; pass `{excludeSubcollections: true}` to omit nested collections. |

---

## `StaticFile`

Represents a static asset (CSS, JS, image, font, etc.) obtained via `pod.staticFile(podPath)` or `!pod.staticFile`.

| Property | Type | Description |
| --- | --- | --- |
| `podPath` | `string` | Pod-relative path to the source file (e.g. `'/static/css/main.css'`). |
| `url` | `Url` or `undefined` | Serving `Url` mapped by `staticRoutes` in `amagaki.ts`. |
| `fingerprint` | `string` | MD5 hash of the file contents (useful for cache-busting query strings). |
| `exists` | `Boolean` | Whether the static file exists on disk. |

---

## `Url`

Represents a serving URL for a document or static file.

| Property / Method | Type | Description |
| --- | --- | --- |
| `path` | `string` | URL path component (e.g. `'/docs/getting-started/cli/'`). |
| `scheme` | `string` | Protocol (`'http'` or `'https'`), defaulting to `env.scheme`. |
| `host` | `string` | Hostname, defaulting to `env.host`. |
| `port` | `string` | Port string, defaulting to `env.port`. |
| `toString()` | `string` | Full serialized URL (e.g. `'https://example.com/about/'`). |
| `Url.relative(other, base)` | `string` | Computes a relative URL from `base` (`Document` or string) to `other` (`Document` or string). |
