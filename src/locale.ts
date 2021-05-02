import * as yaml from 'js-yaml';

import {Builder} from './builder';
import {Document} from './document';
import {Pod} from './pod';
import {TranslationString} from './string';

const xliff = require('xliff');

const RTL_REGEX = /^(ar|fa|he|ur)(\W|$)/;

export class LocaleSet extends Set {
  static fromIds(localeIds: Array<string>, pod: Pod): LocaleSet {
    return new LocaleSet(localeIds.map(locale => pod.locale(locale)));
  }

  toString() {
    return `[Locales: ${Array.from(this.values()).join(', ')}]`;
  }
}

interface Translation {
  translation: string;
  comment?: string;
}

interface LocaleContent {
  translations: Record<string, Translation>;
}

interface XlfItem {
  source: string;
  target: string;
}

type XlfNamespace = string;
type XlfKey = string;
type XlfResource = Record<XlfKey, XlfItem>;

interface XlfDocument {
  resources: Record<XlfNamespace, XlfResource>;
  sourceLanguage: string;
  targetLanguage: string;
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
  xlfPodPath: string;
  id: string;
  recordedStrings: Map<TranslationString, Set<Document>>;
  contextualStrings: Map<Document, Set<TranslationString>>;
  _content: LocaleContent | undefined;

  constructor(pod: Pod, id: string) {
    this.pod = pod;
    this.id = id;
    this.podPath = `/locales/${id}.yaml`;
    this.xlfPodPath = `/locales/${id}.xlf`;
    this.recordedStrings = new Map();
    this.contextualStrings = new Map();
    this._content = undefined;
  }

  toString() {
    return `[Locale: ${this.id}]`;
  }

  private get content() {
    if (this._content !== undefined) {
      return this._content;
    }
    if (this.pod.fileExists(this.podPath)) {
      this._content = this.pod.readYaml(this.podPath) as LocaleContent;
    } else {
      this._content = {
        translations: {},
      };
    }
    return this._content;
  }

  /** Returns whether the locale uses an RTL (right to left) language. */
  get rtl() {
    return RTL_REGEX.test(this.id);
  }

  /** Returns the translations for this locale. The translations are stored
   * within a YAML file for each locale, in a file named
   * `/locales/{locale}.yaml`. The translations are stored as a mapping of
   * source string to translation, under a `translations` key within the file.
   * */
  get translations() {
    return this.content.translations;
  }

  /** Normalizes a string into a `TranslationString` object. */
  toTranslationString(value: string | TranslationString) {
    if (typeof value === 'string') {
      return this.pod.string(
        {
          value: value as string,
        },
        this
      );
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
  recordString(string: TranslationString, location?: Document) {
    if (!this.recordedStrings.has(string)) {
      this.recordedStrings.set(string, new Set());
    }
    if (location) {
      if (!this.contextualStrings.has(location)) {
        this.contextualStrings.set(location, new Set());
      }
      (this.recordedStrings.get(string) as Set<Document>).add(location);
      (this.contextualStrings.get(location) as Set<TranslationString>).add(
        string
      );
    }
    if (!this.content?.translations[string.value]) {
      this.content.translations[string.value] = {
        translation: '',
      };
    }
  }

  getTranslation(value: string | TranslationString, location?: Document) {
    if (!value) {
      return value;
    }

    const string = this.toTranslationString(value);

    this.recordString(string, location);

    if (!this.translations) {
      return string.value;
    }

    // Check for the translation of the preferred value and return it. This
    // permits specification of a "preferred" string, for instances where some
    // locales may have translations and others may not. Usually, this is useful
    // to support updating source languages without waiting for new translations
    // to arrive.
    if (string.prefer) {
      const preferredValue = this.translations?.[string.prefer]?.translation;
      if (preferredValue) {
        return preferredValue;
      }
    }

    // Collect the string because the preferred translation is missing.
    const foundValue = this.translations?.[string.value]?.translation;
    if (foundValue) {
      return foundValue;
    }

    // No translation was found at all, fall back to the source string.
    return string.value;
  }

  async save() {
    const content = yaml.dump(this.content, {
      sortKeys: true,
    });
    Builder.writeFileAsync(this.pod.getAbsoluteFilePath(this.podPath), content);
    await this.saveXlf();
  }

  async saveXlf() {
    const data: XlfDocument = {
      resources: {},
      sourceLanguage: this.pod.defaultLocale.id,
      targetLanguage: this.id,
    };
    data.resources.global = {};
    for (const string of Object.keys(this.translations)) {
      const value = this.translations[string];
      data.resources.global[string] = {
        source: string,
        target: value.translation,
      };
    }
    const resp = await xliff.js2xliff(data);
    Builder.writeFileAsync(this.pod.getAbsoluteFilePath(this.xlfPodPath), resp);
  }
}
