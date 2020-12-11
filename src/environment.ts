interface EnvironmentOptions {
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

  constructor(options: EnvironmentOptions) {
    this.name = options.name;
    this.host = options.host;
    this.port = options.port;
    this.scheme = options.scheme;
    this.dev = options.dev;
  }
}
