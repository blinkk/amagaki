interface UrlOptions {
  path: string;
  host: string;
  scheme: string;
  port?: string;
}

export class Url {
  path: string;
  host: string;
  scheme: string;
  port?: string;

  constructor(options: UrlOptions) {
    this.path = options.path;
    this.host = options.host;
    this.scheme = options.scheme;
    this.port = options.port;
  }
}
