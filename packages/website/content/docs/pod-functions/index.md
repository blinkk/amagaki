---
$path: /docs/pod-functions/
title: Pod functions
order: 0
description: Use pod functions across YAML types, templates, and TypeScript plugins.
---
# Pod functions

"Pod functions" are Amagaki's core accessors for interacting with documents, collections, static files, metadata, and locales across YAML, templates, and TypeScript plugins.

## Overview

| Function | YAML Tag | Description |
| --- | --- | --- |
| `pod.doc(path, locale?)` | `!pod.doc` | Returns a `Document` object. |
| `pod.docs(patterns?, options?)` | `!pod.docs` | Lists `Document` objects matching glob pattern(s). |
| `pod.collection(path)` | `!pod.collection` | Returns a `Collection` object. |
| `pod.collections(patterns?, options?)` | `!pod.collections` | Lists `Collection` objects matching glob pattern(s). |
| `pod.staticFile(path)` | `!pod.staticFile` | Returns a `StaticFile` object (`url`, `fingerprint`, `exists`). |
| `pod.string(options, locale?)` | `!pod.string` | Returns a `TranslationString` (`{value, prefer?}`). |
| `pod.readYaml(path)` | `!pod.yaml` | Loads parsed YAML content (supports `?query` key lookups). |
| `pod.locale(id)` | `!pod.locale` | Returns a `Locale` object. |
| `pod.locales` | `!pod.locales` | Returns a `Set<Locale>` of locale objects. |
| `pod.meta` | `!pod.meta` | Reads site metadata configured in `amagaki.ts`. |

## Examples

### YAML + Nunjucks

{% filter codeTabs %}{% raw %}
```yaml:title=/content/pages/index.yaml
$view: /views/page.njk
# Create a menu containing three documents.
menu:
- doc: !pod.doc /content/pages/index.yaml
  title: Homepage
- doc: !pod.doc /content/pages/about.yaml
  title: About
- doc: !pod.doc /content/pages/contact.yaml
  title: Contact
```
```nunjucks:title=/views/page.njk
{# Render the menu. #}
<ul>
  {% for item in doc.fields.menu %}
    <li><a href="{{item.doc.url.path}}">{{item.title}}</a></li>
  {% endfor %}
</ul>
```
{% endraw %}{% endfilter %}

### TypeScript

```typescript
// Get one document.
const doc = pod.doc('/content/pages/index.yaml');

// List all documents within the posts collection, sorted by order.
const docs = pod.docs('/content/posts/**', {sort: 'order'});

// Read a static file's serving URL and fingerprint.
const stylesheet = pod.staticFile('/static/css/main.css');
```

{{button.button({
    label: 'Read Pod API Reference',
    url: '/api/pod/',
    icon: 'arrow_forward'
})}}
