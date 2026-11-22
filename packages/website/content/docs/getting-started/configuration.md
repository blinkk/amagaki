---
title: Configuration
order: 3
description: Configure pod metadata, locales, static routes, environments, plugins, and TypeScript loaders in amagaki.ts.
---
# Configuration

Your site's top-level configuration lives in `amagaki.ts` (or `amagaki.js`) at the pod root. This file is optional, but it is where you configure pod-wide settings:

- Site metadata (`meta`)
- Base URL mount path (`basePath`)
- Build environments (`environments`)
- Static asset routes (`staticRoutes`)
- Global localization settings (`localization`)
- Plugins, custom routes, template filters, and YAML types

## Example (`amagaki.ts`)

```typescript
import {Pod} from '@amagaki/amagaki';

export default (pod: Pod) => {
  pod.configure({
    basePath: '/',
    meta: {
      siteTitle: 'My Site',
    },
    localization: {
      defaultLocale: 'en',
      locales: ['en', 'fr', 'it', 'ja'],
    },
    staticRoutes: [
      {
        path: '/static/',
        staticDir: '/static/',
      },
    ],
    environments: {
      staging: {
        scheme: 'https',
        host: 'staging.example.com',
      },
      prod: {
        scheme: 'https',
        host: 'example.com',
      },
    },
  });
};
```

## Accessing metadata

Values defined under `meta` are accessible in TypeScript via `pod.meta`, in YAML via `!pod.meta`, and in templates via `pod.meta`:

{% raw %}
```nunjucks
<title>{{doc.fields.title}} — {{pod.meta.siteTitle}}</title>
```
{% endraw %}

## TypeScript loaders (`tsLoader`)

When instantiating `Pod` programmatically in monorepos or projects with custom TypeScript imports, you can choose how `amagaki.ts` is loaded via `PodOptions.tsLoader`:

| Loader | Description |
| --- | --- |
| `'sucrase'` | Lightweight transform loader (default for backwards compatibility). |
| `'tsx'` | Fast `esbuild`-based loader; recommended for monorepos and modern TS syntax. |
| `'esbuild-register'` | Alternative `esbuild`-based loader. |
| `'jiti'` | Universal loader supporting mixed ESM/CJS imports. |
| `'auto'` | Tries loaders in order: `tsx` → `esbuild-register` → `jiti` → `sucrase`. |

```typescript
import {Pod} from '@amagaki/amagaki';

const pod = new Pod('./my-site', undefined, {tsLoader: 'tsx'});
```

See the [Pod API Reference](/api/pod/) for all `PodConfig` options.
