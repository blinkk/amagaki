import * as fs from 'fs';
import * as fsPath from 'path';

import {
  Pod,
  Route,
  RouteProvider,
  Router,
} from '@amagaki/amagaki';

export class PageBuilderStaticRouteProvider extends RouteProvider {
  static files = ['page-builder-ui.min.js'];
  static urlBase = '/_page-builder';

  constructor(router: Router) {
    super(router);
    this.type = 'pageBuilderStatic';
  }

  async routes(): Promise<Route[]> {
    return PageBuilderStaticRouteProvider.files.map(filePath => {
      const absolutePath = fsPath.join(__dirname, 'ui', filePath);
      return new PageBuilderStaticRoute(this, absolutePath);
    });
  }

  static register(pod: Pod) {
    const provider = new PageBuilderStaticRouteProvider(pod.router);
    pod.router.addProvider(provider);
    return provider;
  }
}

class PageBuilderStaticRoute extends Route {
  path: string;
  basename: any;

  constructor(provider: RouteProvider, path: string) {
    super(provider);
    this.provider = provider;
    this.basename = fsPath.basename(path);
    this.path = path;
  }

  get urlPath() {
    return `${PageBuilderStaticRouteProvider.urlBase}/${this.basename}`;
  }

  async build() {
    return fs.readFileSync(this.path, 'utf8');
  }
}
