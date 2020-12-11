import {Pod} from './pod';

export class Router {
  pod: Pod;

  constructor(pod: Pod) {
    this.pod = pod;
  }

  createTree() {}

  resolve(path: string): [Route | undefined, Record<string, string>] {
    const route = new Route(this.pod);
    const params = {};
    return [route, params];
  }
}

export class Route {
  pod: Pod;

  constructor(pod: Pod) {
    this.pod = pod;
  }

  async build() {
    const doc = this.pod.doc('/content/pages/index.yaml');
    return await doc.render();
  }

  getContentType() {
    return 'text/html';
  }
}

export class RouteProvider {
  gerRoutes() {}
}

export class DocumentRouteProvider {}

export class CollectionRouteProvider {}

export class StaticFileRouteProivder {}

export class StaticDirectoryRouteProivder {}

export class RedirectRouteProvider {}
