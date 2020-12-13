import {Pod} from './pod';

export class TranslationString {
  pod: Pod;
  value: string;

  constructor(pod: Pod, value: string) {
    this.pod = pod;
    this.value = value;
  }

  toString() {
    return this.value;
  }
}
