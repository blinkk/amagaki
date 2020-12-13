import {Pod} from './pod';

export class Locale {
  pod: Pod;
  id: string;

  constructor(pod: Pod, id: string) {
    this.pod = pod;
    this.id = id;
  }
}
