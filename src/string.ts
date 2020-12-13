import {Pod} from './pod';

export interface StringOptions {
  prefer?: string;
  value: string;
}

// TODO: Add support for more complex informatoion such as holding the context,
// the URLs of the pages where the string is used, forcing a newer version of a
// string to use for multi-level translation selection, etc.
export class TranslationString {
  pod: Pod;
  value: string;
  prefer?: string;

  constructor(pod: Pod, options: StringOptions) {
    this.pod = pod;
    this.value = options.value;
    this.prefer = options.prefer;
  }

  toString() {
    return this.value;
  }
}
