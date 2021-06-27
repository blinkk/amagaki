import {FileRouteConfig, StaticFileRouteProvider} from './providers/staticFile';
import {Route, RouteProvider} from './providers/provider';

import {Document} from './document';
import {DocumentRouteProvider} from './providers/document';
import {Pod} from './pod';
import {RouteTrie} from './trie';
import {StaticFile} from './staticFile';
import {Url} from './url';

export interface WarmupResults {
  duration: number;
}

export class Router {
  pod: Pod;
  providers: RouteProvider[];
  trie: RouteTrie;

  constructor(pod: Pod) {
    this.pod = pod;
    this.providers = [];
    this.trie = new RouteTrie();
    // Add built-in route providers.
    [
      new DocumentRouteProvider(this),
      // Default static routes. This can be overridden by the presence of any
      // static routes configured in `amagaki.ts`.
      new StaticFileRouteProvider(this, {
        path: this.pod.basePath
          ? `${StaticFileRouteProvider.cleanBasePath(
              this.pod.basePath
            )}/static/`
          : '/static/',
        staticDir: '/src/static/',
      }),
    ].forEach(provider => {
      this.addProvider(provider);
    });
  }

  /**
   * Warms up the router. Static routes are given an opportunity to determine
   * all routes, and dynamic routes are added to the trie.
   * @returns
   */
  async warmup() {
    const now = new Date().getTime();
    // Warm up by referencing (building) the routes.
    await this.routes();
    await Promise.all([
      ...Object.values(this.providers).map(provider =>
        Object.values(provider).map(provider => provider.init)
      ),
    ]);
    const results: WarmupResults = {
      duration: new Date().getTime() / 1000 - now / 1000,
    };
    return results;
  }

  async getRoute(path: string): Promise<Route | undefined> {
    const [provider, params] = this.trie.get(path);
    if (provider) {
      return provider.getRoute(params);
    }
    return undefined;
  }

  async routes() {
    if (this.pod.cache.routes.length) {
      return this.pod.cache.routes;
    }
    for (const provider of this.providers) {
      const routes = await provider.routes();
      for (const route of routes) {
        if (!route.url) {
          continue;
        }
        const routeUrl = route.url.path;
        if (routeUrl in this.pod.cache.routeMap) {
          // Reset the cache so subsequent requests continue to error until
          // the problem is resolved.
          const foundRoute = this.pod.cache.routeMap[routeUrl];
          this.pod.cache.reset();
          throw Error(
            `Two routes share the same URL path (${route.url.path}): ${foundRoute} and ${route}. This probably means you have set the value for "$path" to the same thing for two different documents, or two locales of the same document. Ensure every route has a unique URL path by changing one of the "$path" values.`
          );
        }
        this.pod.cache.routes.push(route);
        this.pod.cache.routeMap[route.url.path] = route;
      }
    }
    return this.pod.cache.routes;
  }

  addProvider(provider: RouteProvider) {
    this.providers.push(provider);
  }

  getUrl(type: string, item: Document | StaticFile): Url | undefined {
    for (const provider of this.providers) {
      const foundItem = provider.urls.get(item);
      if (foundItem) {
        return foundItem;
      }
    }
    return undefined;
  }

  /**
   * Used for setting static directory routes configuration.
   * @param routeConfigs The configurations for the route definition.
   */
  addStaticDirectoryRoutes(routeConfigs: Array<FileRouteConfig>) {
    for (const routeConfig of routeConfigs) {
      this.addProvider(new StaticFileRouteProvider(this, routeConfig));
    }
  }
}
