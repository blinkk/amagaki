import * as fsPath from 'path';

import {Route, RouteProvider} from './provider';

import {Router} from '../router';

export interface FileRouteConfig {
  path: string;
  staticDir: string;
}

export class StaticFileRouteProvider extends RouteProvider {
  config: FileRouteConfig;
  private _cleanBasePath: string;
  type = 'staticFile';

  constructor(router: Router, config: FileRouteConfig) {
    super(router);
    this.config = config;
    this._cleanBasePath = StaticFileRouteProvider.cleanBasePath(
      this.config.path
    );
  }

  async init() {
    if (this.initialized) {
      return;
    }
    this.router.trie.add(`${this._cleanBasePath}/*subPath`, this);
    console.log('added 2');
    this.initialized = true;
  }

  async routes(): Promise<Route[]> {
    const routes: Promise<Route>[] = [];
    if (this.pod.fileExists(this.config.staticDir)) {
      const podPaths = this.pod.walk(this.config.staticDir);
      for (const podPath of podPaths) {
        const subPath = podPath.slice(this.config.staticDir.length);
        routes.push(this.getRoute({subPath: subPath}) as Promise<Route>);
      }
    }
    return await Promise.all(routes);
  }

  async getRoute(params: any): Promise<Route | undefined> {
    const podPath = fsPath.join(this.config.staticDir, params.subPath);
    return new FileRoute(
      this,
      podPath,
      `${this._cleanBasePath}/${params.subPath}}`
    );
  }

  static cleanBasePath(path: string): string {
    path = path.trim();
    if (!path.startsWith('/')) {
      path = `/${path}`;
    }
    while (path.endsWith('/')) {
      path = path.slice(0, -1);
    }
    return path;
  }
}

export class FileRoute extends Route {
  urlPath: string;

  constructor(provider: RouteProvider, podPath: string, urlPath: string) {
    super(provider);
    this.podPath = podPath;
    this.urlPath = urlPath;
    if (this.url) {
      provider.urls.set(this, this.url);
    }
  }

  toString() {
    return `[FileRoute: ${this.staticFile}]`;
  }

  get staticFile() {
    return this.pod.staticFile(this.podPath as string);
  }
}
