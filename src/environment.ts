export interface EnvironmentOptions {
  host: string;
  port?: string;
  scheme: string;
  name: string;
  dev: boolean;
}
export class Environment {
  host: string;
  port?: string;
  scheme: string;
  name: string;
  dev: boolean;

  static DefaultName: 'default';

  constructor(options: EnvironmentOptions) {
    this.name = options.name;
    this.host = options.host;
    this.port = options.port;
    this.scheme = options.scheme;
    this.dev = options.dev;
  }

  toString() {
    return `[Env: ${JSON.stringify(this)}]`;
  }
}
