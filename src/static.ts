import {Pod} from './pod';
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

  get url(): Url | undefined {
    return this.pod.router.getUrl('static_file', this);
  }
}
