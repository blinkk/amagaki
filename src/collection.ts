import {Pod} from './pod';

export class Collection {
  path: string;
  pod: Pod;

  constructor(pod: Pod, path: string) {
    this.pod = pod;
    this.path = path;
  }
}
