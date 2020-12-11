import {Pod} from './pod';

export class Document {
  pod: Pod;
  path: string;

  constructor(pod: Pod, path: string) {
    this.pod = pod;
    this.path = path;
  }

  async render() {
    return 'foo';
  }
}
