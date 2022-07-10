import {localizeData} from '.';
import {Document} from './document';
import {Pod} from './pod';
import {TranslationString} from './string';

const RTL_REGEX = /^(ar|fa|he|ur)(\W|$)/;

export type Translatable = string | TranslationString;
type LocaleId = string;

export class LocaleSet extends Set {
  static fromIds(localeIds: Array<string>, pod: Pod): LocaleSet {
    return new LocaleSet(localeIds.map(locale => pod.locale(locale)));
  }

  toString() {
    return `[Locales: ${Array.from(this.values()).join(', ')}]`;
  }
}

/**
 * Locales provide pods with a way of generating different content for different
 * locales. Locale objects are used to instantiate documents, so that one
 * document can be available in many locales – and documents, collections, and
 * pods can each have their own sets of locales.
 *
 * Locale objects provide a way with accessing the translations for a locale, as
 * well as managing operations around the translation process such as recording
 * strings that are missing translations. Locale objects also provide
 * information about the locale that can be used within templates, such as
 * whether the locale is a right-to-left locale.
 */
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

  /** Returns the translations for this locale. The translations are stored
   * within a YAML file for each locale, in a file named
   * `/locales/{locale}.yaml`. The translations are stored as a mapping of
   * source string to translation, under a `translations` key within the file.
   * */
  get translations() {
    try {
      return this.pod.readYaml(this.podPath)['translations'];
    } catch (e: any) {
      if (e.code !== 'ENOENT') {
        throw e;
      }
      return {};
    }
  }

  /** Returns whether the locale uses an RTL (right to left) language. */
  get rtl() {
    return RTL_REGEX.test(this.id);
  }

  /** Normalizes a string into a `TranslationString` object. */
  toTranslationString(value: Translatable) {
    if (typeof value === 'string') {
      return this.pod.string({
        value: value,
      });
    }
    return value;
  }

  /**
   * Records a missing translation string during the build process. If the
   * build looks up a translation for a source string and if the translation
   * doesn't exist, it is recorded by this function so that all missing
   * translations can be collected (and translated) later. The location of the
   * translation string (the `Document` where the missing translation string was
   * located, is also collected, so that the order of appearance and the context
   * can be bundled with the recorded strings and provided to translators.
   * @param string The source string that is missing a translation.
   * @param location The document where the string was requested.
   */
  recordMissingString(string: TranslationString, location?: Document) {
    if (!this.recordedStrings.has(string)) {
      this.recordedStrings.set(string, new Set());
    }
    if (location) {
      (this.recordedStrings.get(string) as Set<Document>).add(location);
    }
  }

  getTranslation(value: Translatable, location?: Document) {
    const timer = this.pod.profiler.timer(
      'locale.getTranslation',
      'Locale get translation'
    );
    try {
      if (!value) {
        return value;
      }

      const string = this.toTranslationString(value);

      // Return the preferred string without checking translations, if in the
      // default locale.
      if (string.prefer && this === this.pod.defaultLocale) {
        return string.prefer;
      }

      if (!this.pod.fileExists(this.podPath) || !this.translations) {
        this.recordMissingString(string, location);
        return string.value;
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
        this.recordMissingString(string, location);
      }

      // Collect the string because the preferred translation is missing.
      const foundValue = this.translations[string.value];
      if (foundValue) {
        return foundValue;
      }

      // No translation was found at all, fall back to the source string.
      this.recordMissingString(string, location);
      return string.value;
    } finally {
      timer.stop();
    }
  }
}

/**
 * A utility class for serializing data for the `!IfLocale` YAML tag.
 */
export class LocalizableData {
  pod: Pod;
  data: any;

  constructor(pod: Pod, data: Record<LocaleId, any>) {
    this.pod = pod;
    this.data = data;
  }

  /**
   * Returns the data for a given locale, falling back to data with key
   * "default".
   */
  localize(locale: Locale) {
    const result = this.data[locale.id] ?? this.data['default'];
    // Handle nested `LocalizableData` structures.
    return localizeData(result, locale);
  }
}
