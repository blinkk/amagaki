import * as fsPath from 'path';
import * as utils from './utils';
import * as mimetypes from 'mime-types';
import {Document} from './document';
import {Locale} from './locale';
import {Pod} from './pod';
import {StaticFile} from './static';
import {Url} from './url';

export class Router {
  pod: Pod;
  providers: Record<string, RouteProvider>;

  constructor(pod: Pod) {
    this.pod = pod;
    this.providers = {};
    [
      new DocumentRouteProvider(this),
      new CollectionRouteProvider(this),
      new StaticFileRouteProivder(this),
      new StaticDirectoryRouteProivder(this),
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
    Object.values(this.providers).forEach(provider => {
      provider.routes.forEach(route => {
        const routeUrl = route.url.path;
        if (routeUrl in this.pod.cache.routeMap) {
          throw Error(
            `'Two routes share the same URL path: ${this.pod.cache.routeMap[routeUrl]} and ${route}'. This probably means you have set the value for "$path" to the same thing for two different documents, or two locales of the same document. Ensure every route has a unique URL path by changing one of the "$path" values.`
          );
        }
        this.pod.cache.routes.push(route);
        this.pod.cache.routeMap[route.url.path] = route;
      });
    });
    return this.pod.cache.routes;
  }

  addProvider(provider: RouteProvider) {
    this.providers[provider.type] = provider;
  }

  getUrl(type: string, item: Document | StaticFile) {
    const provider = this.providers[type];
    if (!provider) {
      throw Error(`RouteProvider not found for ${type}`);
    }
    return provider.urlMap.get(item);
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
  static DefaultContentFolder = '/content/';

  constructor(router: Router) {
    super(router);
    this.type = 'collection';
  }

  get routes(): Array<Route> {
    const docProvider = this.router.providers['doc'] as DocumentRouteProvider;
    // TODO: See if we want to do assemble routes by walking all /content/
    // files. In Grow.dev, this was too slow. In Amagaki, we could alternatively
    // require users to specify routes in amagak.yaml?routes.
    const podPaths = this.pod.walk(
      CollectionRouteProvider.DefaultContentFolder
    );
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

    podPaths.forEach(podPath => {
      if (!Document.isServable(podPath)) {
        return;
      }

      // Add base and localized docs.
      const baseRoute = addRoute(podPath);
      baseRoute &&
        baseRoute.doc.locales.forEach((locale: Locale) => {
          if (locale !== baseRoute.doc.defaultLocale) {
            addRoute(podPath, locale);
          }
        });
    });

    return routes;
  }
}

export class StaticFileRouteProivder extends RouteProvider {
  static DefaultStaticFolder = '/source/static/';

  constructor(router: Router) {
    super(router);
    this.type = 'static_file';
  }

  get routes(): Array<Route> {
    const podPaths = this.pod.walk(StaticFileRouteProivder.DefaultStaticFolder);
    const routes: Array<Route> = [];
    podPaths.forEach(podPath => {
      const route = new StaticRoute(this, podPath);
      routes.push(route);
      this.urlMap.set(route.staticFile, route.url);
    });
    return routes;
  }
}

export class StaticDirectoryRouteProivder extends RouteProvider {
  constructor(router: Router) {
    super(router);
    this.type = 'static_dir';
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
    throw new Error();
  }

  get path(): string {
    throw new Error();
  }

  get contentType(): string {
    throw new Error();
  }

  get urlPath(): string {
    throw new Error();
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
      return await this.doc.render();
    } catch (err) {
      console.log(`Error buildng: ${this.doc}`);
      throw err;
    }
  }

  get doc() {
    return this.pod.doc(this.podPath, this.locale);
  }

  get path() {
    return this.podPath;
  }

  /**
   * Returns the content type header for the route, based on the route's URL
   * path. Routes that terminate in `/` or have no extension are assumed to be
   * HTML. All other routes are automatically determined using the `mime-types`
   * module.
   */
  get contentType() {
    if (this.urlPath.endsWith('/') || !fsPath.extname(this.urlPath)) {
      return 'text/html';
    }
    return (
      mimetypes.contentType(fsPath.basename(this.urlPath)) ||
      'application/octet-stream'
    );
  }

  get urlPath() {
    let urlPath = this.pod.cache.urlPaths.get(this.doc);
    if (urlPath) {
      return urlPath;
    }
    urlPath = utils.interpolate(this.pod, this.doc.pathFormat, {
      doc: this.doc,
    }) as string;
    this.pod.cache.urlPaths.set(this.doc, urlPath);
    return urlPath;
  }
}

export class StaticRoute extends Route {
  podPath: string;

  constructor(provider: RouteProvider, podPath: string) {
    super(provider);
    this.podPath = podPath;
  }

  toString() {
    return `[StaticRoute: ${this.staticFile}]`;
  }

  get staticFile() {
    return this.pod.staticFile(this.podPath);
  }

  get urlPath() {
    // TODO: Replace with serving path defined in amagaki.yaml.
    return `/static${this.podPath}`;
  }
}
