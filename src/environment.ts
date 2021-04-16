export interface EnvironmentOptions {
  host: string;
  port?: string;
  scheme: string;
  name: string;
  dev: boolean;
  fields?: any;
}
export class Environment {
  host: string;
  port?: string;
  scheme: string;
  name: string;
  dev: boolean;
  fields?: any;

  static DefaultName: 'default';

  constructor(options: EnvironmentOptions) {
    this.name = options.name;
    this.host = options.host;
    this.port = options.port;
    this.scheme = options.host === 'localhost' ? 'http' : options.scheme;
    this.dev = options.dev;
    this.fields = options.fields;
  }

  toString() {
    return `[Env: ${JSON.stringify(this)}]`;
  }
}
