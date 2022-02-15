import {Locale} from './locale';
import {Pod} from './pod';

export interface StringOptions {
  prefer?: string;
  value: string;
}

// TODO: Add support for more complex information such as holding the context,
// the URLs of the pages where the string is used, forcing a newer version of a
// string to use for multi-level translation selection, etc.
export class TranslationString {
  locale?: Locale;
  pod: Pod;
  prefer?: string;
  value: string;

  constructor(pod: Pod, options: StringOptions, locale?: Locale) {
    this.pod = pod;
    this.prefer = options.prefer;
    this.value = options.value;
    this.locale = locale;
  }

  localize(locale: Locale) {
    return new TranslationString(
      this.pod,
      {
        prefer: this.prefer,
        value: this.value,
      },
      locale
    );
  }

  toString() {
    if (this.locale) {
      return this.locale.getTranslation(this);
    }
    return this.value;
  }
}
