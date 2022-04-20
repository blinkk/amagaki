import * as fsPath from 'path';
import * as mimetypes from 'mime-types';
import * as utils from './utils';

import express = require('express');
import { Locale } from './locale';
import { Pod } from "./pod";
import { Router } from './router';
import { Url } from './url';
import { RouteParams } from './trie';

export interface BuildRouteOptions {
  req?: express.Request;
  params?: RouteParams;
}

export interface RouteOptions {
  /** Key to identify the route in the router's URL map. */
  id?: string;
  /** Function to return the content of the route. */
  build: (options?: BuildRouteOptions) => Promise<string>;
  /** Content type for the route. If not specified, it will be inferred from the URL path. */
  contentType?: string;
  /** URL path used when looking up the route. */
  urlPath: string;
  /** Fields to store on the route. */
  fields?: Record<string, any>;
  /** Function to return the static paths of the route. */
  getStaticPaths?: () => Promise<string[]>;
}

export function createRoute(router: Router, options: RouteOptions): Route {
  return new Route(router, options);
}

export class Route {
  pod: Pod;
  fields: Record<string, any>;
  protected _urlPath?: string;
  protected _contentType?: string;
  protected _build: (options?: BuildRouteOptions) => Promise<string>;
  router: Router;
  id?: string;
  type: string = 'default';
  getStaticPaths: () => Promise<string[]>;

  constructor(router: Router, options?: RouteOptions) {
    this.router = router;
    this.pod = this.router.pod;
    this._urlPath = options?.urlPath;
    this._contentType = options?.contentType;
    this._build = options?.build;
    this.fields = options?.fields ?? {};
    this.id = options?.id;
    this.getStaticPaths = options?.getStaticPaths;
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
    throw new Error('Subclasses of Route must first call `setUrlPath`.');
  }

  get url(): Url {
    return new Url({
      path: this.urlPath,
      env: this.pod.env,
    });
  }

  setUrlPath(urlPath: string) {
    this._urlPath = urlPath;
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

export class DocumentRoute extends Route implements Route {
  private _podPath: string;
  locale: Locale;
  type = 'document';

  constructor(router: Router, podPath: string, locale?: Locale) {
    super(router);
    this._podPath = podPath;
    this.locale = locale || this.pod.defaultLocale;
    this.id = this.doc.toString();
    this.initUrlPath();
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

  private initUrlPath() {
    let urlPath = '';

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

    this.setUrlPath(urlPath);
  }
}

export class StaticRoute extends Route implements Route {
  private _podPath: string;
  servingPath: string;
  type = 'staticDir';

  constructor(router: Router, podPath: string, servingPath?: string) {
    super(router);
    this._podPath = podPath;
    this.servingPath = servingPath || podPath;
    this.id = this.toString();
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
