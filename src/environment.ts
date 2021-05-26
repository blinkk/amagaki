export interface EnvironmentOptions {
  host: string;
  port?: string;
  scheme: string;
  name: string;
  dev: boolean;
  fields?: any;
}

export interface EnvironmentConfigOptions {
  host?: string;
  port?: string;
  scheme?: string;
  name?: string;
  dev?: boolean;
  fields?: any;
}

export interface UpdateEnvironmentOptions {
  host?: string;
  port?: string;
  scheme?: string;
  dev?: boolean;
  fields?: any;
}

export class Environment {
  host: string;
  port?: string;
  _scheme: string;
  name: string;
  dev: boolean;
  fields?: any;

  static DefaultName: 'default';

  constructor(options: EnvironmentOptions) {
    this.name = options.name;
    this.host = options.host;
    this.port = options.port;
    this.dev = options.dev;
    this.fields = options.fields;
    this._scheme = options.scheme;
  }

  toString() {
    return `[Env: ${JSON.stringify(this)}]`;
  }

  get scheme() {
    return this.host === 'localhost' ? 'http' : this._scheme;
  }

  /**
   * Updates the environment properties dynamically. Meant to be used in
   * conjunction with options supplied in `amagaki.ts`. If a field is
   * unspecified, the field is unmodified and the original value is preserved.
   */
  updateFromConfig(options: UpdateEnvironmentOptions) {
    this.host = options.host || this.host;
    this.port = options.port || this.port;
    this._scheme = options.scheme || this.scheme;
    this.dev = options.dev || this.dev;
    this.fields = options.fields || this.fields;
  }
}
