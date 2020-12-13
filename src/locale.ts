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
    if (!value) {
      return value;
    }

    const string = this.toTranslationString(value);
    if (!this.pod.fileExists(this.podPath) || !this.translations) {
      this.emptyStrings.add(string);
      return value;
    }
    // Check for the translation of the preferred value and return it. This
    // permits specification of a "preferred" string, for instances where some
    // locales may have translations and others may not. Usually, this is useful
    // to support updating source languages without waiting for new translations
    // to arrive.
    if (string.prefer) {
      const preferredValue = this.translations[string.prefer];
      if (preferredValue) {
        return preferredValue;
      }
      // Collect the string because the preferred translation is missing.
      this.emptyStrings.add(string);
    }
    const foundValue = this.translations[string.value];
    if (foundValue) {
      return foundValue;
    }
    this.emptyStrings.add(string);
    // No translation was found at all, fall back to the source string.
    return value;
  }

  get isRtl() {
    // TODO: Implement this.
    throw Error();
  }
}
