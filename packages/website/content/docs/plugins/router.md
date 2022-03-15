---
title: Router
order: 5
---
# Router plugins

## Path format plugin

Custom functions can be added to use with the `$path` key in content documents
and collections.

{% filter codeTabs %}
```typescript:title=amagaki.ts
export default (pod: Pod) => {
  const plugin = pod.plugins.get('RouterPlugin') as RouterPlugin;
  plugin.addPathFormatFunction('slug', (title: string) => {
    return title.toLowerCase().replace(/\s+/g, '-');
  });
}
```
{% endfilter %}

{% filter codeTabs %}
```yaml
$path: /articles/${slug(doc.fields.title)}/
title: Lorem ipsum dolor sit amet
```
{% endfilter %}

## Adding routes

Amagaki provides a quick way to add new routes to extend functionality of your
site outside of rendering content documents, collections, and static files.
Routes may be added to integrate with external tools or generate custom output
programmatically.

Note that if the list of URL paths changes after the development server is
started, the router must be reset using `pod.router.reset()`. This may occur,
for example, if you are building routes generated from items fetched from an
external service.

{% filter codeTabs %}
```typescript:title=amagaki.ts
export default (pod: Pod) => {
  // Example: Add a single route.
  pod.router.addRoutes('default', async (provider) => {
    provider.addRoute({
      urlPath: '/hello-world/',
      build: async() => {
        return '<!DOCTYPE html><title>Hello World!</title>'
      }
    });
  });

  // Example: Add multiple routes.
  pod.router.addRoutes('multiple', async (provider) => {
    // Get URL paths to add (for example, from a remote service).
    const urlPaths = await getUrlPaths();
    for (const urlPath of urlPaths) {
      provider.addRoute({
        urlPath: urlPath,
        build: async() => {
          return '<!DOCTYPE html><title>Hello World!</title>'
        }
      });
    }
  });
}
```
{% endfilter %}
