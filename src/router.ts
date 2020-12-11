import {Document} from './document';
import {Pod} from './pod';
import {Url} from './url';
import {interpolate} from './utils';

export class Router {
  pod: Pod;
  providers: Map<string, RouteProvider>;

  constructor(pod: Pod) {
    this.pod = pod;
    this.providers = new Map();

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

  resolve(path: string): [Route | undefined, Record<string, string>] {
    // TODO: Implement route trie.
    const route = new DocumentRoute(
      this.providers.get('doc') as RouteProvider,
      '/content/pages/index.yaml'
    );
    const params = {};
    return [route, params];
  }

  get routes() {
    const routes: Array<Route> = [];
    this.providers.forEach(provider => {
      provider.routes.forEach(route => {
        routes.push(route);
      });
    });
    return routes;
  }

  addProvider(provider: RouteProvider) {
    this.providers.set(provider.type, provider);
  }

  getUrl(type: string, item: Document) {
    const provider = this.providers.get(type);
    if (!provider) {
      throw Error(`RouteProvider not found for ${type}`);
    }
    return provider.urlMap.get(item);
  }
}

export class RouteProvider {
  pod: Pod;
  router: Router;
  urlMap: Map<Document, Url>;
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
    const route1 = new DocumentRoute(this, '/content/pages/index.yaml');
    const route2 = new DocumentRoute(this, '/content/pages/copy.yaml');
    this.urlMap.set(route1.doc, route1.url);
    this.urlMap.set(route2.doc, route1.url);
    return [route1, route2];
  }

  getUrlFor(doc: Document) {
    return this.urlMap.get(doc);
  }
}

export class CollectionRouteProvider extends RouteProvider {
  constructor(router: Router) {
    super(router);
    this.type = 'collection';
  }

  get routes(): Array<Route> {
    const docProvider = this.router.providers.get(
      'doc'
    ) as DocumentRouteProvider;
    const route1 = new DocumentRoute(docProvider, '/content/pages/index.yaml');
    const route2 = new DocumentRoute(docProvider, '/content/pages/copy.yaml');
    docProvider.urlMap.set(route1.doc, route1.url);
    docProvider.urlMap.set(route2.doc, route1.url);
    return [route1, route2];
  }

  getUrlFor(doc: Document) {
    return this.urlMap.get(doc);
  }
}

export class StaticFileRouteProivder extends RouteProvider {
  constructor(router: Router) {
    super(router);
    this.type = 'static_file';
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

  constructor(provider: RouteProvider) {
    this.provider = provider;
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

  get url(): Url {
    throw new Error();
  }
}

export class DocumentRoute extends Route {
  pod: Pod;
  podPath: string;

  constructor(provider: RouteProvider, podPath: string) {
    super(provider);
    this.pod = provider.pod;
    this.podPath = podPath;
  }

  async build(): Promise<string> {
    return await this.doc.render();
  }

  get doc() {
    return this.pod.doc(this.podPath);
  }

  get path() {
    return this.podPath;
  }

  get contentType() {
    return 'text/html';
  }

  get url() {
    const path = interpolate(this.doc.pathFormat, {doc: this.doc});
    return new Url({
      path: path,
      host: this.pod.env.host,
      port: this.pod.env.port,
      scheme: this.pod.env.scheme,
    });
  }
}
