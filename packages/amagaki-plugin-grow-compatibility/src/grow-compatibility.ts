import {Pod} from '@amagaki/amagaki';

class GrowCompatibilityPlugin {
  pod: Pod;

  constructor(pod: Pod) {
    this.pod = pod;
  }

  static register(pod: Pod) {
    return new GrowCompatibilityPlugin(pod);
  }
}
