---
title: YAML types
order: 6
description: Reference for Amagaki's built-in YAML constructors and custom YAML types.
---
# YAML types

Amagaki treats custom YAML types as first-class citizens so you can model references, partials, translations, and environment/locale conditionals directly inside your content files — without hardcoding URLs or paths.

## Built-in YAML types

| Tag | Syntax | Description |
| --- | --- | --- |
| `!pod.doc` | `!pod.doc '/content/pages/about.yaml'` or `!pod.doc ['/content/pages/about.yaml', !pod.locale 'de']` | Resolves to a `Document` object. |
| `!pod.docs` | `!pod.docs ['/content/posts/**', {sort: 'order'}]` | Resolves to an array of `Document` objects. |
| `!pod.collection` | `!pod.collection '/content/posts'` | Resolves to a `Collection` object. |
| `!pod.collections` | `!pod.collections ['/content/**', {sort: 'order'}]` | Resolves to an array of `Collection` objects. |
| `!pod.staticFile` | `!pod.staticFile '/static/images/logo.svg'` | Resolves to a `StaticFile` object. |
| `!pod.string` | `!pod.string 'Hello'` or `!pod.string {value: 'Old', prefer: 'New'}` | Resolves to a `TranslationString` localized for the current document. |
| `!pod.yaml` | `!pod.yaml '/content/partials/nav.yaml'` or `!pod.yaml '/content/data.yaml?footer.links'` | Loads a YAML file (with optional `?dot.path` query). |
| `!pod.locale` | `!pod.locale 'ja'` | Resolves to a `Locale` object. |
| `!pod.locales` | `!pod.locales ['en', 'de', 'ja']` | Resolves to a `LocaleSet` of `Locale` objects. |
| `!pod.meta` | `!pod.meta 'siteTitle'` | Reads a key from `pod.meta` configured in `amagaki.ts`. |
| `!pod` | `!pod 'basePath'` | Reads a property directly from the `Pod` instance. |
| `!IfEnvironment` | `!IfEnvironment {default: 'a', prod: 'b'}` | Returns the value matching `pod.env.name`, falling back to `default`. |
| `!IfLocale` | `!IfLocale {default: 'a', ja: 'b'}` | Returns the value matching `doc.locale.id`, falling back to `default`. |

## Examples

### Referencing documents and collections

```yaml
# Single document
home: !pod.doc '/content/pages/index.yaml'

# Single document in a specific locale
homeDe: !pod.doc ['/content/pages/index.yaml', !pod.locale 'de']

# Explicit list of documents
featured: !pod.docs ['/content/pages/index.yaml', '/content/posts/launch.md']

# Glob with options
posts: !pod.docs ['/content/posts/**', {sort: 'order'}]
```

### Partial YAML & dot-path queries

```yaml
# Load an entire partial file
header: !pod.yaml '/content/partials/header.yaml'

# Load a nested key from a YAML file
primaryCta: !pod.yaml '/content/partials/ctas.yaml?signup.button'
```

### Environment and locale conditionals

```yaml
analyticsId: !IfEnvironment
  default: ''
  staging: 'G-STAGING'
  prod: 'G-PROD'

heroImage: !IfLocale
  default: !pod.staticFile '/static/images/hero-en.png'
  ja: !pod.staticFile '/static/images/hero-ja.png'
```

## Custom YAML types

You can define your own YAML tags in `amagaki.ts` or a plugin (for example, to validate structured components or fetch data from an external CMS).

{{button.button({
    label: 'Learn how to create custom YAML types',
    doc: '/content/docs/plugins/yaml-types.md',
    icon: 'arrow_forward'
})}}
