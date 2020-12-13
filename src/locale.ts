import {Pod} from './pod';
import {TranslationString} from './string';

export class Locale {
  pod: Pod;
  podPath: string;
  id: string;
  emptyStrings: Set<TranslationString>;

  constructor(pod: Pod, id: string) {
    this.pod = pod;
    this.id = id;
    this.podPath = `/locales/${id}.yaml`;
    this.emptyStrings = new Set();
  }

  toString() {
    return `[Locale: ${this.id}]`;
  }

  get translations() {
    return this.pod.readYaml(this.podPath);
  }

  toTranslationString(value: string | TranslationString) {
    if (typeof value === 'string') {
      return new TranslationString(this.pod, {
        value: value as string,
      });
    }
    return value;
  }

  getTranslation(value: string | TranslationString) {
    const string = this.toTranslationString(value);
    if (!this.pod.fileExists(this.podPath) || !this.translations) {
      this.emptyStrings.add(string);
      return value;
    }
    const foundValue = this.translations[string.value];
    if (foundValue) {
      return foundValue;
    }
    this.emptyStrings.add(string);
    return value;
  }
}
