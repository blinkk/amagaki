import {BuildOptions, Route, RouteProvider} from './provider';

import {Document} from '../document';
import {interpolate} from '../utils';

export class DocumentRouteProvider extends RouteProvider {
  static type = 'document';

  async init() {
    const routes = await this.routes();
    for (const route of routes) {
      if (route.url) {
        this.router.trie.add(route.url.path, this);
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getRoute(params: any): Promise<Route | undefined> {
    return undefined;
  }

  async routes(): Promise<Route[]> {
    // NOTE: See if we want to do assemble routes by walking all /content/
    // files. In Grow.dev, this was too slow. In Amagaki, we could alternatively
    // require users to specify routes in amagaki.ts.
    const routes: Array<Route> = [];
    for (const doc of this.pod.docs()) {
      if (!Document.isServable(doc.podPath) || !doc.pathFormat) {
        continue;
      }
      routes.push(new DocumentRoute(this, doc));
      for (const locale of doc.locales) {
        if (locale !== doc.defaultLocale) {
          const localizedDoc = this.pod.doc(doc.podPath, locale);
          if (localizedDoc.pathFormat) {
            routes.push(new DocumentRoute(this, localizedDoc));
          }
        }
      }
    }
    return routes;
  }
}

export class DocumentRoute extends Route {
  doc: Document;

  constructor(provider: RouteProvider, doc: Document) {
    super(provider);
    this.doc = doc;
    this.podPath = doc.podPath;
    this.urlPath = this.getUrlPath();
  }

  toString() {
    return `[DocumentRoute: ${this.doc}]`;
  }

  async build(options?: BuildOptions): Promise<string> {
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

  private getUrlPath() {
    let path = interpolate(this.pod, this.doc.pathFormat, {
      doc: this.doc,
      pod: this.pod,
    }) as string;
    // Clean up repeated slashes.
    // Path format params can be blank or return with starting or ending slashes.
    path = path.replace(/\/{2,}/g, '/');
    // Collapse `.../index/$` to `.../` for clean URLs.
    // NOTE: This can be made configurable via a flag if needed, however this is
    // a very sane default.
    return path.replace(/index\/?$/, '');
  }
}
