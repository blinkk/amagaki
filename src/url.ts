import {Environment} from './environment';

interface UrlOptions {
  path: string;
  host?: string;
  scheme?: string;
  port?: string;
  env?: Environment;
}

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
    if (options.host) {
      this._host = options.host;
    }
    if (options.scheme) {
      this._scheme = options.scheme;
    }
    if (options.port) {
      this._port = options.port;
    }
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
}
