import {Pod} from './pod';
import {safeLoad} from 'js-yaml';

export class Document {
  pod: Pod;
  path: string;

  constructor(pod: Pod, path: string) {
    this.pod = pod;
    this.path = path;
  }

  async render() {
    const content = this.pod.readFile(this.path);
    return safeLoad(content);
  }
}
