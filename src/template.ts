import {Pod} from './pod';

export class Template {
  pod: Pod;

  constructor(pod: Pod) {
    this.pod = pod;
  }

  render() {}
}
