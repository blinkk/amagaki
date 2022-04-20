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

### Adding static routes

The most simple scenario is to add static routes. Call `pod.router.add` for
every static route you'd like to add to your site. Static routes are usually
generated as one-offs, from data, or files.

{% filter codeTabs %}
```typescript:title=amagaki.ts
export default (pod: Pod) => {
  pod.router.add({
    urlPath: '/hello-world/',
    build: async() => {
      return '<title>Hello World!</title>'
    }
  });
}
```
{% endfilter %}

### Adding dynamic routes with `getStaticPaths`

Amagaki also supports dynamic routes. You would use dynamic routes when you do
not have a deterministic list of all URL paths available ahead of time. For
example, you might want to fetch data from a CMS or API and output one page per
item based on the response from the CMS.

In development and serving mode, Amagaki can use a parameter-based dynamic
route. In addition to development and serving mode, you need to define a list of
paths to be statically generated for site builds.

In the following example, `/posts/:slug` will be served as a route in dev mode.
The paths from `getStaticPaths` will be used for the full site build, with the
params from the `urlPath` supplied to the `build` function under
`options.params`.

{% filter codeTabs %}
```typescript:title=amagaki.ts
import { BuildRouteOptions } from '@amagaki/amagaki';

export default (pod: Pod) => {
  pod.router.add({
    urlPath: '/posts/:slug',
    build: async(options: BuildRouteOptions) => {
      const doc = await getCmsDocument(options.params.slug);
      return `<title>${doc.fields.title}</title>`
    },
    getStaticPaths: async () => {
      const docs = await listCmsDocuments();
      return docs.map(doc => `/posts/${doc.fields.slug}/`);
    }
  });
}
```
{% endfilter %}
