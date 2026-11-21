---
title: Plugins, Engines & Utilities
order: 5
description: API reference for Plugins, built-in plugins, TemplateEngineManager, and utility functions.
---
# Plugins, Engines & Utilities

## `Plugins` & `PluginComponent`

Accessible via `pod.plugins`. Manages built-in and custom plugins and dispatches lifecycle hooks.

### `Plugins` Methods

| Method | Signature | Description |
| --- | --- | --- |
| `register` | `register(PluginClass, config)` | Instantiates and registers a plugin implementing `PluginComponent`. |
| `get` | `get(name: string)` | Returns the first registered plugin matching class name `name` (e.g. `'NunjucksPlugin'`), or `null`. |
| `trigger` | `trigger(hookName, ...args): Promise<void>` | Asynchronously invokes `<hookName>Hook` on every registered plugin. |
| `triggerSync` | `triggerSync(hookName, ...args): void` | Synchronously invokes `<hookName>Hook` on every registered plugin. |

### `PluginComponent` Lifecycle Hooks

Any plugin class may implement one or more of these optional hook methods:

| Hook Method | Arguments | When Invoked |
| --- | --- | --- |
| `createYamlTypesHook` | `(yamlTypeManager: YamlTypeManager)` | When building `pod.yamlSchema`. |
| `createTemplateEngineHook` | `(templateEngine: TemplateEngineComponent, extension: string)` | When a template engine is instantiated for an extension. |
| `updatePathFormatContextHook` | `(context: Record<string, any>)` | When interpolating `$path` / `$localization.path` strings. |
| `createServerHook` | `(app: express.Express)` | When the dev server creates its Express application. |
| `beforeBuildHook` | `(builder: Builder)` | Immediately before `pod.builder.build()` starts rendering routes. |
| `afterRenderHook` | `(result: TemplateEngineRenderResult)` | Synchronously after a template engine renders output (allows mutating `result.content`). |
| `afterBuildHook` | `(result: BuildResult)` | After `pod.builder.build()` finishes writing files and manifests. |

---

## Built-in Plugins

All five built-in plugins are registered automatically on every `Pod` and can be retrieved via `pod.plugins.get('<Name>')`:

### `NunjucksPlugin` & `NunjucksBuiltInFilters`

```typescript
const nunjucksPlugin = pod.plugins.get('NunjucksPlugin') as NunjucksPlugin;
nunjucksPlugin.addFilter('uppercase', (value: string) => value.toUpperCase());
nunjucksPlugin.addGlobal('siteYear', new Date().getFullYear());
```

Built-in Nunjucks filters (registered automatically):

| Filter | Usage | Description |
| --- | --- | --- |
| `markdown` | {% raw %}<code>{{doc.body &#124; markdown &#124; safe}}</code>{% endraw %} | Converts Markdown to HTML (with GFM heading IDs). |
| `t` | {% raw %}<code>{{'Hello' &#124; t}}</code>{% endraw %} | Translates a string or `TranslationString` in the current `doc.locale`. |
| `relative` | {% raw %}<code>{{otherDoc &#124; relative}}</code>{% endraw %} | Returns a path relative to the current `doc.url.path`. |
| `formatBytes` | {% raw %}<code>{{1024 &#124; formatBytes}}</code>{% endraw %} | Formats a byte count into human-readable units (`'1.00 KB'`). |
| `await` | {% raw %}<code>{{asyncFn() &#124; await}}</code>{% endraw %} | Async Nunjucks filter that awaits a Promise in a template. |

### `YamlPlugin` & `YamlTypeManager`

```typescript
const yamlPlugin = pod.plugins.get('YamlPlugin') as YamlPlugin;
yamlPlugin.addType('!custom', {
  kind: 'scalar',
  construct: value => ({custom: value}),
});
```

Built-in YAML tags: `!pod.doc`, `!pod.docs`, `!pod.collection`, `!pod.collections`, `!pod.staticFile`, `!pod.string`, `!pod.yaml`, `!pod.locale`, `!pod.locales`, `!pod.meta`, `!pod`, `!IfEnvironment`, `!IfLocale`.

### `RouterPlugin`

```typescript
const routerPlugin = pod.plugins.get('RouterPlugin') as RouterPlugin;
routerPlugin.addPathFormatFunction('slugify', (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, '-')
);
```

### `BuilderPlugin`

```typescript
const builderPlugin = pod.plugins.get('BuilderPlugin') as BuilderPlugin;
builderPlugin.addBeforeBuildStep(async builder => {
  // Run before routes are built.
});
builderPlugin.addAfterBuildStep(async result => {
  // Inspect result.metrics, result.manifest, result.diff.
});
```

### `ServerPlugin`

```typescript
const serverPlugin = pod.plugins.get('ServerPlugin') as ServerPlugin;
serverPlugin.register(async app => {
  app.get('/healthz', (_req, res) => res.send('ok'));
});
```

---

## `TemplateEngineManager`

Accessible via `pod.engines`. Maps file extensions to `TemplateEngineComponent` implementations.

| Method | Signature | Description |
| --- | --- | --- |
| `associate` | `associate(extension: string, TemplateEngineClass)` | Associates a file extension (e.g. `'.tsx'`) with a template engine class. |
| `getEngineByExtension` | `getEngineByExtension(extension: string)` | Returns (and caches) the engine for `extension`. Throws `InvalidExtensionError` or `MissingTemplateEngineError`. |
| `getEngineByFilename` | `getEngineByFilename(fileName: string)` | Looks up the engine based on `fileName`'s extension. |

---

## Utility Functions & `DataType`

Exported directly from `@amagaki/amagaki`:

| Export | Signature | Description |
| --- | --- | --- |
| `interpolate` | `interpolate(pod, templateString, params)` | Evaluates `${...}` expressions against `params` (cached per pod). |
| `localizeData` | `localizeData(data, locale)` | Recursively resolves `TranslationString` and `LocalizableData` values inside an object graph for `locale`. |
| `splitFrontMatter` | `splitFrontMatter(content)` | Splits YAML front matter (`---`) from body text, returning `{frontMatter?, body?}`. |
| `queryObject` | `queryObject(query, data)` | Reads nested dot-delimited keys (e.g. `'hero.title'`) from an object. |
| `walk` | `walk(path, newFiles?, removePrefix?)` | Recursively lists file paths under a directory. |
| `basename` | `basename(path)` | Returns filename without its extension. |
| `formatBytes` | `formatBytes(bytes)` | Formats byte counts into readable strings (`Bytes`, `KB`, `MB`, `GB`). |
| `debounce` | `debounce(fn, delay, immediate?)` | Debounces a function call within a `delay` millisecond window. |
| `DataType` | `DataType.isDocument(v)`, `isCollection(v)`, `isStaticFile(v)`, `isObject(v)`, `isArray(v)`, `isString(v)`, `isNumber(v)`, `isBoolean(v)`, `isDate(v)`, `isFunction(v)`, `isNull(v)`, `isUndefined(v)`, `isRegExp(v)`, `isSymbol(v)`, `isInstance(v)` | Type-checking helpers used internally and available to plugins. |
