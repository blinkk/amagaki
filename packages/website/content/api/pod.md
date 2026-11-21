---
title: Pod, Environment & Cache
order: 1
description: API reference for Pod, Environment, and Cache in @amagaki/amagaki.
---
# Pod, Environment & Cache

## `Pod`

`Pod` is the central entry point for every Amagaki site. It manages configuration, content files, locales, template engines, plugins, routes, builds, and profiling.

```typescript
const pod = new Pod(root, environmentOptions?, podOptions?);
```

### Properties

| Property | Type | Description |
| --- | --- | --- |
| `root` | `string` | Resolved absolute filesystem path to the pod root. |
| `config` | `PodConfig` | Active configuration loaded from `pod.configure(...)`. |
| `env` | `Environment` | Active build/server environment (`name`, `host`, `scheme`, `port`, `dev`, `fields`). |
| `router` | `Router` | Route registry and URL resolver. |
| `builder` | `Builder` | Static site builder and exporter. |
| `plugins` | `Plugins` | Registered plugin instances and hook dispatcher. |
| `engines` | `TemplateEngineManager` | Extension-to-template-engine registry (`.njk` registered by default). |
| `cache` | `Cache` | In-memory cache for docs, YAML, routes, and static files. |
| `profiler` | `Profiler` | Build & template rendering profiler (`--profile`). |
| `basePath` | `string` | Configured `basePath` (normalized). |
| `defaultLocale` | `Locale` | Global default locale (`pod.locale('en')` by default). |
| `locales` | `Set<Locale>` | Global set of configured locales. |
| `localization` | `LocalizationConfig` | Global localization config object. |
| `meta` | `MetadataConfig` or `undefined` | Arbitrary site metadata configured in `amagaki.ts`. |
| `yamlSchema` | `yaml.Schema` | Compiled `js-yaml` schema containing all built-in and plugin YAML types. |
| `defaultContentPodPath` | `string` | Default content directory path (`'/content/'`). |
| `defaultView` | `DocumentView` | Default template view path (`'/views/base.njk'`). |

### Methods

| Method | Signature | Description |
| --- | --- | --- |
| `configure` | `configure(config: PodConfig): void` | Applies site configuration (typically called once from `amagaki.ts`). |
| `doc` | `doc(podPath: string, locale?: Locale): Document` | Returns a `Document` instance for `podPath` (defaulting to `pod.defaultLocale`). |
| `docs` | `docs(patterns?, options?): Document[]` | Lists documents matching one or more glob patterns (`string` or `string[]`), ignoring `_`-prefixed files. |
| `collection` | `collection(podPath: string): Collection` | Returns the `Collection` for `podPath`, walking upwards to find `_collection.yaml`. |
| `collections` | `collections(patterns?: string[], options?: CollectionListOptions): Collection[]` | Lists collections matching glob pattern(s). |
| `staticFile` | `staticFile(podPath: string): StaticFile` | Returns a `StaticFile` handle for `podPath`. |
| `locale` | `locale(id: string): Locale` | Returns a cached `Locale` instance for the given locale code (e.g. `'de'`). |
| `string` | `string(options: StringOptions, locale?: Locale): TranslationString` | Creates a `TranslationString` (`{value, prefer?}`). |
| `setEnvironment` | `setEnvironment(name: string): void` | Activates a named environment defined under `config.environments`. |
| `fileExists` | `fileExists(podPath: string): Boolean` | Checks if a file exists relative to `pod.root`. |
| `getAbsoluteFilePath` | `getAbsoluteFilePath(podPath: string): string` | Converts a pod-relative path to an absolute filesystem path. |
| `readFile` | `readFile(podPath: string): string` | Reads a UTF-8 file relative to `pod.root`. |
| `writeFileAsync` | `writeFileAsync(podPath: string, content: string): Promise<void>` | Asynchronously writes content to a pod-relative path (creating directories). |
| `deleteFileAsync` | `deleteFileAsync(podPath: string): Promise<void>` | Asynchronously deletes a file at a pod-relative path. |
| `readYaml` | `readYaml(podPath: string): any` | Parses a YAML file using `pod.yamlSchema` (cached). |
| `readYamlString` | `readYamlString(content: string, cacheKey?: string): any` | Parses a YAML string using `pod.yamlSchema`. |
| `dumpYaml` | `dumpYaml(data: any): string` | Serializes an object to YAML using `pod.yamlSchema`. |
| `walk` | `walk(podPath: string): string[]` | Recursively lists all pod-relative file paths under `podPath`. |
| `warmup` | `warmup(): Promise<void>` | Pre-warms the router so URLs and routes are ready immediately. |

---

## `Environment`

Represents the active runtime environment (`pod.env`), passed to every template as `env` and usable in YAML via `!IfEnvironment`.

| Property / Method | Type | Description |
| --- | --- | --- |
| `name` | `string` | Environment name (`'default'` unless set via `-e` / `pod.setEnvironment()`). |
| `host` | `string` | Hostname used when constructing full `Url` strings (default `'localhost'`). |
| `scheme` | `string` | URL scheme (`'http'` or `'https'`). |
| `port` | `string` or `undefined` | Optional port number. |
| `dev` | `boolean` | `true` when running under `amagaki serve`, `false` during `amagaki build`. |
| `fields` | `any` | Custom environment-specific key/value data from `amagaki.ts`. |
| `updateFromConfig(options)` | `void` | Merges non-empty `UpdateEnvironmentOptions` into the active environment. |

```typescript
// amagaki.ts
pod.configure({
  environments: {
    staging: {
      scheme: 'https',
      host: 'staging.example.com',
      fields: {analyticsId: 'G-STAGING'},
    },
    prod: {
      scheme: 'https',
      host: 'example.com',
      fields: {analyticsId: 'G-PROD'},
    },
  },
});
```

---

## `Cache`

Accessible via `pod.cache`. Holds memoized documents, collections, parsed YAML, locales, static files, strings, and routes.

| Method | Description |
| --- | --- |
| `pod.cache.reset()` | Clears all cached documents, collections, YAML, routes, static files, and resets the router. Called automatically by the dev server file watcher. |
| `pod.cache.clearAll()` | Empties all internal cache maps. |
