import {Document} from './document';
import {Locale} from './locale';
import {Pod} from './pod';

import { NodeType, RouteParams, RouteTrie } from './trie';
import { createRoute, DocumentRoute, Route, RouteOptions, StaticRoute } from './routes';


export interface StaticDirConfig {
  path: string;
  staticDir: string;
}

export type DynamicRouteOptions = Omit<RouteOptions, 'urlPath'>;
export type StaticRouteOptions = DynamicRouteOptions;


export class Router {
  pod: Pod;
  trie: RouteTrie;
  map: Map<string, Route>;
  private warm = false;

  constructor(pod: Pod) {
    this.pod = pod;
    this.trie = new RouteTrie();
    this.map = new Map();
  }

  async resolve(path: string): Promise<[Route, RouteParams] | null> {
    await this.warmup();
    return this.trie.get(path);
  }

  async initRoutes() {
    addCollectionRoutes(this);
    addStaticDirectoryRoutes(this, {
      path: this.pod.basePath
        ? `${cleanBasePath(this.pod.basePath)}/static/`
        : '/static/',
      staticDir: '/src/static/',
    });
  }

  async warmup() {
    if (this.warm) {
      return;
    }
    this.initRoutes();
    this.warm = true;
  }

  reset() {
    this.trie = new RouteTrie();
    this.map = new Map();
    this.warm = false;
  }

  async routes() {
    // if (this.pod.cache.routes.length) {
    //   return this.pod.cache.routes;
    // }
    const routes = [];
    this.trie.walk((path: string, route: Route, type: NodeType) => {
      routes.push(route);
    });
    return routes;
  }

  /**
   * Used for setting static directory routes configuration.
   * @param routeConfigs The configurations for the route definition.
   */
  addStaticDirectoryRoutes(routeConfigs: Array<StaticDirConfig>) {
    for (const routeConfig of routeConfigs) {
      addStaticDirectoryRoutes(this, routeConfig);
    }
  }

  getUrl(id: string) {
    return this.map.get(id)?.url;
  }

  async addRoute(path: string, route: Route) {
    this.trie.add(path, route);
    if (route.id) {
      this.map.set(route.id, route);
    }
  }

  async add(path: string, options: RouteOptions) {
    const route = createRoute(this, options);
    this.addRoute(path, route);
  }

  async getStaticPaths(routes?: Route[]) {
    routes = routes ?? await this.routes();
    let paths = [];
    for (const route of routes) {
      if (route.getStaticPaths) {
        paths = paths.concat(await route.getStaticPaths());
      } else {
        paths.push(route.urlPath);
      }
    }
    return paths;
  }
}

function addCollectionRoutes(router: Router) {
  const pod = router.pod;
  const routes: Array<Route> = [];
  const addRoute = (podPath: string, locale?: Locale) => {
    const route = new DocumentRoute(router, podPath, locale);
    // Only build docs with path formats.
    if (!route.doc.pathFormat) {
      return;
    }
    router.addRoute(route.url.path, route);
    routes.push(route);
  };
  const docs = pod.docs();
  docs.forEach((doc: Document) => {
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

function addStaticDirectoryRoutes(router: Router, config: StaticDirConfig) {
  const pod = router.pod;
  const routes: Array<Route> = [];
  if (pod.fileExists(config.staticDir)) {
    const servingBasePath = cleanBasePath(config.path);
    const podPaths = pod.walk(config.staticDir);
    podPaths.forEach(podPath => {
      const subPath = podPath.slice(config.staticDir.length);
      const servingPath = `${servingBasePath}/${subPath}`;
      const route = new StaticRoute(router, podPath, servingPath);
      router.addRoute(route.url.path, route);
    });
  }
  return routes;
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
