---
title: Routes and URLs
order: 4
---
# Routes

Routing behavior determines how Amagaki generates URLs for content, and what the
lifecycle of a request to a page on the development server looks like.

## Route providers

Amagaki has three basic route providers, all which generate routes. In a
nutshell, here's how routing works:

1. **Documents:** All collections and documents are searched to find `$path` settings (for both
   the root document and localized variations).
    - Documents inherit `$path` settings from their collection's
      `_collection.yaml`.
    - If a document has `$path: null` or a collection does not have a
      `_collection.yaml`, the document will not generate a route.
2. **Static files:** Static file routes registered within `amagaki.js` are used.
3. **Plugins:** Any plugins registered within `amagaki.js` that configure custom route
   providers can add additional routes beyond document routes and static file
   routes.

Pods collect the routes from the steps outlined above to determine a full
routing tree outlining all routes that the pod generates.

## Inspecting routes

Use `npx amagaki build` to build your site, and inspect the generated files
within the `build` directory to see which routes are created.

## Referring to URLs

Because Amagaki routing is declarative (within content) and progammatic (within
plugins that provide route providers), you should never hardcode URLs anywhere
within either content files or templates. Always use an appropriate pod function
to retrieve the URL for something.

The Url object is used for all URLs for documents, static files, and custom
route providers within Amagaki. While it's usually appropriate to refer to a URL
using its `path` property only, you may also want an object's absolute URL
including its domain name. Build environments can specify the hostname that your
site is deployed to, allowing you to centrally configure hostnames.

{% filter codeTabs %}
```yaml
home: !pod.doc /content/pages/index.yaml
```
{% endfilter %}

{% filter codeTabs %}
```nunjucks
{%- raw %}
{{doc.home.url.path}}
{% endraw %}
```
{% endfilter %}

## Route provider deep-dive

### Collection routes

A collection's `_collection.yaml` file specifies the default URL path for all
documents within a collection. Here's what a typical `_collection.yaml` may look
like:

{% filter codeTabs %}
```yaml:title=_collection.yaml
$path: /pages/${doc.basename}/
```
{% endfilter %}

All documents within this collection will be generated to paths generated from
the above path formatter. Path formatters are interpolated, with the following
context variables:

- `doc`: The document being rendered
- `pod`: The pod
- `route`: The route being rendered

For example, a collection with the following structure...

```
.
└── content
    ├── pages
        ├── _collection.yaml
        ├── about.yaml
        ├── contact.yaml
        └── index.yaml
```

... will generate the following routes and URL paths:

- `/pages/about/`
- `/pages/contact/`
- `/pages/`

Note that paths that terminate in `/index/` are automatically cleaned.

### Document routes

Documents can override a collection's `$path` by specifying their own.

{% filter codeTabs %}
```yaml:title=/content/pages/contact.yaml
$path: /pages/get-in-touch/
```
{% endfilter %}

In the above example, the page will be generated to `/pages/get-in-touch/`
instead of inheriting its path from `_collection.yaml`.

Documents can disable routing (and therefore won't be built) by setting their
path to `null`:

{% filter codeTabs %}
```yaml:title=/content/pages/contact.yaml
$path: null
```
{% endfilter %}

Remember, path formatters are interpolated, so you can even refer to a
document's content:

{% filter codeTabs %}
```yaml:title=/content/pages/contact.yaml
$path: /posts/${doc.fields.date}/${doc.fields.slug}/
date: 2019-01-06
slug: hello-world
```
{% endfilter %}

In the above example, the page will be generated to
`/posts/2019-01-06/hello-world/`.

### Static routes

Amagaki collects files from directories and copies them to the `build` folder.

{% filter codeTabs %}
```javascript:title=amagaki.js
module.exports = function (pod) {
  pod.configure({
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

It's a best practice to refer to static files using their pod paths, in case you
want to change the serving path in the future. See the following example for a
common usage pattern.

{% filter codeTabs %}
```nunjucks
{%- raw %}
<link rel="stylesheet" href="{{pod.staticFile('/dist/css/main.css').url.path}}">
<script src="{{pod.staticFile('/dist/js/main.js').url.path}}"></script>
<img src="{{pod.staticFile('/src/static/images/cat.jpg').url.path}}">
{% endraw %}
```
{% endfilter %}

Pod functions also enable usage recording, so it's possible to determine where
assets are used, and how frequently.