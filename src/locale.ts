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

  getTranslation(value: string) {
    if (!this.pod.fileExists(this.podPath) || !this.translations) {
      this.emptyStrings.add(new TranslationString(this.pod, value));
      return value;
    }
    const foundValue = this.translations[value];
    if (foundValue) {
      return foundValue;
    }
    this.emptyStrings.add(new TranslationString(this.pod, value));
    return value;
  }
}
