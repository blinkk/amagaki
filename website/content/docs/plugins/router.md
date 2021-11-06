---
title: Router
order: 5
---
# Router plugins

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

```typescript
interface RobotsTxtRouteProviderOptions {
}

export class RobotsTxtRouteProvider extends RouteProvider {
  options: RobotsTxtRouteProviderOptions;

  constructor(router: Router, options: RobotsTxtRouteProviderOptions) {
    super(router);
    this.type = 'robots';
    this.options = options;
  }

  static register(pod: Pod, options?: RobotsTxtRouteProviderOptions) {
    const provider = new RobotsTxtRouteProvider(pod.router, options);
    pod.router.addProvider(provider);
    return provider;
  }

  async routes() {
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
    return 'User-agent: *\nAllow: /\nSitemap: https://example.com/sitemap.xml';
  }
}
```

And then use it in `amagaki.ts`:

```typescript
export default (pod: Pod) => {
  RobotsTxtRouteProvider.register(pod);
}
```