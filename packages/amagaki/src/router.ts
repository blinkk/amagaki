import * as fsPath from 'path';
import * as mimetypes from 'mime-types';
import * as utils from './utils';

import {Document} from './document';
import {Locale} from './locale';
import {Pod} from './pod';
import {StaticFile} from './staticFile';
import {Url} from './url';

import express = require('express');

export interface BuildRouteOptions {
  req?: express.Request;
}

export interface StaticDirConfig {
  path: string;
  staticDir: string;
}

export interface RouteOptions {
  /** Function to return the content of the route. */
  build: (options?: BuildRouteOptions) => Promise<string>;
  /** Content type for the route. If not specified, it will be inferred from the URL path. */
  contentType?: string;
  /** URL path used when looking up the route. */
  urlPath: string;
  /** Fields to store on the route. */
  fields?: Record<string, any>;
}


export type RouteBuilder = (provider: RouteProvider) => Promise<void>;

export class Router {
  pod: Pod;
  providers: Record<string, RouteProvider[]>;

  constructor(pod: Pod) {
    this.pod = pod;
    this.providers = {};
    [
      new RouteProvider(this),
      new DocumentRouteProvider(this),
      new CollectionRouteProvider(this),
      // Default static routes. This can be overridden by the presence of any
      // static routes configured in `amagaki.ts`.
      new StaticDirectoryRouteProvider(this, {
        path: this.pod.basePath
          ? `${cleanBasePath(this.pod.basePath)}/static/`
          : '/static/',
        staticDir: '/src/static/',
      }),
    ].forEach(provider => {
      this.addProvider(provider);
    });
  }

  async resolve(path: string): Promise<Route | null> {
    // NOTE: Instead of using a route trie with placeholders, and resolving
    // request paths against that tree, we currently generate all concrete
    // routes, and match request paths to the concrete URLs. If this does not
    // prove to be a robust solution, this approach can be replaced with a route
    // trie and matching abstract routes.
    const routes = await this.routes();
    for (const route of routes) {
      if (route.url.path === path) {
        return route;
      }
    }
    return null;
  }

  async warmup() {
    const now = new Date().getTime() / 1000;
    // Warm up by referencing (building) the routes.
    await this.routes();
    return new Date().getTime() / 1000 - now;
  }

  reset() {
    Object.values(this.providers).map(providers =>
      providers.map(provider => provider.reset && provider.reset())
    );
  }

  async routes() {
    if (this.pod.cache.routes.length) {
      return this.pod.cache.routes;
    }
    for (const providers of Object.values(this.providers)) {
      for (const provider of providers) {
        const routes = await provider.routes();
        for (const route of routes) {
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
    }
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
      this.addProvider(new StaticDirectoryRouteProvider(this, routeConfig));
    }
  }

  getUrl(type: string, item: Document | StaticFile) {
    const providers = this.providers[type];
    if (!providers) {
      throw Error(`RouteProvider not found for ${type}`);
    }
    for (const provider of providers) {
      const foundItem = provider.urlMap.get(item.toString());
      if (foundItem) {
        return foundItem;
      }
    }
    return undefined;
  }

  /** Shortcut method for adding a route without subclassing `Route` and `RouteProvider`. */
  async addRoutes(type: string, builder: RouteBuilder) {
    let provider = this.providers[type]?.[0];
    if (!provider) {
      provider = new RouteProvider(this);
      provider.type = type;
      this.addProvider(provider);
    }
    provider.addRouteBuilder(builder);
  }
}

export class RouteProvider {
  pod: Pod;
  router: Router;
  urlMap: Map<string, Url>;
  type: string;
  protected _routeBuilders: RouteBuilder[];
  protected _routes: Route[];

  constructor(router: Router) {
    this.router = router;
    this.pod = router.pod;
    this.urlMap = new Map();
    this.type = 'default';
    this._routeBuilders = [];
    this._routes = [];
  }

  reset() {
    this.urlMap = new Map();
    this._routes = [];
  }

  async routes(): Promise<Route[]> {
    if (this._routes.length) {
      return this._routes;
    }
    // Build all routes, then clear the route builders so they are not built again.
    await Promise.all(this._routeBuilders.map(async (builder) => await builder(this)));
    return this._routes;
  }

  addRouteBuilder(builder: RouteBuilder) {
    this._routeBuilders.push(builder);
  }

  addRoute(options: RouteOptions) {
    const route = new Route(this, options);
    this.urlMap.set(route.url.path, route.url);
    this._routes.push(route);
    return route;
  }
}

export class DocumentRouteProvider extends RouteProvider {
  constructor(router: Router) {
    super(router);
    this.type = 'doc';
  }
}

export class CollectionRouteProvider extends RouteProvider {
  constructor(router: Router) {
    super(router);
    this.type = 'collection';
  }

  async routes(): Promise<Route[]> {
    const docProvider = this.router.providers[
      'doc'
    ][0] as DocumentRouteProvider;
    // NOTE: See if we want to do assemble routes by walking all /content/
    // files. In Grow.dev, this was too slow. In Amagaki, we could alternatively
    // require users to specify routes in amagaki.ts.
    const routes: Array<Route> = [];

    const addRoute = (podPath: string, locale?: Locale) => {
      const route = new DocumentRoute(this, podPath, locale);
      // Only build docs with path formats.
      if (!route.doc.pathFormat) {
        return;
      }
      routes.push(route);
      docProvider.urlMap.set(route.doc.toString(), route.url);
    };

    const docs = this.pod.docs();
    docs.forEach(doc => {
      if (!Document.isServable(doc.podPath)) {
        return;
      }

      // Add base doc.
      addRoute(doc.podPath);

      // Add localized docs.
      doc.locales.forEach((locale: Locale) => {
        if (locale !== doc.defaultLocale) {
          addRoute(doc.podPath, locale);
        }
      });
    });

    return routes;
  }
}

export class StaticDirectoryRouteProvider extends RouteProvider {
  config: StaticDirConfig;

  constructor(router: Router, config: StaticDirConfig) {
    super(router);
    this.type = 'staticDir';
    this.config = config;
  }

  async routes(): Promise<Route[]> {
    const routes: Array<Route> = [];
    if (this.pod.fileExists(this.config.staticDir)) {
      const cleanPath = cleanBasePath(this.config.path);
      const podPaths = this.pod.walk(this.config.staticDir);
      podPaths.forEach(podPath => {
        const subPath = podPath.slice(this.config.staticDir.length);
        const route = new StaticRoute(this, podPath, `${cleanPath}/${subPath}`);
        routes.push(route);
        this.urlMap.set(route.staticFile.toString(), route.url);
      });
    }
    return routes;
  }
}

export class Route {
  provider: RouteProvider;
  pod: Pod;
  fields: Record<string, any>;
  protected _urlPath?: string;
  protected _contentType?: string;
  protected _build: (options?: BuildRouteOptions) => Promise<string>;

  constructor(provider: RouteProvider, options?: RouteOptions) {
    this.provider = provider;
    this.pod = this.provider.pod;
    this._urlPath = options?.urlPath;
    this._contentType = options?.contentType;
    this._build = options?.build;
    this.fields = options?.fields ?? {};
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async build(options?: BuildRouteOptions): Promise<string> {
    if (this._build) {
      return await this._build(options);
    }
    throw new Error('Subclasses of Route must implement `build`.');
  }

  /**
   * Most routes will be generated from files within the pod. Some routes (e.g.
   * routes created dynamically such as from a database query or from explicit
   * parameters) may not be generated from files within the pod, and therefore
   * would be undefined – they would not have a corresponding `podPath`.
   */
  get podPath(): string | undefined {
    return undefined;
  }

  get urlPath(): string {
    if (this._urlPath) {
      return this._urlPath;
    }
    throw new Error('Subclasses of Route must implement a `urlPath` getter.');
  }

  get url(): Url {
    return new Url({
      path: this.urlPath,
      env: this.pod.env,
    });
  }

  /**
   * Returns the content type header for the route, based on the route's URL
   * path. Routes that terminate in `/` or have no extension are assumed to be
   * HTML. All other routes are automatically determined using the `mime-types`
   * module.
   */
  get contentType() {
    if (this._contentType) {
      return this._contentType;
    }
    if (this.urlPath.endsWith('/') || !fsPath.extname(this.urlPath)) {
      return 'text/html';
    }
    return (
      mimetypes.contentType(fsPath.basename(this.urlPath)) ||
      'application/octet-stream'
    );
  }
}

export class DocumentRoute extends Route {
  private _podPath: string;
  locale: Locale;

  constructor(provider: RouteProvider, podPath: string, locale?: Locale) {
    super(provider);
    this._podPath = podPath;
    this.locale = locale || this.pod.defaultLocale;
  }

  toString() {
    return `[DocumentRoute: ${this.doc}]`;
  }

  async build(options?: BuildRouteOptions): Promise<string> {
    try {
      return await this.doc.render({
        req: options?.req,
        route: this,
      });
    } catch (err) {
      console.error(`Error buildng: ${this.doc}`);
      throw err;
    }
  }

  get podPath() {
    return this._podPath;
  }

  get doc() {
    return this.pod.doc(this.podPath, this.locale);
  }

  get urlPath() {
    let urlPath = this.pod.cache.urlPaths.get(this.doc);
    if (urlPath) {
      return urlPath;
    }

    // Update the interpolation context with any plugins.
    const context = {
      doc: this.doc,
      pod: this.pod,
    };
    this.pod.plugins.triggerSync('updatePathFormatContext', context);

    urlPath = utils.interpolate(
      this.pod,
      this.doc.pathFormat,
      context
    ) as string;

    // Clean up repeated slashes.
    // Path format params can be blank or return with starting or ending slashes.
    urlPath = urlPath.replace(/\/{2,}/g, '/');

    // Collapse `.../index/$` to `.../` for clean URLs.
    // NOTE: This can be made configurable via a flag if needed, however this is
    // a very sane default.
    urlPath = urlPath.replace(/index\/?$/, '');

    this.pod.cache.urlPaths.set(this.doc, urlPath);
    return urlPath;
  }
}

export class StaticRoute extends Route {
  private _podPath: string;
  servingPath: string;

  constructor(provider: RouteProvider, podPath: string, servingPath?: string) {
    super(provider);
    this._podPath = podPath;
    this.servingPath = servingPath || podPath;
  }

  toString() {
    return `[StaticRoute: ${this.staticFile}]`;
  }

  get podPath() {
    return this._podPath;
  }

  get staticFile() {
    return this.pod.staticFile(this.podPath);
  }

  get urlPath() {
    return this.servingPath;
  }

  /**
   * Returns the content type header for the route, based on the file's pod path.
   */
  get contentType() {
    return (
      mimetypes.contentType(fsPath.basename(this.podPath)) ||
      'application/octet-stream'
    );
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
