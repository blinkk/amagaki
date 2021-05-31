import * as fsPath from 'path';
import {Document} from './document';
import {Environment} from './environment';

interface UrlOptions {
  path: string;
  host?: string;
  scheme?: string;
  port?: string;
  env?: Environment;
}

const ABSOLUTE_URL_REGEX = new RegExp('^(//|[a-z]+:)', 'i');

export class Url {
  path: string;
  env?: Environment;
  private _host?: string;
  private _scheme?: string;
  private _port?: string;

  /**
   * Creates Url instance. If host, scheme, and port are supplied options, those
   * values will be used. By default, a reference to the pod's environment is
   * used instead.
   */
  constructor(options: UrlOptions) {
    this.path = options.path;
    this.env = options.env;
    this._host = options.host;
    this._scheme = options.scheme;
    this._port = options.port;
  }

  get host() {
    return this._host || this.env?.host;
  }

  get scheme() {
    return this._scheme || this.env?.scheme;
  }

  get port() {
    return this._port || this.env?.port;
  }

  toString() {
    if (this.port) {
      return `${this.scheme}://${this.host}:${this.port}${this.path}`;
    }
    return `${this.scheme}://${this.host}${this.path}`;
  }

  /**
   * Returns a URL relative to another URL. Accepts both `Document` objects
   * (i.e. for returning the URL of one document relative to another) or URLs as
   * strings. Accepts both full URLs or paths only.
   * @param other The `Document` or URL being linked to.
   * @param base The `Document` or URL being linked from.
   * @returns The URL of `other` relative to `base`.
   */
  static relative(other: Document | string, base: Document | string) {
    const otherUrl = other instanceof Document ? other.url?.path : other;
    const baseUrl = base instanceof Document ? base.url?.path : base;
    if (!otherUrl || !baseUrl || ABSOLUTE_URL_REGEX.test(otherUrl)) {
      return otherUrl;
    }
    const result = fsPath.relative(baseUrl, otherUrl);
    if (!result || result === '/') {
      return otherUrl.endsWith('/') ? './' : '.';
    }
    return otherUrl.endsWith('/') ? `./${result}/` : `./${result}`;
  }
}
