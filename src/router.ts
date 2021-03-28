import * as fsPath from 'path';
import * as utils from './utils';

import {Document} from './document';
import {Locale} from './locale';
import {Pod} from './pod';
import {StaticFile} from './static';
import {Url} from './url';

export interface StaticDirConfig {
  path: string;
  staticDir: string;
}

export class Router {
  pod: Pod;
  providers: Record<string, RouteProvider[]>;

  constructor(pod: Pod) {
    this.pod = pod;
    this.providers = {};
    [
      new DocumentRouteProvider(this),
      new CollectionRouteProvider(this),
      // Default static routes. This can be overridden by the presence of any
      // static routes configured in `amagaki.js`.
      new StaticDirectoryRouteProivder(this, {
        path: '/static/',
        staticDir: '/src/static/',
      }),
    ].forEach(provider => {
      this.addProvider(provider);
    });
  }

  createTree() {}

  resolve(path: string): Route | null {
    // TODO: Implement route trie.
    for (let i = 0; i < this.routes.length; i++) {
      const route = this.routes[i];
      if (route.url.path === path) {
        return route;
      }
    }
    return null;
  }

  warmup() {
    const now = new Date().getTime() / 1000;
    // Warm up by referencing (building) the routes.
    this.routes.length;
    return new Date().getTime() / 1000 - now;
  }

  get routes() {
    if (this.pod.cache.routes.length) {
      return this.pod.cache.routes;
    }
    Object.values(this.providers).forEach(providers => {
      providers.forEach(provider => {
        provider.routes.forEach(route => {
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
        });
      });
    });
    return this.pod.cache.routes;
  }

  addProvider(provider: RouteProvider) {
    if (this.providers[provider.type]) {
      this.providers[provider.type].push(provider);
    } else {
      this.providers[provider.type] = [provider];
    }
  }

  /**
   * Used for setting static directory routes configuration.
   * @param routeConfigs The configurations for the route definition.
   */
  addStaticDirectoryRoutes(routeConfigs: Array<StaticDirConfig>) {
    for (const routeConfig of routeConfigs) {
      this.addProvider(new StaticDirectoryRouteProivder(this, routeConfig));
    }
  }

  getUrl(type: string, item: Document | StaticFile) {
    const providers = this.providers[type];
    if (!providers) {
      throw Error(`RouteProvider not found for ${type}`);
    }
    let result = undefined;
    providers.forEach(provider => {
      const foundItem = provider.urlMap.get(item);
      if (foundItem) {
        result = foundItem;
      }
    });
    return result;
  }
}

export class RouteProvider {
  pod: Pod;
  router: Router;
  urlMap: Map<Document | StaticFile, Url>;
  type: string;

  constructor(router: Router) {
    this.router = router;
    this.pod = router.pod;
    this.urlMap = new Map();
    this.type = 'default';
  }

  get routes(): Array<Route> {
    return [];
  }
}

export class DocumentRouteProvider extends RouteProvider {
  constructor(router: Router) {
    super(router);
    this.type = 'doc';
  }

  get routes(): Array<Route> {
    return [];
  }
}

export class CollectionRouteProvider extends RouteProvider {
  constructor(router: Router) {
    super(router);
    this.type = 'collection';
  }

  get routes(): Array<Route> {
    const docProvider = this.router.providers[
      'doc'
    ][0] as DocumentRouteProvider;
    // NOTE: See if we want to do assemble routes by walking all /content/
    // files. In Grow.dev, this was too slow. In Amagaki, we could alternatively
    // require users to specify routes in amagaki.js.
    const routes: Array<Route> = [];

    function addRoute(podPath: string, locale?: Locale) {
      const route = new DocumentRoute(docProvider, podPath, locale);
      // Only build docs with path formats.
      if (!route.doc.pathFormat) {
        return;
      }
      routes.push(route);
      docProvider.urlMap.set(route.doc, route.url);
      return route;
    }

    const docs = this.pod.docs();
    docs.forEach(doc => {
      // Add base and localized docs.
      const baseRoute = addRoute(doc.path);
      baseRoute &&
        baseRoute.doc.locales.forEach((locale: Locale) => {
          if (locale !== baseRoute.doc.defaultLocale) {
            addRoute(doc.path, locale);
          }
        });
    });

    return routes;
  }
}

export class StaticDirectoryRouteProivder extends RouteProvider {
  config: StaticDirConfig;

  constructor(router: Router, config: StaticDirConfig) {
    super(router);
    this.type = 'static_dir';
    this.config = config;
  }

  get routes(): Array<Route> {
    const podPaths = this.pod.walk(this.config.staticDir);
    const routes: Array<Route> = [];
    const cleanPath = cleanBasePath(this.config.path);
    podPaths.forEach(podPath => {
      const subPath = podPath.slice(this.config.staticDir.length);
      const route = new StaticRoute(this, podPath, `${cleanPath}/${subPath}`);
      routes.push(route);
      this.urlMap.set(route.staticFile, route.url);
    });
    return routes;
  }
}

export class Route {
  provider: RouteProvider;
  pod: Pod;

  constructor(provider: RouteProvider) {
    this.provider = provider;
    this.pod = this.provider.pod;
  }

  async build(): Promise<string> {
    throw new Error('Subclasses of Route must implement a `build` getter.');
  }

  get path(): string {
    throw new Error('Subclasses of Route must implement a `path` getter.');
  }

  get contentType(): string {
    throw new Error(
      'Subclasses of Route must implement a `contentType` getter.'
    );
  }

  get urlPath(): string {
    throw new Error('Subclasses of Route must implement a `urlPath` getter.');
  }

  get url(): Url {
    return new Url({
      path: this.urlPath,
      host: this.pod.env.host,
      port: this.pod.env.port,
      scheme: this.pod.env.scheme,
    });
  }
}

export class DocumentRoute extends Route {
  podPath: string;
  locale: Locale;

  constructor(provider: RouteProvider, podPath: string, locale?: Locale) {
    super(provider);
    this.podPath = podPath;
    this.locale = locale || this.pod.defaultLocale;
  }

  toString() {
    return `[DocumentRoute: ${this.doc}]`;
  }

  async build(): Promise<string> {
    try {
      return await this.doc.render({
        route: this,
      });
    } catch (err) {
      console.error(`Error buildng: ${this.doc}`);
      throw err;
    }
  }

  get doc() {
    return this.pod.doc(this.podPath, this.locale);
  }

  get path() {
    return this.podPath;
  }

  get contentType() {
    return 'text/html';
  }

  get urlPath() {
    let urlPath = this.pod.cache.urlPaths.get(this.doc);
    if (urlPath) {
      return urlPath;
    }
    urlPath = utils.interpolate(this.pod, this.doc.pathFormat, {
      doc: this.doc,
    }) as string;

    // Clean up multiple slashes in url paths.
    // Path format params can be blank or return with starting or ending slashes.
    urlPath = urlPath.replace(/\/{2,}/g, '/');

    this.pod.cache.urlPaths.set(this.doc, urlPath);
    return urlPath;
  }
}

export class StaticRoute extends Route {
  podPath: string;
  servingPath: string;

  constructor(provider: RouteProvider, podPath: string, servingPath?: string) {
    super(provider);
    this.podPath = podPath;
    this.servingPath = servingPath || podPath;
  }

  toString() {
    return `[StaticRoute: ${this.staticFile}]`;
  }

  get staticFile() {
    return this.pod.staticFile(this.podPath);
  }

  get urlPath() {
    return this.servingPath;
  }
}

function cleanBasePath(path: string): string {
  path = path.trim();

  if (!path.startsWith('/')) {
    path = `/${path}`;
  }

  while (path.endsWith('/')) {
    path = path.slice(0, -1);
  }

  return path;
}
