import {Document} from './document';
import {Pod} from './pod';
import {TranslationString} from './string';

export class LocaleSet extends Set {
  toString() {
    return `[Locales: ${Array.from(this.values()).join(', ')}]`;
  }
}

export class Locale {
  pod: Pod;
  podPath: string;
  id: string;
  recordedStrings: Map<TranslationString, Set<Document>>;

  constructor(pod: Pod, id: string) {
    this.pod = pod;
    this.id = id;
    this.podPath = `/locales/${id}.yaml`;
    this.recordedStrings = new Map();
  }

  toString() {
    return `[Locale: ${this.id}]`;
  }

  get translations() {
    return this.pod.readYaml(this.podPath)['translations'];
  }

  toTranslationString(value: string | TranslationString) {
    if (typeof value === 'string') {
      return this.pod.string({
        value: value as string,
      });
    }
    return value;
  }

  recordString(string: TranslationString, location?: Document) {
    if (!this.recordedStrings.has(string)) {
      this.recordedStrings.set(string, new Set());
    }
    if (location) {
      (this.recordedStrings.get(string) as Set<Document>).add(location);
    }
  }

  getTranslation(value: string | TranslationString, location?: Document) {
    if (!value) {
      return value;
    }

    const string = this.toTranslationString(value);
    if (!this.pod.fileExists(this.podPath) || !this.translations) {
      this.recordString(string, location);
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
      this.recordString(string, location);
    }
    const foundValue = this.translations[string.value];
    if (foundValue) {
      return foundValue;
    }
    this.recordString(string, location);
    // No translation was found at all, fall back to the source string.
    return value;
  }

  get isRtl() {
    // TODO: Implement this.
    throw Error();
  }
}
