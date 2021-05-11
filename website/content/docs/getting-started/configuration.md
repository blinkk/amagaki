---
title: Configuration
order: 3
---
# Configuration

Your project’s top-level configuration is managed in the `amagaki.js` file. This
file is optional. However, it is required for specifying pod-wide settings, as
outlined below.

Configuration is used for specifying:

- Custom metadata
- Build environments
- URL routing settings
- Static file routing
- Localization behavior
- External plugins
- Local plugins

The `amagaki.js` file configures pod-wide settings. Similar configuration (i.e.
URL paths, templates, custom fields, and localization behavior) can be specified
at the content-level, on a per-document or per-collection basis.

## Example

Here's what a sample `amagaki.js` file may look like:

```javascript
module.exports = function (pod) {
  pod.configure({
    metadata: {
      name: 'Amagaki Example',
    },
    localization: {
      defaultLocale: 'en',
      locales: ['en', 'fr', 'it', 'ja'],
    },
    staticRoutes: [
      {
        path: '/static/',
        staticDir: '/dist/',
      },
      {
        path: '/static/images/',
        staticDir: '/src/static/images/',
      },
    ],
  });
};
```

## Custom metadata

Specify custom metadata:

```javascript
pod.configure({
    metadata: {
        siteTitle: 'Amagaki',
        siteDescription: 'A cool tool for hand-coding marketing websites.',
    },
});
```

Metadata can be accessed using a pod function:

```nunjucks
{%- raw %}
{{pod.metadata.siteTitle}}
{% endraw %}
```

