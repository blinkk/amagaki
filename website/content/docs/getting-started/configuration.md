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

{% filter codeTabs %}
```javascript:title=amagaki.js
module.exports = function (pod) {
  pod.configure({
    meta: {
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
{% endfilter %}

## Custom metadata

Specify custom metadata:

{% filter codeTabs %}
```javascript:title=amagaki.js
pod.configure({
    meta: {
        siteTitle: 'Amagaki',
        siteDescription: 'A cool tool for hand-coding marketing websites.',
    },
});
```
{% endfilter %}

Metadata can be accessed using a pod function:

{% filter codeTabs %}
```nunjucks
{%- raw %}
{{pod.meta.siteTitle}}
{% endraw %}```
{% endfilter %}