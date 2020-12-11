import {Pod} from './pod';

export class Builder {
  pod: Pod;

  constructor(pod: Pod) {
    this.pod = pod;
  }

  build() {}

  render() {}
}
