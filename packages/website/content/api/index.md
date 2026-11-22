---
$path: /api/
title: Overview
order: 0
description: Complete public TypeScript API reference for @amagaki/amagaki.
---
# API Reference

All public classes, interfaces, plugins, and utility functions are exported from the root `@amagaki/amagaki` package:

```typescript
import {
  Pod,
  Document,
  Collection,
  StaticFile,
  Url,
  Locale,
  LocaleSet,
  TranslationString,
  Environment,
  Router,
  Route,
  RouteProvider,
  Builder,
  Server,
  Plugins,
  NunjucksPlugin,
  YamlPlugin,
  RouterPlugin,
  BuilderPlugin,
  ServerPlugin,
  interpolate,
} from '@amagaki/amagaki';
```

## Module Map

| Area | Public Exports | Reference |
| --- | --- | --- |
| **Core Pod & Env** | `Pod`, `PodOptions`, `PodConfig`, `TypeScriptLoader`, `Environment`, `Cache` | [Pod, Environment & Cache](/api/pod/) |
| **Content & Assets** | `Document`, `Collection`, `StaticFile`, `Url`, `TemplateContext` | [Documents, Collections & URLs](/api/documents-and-collections/) |
| **Routing & Builds** | `Router`, `RouteProvider`, `Route`, `DocumentRoute`, `StaticRoute`, `Builder`, `BuildResult`, `Server`, `Profiler` | [Routing, Builder & Server](/api/routing-and-building/) |
| **Localization** | `Locale`, `LocaleSet`, `TranslationString`, `LocalizableData` | [Localization & Strings](/api/localization/) |
| **Plugins & Utils** | `Plugins`, `PluginComponent`, `NunjucksPlugin`, `YamlPlugin`, `RouterPlugin`, `BuilderPlugin`, `ServerPlugin`, `TemplateEngineManager`, `DataType`, helpers | [Plugins, Engines & Utilities](/api/plugins-and-engines/) |

## Programmatic Usage

You can instantiate a `Pod` programmatically in build scripts, tests, or custom tooling:

```typescript
import {Pod, Server} from '@amagaki/amagaki';

// Create a pod with optional environment & TypeScript loader settings.
const pod = new Pod(
  './my-site',
  {name: 'prod', host: 'https://example.com'},
  {tsLoader: 'tsx'}
);

// Build all routes to ./my-site/build/
const result = await pod.builder.build();
console.log(`Built ${result.metrics.numDocumentRoutes} documents`);

// Or start the development server programmatically.
const server = new Server(pod, {port: 8080});
await server.start();
```

## Configuration Interfaces

### `PodOptions`

| Property | Type | Description |
| --- | --- | --- |
| `tsLoader` | `TypeScriptLoader` | Loader used to import `amagaki.ts`: `'sucrase'` (default), `'tsx'`, `'esbuild-register'`, `'jiti'`, or `'auto'`. |

### `PodConfig`

Passed to `pod.configure(config)` inside `amagaki.ts`:

| Property | Type | Description |
| --- | --- | --- |
| `basePath` | `string` | Base URL path where the site is mounted (referenced as `${pod.basePath}`). |
| `localization` | `LocalizationConfig` | Global `defaultLocale` (default `'en'`) and `locales` array (default `['en']`). |
| `meta` | `MetadataConfig` | Arbitrary site-wide metadata accessible via `pod.meta` and `!pod.meta`. |
| `staticRoutes` | `StaticDirConfig[]` | Array of `{path, staticDir}` mappings served and copied as static files. |
| `environments` | `Record<string, EnvironmentConfigOptions>` | Named environment overrides (`host`, `scheme`, `port`, `dev`, `fields`). |
