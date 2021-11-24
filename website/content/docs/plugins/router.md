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

## Custom route providers

The Amagaki router can be extended to generate your own routes. By default,
Amagaki has two route providers:

- [CollectionRouteProvider](https://amagaki.dev/api/classes/router.collectionrouteprovider.html)
  – Provides routes generated from data files in the content directory
- [StaticDirectoryRouteProvider](https://amagaki.dev/api/classes/router.staticdirectoryrouteprovider.html)
  – Provides routes from static files in specified directories

Custom route providers could be created in order to provide routes from
databases, your own custom handlers that don't map to filesystem files, or
pretty much anything.

## Anatomy

Custom route providers should extend the
[`RouteProvider`](https://amagaki.dev/api/classes/router.routeprovider.html)
class.

Route providers must:

- Have a `type` property.
- Define an async `routes` method that returns a list of `Route`s.

Routes must:

- Have a `urlPath` getter.
- Define an async `build` method that returns the content of the HTTP response
  (or, when building a static site, the generated file).
- Can optionally have a `contentType` getter.

## Example

Here's an example of a route provider that serves a `robots.txt` file.

{% filter codeTabs %}
```typescript:title=sitemap.ts
export class RobotsTxtRouteProvider extends RouteProvider {

  constructor(router: Router) {
    super(router);
    this.type = 'robots';
  }

  static register(pod: Pod) {
    const provider = new RobotsTxtRouteProvider(pod.router);
    pod.router.addProvider(provider);
    return provider;
  }

  async routes() {
    // This RouteProvider only generates one route – the `robots.txt` file.
    return [new RobotsTxtRoute(this)];
  }
}

class RobotsTxtRoute extends Route {
  constructor(provider: RouteProvider) {
    super(provider);
    this.provider = provider;
  }

  get urlPath() {
    return '/robots.txt';
  }

  async build() {
    // The response of the `RobotsTxtRoute` is static.
    return 'User-agent: *\nAllow: /\nSitemap: https://example.com/sitemap.xml';
  }
}
```
{% endfilter %}

And then use it in `amagaki.ts`:

{% filter codeTabs %}
```typescript:title=amagaki.ts
import {RobotsTxtRouteProvider} from './sitemap';

export default (pod: Pod) => {
  RobotsTxtRouteProvider.register(pod);
}
```
{% endfilter %}

The above example shows rendering static content at both routes. If you'd like
to render dynamic content, do so by rendering a template within the `build`
method:

```typescript
async build() {
  // The response of this route is dynamic.
  // `route` and `pod` are passed to the Nunjucks context.
  const template = '/views/preview.njk';
  const nunjucks = this.pod.engines.getEngineByFilename(
    previewTemplate
  ) as NunjucksTemplateEngine;
  return nunjucks.render(previewTemplate, {
    pod: this.pod,
    route: this,
  });
}
```
