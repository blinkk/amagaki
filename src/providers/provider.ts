import * as fsPath from 'path';
import * as mimetypes from 'mime-types';

import {Pod} from '../pod';
import {Router} from '../router';
import {Url} from '../url';

import express = require('express');

export interface BuildOptions {
  req?: express.Request;
}

export class RouteProvider {
  path?: string;
  pod: Pod;
  router: Router;
  urls: Map<any, Url>;

  static type = 'default';

  constructor(router: Router) {
    this.router = router;
    this.pod = router.pod;
    this.urls = new Map();
  }

  /** Initialize the route provider by adding it to the trie. */
  async init(): Promise<void> {}

  /** Return all routes provided. */
  async routes(): Promise<Route[]> {
    return [];
  }

  /** Return one route, given parameters from the trie. */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getRoute(params: any): Promise<Route | undefined> {
    throw new Error('Subclasses must provide routes.');
  }
}

export class Route {
  podPath?: string;
  pod: Pod;
  provider: RouteProvider;
  urlPath?: string;

  constructor(provider: RouteProvider) {
    this.provider = provider;
    this.pod = this.provider.pod;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async build(options?: BuildOptions): Promise<string> {
    throw new Error('Subclasses of Route must implement `build`.');
  }

  get url(): Url | undefined {
    if (this.urlPath) {
      return new Url({
        path: this.urlPath,
        env: this.pod.env,
      });
    }
    return undefined;
  }

  /**
   * Returns the content type header for the route, based on the route's URL
   * path. Routes that terminate in `/` or have no extension are assumed to be
   * HTML. All other routes are automatically determined using the `mime-types`
   * module.
   */
  get contentType() {
    if (!this.url) {
      return;
    }
    if (this.url.path.endsWith('/') || !fsPath.extname(this.url.path)) {
      return 'text/html';
    }
    return (
      mimetypes.contentType(fsPath.basename(this.url.path)) ||
      'application/octet-stream'
    );
  }
}
