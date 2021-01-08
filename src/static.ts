import Pod from './pod';
import {Url} from './url';

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
    return this.pod.router.getUrl('static_dir', this);
  }
}
