import {Pod} from './pod';

export class StaticFile {
  pod: Pod;
  podPath: string;

  constructor(pod: Pod, podPath: string) {
    this.pod = pod;
    this.podPath = podPath;
  }

  toString() {
    return `{StaticFile: "${this.podPath}"}`;
  }
}
