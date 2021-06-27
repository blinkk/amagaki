import {Pod} from './pod';
import {StaticFileRouteProvider} from './providers/staticFile';
import {Url} from './url';
import {createHash} from 'crypto';

export class StaticFile {
  pod: Pod;
  podPath: string;

  constructor(pod: Pod, podPath: string) {
    this.pod = pod;
    this.podPath = podPath;
  }

  toString() {
    return `[StaticFile: ${this.podPath}]`;
  }

  /**
   * Returns the url for the static file by looking it up from the router. If
   * the static file doesn't have a serving URL, `undefined` is returned.
   */
  get url(): Url | undefined {
    return this.pod.router.getUrl(StaticFileRouteProvider.type, this);
  }

  /** Returns the MD5 hash for the file. */
  get fingerprint() {
    const content = this.pod.readFile(this.podPath);
    return createHash('md5').update(content).digest('hex');
  }

  /** Returns whether the file exists. */
  get exists() {
    return this.pod.fileExists(this.podPath);
  }
}
