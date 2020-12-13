import {Pod} from './pod';

// TODO: Add support for more complex informatoion such as holding the context,
// the URLs of the pages where the string is used, forcing a newer version of a
// string to use for multi-level translation selection, etc.
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
